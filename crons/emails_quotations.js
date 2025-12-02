function Common() { }

var connection = require('../routes/connection_db');
var commonEmails = require('./emailSender');
var common = require('./common');

Common.prototype.quotationsEmails = function () {

    var taskId = common.createNewTaskInScheduler("quotationsEmails", 0);

    var providers_array = [
        {
            name: "Mercado Agro",
            providerId: 0,
            brands: ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14', '15', '16', '17', '18',],
            email: [
                '"Martín - Agro Oriental" <martin@agrooriental.com.uy.uy>',
            ],
            cc: [
                '"Martín - Agro Oriental" <martin@agrooriental.com.uy.uy>',
            ],
            htmlDir: './resources/emails/html/request_quotation.html',
            salute: "Hola,",
            subject: "Solicitud INTERNA de cotización de equipos",
            description: [
                "Se solicitaron los precios y los plazos de entrega de los siguientes ítems:",
                "Se solicitó el precio y el plazo de entrega del siguiente ítem:",
            ],
            productsRowsHTML: [],
        },
    ];

    var selectQuery =
        `
            SELECT 
                service_request_pieces.id AS pieceId, 
                service_request_pieces.requestId AS requestId, 
                service_request_pieces.productId AS productId, 
                service_request_pieces.quantity AS quantity, 
                products.id AS productId, 
                products.name AS productName,
                products.description AS productDescription,
                products.sku AS productSku,
                brands.name AS brandName,
                products.brandId AS brandId
            FROM service_request_pieces 
            INNER JOIN request ON request.id = service_request_pieces.requestId 
            INNER JOIN products ON products.id = service_request_pieces.productId
            INNER JOIN brands ON brands.id = products.brandId 
            LEFT JOIN service_request_pieces_quotation ON service_request_pieces_quotation.piecesId = service_request_pieces.id
            WHERE 
                service_request_pieces.status = 1 AND 
                service_request_pieces.tracking = 9 AND
                service_request_pieces_quotation.id IS NULL
            GROUP BY service_request_pieces.id 
            ORDER BY service_request_pieces.id ASC
            LIMIT 0, 10
        `;

    connection.query(selectQuery,
        function (err, results) {
            if (err) {
                console.log(err);
                common.insertTaskInScheduler("quotationsEmails", taskId, 30, "");
            }
            else {
                if (results.length) {
                    var insertParamsArray = [];
                    var insertParamsCode = [];
                    for (var indxProd in results) {
                        for (let indProv in providers_array) {
                            if (providers_array[indProv].brands.includes(results[indxProd].brandId)) {
                                insertParamsCode.push("(?,?,NOW(),1)");
                                insertParamsArray.push(results[indxProd].pieceId);
                                insertParamsArray.push(providers_array[indProv].providerId);

                                providers_array[indProv].productsRowsHTML.push(
                                    `<tr style="height:12.0pt">
                                        <td width="70" nowrap="" valign="center" style="width:50.0pt;border:solid windowtext 1.0pt;border-top:none;padding:0cm 3.5pt 0cm 3.5pt;height:12.0pt">
                                            <p>
                                                <span style="font-size:9.0pt">` + results[indxProd].quantity + `</span>
                                            </p>
                                        </td>
                                        <td width="165" nowrap="" valign="center" style="width:150.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0cm 3.5pt 0cm 3.5pt;height:12.0pt">
                                            <p>
                                                <span style="font-size:9.0pt;color:black">` + results[indxProd].productSku + `</span>
                                            </p>
                                        </td>
                                        <td width="165" nowrap="" valign="center" style="width:150.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0cm 3.5pt 0cm 3.5pt;height:12.0pt">
                                            <p>
                                                <span style="font-size:9.0pt;color:black">` + results[indxProd].brandName + `</span>
                                            </p>
                                        </td>
                                        <td width="165" nowrap="" valign="center" style="width:150.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0cm 3.5pt 0cm 3.5pt;height:12.0pt">
                                            <p>
                                                <span style="font-size:9.0pt;color:black">S` + results[indxProd].requestId + `</span>
                                            </p>
                                        </td>
                                    </tr>`
                                );
                            }
                        }
                    }

                    for (let indProv in providers_array) {
                        if (providers_array[indProv].productsRowsHTML.length) {

                            var __aux_description_line__ = providers_array[indProv].description[0];
                            if (providers_array[indProv].productsRowsHTML.length == 1)
                                __aux_description_line__ = providers_array[indProv].description[1];

                            var hashes = [
                                {
                                    key: "__salute_line__",
                                    replace: providers_array[indProv].salute,
                                },
                                {
                                    key: "__description_line__",
                                    replace: __aux_description_line__,
                                },
                                {
                                    key: "__products_table__",
                                    replace:
                                        `<table border="0" cellspacing="0" cellpadding="0" width="565" style="width:450.0pt;border-collapse:collapse">
                                            <tbody>
                                                <tr style="height:42.75pt">
                                                    <td width="70" valign="top" style="width:50.0pt;border:solid windowtext 1.0pt;background:#bdd7ee;padding:0cm 3.5pt 0cm 3.5pt;height:42.75pt">
                                                        <p>
                                                            <span style="font-size:9.0pt">Cantidad</span>
                                                        </p>
                                                    </td>
                                                    <td width="165" valign="top" style="width:150.0pt;border:solid windowtext 1.0pt;border-left:none;background:#bdd7ee;padding:0cm 3.5pt 0cm 3.5pt;height:42.75pt">
                                                        <p>
                                                            <span style="font-size:9.0pt;color:black">Código de producto</span>
                                                        </p>
                                                    </td>
                                                    <td width="165" valign="top" style="width:150.0pt;border:solid windowtext 1.0pt;border-left:none;background:#bdd7ee;padding:0cm 3.5pt 0cm 3.5pt;height:42.75pt">
                                                        <p>
                                                            <span style="font-size:9.0pt;color:black">Marca</span>
                                                        </p>
                                                    </td>
                                                    <td width="165" valign="top" style="width:150.0pt;border:solid windowtext 1.0pt;border-left:none;background:#bdd7ee;padding:0cm 3.5pt 0cm 3.5pt;height:42.75pt">
                                                        <p>
                                                            <span style="font-size:9.0pt;color:black">Ref.</span>
                                                        </p>
                                                    </td>
                                                </tr>` +
                                        providers_array[indProv].productsRowsHTML.join(" ") +
                                        `</tbody>
                                        </table>`
                                },

                            ];

                            commonEmails.email_sender(
                                providers_array[indProv].htmlDir,
                                '"Agro Oriental" <logistica@agrooriental.com.uy.uy>',
                                providers_array[indProv].email,
                                providers_array[indProv].cc,
                                providers_array[indProv].subject,
                                hashes);
                            common.insertTaskInScheduler("quotationsEmails", taskId, 0, "Email a " + providers_array[indProv].email);
                        }
                    }

                    var insertQuery =
                        "INSERT INTO service_request_pieces_quotation (piecesId, providerId, priceReqDate, status) VALUES " +
                        insertParamsCode.join();


                    connection.query(
                        insertQuery,
                        insertParamsArray,
                        function (err, results) {
                            if (err) {
                                console.log(err);
                                common.insertTaskInScheduler("quotationsEmails", taskId, 30, "");
                            }
                            else {
                                common.insertTaskInScheduler("quotationsEmails", taskId, 100, "");
                            }
                        });

                }
                else
                    common.insertTaskInScheduler("quotationsEmails", taskId, 100, "");
            }
        });

};

