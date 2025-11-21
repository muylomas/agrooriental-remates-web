function Common() { }

var connection = require('../routes/connection_db');
var common_gral = require('../routes/common_gral');
var commonEmails = require('./emailSender');
var common = require('./common');

function sendNotifEmail(params, requestId, companyName, callback) {
    var htmlDir = './resources/emails/html/request_notifications.html';
    var subject =
        "S" + requestId + " - " +
        companyName + " - Actualización Logística para " +
        params.requestUser.name + " " + params.requestUser.surname;
    var __aux_messages_rows = "";

    if (params.users.length && params.data.length) {
        for (let index in params.data) {
            var __aux_cell_content = {
                description: "",
                order: "",
                po: "",
            };

            switch (params.data[index].logisticKey) {
                case 'po-PDF':
                    __aux_cell_content.description = "Se creó la órden de compra " +
                        params.data[index].poId + ".";
                    __aux_cell_content.order = params.data[index].orderId;
                    __aux_cell_content.po = params.data[index].poId;
                    break;
                case 'order-po':
                case 'po-order':
                    __aux_cell_content.description =
                        "Se conectó el pedido " +
                        params.data[index].orderId + "-" + params.data[index].orderLine +
                        " con la O.C. " +
                        params.data[index].poId + "-" + params.data[index].poLine + ".";
                    __aux_cell_content.order = params.data[index].orderId + "-" + params.data[index].orderLine;
                    __aux_cell_content.po = params.data[index].poId + "-" + params.data[index].poLine;
                    break;
                case 'po-status':
                case 'shipment_status':
                    __aux_cell_content.description =
                        "Se actualizó el estado del material a " + params.data[index].statusName + ".";
                    __aux_cell_content.order = params.data[index].orderId + "-" + params.data[index].orderLine;
                    __aux_cell_content.po = params.data[index].poId + "-" + params.data[index].poLine;
                    break;
                case 'po-shipmentDate':
                    __aux_cell_content.description =
                        "Se actualizó la fecha de embarque a " + params.data[index].shipmentDate + ".<br>" +
                        "Fecha de nacionalización aprox. " + params.data[index].nationalizationDate + ".<br>" +
                        "FLEC:" + params.data[index].flec + ".";
                    __aux_cell_content.order = params.data[index].orderId + "-" + params.data[index].orderLine;
                    __aux_cell_content.po = params.data[index].poId + "-" + params.data[index].poLine;
                    break;
                case 'po-providerPO':
                    __aux_cell_content.description =
                        "Se actualizó el identificador de compra del proveedor a " +
                        params.data[index].providerPO + ".";
                    __aux_cell_content.order = params.data[index].orderId + "-" + params.data[index].orderLine;
                    __aux_cell_content.po = params.data[index].poId + "-" + params.data[index].poLine;
                    break;
                case 'po-split':
                    __aux_cell_content.description =
                        "Se dividió la O.C. con el material " + params.data[index].productCode + "."
                    __aux_cell_content.order = params.data[index].orderId + "-" + params.data[index].orderLine;
                    __aux_cell_content.po = params.data[index].poId + "-" + params.data[index].poLine;
                    break;
            }

            var __aux_margin_top_table = "0";
            if (index > 0) {
                __aux_margin_top_table = "10px;"
            }

            let datesToInsertTable = "";
            if (
                (params.data[index].committedInitialDate && params.data[index].committedInitialDate > 0) ||
                (params.data[index].shipmentDateShow && params.data[index].shipmentDateShow > 0)
            ) {
                let datesToInsertTableArray = "";
                datesToInsertTableArray.push(
                    `<span style="color:rgb(102,102,102);font-size:10px">
                        FECHAS
                    </span>`
                );

                if (params.data[index].committedInitialDate && params.data[index].committedInitialDate > 0) {
                    datesToInsertTableArray.push(
                        `<span style='font-weight:bold;'>Fecha Ini. Comp.</span>: ` + params.data[index].committedInitialDate
                    );
                }

                if (params.data[index].shipmentDateShow && params.data[index].shipmentDateShow > 0) {
                    datesToInsertTableArray.push(
                        `<span style='font-weight:bold;'>Fecha Ini. Comp.</span>: ` + params.data[index].shipmentDateShow
                    );
                }

                datesToInsertTable = datesToInsertTableArray.join("<br>");
            }


            __aux_messages_rows +=
                `
                    <tr>
                        <td>
                            <table border="0" cellpadding="0" cellspacing="0" 
                                style="margin-top:` + __aux_margin_top_table + `;border-collapse:collapse;border-spacing:0;
                                color:rgb(51,51,51);background-color:rgb(250,250,250);border-radius:3px;font-size:12px;
                                font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
                                <tbody>
                                    <tr height="46">
                                        <td width="320" style="padding-left:20px;border-style:solid;border-color:white;border-left-width:0;border-right-width:1px;border-bottom-width:1px;border-top-width:0px">
                                            <span style="font-weight:bold;">
                                            ` + params.data[index].productCode + `
                                            </span><br>
                                            <span>
                                            ` + params.data[index].productShortCode + `
                                            </span>
                                        </td>
                                        <td width="320" style="padding-left:20px;border-style:solid;border-color:white;border-left-width:0;border-right-width:1px;border-bottom-width:1px;border-top-width:0px">
                                            <span style="color:rgb(102,102,102);font-size:10px;">
                                                PEDIDO: ` + __aux_cell_content.order + `
                                            </span><br>
                                            <span style="color:rgb(102,102,102);font-size:10px;">
                                                O.C.: ` + __aux_cell_content.po + `
                                            </span>
                                        </td>
                                        <td width="320" style="padding-left:20px;border-style:solid;border-color:white;border-left-width:0;border-right-width:1px;border-bottom-width:1px;border-top-width:0px">
                                            ` + datesToInsertTable + `
                                        </td>
                                    </tr>
                                    <tr height="26">
                                        <td width="340" colspan="3" style="padding:20px;border-style:solid;border-color:white;border-left-width:0px;border-right-width:0px;border-top-width:0px;border-bottom-width:0px">
                                        ` + __aux_cell_content.description + `
                                    </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                `;
        }

        var __aux_description_line__ =
            "Estas son las actualizaciones logísticas de la solicitud " +
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
            '"MercadoAgro" <no-reply@mercadoagro.com>',
            [params.requestUser.email],
            params.ccUsers,
            subject,
            hashes
        );
    }

    if (params.data.length) {
        var __updateRequestNotifQuery = [];
        var __updateRequestNotifParams = [];
        for (let index in params.data) {
            __updateRequestNotifQuery.push("?");
            __updateRequestNotifParams.push(
                params.data[index].poId + "-" + params.data[index].poLine
            );
        }

        connection.query(
            `
                UPDATE po_items_history SET
                    notif = 1
                WHERE 
                    CONCAT(poId,"-",poLine) IN (` + __updateRequestNotifQuery.join() + ")"
            ,
            __updateRequestNotifParams,
            function (err, results) {
                if (err) {
                    console.log(err);
                }

                callback();
            });
    }
};

