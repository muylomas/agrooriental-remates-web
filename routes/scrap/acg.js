const connection = require('../connection_db');
const https = require('https');

function processBody(body) {
    let cattlePrices = [];

    if (body.indexOf('id="boxInformativo"') != -1) {
        let __aux_getDataSection = body.split('id="boxInformativo"')[1];
        if (__aux_getDataSection.indexOf('</section>') != -1) {
            let dataSection = __aux_getDataSection.split('id="boxInformativo"')[0];
            let sectionsCards = dataSection.split('class="card');

            if (sectionsCards.length > 1) {
                for (var cardIndex in sectionsCards) {
                    if (sectionsCards[cardIndex].indexOf('Precios de la semana') != -1 &&
                        sectionsCards[cardIndex].indexOf('</h6>') != -1 &&
                        sectionsCards[cardIndex].indexOf('primeraColumnaBoxInformativo') != -1) {

                        let cattleDataBody = sectionsCards[cardIndex].split('primeraColumnaBoxInformativo')[1];
                        let cattleDataArray = cattleDataBody.split('</div> <!--');

                        for (var cattleIndex in cattleDataArray) {
                            if (cattleIndex < 4) {
                                if (cattleDataArray[cattleIndex].indexOf('img') != -1 &&
                                    cattleDataArray[cattleIndex].indexOf('</h5>') != -1 &&
                                    cattleDataArray[cattleIndex].indexOf('col-8') != -1 &&
                                    cattleDataArray[cattleIndex].indexOf('</h3>') != -1 &&
                                    cattleDataArray[cattleIndex].indexOf('</p>') != -1) {
                                    let __aux_title = cattleDataArray[cattleIndex].split('</h5>')[0].split('>');
                                    let __aux_val = cattleDataArray[cattleIndex].split('col-8')[1].split('</h3>')[0].split('>');
                                    let __aux_unit = cattleDataArray[cattleIndex].split('col-8')[1].split('</p>')[0].split('>');
                                    let __aux_data_compound = {
                                        title: __aux_title[__aux_title.length - 1].trim(),
                                        image: cattleDataArray[cattleIndex].split('<img src="')[1].split('"')[0].trim(),
                                        val: __aux_val[__aux_val.length - 1].trim(),
                                        unit: __aux_unit[__aux_unit.length - 1].trim(),
                                    };
                                    cattlePrices.push(__aux_data_compound);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return cattlePrices;
};

function Common() { }

Common.prototype.getCattlePrices = function (callback) {
    let cattlePrices = [];
    connection.query(
        `
            SELECT * 
            FROM cattle_prices_acg 
            WHERE created_at > (NOW() - INTERVAL 3 HOUR)
        `,
        function (err, results) {
            if (err) {
                console.log(err);
            }

            if (!err && results.length) {
                try {
                    cattlePrices = processBody(results[0].value);
                    callback(cattlePrices);
                }
                catch (err) {
                    console.log(err);
                    callback(cattlePrices);
                }
            }
            else {
                try {
                    var options = {
                        hostname: "acg.com.uy",
                        port: 443,
                        path: "/",
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
                                connection.query(
                                    `
                                        INSERT INTO cattle_prices_acg SET value = ?
                                    `,
                                    [
                                        body,
                                    ],
                                    function (err, results) {
                                        cattlePrices = processBody(body);
                                        callback(cattlePrices);
                                    }
                                );
                            });
                        });
                }
                catch (err) {
                    console.log(err);
                    callback(cattlePrices);
                }
            }
        }
    );
};

module.exports = new Common();