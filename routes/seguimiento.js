// Shipment tracking links of the RuralIA app (https://seguimiento.agrooriental.com.uy/s/:codigo).
// The meta-tapa backend creates the links; this host only serves what lets Android (App Links)
// and iOS (Universal Links) open them straight in the app, plus the page shown when a link is
// opened in a browser instead (app not installed, or an app that doesn't hand it over).
// Mounted for this host only (see app.js).
const express = require('express');
const router = express.Router();

const DOMINIO = 'seguimiento.agrooriental.com.uy';
const PAQUETE = 'com.ruraliaapp.uy';
const APPLE_APP_IDS = ['6W9SM856BA.com.ruraliaapp.uy'];
// SHA-256 fingerprints of the Play App Signing certificate (Play Console > App integrity),
// comma separated. Without them Android doesn't verify the domain.
const HUELLAS_ANDROID = (process.env.SEGUIMIENTO_ANDROID_SHA256 || '').split(',').map(s => s.trim()).filter(Boolean);
const PLAY_STORE = `https://play.google.com/store/apps/details?id=${PAQUETE}`;
const APP_STORE = process.env.SEGUIMIENTO_APP_STORE || 'https://apps.apple.com/uy/search?term=ruralia';

router.get('/.well-known/assetlinks.json', (req, res) => {
  res.json([{
    relation: ['delegate_permission/common.handle_all_urls'],
    target: { namespace: 'android_app', package_name: PAQUETE, sha256_cert_fingerprints: HUELLAS_ANDROID },
  }]);
});

// No extension, application/json and no redirects (Apple requires it).
const appleAppSiteAssociation = (req, res) => res.type('application/json').send(JSON.stringify({
  applinks: { details: [{ appIDs: APPLE_APP_IDS, components: [{ '/': '/s/*' }] }] },
}));
router.get('/.well-known/apple-app-site-association', appleAppSiteAssociation);
router.get('/apple-app-site-association', appleAppSiteAssociation);

router.get('/s/:codigo', (req, res) => {
  const { codigo } = req.params;
  if (!/^[A-Za-z0-9]{1,20}$/.test(codigo)) return res.status(404).end();
  const url = `https://${DOMINIO}/s/${codigo}`;
  // On Android, intent:// opens the app or, if it's not installed, the store.
  const intent = `intent://${DOMINIO}/s/${codigo}#Intent;scheme=https;package=${PAQUETE};S.browser_fallback_url=${encodeURIComponent(PLAY_STORE)};end`;
  res.type('html').send(`<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Seguimiento del embarque · RuralIA</title>
<meta property="og:title" content="Seguimiento del embarque">
<meta property="og:description" content="Seguí en la app RuralIA dónde está el camión con el ganado.">
<meta property="og:url" content="${url}"><meta property="og:type" content="website">
<meta name="apple-itunes-app" content="app-argument=${url}">
<style>
  :root { color-scheme: light dark; --fondo:#f6f5f1; --texto:#1f2a1f; --suave:#5b665b; --boton:#2f6b3a; --borde:#d9ddd6; }
  @media (prefers-color-scheme: dark) { :root { --fondo:#161a16; --texto:#e8ece6; --suave:#a7b0a5; --boton:#4f9a5c; --borde:#2c332b; } }
  body { margin:0; font-family:-apple-system,system-ui,Segoe UI,Roboto,sans-serif; background:var(--fondo); color:var(--texto); }
  main { max-width:420px; margin:0 auto; padding:48px 16px; text-align:center; }
  h1 { font-size:22px; margin:0 0 8px; } p { color:var(--suave); line-height:1.45; margin:0 0 24px; }
  a { display:block; padding:14px; border-radius:10px; text-decoration:none; font-weight:600; margin-bottom:12px; }
  .principal { background:var(--boton); color:#fff; } .secundario { border:1px solid var(--borde); color:var(--texto); }
</style></head>
<body><main>
  <h1>Seguimiento del embarque</h1>
  <p>Para ver en el mapa dónde está el camión, abrí este link con la app RuralIA.</p>
  <a class="principal" id="abrir" href="${url}">Abrir en RuralIA</a>
  <a class="secundario" href="${PLAY_STORE}">Bajar para Android</a>
  <a class="secundario" href="${APP_STORE}">Bajar para iPhone</a>
</main>
<script>if (/android/i.test(navigator.userAgent)) document.getElementById('abrir').href = ${JSON.stringify(intent)};</script>
</body></html>`);
});

// Nothing else is served on this host (not the rest of the site).
router.use((req, res) => res.status(404).end());

router.DOMINIO = DOMINIO;
module.exports = router;
