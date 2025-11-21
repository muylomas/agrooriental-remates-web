const express = require('express');
const router = express.Router();
const paymentsInAdvance = require('./paymentsInAdvance');

router.post('/request/advance', function (req, res, next) {
    paymentsInAdvance.requestFor(
        req.sessionID,
        req.body.lotId,
        req.body.amount,
        function (err, paymentInAdvanceId) {
            res.json({
                error: err,
                paymentInAdvanceId: paymentInAdvanceId,
                paymentsInAdvanceAmount: req.body.amount,
            });
        }
    );
});

module.exports = router;