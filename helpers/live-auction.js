// TEMPORAL: sección "Remate en Vivo" (transmisión YouTube + contacto WhatsApp).
// Único lugar donde se define cuándo está activa. Lo usan remate.pug (vía
// app.locals.liveAuction) y /api/cattle/lots/refresh (recarga de pestañas
// abiertas antes del deploy).
//
// Uruguay es UTC-3 fijo (sin horario de verano).

const LIVE_AUCTION_DATE = '2026-09-29';
const LIVE_AUCTION_FROM_HOUR = 17;

function isOn() {
    const uruguayHour = (new Date().getUTCHours() - 3 + 24) % 24;
    const fechaUY = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Montevideo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    return uruguayHour >= LIVE_AUCTION_FROM_HOUR && fechaUY == LIVE_AUCTION_DATE;
}

// Milisegundos (reloj del servidor) hasta que isOn() pasa a ser true; <= 0 si
// ya pasó ese momento.
function msUntilOn() {
    const fromHour = String(LIVE_AUCTION_FROM_HOUR).padStart(2, '0');
    return new Date(LIVE_AUCTION_DATE + 'T' + fromHour + ':00:00-03:00').getTime() - Date.now();
}

module.exports = { isOn, msUntilOn };
