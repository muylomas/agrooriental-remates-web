const express = require('express');
const router = express.Router();

// Datos de la empresa que aparecen en las páginas legales. Los campos vacíos
// no se muestran (las páginas usan un texto genérico en su lugar).
const LEGAL_INFO = {
    companyName: 'ISOFAM S.A. (Agro Oriental)',   // razón social
    rut: '216921520017',                         // RUT de la empresa
    address: 'Gral. Domingo French 1948, Montevideo, Uruguay',                     // domicilio legal
    contactEmail: 'contacto@agrooriental.com.uy',                // email para consultas y derechos ARCO
    lastUpdated: '24 de noviembre de 2026',
};

function render(res, view, activePage, pageTitle) {
    res.render(view, {
        activePage: activePage,
        pageTitle: pageTitle,
        legal: LEGAL_INFO,
    });
}

// Páginas legales: públicas, no piden sesión (ver legal_urls en
// middlewares/authentication.js).
router.get('/terminos-y-condiciones', function (req, res, next) {
    render(res, 'legal/terms', 'terms', 'Términos y Condiciones');
});

router.get('/politica-de-privacidad', function (req, res, next) {
    render(res, 'legal/privacy', 'privacy', 'Política de Privacidad y Cookies');
});

// La política de cookies es una sección de la de privacidad.
router.get('/politica-de-cookies', function (req, res, next) {
    res.redirect('/politica-de-privacidad#cookies');
});

module.exports = router;
