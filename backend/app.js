const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'checkin'
})
connection.connect(function (error) {
    if (error) {
        console.log(error);
    }
})