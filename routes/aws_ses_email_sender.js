function Common() { }

const { SNSClient, ListTopicsCommand } = require('@aws-sdk/client-sns');
const { fromIni } = require('@aws-sdk/credential-providers');
const awsConfigEnv = fromIni({
    filepath: './aws_credentials.ini',
    configFilepath: './sns_config.ini',
});

Common.prototype.email_sender = function (params, callback) {
    /*fs.readFile(htmlDir, 'utf8', function (err, data) {
        if (err) {
        }
        else {
            var emailHtml = data;

            for (var indHashes in hashes) {
                emailHtml = emailHtml.replace(
                    new RegExp(hashes[indHashes].key, 'g'),
                    hashes[indHashes].replace);
            }

            var emailTxt = emailHtml.replace(/<[^>]*>/g, '');

            var params = {
                Destination: {
                    ToAddresses: toEmails,
                    CcAddresses: ccEmails,
                },
                Source: sourceEmail,
                Message: {
                    Subject: {
                        Data: subject
                    },
                    Body: {
                        Html: {
                            Data: emailHtml

                        },
                        Text: {
                            Data: emailTxt
                        }
                    }
                }
            };

            SES.sendEmail(params,
                function (err, data) {
                    if (err) {
                        console.log("//-----------SES error-----------//");
                        console.log(err);

                    }

                    callback(err);
                });
        }
    });*/
};

module.exports = new Common();