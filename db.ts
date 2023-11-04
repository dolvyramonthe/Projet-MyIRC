import mysql from 'mysql2';

export const db = mysql.createConnection({
    host: 'localhost',
    user: 'mysqldbuser',
    password: 'ConnectMe123$',
    database: 'myirc_db'
});