Common.prototype.sendQuotation = function () {

    var taskId = common.createNewTaskInScheduler("sendQuotationsEmails", 0);

    var selectQuery =
        `SELECT 
            service_request_pieces.id AS pieceId, 
            service_request_pieces.requestId AS requestId, 
            service_request_pieces.productId AS productId, 
            service_request_pieces.quantity AS quantity, 
            products.id AS productId, 
            products.name AS productName,
            products.description AS productDescription,
            products.sku AS productSku,
            brands.name AS brandName,
            service_request_pieces_quotation.currency AS currency,
            service_request_pieces_quotation.price AS price,
            service_request_pieces_quotation.nationalizationPrice AS nationalizationPrice,
            service_request_pieces_quotation.deliveryPeriod + providerParams.flecLow AS deliveryPeriodLow,
            service_request_pieces_quotation.deliveryPeriod + providerParams.flecHigh AS deliveryPeriodHigh,
            users.id AS userId, 
            users.name AS userName, 
            users.surname AS userSurname,
            users.email AS userEmail,
            users.department AS userDepartment,
            providers.name AS providerName
        FROM service_request_pieces 
        INNER JOIN request ON request.id = service_request_pieces.requestId 
        INNER JOIN products ON products.id = service_request_pieces.productId
        INNER JOIN brands ON brands.id = products.brandId 
        LEFT JOIN 
            ( 
                SELECT 
                    MAX(id) AS id, 
                    requestId 
                FROM request_status_history 
                WHERE status IN (2,5) 
                GROUP BY requestId
            ) AS mercadoagroReqStatusHistory
             ON 
            mercadoagroReqStatusHistory.requestId = request.id 
        LEFT JOIN request_assignments ON request_assignments.requestHistoryId = mercadoagroReqStatusHistory.id 
        LEFT JOIN users ON users.id = request_assignments.userId  
        LEFT JOIN service_request_pieces_quotation ON service_request_pieces_quotation.piecesId = service_request_pieces.id
        INNER JOIN providers ON providers.id = service_request_pieces_quotation.providerId
        INNER JOIN providers_import_coefficients AS providerParams ON providerParams.providerId = service_request_pieces_quotation.providerId
        WHERE 
            service_request_pieces.status = 1 AND 
            service_request_pieces.tracking = 9 AND
            service_request_pieces_quotation.currency IS NOT NULL AND
            service_request_pieces_quotation.price IS NOT NULL AND
            service_request_pieces_quotation.nationalizationPrice IS NOT NULL AND
            service_request_pieces_quotation.deliveryPeriod IS NOT NULL 
        GROUP BY service_request_pieces.id 
        ORDER BY service_request_pieces.id ASC`;

    connection.query(selectQuery,
        function (err, results) {
            if (err) {
                console.log(err);
                common.insertTaskInScheduler("sendQuotationsEmails", taskId, 30, "");
            }
            else {

                if (results.length) {
                    var requests = {};
                    for (var indxRes in results) {
                        if (!(results[indxRes].requestId in requests)) {
                            requests[results[indxRes].requestId] = [];
                        }

                        requests[results[indxRes].requestId].push(results[indxRes]);
                    }

                    var htmlDir = './resources/emails/html/send_quotation.html';
                    for (var indxReq in requests) {
                        var subject = "Cotización de equipos - S" + indxReq;
                        var updateParamsCode = [];
                        var updateParamsArray = [];
                        var __aux_products_rows = "";

                        var __aux_provider_name = requests[indxReq][0].providerName;

                        for (var indxProd in requests[indxReq]) {
                            updateParamsCode.push(" id = ? ");
                            updateParamsArray.push(requests[indxReq][indxProd].pieceId);

                            __aux_products_rows +=
                                `<tr style="height:12.0pt">
                                    <td width="70" nowrap="" valign="center" style="width:50.0pt;border:solid windowtext 1.0pt;border-top:none;padding:0cm 3.5pt 0cm 3.5pt;height:12.0pt">
                                        <p>
                                            <span style="font-size:9.0pt">` + requests[indxReq][indxProd].quantity + `</span>
                                        </p>
                                    </td>
                                    <td width="165" nowrap="" valign="center" style="width:150.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0cm 3.5pt 0cm 3.5pt;height:12.0pt">
                                        <p>
                                            <span style="font-size:9.0pt;color:black">` + requests[indxReq][indxProd].productSku + `</span>
                                        </p>
                                    </td>
                                    <td width="165" nowrap="" valign="center" style="width:150.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0cm 3.5pt 0cm 3.5pt;height:12.0pt">
                                        <p>
                                            <span style="font-size:9.0pt;color:black">` + requests[indxReq][indxProd].brandName + `</span>
                                        </p>
                                    </td>
                                    <td width="165" nowrap="" valign="center" style="width:150.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0cm 3.5pt 0cm 3.5pt;height:12.0pt">
                                        <p>
                                            <span style="font-size:9.0pt;color:black">` +
                                requests[indxReq][indxProd].currency + " " +
                                (requests[indxReq][indxProd].quantity * requests[indxReq][indxProd].price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                                "*" +
                                `</span>
                                            <br/>
                                            <span style="font-size:9.0pt;color:black">` +
                                requests[indxReq][indxProd].currency + " " +
                                (requests[indxReq][indxProd].quantity * requests[indxReq][indxProd].nationalizationPrice).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                                "**" +
                                `</span>
                                            <br/>
                                            <span style="font-size:9.0pt;color:black"> Plazo de entrega: ` +
                                requests[indxReq][indxProd].deliveryPeriodLow + "-" +
                                requests[indxReq][indxProd].deliveryPeriodHigh + " días aprox." +
                                `</span>
                                        </p>
                                    </td>
                                </tr>`;
                        }

                        var __aux_description_line__ = "Se envían las cotizaciones solicitadas para la solicitud S" + indxReq + "."

                        var hashes = [
                            {
                                key: "__salute_line__",
                                replace: "Hola, cómo están?",
                            },
                            {
                                key: "__description_line__",
                                replace: __aux_description_line__,
                            },
                            {
                                key: "__provider_name__",
                                replace: __aux_provider_name,
                            },
                            {
                                key: "__products_table__",
                                replace:
                                    `<table border="0" cellspacing="0" cellpadding="0" width="565" style="width:450.0pt;border-collapse:collapse">
                                        <tbody>
                                            <tr style="height:42.75pt">
                                                <td width="70" valign="top" style="width:50.0pt;border:solid windowtext 1.0pt;background:#bdd7ee;padding:0cm 3.5pt 0cm 3.5pt;height:42.75pt">
                                                    <p>
                                                        <span style="font-size:9.0pt">Cantidad</span>
                                                    </p>
                                                </td>
                                                <td width="165" valign="top" style="width:150.0pt;border:solid windowtext 1.0pt;border-left:none;background:#bdd7ee;padding:0cm 3.5pt 0cm 3.5pt;height:42.75pt">
                                                    <p>
                                                        <span style="font-size:9.0pt;color:black">Código de producto</span>
                                                    </p>
                                                </td>
                                                <td width="165" valign="top" style="width:150.0pt;border:solid windowtext 1.0pt;border-left:none;background:#bdd7ee;padding:0cm 3.5pt 0cm 3.5pt;height:42.75pt">
                                                    <p>
                                                        <span style="font-size:9.0pt;color:black">Marca</span>
                                                    </p>
                                                </td>
                                                <td width="165" valign="top" style="width:150.0pt;border:solid windowtext 1.0pt;border-left:none;background:#bdd7ee;padding:0cm 3.5pt 0cm 3.5pt;height:42.75pt">
                                                    <p>
                                                        <span style="font-size:9.0pt;color:black">Cotización</span>
                                                    </p>
                                                </td>
                                            </tr>` +
                                    __aux_products_rows +
                                    `</tbody>
                                    </table>`
                            },

                        ];

                        var __aux_to_array = [
                            '"' + requests[indxReq][0].userName + " " + requests[indxReq][0].userSurname + '" ' +
                            '<' + requests[indxReq][0].userEmail + '>'
                        ];

                        commonEmails.email_sender(
                            htmlDir,
                            '"Cotizaciones Agro Oriental" <cotizaciones@agrooriental.com.uy>',
                            __aux_to_array,
                            [
                                '"Martín - Agro Oriental" <martin@agrooriental.com.uy>',
                            ],
                            subject,
                            hashes
                        );
                        common.insertTaskInScheduler("sendQuotationsEmails", taskId, 0, "");

                        var updateQuery =
                            "UPDATE service_request_pieces SET tracking = 10 WHERE " +
                            updateParamsCode.join(" OR ");


                        connection.query(
                            updateQuery,
                            updateParamsArray,
                            function (err, results) {
                                if (err) {
                                    console.log(err);
                                    common.insertTaskInScheduler("sendQuotationsEmails", taskId, 30, indxReq);
                                }
                                else {
                                    common.insertTaskInScheduler("sendQuotationsEmails", taskId, 100, indxReq);
                                }
                            });
                    }

                }
                else
                    common.insertTaskInScheduler("sendQuotationsEmails", taskId, 100, "");
            }
        });

};

module.exports = new Common();