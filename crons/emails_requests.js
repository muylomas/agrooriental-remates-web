function Common() { }

var connection = require('../routes/connection_db');
var common_gral = require('../routes/common_gral');
var commonEmails = require('./emailSender');
var common = require('./common');

function sendNotifEmail(params, requestId, companyName, callback) {
    var htmlDir = './resources/emails/html/request_notifications.html';
    var subject = "S" + requestId + " - " + companyName + " - Nuevo comentario";
    var __aux_messages_rows = "";

    for (var indxMess in params) {
        if (params[indxMess].users.length) {
            for (let index in params[indxMess].subjectInfo) {
                var __aux_cell_content = "";
                if (params[indxMess].subjectInfo[index].data.startsWith("XconnectToRequest:")) {
                    var __aux_connectedReqId = params[indxMess].subjectInfo[index].data.split(":")[1];

                    __aux_cell_content =
                        "Se conectó a la solicitud: " +
                        "<a href='/requests/detail/" + __aux_connectedReqId + "'>" +
                        "S" + __aux_connectedReqId +
                        "</a>";
                }
                else {
                    var __aux_lineSub = [params[indxMess].subjectInfo[index].data];
                    if (params[indxMess].subjectInfo[index].data && params[indxMess].subjectInfo[index].data.split("\n").length > 1) {
                        var __aux_lineSub = params[indxMess].subjectInfo[index].data.split("\n");
                    }

                    __aux_cell_content = __aux_lineSub.join("<br>");
                }

                var __aux_date = params[indxMess].subjectInfo[index].date;
                if ("hour" in params[indxMess].subjectInfo[index] && params[indxMess].subjectInfo[index].hour)
                    __aux_date += " " + params[indxMess].subjectInfo[index].hour.toLowerCase();

                var __aux_margin_top_table = "0";
                if (index > 0) {
                    __aux_margin_top_table = "10px;"
                }

                __aux_messages_rows +=
                    `
                        <tr>
                            <td>
                                <table border="0" cellpadding="0" cellspacing="0" ` +
                    `style="margin-top:` + __aux_margin_top_table + `;border-collapse:collapse;border-spacing:0;` +
                    `color:rgb(51,51,51);background-color:rgb(250,250,250);border-radius:3px;font-size:12px;` +
                    `font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
                                    <tbody>
                                        <tr height="46">
                                            <td width="320" colspan="2" style="padding-left:20px;border-style:solid;border-color:white;border-left-width:0;border-right-width:1px;border-bottom-width:1px;border-top-width:0px">
                                                <span style="color:rgb(102,102,102);font-size:10px">
                                                    USUARIO
                                                </span><br>` +
                    "<span style='color:#15c;font-weight:bold;'>" +
                    params[indxMess].subjectInfo[index].name + " " + params[indxMess].subjectInfo[index].surname +
                    "</span>" +
                    `</td>
                                            <td width="340" rowspan="2" style="padding:20px;border-style:solid;border-color:white;border-left-width:0px;border-right-width:0px;border-top-width:0px;border-bottom-width:0px">` +
                    __aux_cell_content +
                    `</td>
                                        </tr>
                                        <tr height="46">
                                            <td colspan="2" style="padding-left:20px;border-style:solid;border-color:white;border-left-width:0;border-right-width:1px;border-bottom-width:1px;border-top-width:0px">
                                                <span style="color:rgb(102,102,102);font-size:10px">
                                                    FECHA
                                                </span><br>
                                                <span style='font-weight:bold;'>` +
                    __aux_date +
                    `</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    `;
            }

            var __aux_description_line__ =
                "Estas son las actualizaciones de la solicitud " +
                "<a href='/requests/detail/" + requestId + "'>" +
                "S" + requestId +
                "</a>" +
                ":";

            var hashes = [
                {
                    key: "__description_line__",
                    replace: __aux_description_line__,
                },
                {
                    key: "__products_table__",
                    replace:
                        `<table border="0" cellspacing="0" cellpadding="0" width="565" style="width:450.0pt;border-collapse:collapse">
                            <tbody>` +
                        __aux_messages_rows +
                        `</tbody>
                        </table>`
                },

            ];

            commonEmails.email_sender(
                htmlDir,
                '"Agro Oriental" <no-reply@mercadoagro.com>',
                params[indxMess].users,
                [],
                subject,
                hashes
            );
        }
    }

    connection.query(
        `
            UPDATE request_subject SET
                notif = 1
            WHERE requestId = ?
        `,
        [requestId],
        function (err, results) {
            if (err) {
                console.log(err);
            }

            callback();
        });
};

function processNewRequestCommentUpdate(requests, processingIndex, callback) {
    common_gral.getRequest({}, requests[processingIndex].requestId, function (output) {
        if (!output.request.empty) {
            var userToNotif = output.request.extraUser;
            userToNotif.push(output.request.user);
            var __sending_params = {};
            for (var indSubj in output.request.subjectHistory) {
                if (output.request.subjectHistory[indSubj].notif == 0) {
                    var __aux_key = {
                        key: [],
                        users: [],
                    };

                    for (let index in userToNotif) {
                        if (userToNotif[index].userId != output.request.subjectHistory[indSubj].userId) {
                            __aux_key.key.push(userToNotif[index].userId);
                            __aux_key.users.push(userToNotif[index].email);
                        }
                    }

                    if (!(__aux_key.key.join("_") in __sending_params)) {
                        __sending_params[__aux_key.key.join("_")] = {
                            subjectInfo: [],
                            users: __aux_key.users,
                        }
                    }

                    __sending_params[__aux_key.key.join("_")].subjectInfo.push(
                        output.request.subjectHistory[indSubj]
                    );
                }
            }

            sendNotifEmail(
                __sending_params,
                requests[processingIndex].requestId,
                output.request.company,
                function () {
                    if (processingIndex >= requests.length - 1)
                        callback();
                    else
                        processNewRequestCommentUpdate(requests, processingIndex + 1, callback)
                })
        }
        else {
            if (processingIndex >= requests.length - 1)
                callback();
            else
                processNewRequestCommentUpdate(requests, processingIndex + 1, callback)
        }
    });
};

Common.prototype.requestsUpdatesEmails = function () {

    var taskId = common.createNewTaskInScheduler("requestsUpdatesEmails", 0);

    var selectQuery =
        `
            SELECT 
                request_subject.requestId AS requestId
            FROM request_subject 
            WHERE 
                request_subject.notif = 0
            GROUP BY request_subject.requestId 
            LIMIT 0, 10
        `;

    connection.query(selectQuery,
        function (err, results) {
            if (err) {
                common.insertTaskInScheduler("requestsUpdatesEmails", taskId, 30, "");
            }
            else {

                if (results.length) {
                    processNewRequestCommentUpdate(results, 0, function () {
                        common.insertTaskInScheduler("requestsUpdatesEmails", taskId, 100, "");
                    });
                }
                else
                    common.insertTaskInScheduler("requestsUpdatesEmails", taskId, 100, "");
            }
        });

};

module.exports = new Common();