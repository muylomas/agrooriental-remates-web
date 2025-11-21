// New type of multiple (Pool) connections
var rds_conf = {
    connectionLimit: 15,
    host: "mercadoagro.c3gecym2ofp9.us-west-1.rds.amazonaws.com",
    database: "mercadoagro",
    user: "admin",
    password: "D84gr0M3rc4d0!*",
    charset: "utf8mb4"
};
var mysql = require('mysql');
var poolConnection = mysql.createPool(rds_conf);

poolConnection.on('connection', function (connection) {
    connection.on('error', function (err) {
        console.error(new Date(), 'ERROR in MySQL Pool connected to MercadoAgro db', err.code);
    });
    connection.on('close', function (err) {
        console.error(new Date(), 'CLOSE MySQL Pool connected to MercadoAgro db', err);
    });
});

module.exports = poolConnection;