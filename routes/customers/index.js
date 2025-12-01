var express = require('express');
var router = express.Router();
const common_gral = require('../common_gral');
const profile = require('./profile');

router.get('/', function (req, res, next) {

});

router.get('/perfil', function (req, res, next) {
    profile.getViewParams(
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

module.exports = router;