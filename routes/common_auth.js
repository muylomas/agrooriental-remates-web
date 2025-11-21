const connection = require('./connection_db');

function Common() { }

Common.prototype.basic = function (sessionID, callback) {
    data = {
        err: false,
        user: {
            id: 0,
            name: "",
            picture: "",
            type: 0,
            warehouse: 0
        },
        sessionID: sessionID,
    };

    connection.query(
        `
            SELECT id, name, surname, image 
            FROM customers 
            WHERE session = ?
            LIMIT 0, 1
        `,
        [
            sessionID,
        ],
        function (err, results) {
            if (err) {
                data.err = err;
            }
            else {
                if (results.length) {
                    data.user.id = results[0].id;
                    data.user.firstname = results[0].name;
                    data.user.name = results[0].name + " " + results[0].surname;
                    data.user.image = results[0].picture;
                    data.user.type = results[0].type;
                    data.user.sector = results[0].sector;
                }
                else {
                    data.err = true;
                }
            }

            callback(data);
        }
    );
};

// True if the email is correct, false if fails test
Common.prototype.verifyEmail = function (email) {
    const formatEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return formatEmail.test(email);
};

module.exports = new Common();