const connection = require('../routes/connection_db');
const common = require('./common');
const SES = require("../routes/aws_ses_email_sender");

function Common() { }

Common.prototype.sendAssignmentNotifications = function () {
    var taskId = common.createNewTaskInScheduler("sendAssignmentNotificationsMA", 0);

    function sendAssignmentNotificationEmail(email, body, subject) {
        var params = {
            Destination: {
                ToAddresses: [email]
            },
            Source: '"MercadoAgro" <noreply@mercadoagro.com.uy>',
            Message: {
                Subject: {
                    Data: subject
                },
                Body: {
                    Html: {
                        Data: body

                    },
                    Text: {
                        Data: body
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
    };

    function extraAssignment() {
        var sqlQuery =
            `
                SELECT 
                    request_extra_assignments.requestId AS requestId, 
                    assUser.name AS assUserName, 
                    assUser.surname AS assUserSurname, 
                    mainUser.email AS mainUserEmail, 
                    mainUser.name AS mainUserName, 
                    company.name AS companyName
                FROM request_extra_assignments 
                INNER JOIN users AS assUser ON assUser.id = request_extra_assignments.assignemntUserId 
                INNER JOIN users AS mainUser ON mainUser.id = request_extra_assignments.userId 
                INNER JOIN request ON request.id = request_extra_assignments.requestId 
                INNER JOIN company ON company.id = request.companyId 
                WHERE 
                    request_extra_assignments.status = 1 AND request_extra_assignments.notif = 0 
                ORDER BY request_extra_assignments.id ASC 
                LIMIT 0,10
            `;

        connection.query(sqlQuery, function (err, results) {

            if (err) {
                console.log(err);
            }
            else {
                if (results.length) {
                    for (var index in results) {
                        var mesasgeEmailText =
                            "<html><body>" +
                            "Hola " + results[index].mainUserName + "," +
                            "<br><br>" +
                            results[index].assUserName + " " + results[index].assUserSurname +
                            " te ha agregado como asociado en el seguimiento de la solicitud " +
                            "<a href='/requests/detail/" + results[index].requestId + "'>" +
                            "S" + results[index].requestId +
                            "</a>" +
                            "<br><br>" +
                            "Este email fue enviado por el sistema de MercadoAgro, no responda al mismo." +
                            "</body></html>";

                        sendAssignmentNotificationEmail(
                            results[index].mainUserEmail,
                            mesasgeEmailText,
                            "S" + results[index].requestId + " - " +
                            results[index].companyName +
                            " - fuiste asociado a esta solicitud"
                        );

                        common.insertTaskInScheduler("sendAssignmentNotificationsMA", taskId, 100, "extra " + results[index].mainUserEmail);

                        var updateSqlQuery =
                            "UPDATE request_extra_assignments SET " +
                            "notif = 1 " +
                            "WHERE " +
                            "requestId = ?";

                        connection.query(
                            updateSqlQuery,
                            [
                                results[index].requestId
                            ],
                            function (err, results) {

                            });

                    }
                }
            }
        });
    };

    function assignment() {
        var sqlQuery =
            `
                SELECT 
                    request_status_history.requestId AS requestId, 
                    request_assignments.id AS assignmentId, 
                    users.name AS userName, 
                    users.email AS userEmail, 
                    company.name AS companyName
                FROM request_assignments 
                INNER JOIN users ON users.id = request_assignments.userId 
                INNER JOIN request_status_history ON request_status_history.id = request_assignments.requestHistoryId 
                INNER JOIN request ON request.id = request_status_history.requestId 
                INNER JOIN company ON company.id = request.companyId 
                WHERE request_assignments.notif = 0 
                ORDER BY request_assignments.id ASC 
                LIMIT 0,10
            `;

        connection.query(sqlQuery, function (err, results) {

            if (err) {
                console.log(err);
            }
            else {
                if (results.length) {
                    for (var index in results) {
                        var mesasgeEmailText =
                            "<html><body>" +
                            "Hola " + results[index].userName + "," +
                            "<br><br>" +
                            "Se te ha asignado la siguiente solicitud para su seguimiento: " +
                            "<a href='/requests/detail/" + results[index].requestId + "'>" +
                            "S" + results[index].requestId +
                            "</a>" +
                            "<br><br>" +
                            "Este email fue enviado por el sistema de MercadoAgro, no responda al mismo." +
                            "</body></html>";

                        sendAssignmentNotificationEmail(
                            results[index].userEmail,
                            mesasgeEmailText,
                            "S" + results[index].requestId + " - " +
                            results[index].companyName +
                            " - solicitud asignada"
                        );

                        common.insertTaskInScheduler("sendAssignmentNotificationsMA", taskId, 100, results[index].userEmail);

                        var updateSqlQuery =
                            "UPDATE request_assignments SET " +
                            "notif = 1 " +
                            "WHERE " +
                            "id = ?";

                        connection.query(
                            updateSqlQuery,
                            [
                                results[index].assignmentId
                            ],
                            function (err, results) {

                            });

                    }
                }
            }
        });
    };

    assignment();
    extraAssignment();
    common.insertTaskInScheduler("sendAssignmentNotificationsMA", taskId, 100, "");

};

module.exports = new Common();