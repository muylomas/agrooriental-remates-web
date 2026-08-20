const express = require('express');
const router = express.Router();
const common_auth = require('../common_auth');
const auctions = require('./auctions');
router.get('/:auctionId', function (req, res, next) {
    common_auth.basic(req.sessionID, function (reply) {
        auctions.getViewParams(
            reply.user,
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
});

module.exports = router;