const mime = require('mime');
const fs = require('fs');
const sha512 = require('js-sha512');
const S3 = require("./aws_s3_uploader");

function Common() { }

Common.prototype.redirectSavingSession = function (req, res, url) {
    req.session.save(function (err) {
        res.redirect(url);
    });
}

Common.prototype.renderSavingSession = function (req, res, url, params) {
    res.render(url, params);
    /*req.session.save(function(err){
        res.render(url,  params);
    });*/
}

Common.prototype.fileNameExt = function (fileName) {
    // Get mime type from name
    var type = mime.getType(fileName);
    if (!type)
        type = 'text/plain';

    var fileNameLowerCase = fileName.toLowerCase();
    var __aux_nameArr = fileNameLowerCase.split(".");
    var __aux_extension = mime.getExtension(type);
    var __aux_fileOriginalName = "";
    if (__aux_nameArr.length > 1) {
        __aux_extension = __aux_nameArr[__aux_nameArr.length - 1];
        if (__aux_nameArr.length == 2) {
            __aux_fileOriginalName = __aux_nameArr[0];
        }
        else {
            __aux_fileOriginalName = __aux_nameArr.splice(-1, 1).join(".");
        }
    }

    return {
        name: __aux_fileOriginalName.replace(/\s+/g, '_'),
        extension: __aux_extension,
        mimeType: type
    };
};

Common.prototype.uploadFile = function (fileName, folder, fields, callback) {
    const fileContent = fs.readFileSync(fileName);

    const fileNameExtMime = Common.prototype.fileNameExt(fields.fileName);

    const timestamp_seconds = new Date().getTime() / 1000;
    const __aux_filename =
        sha512(
            Common.prototype.randomString(12) +
            timestamp_seconds + "-" +
            (10000 + Math.floor(Math.random() * 1000)).toString()
        ) + "." + fileNameExtMime.extension;

    S3.uploadFile(
        "agro-oriental-remates",
        folder + __aux_filename,
        fileContent,
        "",
        fileNameExtMime.mimeType,
        'public-read',
        function (s3Err) {
            if (s3Err) {
                callback("");
            }
            else
                callback(__aux_filename);
        }
    );
};

Common.prototype.randomString = function (length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

Common.prototype.randomStringNumbers = function (length) {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

module.exports = new Common();