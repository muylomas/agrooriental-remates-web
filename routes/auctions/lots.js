const connection = require('../connection_db');

function Common() { }

Common.prototype.getAuctionsByLotId = function (lotId, callback) {
    let acutionBids = [];

    connection.query(
        `
            SELECT 
                auctions_bids.price AS amount,
                DATE_FORMAT(auctions_bids.created_at - INTERVAL 3 HOUR, '%d/%m/%Y') AS bidDate,
                DATE_FORMAT(auctions_bids.created_at - INTERVAL 3 HOUR, '%H:%i:%s') AS bidTime
            FROM auctions_bids
            WHERE 
                auctions_bids.lotId = ? AND
                auctions_bids.status = 1
            ORDER BY auctions_bids.created_at DESC, auctions_bids.id DESC
            LIMIT 0, 5
        `,
        [
            lotId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else if (results.length) {
                acutionBids = results;
            }

            callback(acutionBids);
        }
    );

};

module.exports = new Common();