const mysql = require('mysql');
var connection = mysql.createConnection({
    host     : process.env.MYSQL_HOST,
    port     : process.env.MYSQL_PORT,
    user     : process.env.ACCESSKEY,
    password : process.env.SECRETKEY,
    database : 'app_' + process.env.APPNAME
});
connection.connect(function (error) {
    if (error) {
        console.log(error);
    }
})

module.exports = connection;