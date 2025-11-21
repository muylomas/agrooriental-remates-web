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

function getInsertedComment(commentId, callback) {
    let comment = {};

    connection.query(
        `
            SELECT 
                cattle_comments.id AS id,
                cattle_comments.lotId AS lotId,
                customers_complete.customerName AS name,
                customers_complete.customerSurname AS surname,
                cattle_comments.comment AS comment,
                DATE_FORMAT(cattle_comments.created_at - INTERVAL 3 HOUR, '%d/%m/%Y') AS date,
                DATE_FORMAT(cattle_comments.created_at - INTERVAL 3 HOUR, '%h:%i %p') AS hour,
                FALSE AS owner
            FROM cattle_comments
            INNER JOIN customers_complete ON customers_complete.customerId = cattle_comments.customerId
            WHERE 
                cattle_comments.status = 1 AND
                cattle_comments.customerId IS NOT NULL AND
                cattle_comments.customerId > 0 AND
                cattle_comments.public = 1 AND
                cattle_comments.id = ? 
            ORDER BY cattle_comments.created_at ASC
        `,
        [
            commentId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else if (results.length) {
                comment = results[0];
            }

            callback(comment);
        }
    );
}

module.exports = function (socket) {
    socket.on('publishComment', (parameters) => {
        if (
            "comment" in parameters && parameters.comment &&
            "lotId" in parameters && parameters.lotId &&
            "hash" in parameters && parameters.hash
        ) {
            getUserBySocket(
                socket.id,
                function (customerId) {
                    if (customerId) {
                        connection.query(
                            `
                                INSERT INTO cattle_comments 
                                    (lotId, userId, customerId, comment, public, notif, status)
                                VALUES
                                    (?, 0, ?, ?, 1, 0, 1);
                            `,
                            [
                                parameters.lotId,
                                customerId,
                                parameters.comment,
                            ],
                            function (err, results) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    const newCommentId = results.insertId;
                                    getInsertedComment(
                                        newCommentId,
                                        function (commentParams) {
                                            socket.broadcast.emit(
                                                'newCommentPublished',
                                                commentParams,
                                            );

                                            socket.emit(
                                                'publishCommentUpdate',
                                                {
                                                    hash: parameters.hash,
                                                    id: newCommentId,
                                                    lotId: commentParams.lotId,
                                                    date: commentParams.date,
                                                    hour: commentParams.hour,
                                                },
                                            );
                                        }
                                    );

                                }
                            }
                        );
                    }
                    else {
                        socket.emit(
                            'publishCommentError',
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