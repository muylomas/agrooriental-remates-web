const express = require('express');
const router = express.Router();
const searchProc = require('./search');
const newForm = require('./newLotForm');
const saveProc = require('./save');

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

router.post('/lot/auction/bids', function (req, res, next) {
    if ("body" in req && req.body.lotId) {
        searchProc.auctionBidsByLotId(
            req.sessionID,
            req.body.lotId,
            function (auctionBids) {
                res.json({
                    error: false,
                    auctionBids: auctionBids,
                    lotId: req.body.lotId,
                });
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