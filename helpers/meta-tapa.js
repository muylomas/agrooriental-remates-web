// Cliente de la API de integraciones de Meta Tapa: códigos de verificación y
// avisos por WhatsApp (los manda Meta Tapa con su número de WhatsApp, con SMS
// de respaldo para los códigos).
//
// Configuración (las variables de entorno tienen prioridad sobre el archivo):
//   META_TAPA_URL      base de la API, ej. https://<api de meta-tapa>/api/Integraciones
//   META_TAPA_API_KEY  la misma clave que Integraciones__Remates__ApiKey en Meta Tapa
// o el archivo meta_tapa_config.json en la raíz (no se versiona; ver
// meta_tapa_config.example.json).
//
// Usa el módulo https y no fetch porque producción corre Node 14.

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const TIMEOUT_MS = 10000;

function leerConfig() {
    let archivo = {};
    try {
        archivo = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'meta_tapa_config.json'), 'utf8'));
    }
    catch (e) {
        // Sin archivo: se usan solo las variables de entorno.
    }
    return {
        url: (process.env.META_TAPA_URL || archivo.url || '').replace(/\/+$/, ''),
        apiKey: process.env.META_TAPA_API_KEY || archivo.apiKey || '',
    };
}

const config = leerConfig();
if (!config.url || !config.apiKey) {
    console.error('Meta Tapa: falta META_TAPA_URL / META_TAPA_API_KEY (o meta_tapa_config.json). No se van a poder mandar códigos ni avisos.');
}

// Llama a la API y responde callback({ ok, status, data, errorCode, message, detail }).
// Nunca lanza: si no hay conexión o la respuesta no es JSON, ok = false y
// errorCode = "sin_conexion".
function llamar(metodo, ruta, cuerpo, callback) {
    if (!config.url || !config.apiKey) {
        return callback({ ok: false, status: 0, errorCode: 'sin_configuracion', message: 'Meta Tapa sin configurar' });
    }

    let terminado = false;
    const responder = (r) => {
        if (!terminado) {
            terminado = true;
            callback(r);
        }
    };

    const url = new URL(config.url + ruta);
    const json = cuerpo ? JSON.stringify(cuerpo) : null;
    const headers = { 'X-Api-Key': config.apiKey, 'Accept': 'application/json' };
    if (json) {
        headers['Content-Type'] = 'application/json';
        headers['Content-Length'] = Buffer.byteLength(json);
    }

    const req = (url.protocol === 'http:' ? http : https).request(
        url,
        { method: metodo, headers: headers, timeout: TIMEOUT_MS },
        (res) => {
            let texto = '';
            res.setEncoding('utf8');
            res.on('data', (c) => { texto += c; });
            res.on('end', () => {
                let body = null;
                try { body = JSON.parse(texto); } catch (e) { }
                if (!body) {
                    console.error('Meta Tapa:', metodo, ruta, 'respondió', res.statusCode, 'sin JSON');
                    return responder({ ok: false, status: res.statusCode, errorCode: res.statusCode === 401 ? 'no_autorizado' : 'sin_conexion' });
                }
                responder({
                    ok: res.statusCode >= 200 && res.statusCode < 300 && body.status === true,
                    status: res.statusCode,
                    data: body.data,
                    errorCode: body.errorCode,
                    message: body.message,
                    detail: body.detail,
                });
            });
        }
    );
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', (err) => {
        console.error('Meta Tapa:', metodo, ruta, err.message);
        responder({ ok: false, status: 0, errorCode: 'sin_conexion' });
    });
    if (json) req.write(json);
    req.end();
}

// Teléfono en E.164 a partir de customers_complete.phoneCountryCode ("+598")
// y phoneNumber. Devuelve "" si falta alguno.
function telefonoE164(phoneCountryCode, phoneNumber) {
    const codigo = String(phoneCountryCode || '').replace(/[^0-9]/g, '');
    const numero = parseInt(phoneNumber, 10);
    if (!codigo || !numero) return '';
    return '+' + codigo + numero;
}

// canal: "whatsapp" (por defecto) o "sms".
function solicitarCodigo(telefono, proposito, canal, callback) {
    llamar('POST', '/Otp/Solicitar', { telefono: telefono, proposito: proposito || 'login', canal: canal || 'whatsapp' }, callback);
}

function verificarCodigo(telefono, proposito, codigo, callback) {
    llamar('POST', '/Otp/Verificar', { telefono: telefono, proposito: proposito || 'login', codigo: String(codigo) }, callback);
}

// Avisos por WhatsApp. La web solo los manda a clientes con whatsappOptIn = 1.
// tipo: "bid.outbid" | "auction.won" | "auction.closed".
function enviarEvento(tipo, idempotencyKey, destinatario, datos, callback) {
    llamar(
        'POST',
        '/Notificaciones/Eventos',
        { tipo: tipo, idempotencyKey: idempotencyKey, destinatario: destinatario, datos: datos },
        (r) => {
            if (!r.ok) {
                console.error('Meta Tapa: evento', tipo, idempotencyKey, 'no registrado:', r.status, r.errorCode, r.message || '');
            }
            if (callback) callback(r);
        }
    );
}

// Texto para mostrarle al cliente cuando falla pedir o verificar un código.
function mensajeError(r) {
    switch (r.errorCode) {
        case 'espera':
            return 'Ya te mandamos un código hace instantes. Esperá ' + (parseInt(r.detail, 10) || 60) + ' segundos para pedir otro.';
        case 'limite_envios':
            return 'Pediste demasiados códigos en la última hora. Probá más tarde.';
        case 'codigo_incorrecto':
            return 'El código no es correcto.' + (r.detail != null ? ' Te quedan ' + r.detail + ' intentos.' : '');
        case 'codigo_vencido':
            return 'El código venció. Pedí uno nuevo.';
        case 'intentos_agotados':
            return 'Agotaste los intentos con este código. Pedí uno nuevo.';
        default:
            return 'No pudimos enviarte el código. Probá de nuevo en unos minutos o comunicate con Agro Oriental al +598 98 950 792.';
    }
}

module.exports = { telefonoE164, solicitarCodigo, verificarCodigo, enviarEvento, mensajeError };
