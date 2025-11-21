const express = require('express');
const router = express.Router();
const searchProcc = require('./search');

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

module.exports = router;