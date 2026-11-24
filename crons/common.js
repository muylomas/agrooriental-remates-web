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

module.exports = new Common();