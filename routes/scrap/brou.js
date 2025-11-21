const connection = require('../connection_db');
const https = require('https');

function processCurrencyBody(body) {
    currencyObj = [];
    var getTableRows = body.split("<tr>");
    for (var curInd in getTableRows) {
        if (getTableRows[curInd].indexOf("<td>") != -1) {
            var getTableRowsCell = getTableRows[curInd].split("<td>");

            if (getTableRowsCell.length == 10) {
                if (
                    getTableRowsCell[1].indexOf('<img src="') &&
                    getTableRowsCell[1].indexOf('class="moneda">')
                ) {
                    currencyObj.push({
                        icon: "https://www.brou.com.uy" + getTableRowsCell[1].split('<img src="')[1].split('"')[0],
                        currency: getTableRowsCell[1].split('class="moneda">')[1].split('<')[0].trim(),
                        buy: getTableRowsCell[3].split('class="valor">')[1].split('<')[0].trim(),
                        sell: getTableRowsCell[5].split('class="valor">')[1].split('<')[0].trim(),
                        abuy: getTableRowsCell[7].split('class="valor">')[1].split('<')[0].trim(),
                        asell: getTableRowsCell[9].split('class="valor">')[1].split('<')[0].trim(),
                    });
                }
            }
        }
    }

    return currencyObj;
};

function Common() { }

Common.prototype.getCurrencies = function (callback) {
    let currencyObj = [];
    connection.query(
        `
            SELECT * 
            FROM currency_table 
            WHERE created_at > (NOW() - INTERVAL 3 HOUR)
        `,
        function (err, results) {
            if (err) {
                console.log(err);
            }

            if (!err && results.length) {
                currencyObj = processCurrencyBody(results[0].value);
                callback(currencyObj);
            }
            else {
                try {
                    var options = {
                        hostname: "www.brou.com.uy",
                        port: 443,
                        path: "/c/portal/render_portlet?p_l_id=20593&p_p_id=cotizacionfull_WAR_broutmfportlet_INSTANCE_otHfewh1klyS&p_p_lifecycle=0&p_t_lifecycle=0&p_p_state=normal&p_p_mode=view&p_p_col_id=column-1&p_p_col_pos=0&p_p_col_count=2&p_p_isolated=1&currentURL=%2Fcotizaciones",
                        method: 'GET'
                    };

                    https.get(
                        options,
                        function (response) {
                            // Continuously update stream with data
                            var body = '';
                            response.on('data', function (reply) {
                                body += reply;
                            });
                            response.on('end', function () {

                                if (body.indexOf("<tr>") != -1) {
                                    connection.query(
                                        `
                                            INSERT INTO currency_table SET value = ?
                                        `,
                                        [
                                            body,
                                        ],
                                        function (err, results) {
                                            currencyObj = processCurrencyBody(body);
                                            callback(currencyObj);
                                        });
                                }
                                else {
                                    callback(currencyObj);
                                }
                            });
                        });
                }
                catch (err) {
                    console.log(err);
                    callback(currencyObj);
                }
            }
        }
    );
};

module.exports = new Common();