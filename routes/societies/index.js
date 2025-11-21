var express = require('express');
var router = express.Router();
const common_gral = require('../common_gral');
const list = require('./list');
const profile = require('./profile');
const newForm = require('./newForm');
const update = require('./update');

router.get('/', function (req, res, next) {
    list.getViewParams(
        req.sessionID,
        "",
        1,
        50,
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
    let viewURLDir = "/sociedades";
    if ("body" in req) {
        if ("searchTerm" in req.body && req.body.searchTerm) {
            viewURLDir = "/sociedades/s/" + encodeURIComponent(req.body.searchTerm);
        }
    }

    res.redirect(viewURLDir);
});

router.get('/s/:searchTerm', function (req, res, next) {
    list.getViewParams(
        req.sessionID,
        req.params.searchTerm,
        1,
        50,
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

router.get('/perfil/:societyId', function (req, res, next) {
    profile.getViewParams(
        req.sessionID,
        req.params.societyId,
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

router.get('/nueva', function (req, res, next) {
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

router.post('/nueva/crear', function (req, res, next) {
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
    update.submit(
        req.sessionID,
        req,
        function (viewURLDir) {
            res.redirect(viewURLDir);
        }
    );
});

module.exports = router;