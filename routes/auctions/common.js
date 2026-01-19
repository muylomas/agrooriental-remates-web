const connection = require('../connection_db');

function Common() { }

Common.prototype.activeAuctions = function (callback) {
    let auctions = [];
    connection.query(
        `
            SELECT 
                auctions.*,
                COUNT(DISTINCT cattle_complete.lotId) AS lotsCount
            FROM auctions 
            INNER JOIN cattle_complete ON cattle_complete.auctionId = auctions.id
            WHERE
                auctions.status = 1
            GROUP BY auctions.id
        `,
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                if (results.length) {
                    auctions = results;
                }
            }

            callback(auctions);
        }
    );
};


module.exports = new Common();