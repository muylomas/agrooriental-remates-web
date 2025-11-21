const express = require('express');
const router = express.Router();
const searchProcc = require('./search');

router.get('/search/:societyString', function (req, res, next) {
    searchProcc.byString(
        req.sessionID,
        req.params.societyString,
        function (societies) {
            res.json({
                error: 0,
                societies: societies,
            });
        }
    );
});

module.exports = router;