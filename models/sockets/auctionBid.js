/*
 * Serve content over a socket
 */
const connection = require('../../routes/connection_db');
const aws_sms_sender = require('../../routes/aws_sms_sender');



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
    let reply = { error: true, msg: "Pique no válido", customer: {} };
    connection.query(
        `
            SELECT
                cattle.startPrice AS startPrice, 
                cattle.stepPrice AS stepPrice,
                customers_complete.customerId AS customerId,
                customers_complete.phoneCountryCode AS phoneCountryCode,
                customers_complete.phoneNumber AS phoneNumber
            FROM cattle
            LEFT JOIN auctions_bids_max ON auctions_bids_max.lotId = cattle.id
            LEFT JOIN auctions_bids ON auctions_bids.id = auctions_bids_max.auctionBidId
            LEFT JOIN customers_complete ON customers_complete.customerId = auctions_bids.customerId
            WHERE cattle.id = ?
        `,
        [
            lotId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }

            if (results.length) {
                if (bid < results[0].startPrice) {
                    reply.msg = "El pique debe superar la base de USD " + results[0].startPrice + ". Vuelva a intenarlo!";
                }
                else if ((bid - results[0].startPrice) % results[0].stepPrice === 0) {
                    reply.msg = " ";
                    reply.error = false;
                } else {
                    reply.msg = "El pique debe respetar los incrementos de USD " + results[0].stepPrice + ". Vuelva a intenarlo!";
                }

                reply.customer = {
                    customerId: results[0].customerId,
                    phoneCountryCode: results[0].phoneCountryCode,
                    phoneNumber: results[0].phoneNumber,
                }
            }
            else {
                reply.msg = "Problemas para registrar la oferta. Contacte con Agro Oriental al +598 98 950 792 o uelva a intenarlo!";
            }

            callback(reply);
        }
    );
}

function isSalePrice(lastBid, salePrice, lotId, callback) {
    if (salePrice <= lastBid) {
        callback(true);
    }
    else
        callback(false);
};

function sendSMSToLooser(customer, lotId) {
    aws_sms_sender.sms_sender(
        {
            Message: "Superaron tu oferta para el lote " + lotId + ". Superala si no querés perderlo https://equinos.agrooriental.uy/#lote-" + lotId,
            PhoneNumber: customer.phoneCountryCode + parseInt(customer.phoneNumber, 10),
        },
        function (error) {
        }
    );
};


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
                                const lastAuctionCustomer = bidCheckReply.customer;
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
                                            LEFT JOIN auctions_bids_max ON auctions_bids_max.lotId = cattle_complete.lotId
                                            LEFT JOIN auctions_bids ON auctions_bids.id = auctions_bids_max.auctionBidId
                                            WHERE 
                                                cattle_complete.lotId = ? AND
                                                cattle_complete.auctionEnd > NOW() - INTERVAL 3 HOUR AND
                                                IF(auctions_bids.price IS NULL, 0, auctions_bids.price) < ?;
                                        `,
                                        [
                                            parameters.bid,
                                            parameters.lotId,
                                            customerId,
                                            socket.id,
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

                                                                    if (lastAuctionCustomer.customerId != customerId) {
                                                                        sendSMSToLooser(lastAuctionCustomer);
                                                                    }
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
                                            error: "1.2",
                                            msg: bidCheckReply.msg,
                                        },
                                    );
                                }
                            }
                        );
                    }
                    else {
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