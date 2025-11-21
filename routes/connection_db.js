// New type of multiple (Pool) connections
var rds_conf = {
    connectionLimit: 15,
    host: "remates.cbg6iam029qt.us-west-1.rds.amazonaws.com",
    database: "remates",
    user: "admin",
    password: "9sNvD-*VW8xr%",
    charset: "utf8mb4"
};
var mysql = require('mysql');
var poolConnection = mysql.createPool(rds_conf);

poolConnection.on('connection', function (connection) {
    connection.on('error', function (err) {
        console.error(new Date(), 'ERROR in MySQL Pool connected to Agro Oriental Remates db', err.code);
    });
    connection.on('close', function (err) {
        console.error(new Date(), 'CLOSE MySQL Pool connected to Agro Oriental Remates db', err);
    });
});

module.exports = poolConnection;