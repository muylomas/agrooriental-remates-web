const express = require('express');
const router = express.Router();
const common_auth = require('../common_auth');
const auctions = require('./auctions');

router.get('/', function (req, res, next) {
    console.log("criollosparaganar 1");
    common_auth.basic(req.sessionID, function (reply) {
        console.log("criollosparaganar 2");
        auctions.getViewParams(
            function (viewURLDir, indexParams, type) {

                console.log("criollosparaganar 3");
                console.log("type: " + type);
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