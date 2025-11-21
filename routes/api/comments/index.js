const express = require('express');
const router = express.Router();
const commentsLists = require('./get-lists');

router.post('/get/first', function (req, res, next) {
    if (
        "body" in req &&
        "lotId" in req.body && req.body.lotId
    ) {
        commentsLists.initialList(
            req.sessionID,
            req.body.lotId,
            function (replyComments) {
                res.json({
                    error: false,
                    comments: replyComments,
                });
            }
        );
    }
    else {
        res.json({
            error: true,
            comments: [],
        });
    }
});

module.exports = router;