function processNewRequestCommentUpdate(requestsIds, poHistory, processingIndex, callback) {
    common_gral.getRequest({}, requestsIds[processingIndex], function (output) {
        if (!output.request.empty) {
            var userToNotif = output.request.extraUser;
            userToNotif.push(output.request.user);
            let ccUsers = [];
            if (output.request.extraUser && output.request.extraUser.length) {
                for (let index in output.request.extraUser) {
                    ccUsers.push(output.request.extraUser[index].email);
                }
            }
            var __sending_params = {
                requestUser: output.request.user,
                ccUsers: ccUsers,
                users: [],
                data: [],
            };

            for (let index in userToNotif) {
                __sending_params.users.push(userToNotif[index].email);
            }

            var __aux_po_already_in = [];
            for (var indPOHis in poHistory) {
                if (poHistory[indPOHis].requestId == requestsIds[processingIndex] &&
                    !__aux_po_already_in.includes(poHistory[indPOHis].poId + "-" + poHistory[indPOHis].poLine)
                ) {
                    __sending_params.data.push(
                        poHistory[indPOHis]
                    );
                    __aux_po_already_in.push(poHistory[indPOHis].poId + "-" + poHistory[indPOHis].poLine)
                }
            }

            sendNotifEmail(
                __sending_params,
                requestsIds[processingIndex],
                output.request.company,
                function () {
                    if (processingIndex >= requestsIds.length - 1)
                        callback();
                    else
                        processNewRequestCommentUpdate(requestsIds, poHistory, processingIndex + 1, callback)
                })
        }
        else {
            if (processingIndex >= requestsIds.length - 1)
                callback();
            else
                processNewRequestCommentUpdate(requestsIds, poHistory, processingIndex + 1, callback)
        }
    });
};

