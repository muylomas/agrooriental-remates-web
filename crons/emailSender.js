const fs = require("fs");
const SES = require("../routes/aws_ses_email_sender");

function Common() { }

Common.prototype.email_sender = function (htmlDir, sourceEmail, toEmails, ccEmails, subject, hashes) {
    fs.readFile(htmlDir, 'utf8', function (err, data) {
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

            SES.email_sender(
                params,
                function (err, data) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                    }

                }
            );
        }
    });
};

module.exports = new Common();