const connection = require('../connection_db');

function Common() { }

Common.prototype.verifyPhoneAvailability = function (phoneNumber, callback) {
    let availability = true;
    connection.query(
        `
            SELECT id
            FROM customers 
            WHERE
                phoneNumber = ?
        `,
        [
            parseInt(phoneNumber, 10),
        ],
        function (err, results) {
            if (err) {
                console.log(err);
                availability = false;
            }
            else {
                if (results.length) {
                    availability = false;
                }
            }

            callback(availability);
        }
    );
};


module.exports = new Common();