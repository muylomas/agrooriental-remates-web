const express = require('express');
const router = express.Router();
const searchProcc = require('./search');
const getProcc = require('./get');

router.get('/search/:farmString', function (req, res, next) {
    searchProcc.byString(
        req.sessionID,
        req.params.farmString,
        function (farms) {
            res.json({
                error: 0,
                farms: farms,
            });
        }
    );
});

router.get('/get/by/customer/:customerId', function (req, res, next) {
    getProcc.getByCustomerId(
        req.sessionID,
        req.params.customerId,
        function (farms) {
            res.json({
                error: 0,
                farms: farms,
            });
        }
    );
});

module.exports = router;