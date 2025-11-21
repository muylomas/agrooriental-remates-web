const express = require('express');
const router = express.Router();
const common_gral = require('./common_gral');
const common_auth = require('./common_auth');

const homeFeed = require('./cattle/home');

router.get('/', function (req, res, next) {
    common_auth.basic(req.sessionID, function (reply) {
        if (reply.err) {
            res.render('index-logout', {},);
        }
        else {
            homeFeed.getViewParams(
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
        }
    });
});

module.exports = router;