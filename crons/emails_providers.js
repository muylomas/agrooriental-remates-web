function Common() { }

var connection = require('../routes/connection_db');
var commonEmails = require('./emailSender');
var common = require('./common');

const productTableRowTemplate =
    `
        <td style="
                border-width:1px;
                border-style:solid;
                border-color:#002060;
                overflow:hidden;
                padding:0px 3px;
                vertical-align:middle;
                font-family:Roboto;
                font-size:8pt;
                font-weight:normal;
                color:rgb(8,17,59)
            ">
                __row_content__
        </td>
    `;

function sendNotifEmail(tableRows, providerName, onlineKey, toName, updateItemCount, toEmails, callback) {
    var htmlDir = './resources/emails/html/providers_notifications/provider_notifications.html';
    var subject = "Materiales pendientes de O.C. - " + providerName;

    var remainingItems = "";
    if (updateItemCount) {
        remainingItems = " (5 de " + updateItemCount + " materiales pendientes)";
    }

    var hashes = [
        {
            key: "__recipient_name__",
            replace: toName,
        },
        {
            key: "__online_key__",
            replace: onlineKey,
        },
        {
            key: "__provider_name__",
            replace: providerName,
        },
        {
            key: "__remaining_items__",
            replace: remainingItems,
        },
        {
            key: "__products_table_rows__",
            replace: tableRows,
        },

    ];

    commonEmails.email_sender(
        htmlDir,
        '"Agro Oriental" <logistica@mercadoagro.com>',
        toEmails,
        [
            'martin@mercadoagro.com',
        ],
        subject,
        hashes
    );


    callback();

};

function createTableCell(content) {
    return productTableRowTemplate.replace(
        "__row_content__",
        content
    );
};

function processProviderMissingUpdate(providersId, providersData, processingIndex, callback) {
    var provider_name = providersData[providersId[processingIndex]][0].provider;
    var online_key = providersData[providersId[processingIndex]][0].onlineAccessKey;
    var to_name = providersData[providersId[processingIndex]][0].contactName;
    var to_emails = [providersData[providersId[processingIndex]][0].contactEmail];

    if (providersData[providersId[processingIndex]][0].contactEmail.indexOf(",") != -1) {
        to_emails = providersData[providersId[processingIndex]][0].contactEmail.split(",");
    }

    var tableRows = [];
    const maxTableRows = 5;
    for (var indProvDat in providersData[providersId[processingIndex]]) {
        if (indProvDat < maxTableRows) {
            tableRows.push(
                '<tr style="height:20px">' +
                createTableCell(providersData[providersId[processingIndex]][indProvDat].poId) +
                createTableCell(providersData[providersId[processingIndex]][indProvDat].poDate) +
                createTableCell(providersData[providersId[processingIndex]][indProvDat].providerPO) +
                createTableCell(providersData[providersId[processingIndex]][indProvDat].poType) +
                createTableCell(providersData[providersId[processingIndex]][indProvDat].productQuantity) +
                createTableCell(providersData[providersId[processingIndex]][indProvDat].productCode) +
                createTableCell(providersData[providersId[processingIndex]][indProvDat].productBrand) +
                createTableCell(providersData[providersId[processingIndex]][indProvDat].shipmentDate) +
                createTableCell(providersData[providersId[processingIndex]][indProvDat].productStatus) +
                '</tr>'
            );
        }
    }

    var update_item_count = 0;
    if (providersData[providersId[processingIndex]].length > maxTableRows) {
        update_item_count = providersData[providersId[processingIndex]].length;
    }



    sendNotifEmail(tableRows.join(" "), provider_name, online_key, to_name, update_item_count, to_emails, function () {
        if (processingIndex >= providersId.length - 1)
            callback();
        else
            processProviderMissingUpdate(providersId, providersData, processingIndex + 1, callback)
    })
};

Common.prototype.providersUpdateEmails = function () {

    var taskId = common.createNewTaskInScheduler("providersUpdateEmails", 0);

    var selectQuery =
        `
            SELECT 
                po_items.mercadoId AS poId,
                po_items.type AS poType,
                DATE_FORMAT(po_items.datePO, '%d/%m/%Y') AS poDate,
                po_items.provider AS provider,
                po_items.providerPO AS providerPO,
                po_items.productCode AS productCode,
                po_items.productShortCode AS productShortCode,
                po_items.brand AS productBrand,
                po_items.quantity AS productQuantity,
                po_items.currency AS productCurrency,
                po_items.price AS productPriced,
                po_items_status.shortName AS productStatus,
                IF(
                    po_items.shipmentDate != 0 AND po_items.shipmentDate IS NOT NULL,
                    DATE_FORMAT(po_items.shipmentDate, '%d/%m/%Y'),
                    ''
                ) AS shipmentDate,
                providers.id AS providerId,
                providers.contactFirstname AS contactName,
                providers.contactEmail AS contactEmail,
                providers.onlineAccessKey AS onlineAccessKey
            FROM po_items
            INNER JOIN providers ON providers.mercado = po_items.provider
            INNER JOIN po_items_status ON po_items_status.id = po_items.status
            WHERE 
                po_items.shipmentDate < NOW() AND
                (po_items.status NOT IN (40,45,200) AND po_items.status < 50) AND
                providers.contactEmail != ''
            ORDER BY po_items.datePO ASC, po_items.date ASC
        `;

    connection.query(selectQuery,
        function (err, results) {
            if (err) {
                console.log(err);
                common.insertTaskInScheduler("providersUpdateEmails", taskId, 30, "");
            }
            else {

                if (results.length) {
                    providersId = [];
                    providersData = {};
                    for (let index in results) {
                        if (!(results[index].providerId in providersData)) {
                            providersData[results[index].providerId] = [];
                            providersId.push(results[index].providerId);
                        }

                        providersData[results[index].providerId].push(results[index]);
                    }
                    processProviderMissingUpdate(providersId, providersData, 0, function () {
                        common.insertTaskInScheduler("providersUpdateEmails", taskId, 100, "");
                    });
                }
                else {
                    common.insertTaskInScheduler("providersUpdateEmails", taskId, 100, "");
                }
            }
        });

};

module.exports = new Common();