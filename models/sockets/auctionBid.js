/*
 * Serve content over a socket
 */
const connection = require('../../routes/connection_db');

function getUserBySocket(socketId, callback) {
    connection.query(
        `
            SELECT id
            FROM customers
            WHERE socketId = ?
        `,
        [
            socketId,
        ],
        function (err, results) {
            let userId = 0;
            if (err) {
                console.log(err);
            }
            else if (results.length) {
                userId = results[0].id;
            }

            callback(userId);
        }
    );
}

function isSalePrice(lastBid, salePrice, lotId, callback) {
    if (salePrice <= lastBid) {
        /*connection.query(
            `
                UPDATE cattle SET
                auctionEnd = NOW() - INTERVAL 3 HOUR
                WHERE id = ?
            `,
            [
                lotId,
            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                }
                callback(true);
            }
        );*/
        callback(true);
    }
    else
        callback(false);
}

module.exports = function (socket) {
    socket.on('auctionBidCustomers', (parameters) => {
        console.log("=================== Models auctionBidCustomers ===================");
        console.log(parameters);
        if (
            "bid" in parameters && parameters.bid &&
            "lotId" in parameters && parameters.lotId
        ) {
            getUserBySocket(
                socket.id,
                function (customerId) {
                    if (customerId) {
                        connection.query(
                            `
                                INSERT INTO auctions_bids (price, lotId, customerId, userId, socket, status)
                                SELECT 
                                    ? AS price,
                                    ? AS lotId,
                                    ? AS customerId,
                                    0 AS userId,
                                    ? AS socket,
                                    1 AS status
                                FROM cattle_complete
                                WHERE 
                                    cattle_complete.lotId = ? AND
                                    cattle_complete.auctionEnd > NOW() - INTERVAL 3 HOUR AND
                                    (
                                        SELECT IF(MAX(price) IS NULL, 0, MAX(price)) FROM auctions_bids WHERE lotId = ?
                                    ) < ?;
                            `,
                            [
                                parameters.bid,
                                parameters.lotId,
                                customerId,
                                socket.id,
                                parameters.lotId,
                                parameters.lotId,
                                parameters.bid,
                            ],
                            function (err, results) {
                                if (err) {
                                    console.log(err);
                                }
                                connection.query(
                                    `
                                        SELECT 
                                            auctions_bids.socket AS socketId,
                                            IF(
                                                auctions_bids.price IS NULL,
                                                cattle_complete.startPrice,
                                                auctions_bids.price
                                            ) AS price,
                                            cattle_complete.salePrice AS salePrice
                                        FROM auctions_bids_max
                                        INNER JOIN auctions_bids ON auctions_bids.id = auctions_bids_max.auctionBidId
                                        LEFT JOIN cattle_complete ON cattle_complete.lotId = auctions_bids_max.lotId
                                        WHERE 
                                            auctions_bids_max.lotId = ?;
                                    `,
                                    [
                                        parameters.lotId,
                                    ],
                                    function (err, results) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        else if (results.length) {
                                            if (results[0].socketId != socket.id) {
                                                socket.emit(
                                                    'auctionBidUpdate',
                                                    {
                                                        price: parameters.bid,
                                                        lotId: parameters.lotId,
                                                        socketId: "",
                                                        end: true,
                                                    },
                                                );
                                            }
                                            else {
                                                isSalePrice(
                                                    results[0].price,
                                                    results[0].salePrice,
                                                    parameters.lotId,
                                                    function (acutionEnd) {
                                                        let __aux_newBidMsg = {
                                                            price: results[0].price,
                                                            lotId: parameters.lotId,
                                                            socketId: socket.id,
                                                            end: acutionEnd,
                                                        };

                                                        socket.broadcast.emit(
                                                            'auctionBidUpdate',
                                                            __aux_newBidMsg,
                                                        );

                                                        socket.emit(
                                                            'auctionBidUpdate',
                                                            __aux_newBidMsg,
                                                        );
                                                    }
                                                );
                                            }
                                        }

                                    }
                                );
                            }
                        );
                    }
                    else {
                        socket.emit(
                            'auctionBidError',
                            {
                                error: 1,
                            },
                        );
                    }
                }
            );
        }
    });
};