Common.prototype.logisticsUpdatesEmails = function () {

    var taskId = common.createNewTaskInScheduler("logisticsUpdatesEmails", 0);

    var selectQuery =
        `
            SELECT 
                po_items_history.id AS historyId,
                orders_items.requestId AS requestId,
                po_items_history.key AS logisticKey,
                po_items_history.poId AS poId,
                po_items_history.poLine AS poLine,
                po_items.mercadoOrderId AS orderId,
                po_items.mercadoOrderLine AS orderLine,
                po_items.productCode AS productCode,
                po_items.productShortCode AS productShortCode,
                po_items.providerPO AS providerPO,
                po_items_status.name AS statusName,
                DATE_FORMAT(orders_items.flec, '%d/%m/%Y') AS flec,
                IF(
                    MIN(po_committed_initial_date.shipmentDate) IS NULL, 
                    0,
                    DATE_FORMAT(
                        po_committed_initial_date.shipmentDate,
                        '%d/%m/%Y'
                    )
                ) AS committedInitialDate,
                IF(
                    
                    MIN(po_items.shipmentDate) IS NOT NULL,
                    DATE_FORMAT(
                        po_items.shipmentDate,
                        '%d/%m/%Y'
                    ),
                    0
                ) AS shipmentDateShow,
                DATE_FORMAT(po_items.shipmentDate, '%d/%m/%Y') AS shipmentDate,
                DATE_FORMAT(po_items.shipmentDate + INTERVAL po_items.shipmentFlightDays DAY, '%d/%m/%Y') AS nationalizationDate,
                DATE_FORMAT(po_items_history.created_at, '%d/%m/%Y') AS date
            FROM po_items_history 
            INNER JOIN po_items ON 
                po_items.mercadoId = po_items_history.poId AND
                po_items.mercadoLine = po_items_history.poLine
            LEFT JOIN po_items_history AS po_committed_initial_date ON 
                po_committed_initial_date.poId = po_items_history.poId AND
                po_committed_initial_date.poLine = po_items_history.poLine AND
                po_committed_initial_date.key = 'po-shipmentDate'
            INNER JOIN orders_items ON 
                po_items.mercadoOrderId = orders_items.mercadoId AND 
                po_items.mercadoOrderLine = orders_items.mercadoLine
            INNER JOIN po_items_status ON po_items_status.id = po_items.status
            WHERE 
                po_items_history.notif = 0 AND
                po_items_history.key IN (
                    'po-PDF','order-po','po-order','po-status','shipment_status',
                    'po-shipmentDate','po-providerPO','po-split'
                )
            ORDER BY po_items_history.id DESC
        `;

    connection.query(selectQuery,
        function (err, results) {
            if (err) {
                common.insertTaskInScheduler("logisticsUpdatesEmails", taskId, 30, "");
            }
            else {

                if (results.length) {
                    var requestIds = [];
                    for (let index in results) {
                        if (!requestIds.includes(results[index].requestId))
                            requestIds.push(results[index].requestId);
                    }
                    processNewRequestCommentUpdate(requestIds, results, 0, function () {
                        connection.query(
                            `
                                UPDATE po_items_history SET
                                    notif = 1
                                WHERE 
                                    notif = 0;
                            `,
                            function (err, results) {
                                if (err) {
                                    console.log(err);
                                }

                                common.insertTaskInScheduler("logisticsUpdatesEmails", taskId, 100, "");
                            });
                    });
                }
                else
                    common.insertTaskInScheduler("logisticsUpdatesEmails", taskId, 100, "");
            }
        });

};

module.exports = new Common();