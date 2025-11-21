function Common() { }

const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { fromIni } = require('@aws-sdk/credential-providers');
const awsConfigEnv = fromIni({
    filepath: './aws_credentials.ini',
    configFilepath: './s3_config.ini',
});

Common.prototype.uploadFile = function (bucketName, bucketKey, fileContent, contentEncoding, type, aclPermission, callback) {
    const params = {
        Bucket: bucketName,
        Key: bucketKey,
        Body: fileContent,
        ContentEncoding: contentEncoding,
        ContentType: type,
        ACL: aclPermission
    };

    const upload = new Upload({
        client: new S3Client({ region: "us-east-1", credentials: awsConfigEnv }),
        params: params
    });

    upload.done()
        .then(_ => callback(false))
        .catch(s3Err => {
            //console.error("unable to upload", e);
            console.log("|---------------------- S3 error ----------------------|");
            console.log(s3Err);
            console.log("|------------------------------------------------------|");
            callback(s3Err);
        });
};

module.exports = new Common();