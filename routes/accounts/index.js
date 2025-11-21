var express = require('express');
var router = express.Router();
const common_gral = require('../common_gral');
const balanceAndTransactions = require('./balance-and-transactions');
const transactions = require('./transactions');

router.get('/', function (req, res, next) {
    balanceAndTransactions.getViewParams(
        req.sessionID,
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

router.get('/transaccion/:lotId', function (req, res, next) {
    transactions.getViewParams(
        req.sessionID,
        req.params.lotId,
        function (viewURLDir, indexParams, type) {
            if (type == "redirect") {
                res.redirect(viewURLDir);
            }
            else {
                indexParams.transaction = {};
                indexParams.transaction.lotId = req.params.lotId;

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

module.exports = router;