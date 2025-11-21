const express = require('express');
const router = express.Router();
const connection = require('./connection_db');
const S3 = require("./aws_s3_uploader");

router.get('/url/:url', function (req, res, next) {
    var fileUrl = decodeURIComponent(req.params.url);

    const downloadFile = (url, callback) => {
        /*
        var params = {
            Bucket: "muylomas",
            Key: url
        }

        s3.getObject(params, (err, data) => {
            if (err) {
                console.error(err);
                callback(err);
            }
            else
                callback(data.Body);
        });
        */
    }

    var sqlQuery =
        "SELECT name, surname, picture, type " +
        "FROM users " +
        "WHERE " +
        "session = ? " +
        "LIMIT 0, 1";

    connection.query(
        sqlQuery,
        [req.sessionID],
        function (err, results) {
            if (err) {
                res.redirect('/login');
            }
            else {
                /*if (results.length) {

                    downloadFile(fileUrl, function (data) {
                        res.header("Access-Control-Allow-Origin", "*");
                        res.header("Access-Control-Allow-Headers", "X-Requested-With");
                        res.header('content-type', 'application/pdf');
                        res.send(data);
                    })
                }
                else {
                    res.redirect('/login');
                }*/
                res.redirect('/login');
            }
        });

});

module.exports = router;