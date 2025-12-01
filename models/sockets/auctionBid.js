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

function isBidOk(bid, lotId, callback) {
    let reply = { error: true, msg: "Pique no válido" };
    connection.query(
        `
            SELECT
                startPrice, 
                stepPrice
            FROM cattle
            WHERE id = ?
        `,
        [
            lotId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }

            if (bid < results[0].startPrice) {
                reply.msg = "El pique debe superar la base de USD " + results[0].startPrice + ". Vuelva a intenarlo!";
            }
            else if ((bid - results[0].startPrice) % results[0].stepPrice === 0) {
                reply.msg = " ";
                reply.error = false;
            } else {
                reply.msg = "El pique debe respetar los incrementos de USD " + results[0].stepPrice + ". Vuelva a intenarlo!";
            }

            callback(reply);
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
        if (
            "bid" in parameters && parameters.bid &&
            "lotId" in parameters && parameters.lotId
        ) {
            getUserBySocket(
                socket.id,
                function (customerId) {
                    if (customerId) {
                        isBidOk(
                            parameters.bid,
                            parameters.lotId,
                            function (bidCheckReply) {
                                if (!bidCheckReply.error) {
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
                                                            console.log("socket.emit 1");
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

                                                                    console.log("socket.emit 2");
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

                                    console.log("socket.emit 3");
                                    socket.emit(
                                        'auctionBidError',
                                        {
                                            error: "1.2",
                                            msg: bidCheckReply.msg,
                                        },
                                    );
                                }
                            }
                        );
                    }
                    else {

                        console.log("socket.emit 4");
                        socket.emit(
                            'auctionBidError',
                            {
                                error: "1.1",
                                msg: "Usuario no válido.",
                            },
                        );
                    }
                }
            );
        }
        else {

            console.log("socket.emit 5");
            socket.emit(
                'auctionBidError',
                {
                    error: "1.0",
                    msg: "No se pudo ingresar la oferta, intentalo nuevamente.",
                },
            );
        }
    });
};