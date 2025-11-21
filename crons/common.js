function Common() { }

var connection = require('../routes/connection_db');
var sha512 = require('js-sha512');

Common.prototype.insertTaskInScheduler = function (task, taskId, status, output) {
    var insertQuery =
        "INSERT INTO `scheduler` SET " +
        "`task` = '" + task + "', " +
        "`taskId` = '" + taskId + "', " +
        "`output` = '" + output + "', " +
        "`status` = '" + status + "', " +
        "`date` = NOW()";

    connection.query(insertQuery,
        function (err, results) {
            if (err) {
            }
            else {
            }
        });
};

Common.prototype.createNewTaskInScheduler = function (task, status) {
    var dateNow = new Date();
    var dateNowMilliseconds = dateNow.getTime();
    var taskId = sha512(dateNowMilliseconds.toString() + sha512(task));

    var insertQuery =
        "INSERT INTO `scheduler` SET " +
        "`task` = '" + task + "', " +
        "`taskId` = '" + taskId + "', " +
        "`status` = '" + status + "', " +
        "`date` = NOW()";

    connection.query(insertQuery,
        function (err, results) {
            if (err) {
            }
            else {
            }
        });

    return taskId;
};

Common.prototype.availabilityTaskInScheduler = function (task, callback) {
    var insertQuery =
        "SELECT `status`, IF(`date` < (NOW() - INTERVAL 1 HOUR), 1, 0) AS reset " +
        "FROM `scheduler` " +
        "WHERE `task` = '" + task + "' " +
        "ORDER BY id DESC " +
        "LIMIT 0,1";

    connection.query(insertQuery,
        function (err, results) {
            if (err) {
                callback(false);
            }
            else {
                if (!results.length || results[0].status != 0)
                    callback(true);
                else {
                    if (results.length && results[0].reset == 1) {
                        var dateNow = new Date();
                        var dateNowMilliseconds = dateNow.getTime();
                        var taskId = sha512(dateNowMilliseconds.toString() + sha512(task));
                        Common.prototype.insertTaskInScheduler(task, taskId, 100, "Wake Up");
                        callback(true);
                    }
                    else
                        callback(false);
                }
            }
        });
};

module.exports = new Common();