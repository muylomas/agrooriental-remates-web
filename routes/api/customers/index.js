const express = require('express');
const router = express.Router();
const searchProcc = require('./search');
const updateProcc = require('./update');

router.get('/search/:customerString', function (req, res, next) {
    searchProcc.byString(
        req.sessionID,
        req.params.customerString,
        function (customers) {
            res.json({
                error: 0,
                customers: customers,
            });
        }
    );
});

router.post('/profile/update', function (req, res, next) {
    updateProcc.profile(
        req.sessionID,
        req.body,
        function () {
            res.json({
                error: 0,
            });
        }
    );
});

module.exports = router;