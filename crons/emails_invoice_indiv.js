function Common() { }

const connection = require('../routes/connection_db');
const commonEmails = require('./emailSender');
const common = require('./common');
const ccUsers = [
    'mle0277@gmail.com',
];
const serviceUsers = [
    'mle0277@gmail.com',
];
const htmlDir = './resources/emails/html/new_invoice.html';

function sendNotifEmail(invoicesData, callback) {
    let subject = "Nueva factura #" + invoicesData.value + " - " + invoicesData.companyName + " - S" + invoicesData.requestId;
    let __aux_amount = invoicesData.amount;
    if (__aux_amount) {
        __aux_amount = __aux_amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    let hashes = [
        {
            key: "__invoice_number__",
            replace: invoicesData.value,
        },
        {
            key: "__invoice_currency__",
            replace: invoicesData.currency,
        },
        {
            key: "__invoice_amount__",
            replace: __aux_amount,
        },
        {
            key: "__invoice_date__",
            replace: invoicesData.date,
        },
        {
            key: "__invoice_requestId__",
            replace: invoicesData.requestId,
        },

    ];

    let toUserEmails = invoicesData.user;
    if (invoicesData.requestId > 20000000) {
        toUserEmails = serviceUsers;
    }

    if (toUserEmails.length) {
        commonEmails.email_sender(
            htmlDir,
            '"MercadoAgro" <facturacion@mercadoagro.com>',
            toUserEmails,
            ccUsers,
            subject,
            hashes
        );
    }

    callback();

};

function processEmailNotif(invoices, invoicesId, processingIndex, callback) {
    sendNotifEmail(invoices[processingIndex], function () {
        invoicesId.push(invoices[processingIndex].id);
        if (processingIndex >= invoices.length - 1) {
            let invoicesId_string = [];
            for (let index in invoicesId) {
                invoicesId_string.push("?");
            }

            connection.query(
                `
                    UPDATE request_poinon SET
                        notif = 1
                    WHERE 
                        id IN (` + invoicesId_string.join() + `)
                `,
                invoicesId,
                function (err, results) {
                    if (err) {
                        console.log(err);
                    }

                    callback();
                }
            );
        }
        else
            processEmailNotif(invoices, invoicesId, processingIndex + 1, callback)
    });
};

function groupRequests(data) {
    let outputResult = [];
    let requestsIdArray = [];
    for (let index in data) {
        indReqUpdate = outputResult.length;
        if (!requestsIdArray.includes(data[index].requestId)) {
            requestsIdArray.push(data[index].requestId);
            outputResult.push({});

            outputResult[indReqUpdate].id = data[index].id;
            outputResult[indReqUpdate].requestId = data[index].requestId;
            outputResult[indReqUpdate].value = data[index].value;
            outputResult[indReqUpdate].type = data[index].type;
            outputResult[indReqUpdate].currency = data[index].currency;
            outputResult[indReqUpdate].amount = data[index].amount;
            outputResult[indReqUpdate].date = data[index].date;
            outputResult[indReqUpdate].companyName = data[index].companyName;
            outputResult[indReqUpdate].user = [];

            if (data[index].user && !ccUsers.includes(data[index].extraUser))
                outputResult[indReqUpdate].user.push(data[index].user);

        }
        else {
            for (let indexSearch in outputResult) {
                if (outputResult[indexSearch].requestId == data[index].requestId) {
                    indReqUpdate = indexSearch;
                }
            }
        }

        if (
            data[index].extraUser &&
            !outputResult[indReqUpdate].user.includes(data[index].extraUser) &&
            !ccUsers.includes(data[index].extraUser)
        ) {
            outputResult[indReqUpdate].user.push(data[index].extraUser);
        }
    }

    return outputResult;
}

Common.prototype.invoiceServiceNotifIndiv = function () {

    var taskId = common.createNewTaskInScheduler("invoiceServiceNotifIndiv", 0);

    var selectQuery =
        `
            SELECT 
                request_poinon.id AS id, 
                request_poinon.requestId AS requestId,
                request_poinon.value AS value,
                request_poinon.type AS type,
                request_poinon.currency AS currency,
                request_poinon.amount AS amount,
                DATE_FORMAT(request_poinon.date, '%d/%m/%Y') AS date,
                company.name AS companyName, 
                extraUser.email AS extraUser,
                users.email AS user
            FROM request_poinon
            INNER JOIN request ON request.id = request_poinon.requestId 
            INNER JOIN company ON company.id = request.companyId 
            LEFT JOIN request_status_history_assign ON request_status_history_assign.requestId = request_poinon.requestId 
            LEFT JOIN users ON users.id = request_status_history_assign.userId
            LEFT JOIN request_extra_assignments ON request_extra_assignments.requestId = request_poinon.requestId AND request_extra_assignments.status = 1 
            LEFT JOIN users AS extraUser ON extraUser.id = request_extra_assignments.userId 
            WHERE 
                request_poinon.notif = 0 AND 
                request_poinon.type = "invoiceNumber" AND
                request_poinon.status = 1
            LIMIT 0, 10
        `;

    connection.query(selectQuery,
        function (err, results) {
            if (err) {
                console.log(err);
                common.insertTaskInScheduler("invoiceServiceNotifIndiv", taskId, 30, "");
            }
            else {
                if (results.length) {
                    processEmailNotif(
                        groupRequests(results),
                        [],
                        0,
                        function () {
                            common.insertTaskInScheduler("invoiceServiceNotifIndiv", taskId, 100, "");
                        }
                    );
                }
                else {
                    common.insertTaskInScheduler("invoiceServiceNotifIndiv", taskId, 100, "");
                }
            }
        });

};

module.exports = new Common();