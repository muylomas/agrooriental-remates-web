var express = require('express');
var router = express.Router();
const common_gral = require('../common_gral');
const list = require('./list');
const publication = require('./publication');
const sellProc = require('./sell');
const newForm = require('./newLotForm');
const updateProc = require('./update');

router.get('/', function (req, res, next) {
    list.getViewParams(
        req.sessionID,
        "",
        1,
        12,
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

router.post('/buscar', function (req, res, next) {
    let viewURLDir = "/ganado";
    if ("body" in req) {
        if ("searchTerm" in req.body && req.body.searchTerm) {
            viewURLDir = "/ganado/s/" + encodeURIComponent(req.body.searchTerm);
        }
    }

    res.redirect(viewURLDir);
});

router.get('/s/:searchTerm', function (req, res, next) {
    list.getViewParams(
        req.sessionID,
        req.params.searchTerm,
        1,
        12,
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

router.get('/p/:page/l/:length', function (req, res, next) {
    list.getViewParams(
        req.sessionID,
        "",
        req.params.page,
        req.params.length,
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

router.get('/p/:page/l/:length/s/:searchTerm', function (req, res, next) {
    list.getViewParams(
        req.sessionID,
        req.params.searchTerm,
        req.params.page,
        req.params.length,
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

router.get('/lote/publicacion/:lotId', function (req, res, next) {

    publication.getViewParams(
        req.sessionID,
        req.params.lotId,
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

router.post('/lote/fin-subasta', function (req, res, next) {
    updateProc.updateAuctionEnd(
        req.sessionID,
        req,
        function (lotId) {
            if (lotId) {
                res.redirect("/ganado/lote/publicacion/" + lotId);
            }
            else {
                res.redirect("/ganado");
            }
        }
    );
});

router.get('/vender', function (req, res, next) {
    sellProc.getViewParams(
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

router.get('/lote/nuevo', function (req, res, next) {
    newForm.getViewParams(
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

router.get('/lote/nuevo/s/:savedLotId', function (req, res, next) {
    sellProc.getSavedViewParams(
        req.sessionID,
        req.params.savedLotId,
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

router.post('/lote/nuevo/crear', function (req, res, next) {
    newForm.submit(
        req.sessionID,
        req,
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

router.post('/actualizar', function (req, res, next) {
    updateProc.submit(
        req.sessionID,
        req,
        function (viewURLDir) {
            res.redirect(viewURLDir);
        }
    );
});

module.exports = router;