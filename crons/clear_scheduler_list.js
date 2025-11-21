function Common() { }

var connection = require('../routes/connection_db');

Common.prototype.clearSchedulerList = function (callback) {
    connection.query(
        `TRUNCATE TABLE scheduler`,
        function (err, results) {
            if (err) {
                console.log(err);
            }

            callback();
        });
};

module.exports = new Common();