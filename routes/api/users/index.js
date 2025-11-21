const express = require('express');
const router = express.Router();
const searchProcc = require('./search');

router.get('/search/:userString/:userType', function (req, res, next) {
    searchProcc.byString(
        req.sessionID,
        req.params.userString,
        req.params.userType,
        function (salesagents) {
            res.json({
                error: 0,
                salesagents: salesagents,
            });
        }
    );
});

module.exports = router;