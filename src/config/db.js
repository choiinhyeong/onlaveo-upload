const mysql = require('mysql2/promise');

module.exports = mysql.createPool({
    host: 'localhost',
    user: 'onlaveo',
    password: '258135sj!!',
    database: 'onlaveo'
});