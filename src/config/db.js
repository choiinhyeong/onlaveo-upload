const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'onlaveo',
    password: '258135sj!!',
    database: 'onlaveo',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;
