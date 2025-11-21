const connection = require('./connection_db');

function Common() { }

Common.prototype.getLocations = function (stateId, callback) {
    let countryLocations = [];

    connection.query(
        `
            SELECT * 
            FROM locations 
            WHERE state = ? 
            ORDER BY name ASC
        `,
        [
            stateId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                countryLocations = results;
            }

            callback(countryLocations);
        }
    );
};

Common.prototype.getStates = function (countryId, callback) {
    let countryStates = [];

    connection.query(
        `
            SELECT * FROM states 
            WHERE country = ? 
            ORDER BY name ASC
        `,
        [
            countryId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else {

                countryStates = results;
            }

            callback(countryStates);
        }
    );
};

Common.prototype.getCountries = function (callback) {
    let countries = [];

    connection.query(
        `
            SELECT *
            FROM countries
        `,
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                countries = results;
            }

            callback(countries);
        }
    );
};

module.exports = new Common();