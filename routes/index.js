const express = require('express');
const router = express.Router();
const common_gral = require('./common_gral');
const common_auth = require('./common_auth');

const homeFeed = require('./cattle/home');

// auctionId = 0 es la home: muestra el remate activo o, si hay más de uno,
// la página para elegir (ver homeFeed.getViewParams).
function renderAuction(req, res, auctionId) {
    common_auth.basic(req.sessionID, function (reply) {
        // Sin sesión: si después se identifica (para ofertar o ver sus
        // piques), el login lo devuelve a este remate y no a la home.
        if (auctionId && !reply.user.id) {
            req.session.redirectTo = req.originalUrl;
        }

        homeFeed.getViewParams(
            reply.user,
            auctionId,
            function (viewURLDir, indexParams, type) {
                if (type == "redirect") {
                    res.redirect(viewURLDir);
                }
                else {
                    common_gral.renderSavingSession(
                        req,
                        res,
                        viewURLDir,
                        indexParams
                    );
                }
            }
        );
    });
}

router.get('/', function (req, res, next) {
    renderAuction(req, res, 0);
});

router.get('/remate/:auctionId(\\d+)', function (req, res, next) {
    renderAuction(req, res, parseInt(req.params.auctionId, 10));
});

module.exports = router;
