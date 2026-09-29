const express = require('express');
const router = express.Router();
const searchProc = require('./search');
const newForm = require('./newLotForm');
const saveProc = require('./save');
const liveAuction = require('../../../helpers/live-auction');

router.post('/search/for/map', function (req, res, next) {
    if (
        "body" in req &&
        "latMin" in req.body && req.body.latMin &&
        "latMax" in req.body && req.body.latMax &&
        "lngMin" in req.body && req.body.lngMin &&
        "lngMax" in req.body && req.body.lngMax
    ) {
        searchProc.forMap(
            req.sessionID,
            req.body,
            function (replyLots) {
                res.json({
                    lots: replyLots,
                });
            }
        );
    }
    else {
        res.json({
            lots: [],
        });
    }
});

router.post('/lot/new/save', function (req, res, next) {
    newForm.submit(
        req.sessionID,
        req,
        function (savedLotId, tabStatuses) {
            res.json({
                savedLotId: savedLotId,
                tabStatuses: tabStatuses,
            });
        }
    );
});

router.post('/lot/saved/delete', function (req, res, next) {
    if ("body" in req && req.body.lotId) {
        saveProc.delete(
            req.sessionID,
            req.body.lotId,
            function () {
                res.json({
                    error: false,
                    lotId: req.body.lotId,
                });
            }
        );
    }
    else {
        res.json({
            error: true,
            lotId: false,
        });
    }
});

router.get('/lots/refresh', function (req, res, next) {
    // TEMPORAL (remate en vivo, ver helpers/live-auction.js): las páginas abiertas antes del
    // deploy no traen el setTimeout de recarga, pero sí este polling vía
    // $.get sin dataType, así que jQuery ejecuta la respuesta si viene como
    // JavaScript. Las páginas nuevas mandan ?v=2 y nunca reciben esto, por lo
    // que cada pestaña vieja recarga una sola vez.
    if (!req.query.v && liveAuction.isOn()) {
        res.type('application/javascript').send('location.reload();');
        return;
    }

    searchProc.refreshLots(
        req.sessionID,
        function (replyLots) {
            res.json({
                lots: replyLots,
            });
        }
    );
});

router.post('/lot/auction/bids', function (req, res, next) {
    if ("body" in req && req.body.lotId) {
        searchProc.auctionBidsByLotId(
            req.sessionID,
            req.body.lotId,
            function (auctionReply) {
                res.json(auctionReply);
            }
        );
    }
    else {
        res.json({
            error: true,
            auctionBids: [],
            lotId: false,
            msg: "1.0",
        });
    }
});

module.exports = router;