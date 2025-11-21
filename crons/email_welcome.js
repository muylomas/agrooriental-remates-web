function Common() { }

var connection = require('../routes/connection_db');
var commonEmails = require('./emailSender');
var common = require('./common');

Common.prototype.emailNewUser = function () {

    var taskId = common.createNewTaskInScheduler("welcomeEmailApp", 0);

    var selectQuery =
        "SELECT " +
        "`id`, `email`, `name`, `locale`, `confirmSent`, `confirmCode`, `statusCode` " +
        "FROM `users` " +
        "WHERE " +
        "`confirmSent` = 0 " +
        "LIMIT 0, 5";

    connection.query(selectQuery,
        function (err, results) {
            if (err) {
                common.insertTaskInScheduler("welcomeEmailApp", taskId, 30, "");
            }
            else {

                if (results.length) {
                    var sendUser = {};
                    var idSent = [];
                    for (var indNewUser in results) {
                        sendUser = {
                            name: results[indNewUser].name,
                            email: results[indNewUser].email,
                            locale: results[indNewUser].locale
                        };

                        idSent.push(results[indNewUser].id);

                        var htmlDir = './resources/emails/html/welcome_' + results[indNewUser].locale + '.html';
                        var subject = "Welcome to MuyLoMas - Please confirm your email address";
                        switch (results[indNewUser].locale) {
                            case "es":
                                subject = "Bienvenid@ a MuyLoMas - Confirma tu dirección de email";

                                break;
                            default:
                                subject = "Bienvenid@ a MuyLoMas - Confirma tu dirección de email";
                                break;
                        }

                        var hashes = [
                            {
                                key: "__confirmCode__",
                                replace: results[indNewUser].confirmCode
                            },
                            {
                                key: "__statusCode__",
                                replace: results[indNewUser].statusCode
                            }
                        ];

                        commonEmails.email_sender(
                            htmlDir,
                            '"MuyLoMas" <noreply@muylomas.com>',
                            [sendUser.email],
                            [],
                            subject,
                            hashes);
                        common.insertTaskInScheduler("welcomeEmailApp", taskId, 0, sendUser.email);
                    }

                    var updateQuery = "UPDATE `users` SET " +
                        "`confirmSent` = 1 " +
                        "WHERE " +
                        "`id` IN (" + idSent.toString() + ")";


                    connection.query(updateQuery,
                        function (err, results) {
                            if (err) {
                                common.insertTaskInScheduler("welcomeEmailApp", taskId, 30, "");
                            }
                            else {
                                common.insertTaskInScheduler("welcomeEmailApp", taskId, 100, "");
                            }
                        });

                }
                else
                    common.insertTaskInScheduler("welcomeEmailApp", taskId, 100, "");
            }
        });

};

module.exports = new Common();