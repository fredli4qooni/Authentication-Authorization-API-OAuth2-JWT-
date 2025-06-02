const app = require('./app'); // Impor aplikasi Express dari app.js
const dotenv = require('dotenv');

dotenv.config(); // Pastikan variabel lingkungan dimuat

const PORT = process.env.PORT || 3000; // Ambil port dari .env atau default ke 3000

// Test koneksi database 
const dbPool = require('./src/config/database');
const { testConnection } = require('./src/utils/dbTestUtil'); 

const startServer = async () => {
    // Cek koneksi database sebelum server 
    const dbConnected = await testConnection(dbPool); 
    
    if (!dbConnected && process.env.NODE_ENV !== 'test') { // Jangan exit jika sedang testing
        console.error("FATAL: Database connection failed. Server will not start.");
        process.exit(1); // Keluar jika koneksi DB gagal dan ini krusial
    }
    
    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`Access API at http://localhost:${PORT}`);
    });

    // Penanganan untuk graceful shutdown (opsional tapi bagus untuk produksi)
    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server');
        server.close(() => {
            console.log('HTTP server closed');
            dbPool.end(err => {
                if (err) console.error('Error closing database pool:', err);
                else console.log('Database pool closed.');
                process.exit(0);
            });
        });
    });

    process.on('SIGINT', () => {
        console.log('SIGINT signal received: closing HTTP server');
        server.close(() => {
            console.log('HTTP server closed');
            dbPool.end(err => {
                if (err) console.error('Error closing database pool:', err);
                else console.log('Database pool closed.');
                process.exit(0);
            });
        });
    });
};

startServer();