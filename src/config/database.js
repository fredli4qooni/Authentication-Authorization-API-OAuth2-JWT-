const mysql = require('mysql2/promise'); 
const dotenv = require('dotenv');

dotenv.config(); // Memuat variabel dari .env

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10, 
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Fungsi untuk menguji koneksi saat aplikasi dimulai
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log(`Successfully connected to the database '${process.env.DB_NAME}' as '${process.env.DB_USER}'.`);
        connection.release();
    } catch (error) {
        console.error('Error connecting to the database:', error.message);
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error(`Database '${process.env.DB_NAME}' does not exist. Please create it.`);
        } else if (error.code === 'ECONNREFUSED') {
            console.error('Database connection refused. Ensure MySQL server is running and accessible.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error(`Access denied for user '${process.env.DB_USER}'. Check your credentials.`);
        }
        // process.exit(1); // Keluar dari aplikasi jika koneksi gagal.
    }
};


module.exports = pool; 