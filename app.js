// auth-api-detailed/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Impor rute 
const authRoutes = require('./src/routes/authRoutes');

//  Impor pool database untuk menjalankan tes koneksi saat startup 
const dbPool = require('./src/config/database'); 
const { testConnection } = require('./src/utils/dbTestUtil'); 

// Muat variabel lingkungan dari file .env
dotenv.config();

// Inisialisasi aplikasi Express
const app = express();

// Middleware Global
// 1. CORS (Cross-Origin Resource Sharing)
//    Memungkinkan request dari domain/origin yang berbeda (misalnya, frontend di port lain)
app.use(cors());

// 2. Body Parsers
//    Untuk mem-parsing body request JSON
app.use(express.json({ limit: '10kb' })); // Batasi ukuran payload JSON
//    Untuk mem-parsing body request URL-encoded
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rute API Utama
// Semua rute yang didefinisikan di authRoutes akan memiliki prefix /api/auth
app.use('/api/auth', authRoutes);

// Rute dasar untuk mengecek apakah server berjalan
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Authentication & Authorization API is up and running!'
    });
});

// Middleware Penanganan Error Global
// Ini akan menangkap error yang tidak tertangani di rute atau middleware sebelumnya.
app.use((err, req, res, next) => {
    console.error("UNHANDLED ERROR:", err.stack || err);
    
    // Default ke 500 
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message || 'An unexpected error occurred.',
        // Hanya tampilkan stack error di mode development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Penanganan untuk rute yang tidak ditemukan (404)
app.use((req, res, next) => { 
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server! (using app.use for 404)`
    });
});


module.exports = app; 