const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt'); // Konfigurasi JWT (secret)
const userModel = require('../models/userModel'); // Untuk mengambil info user terbaru 

/**
 * Middleware untuk memverifikasi Access Token JWT.
 * Jika token valid, payload token (data pengguna) akan ditambahkan ke `req.user`.
 */
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization']; // 'Authorization': 'Bearer TOKEN_STRING'
    const token = authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            status: 'fail',
            message: 'Access denied. No token provided.' 
        });
    }

    try {
        const decodedPayload = jwt.verify(token, jwtConfig.accessSecret); 

        // Ambil data user terbaru dari database 
        const user = await userModel.findUserById(decodedPayload.id);
        if (!user) {
            return res.status(401).json({
                status: 'fail',
                message: 'Access denied. User associated with token not found.'
            });
        }
        // Gabungkan informasi dari token dengan data user dari DB.
        // prioritaskan data dari DB, dan  memastikan field 'role' yang dipakai konsisten (yaitu 'role_name' dari DB).
        req.user = { 
            id: user.id, 
            username: user.username, 
            email: user.email, // Jika ada di userModel.findUserById
            role: user.role_name, // Menggunakan role_name dari DB
        };

        next(); // Lanjutkan ke handler/middleware berikutnya
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ 
                status: 'fail',
                message: 'Access denied. Token has expired.' 
            });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ 
                status: 'fail',
                message: 'Access denied. Invalid token.' 
            });
        }
        // Error lainnya
        console.error("Authentication error:", error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error during authentication.'
        });
    }
};

/**
 * Middleware untuk Role-Based Access Control (RBAC).
 * Memeriksa apakah peran pengguna (`req.user.role`) ada dalam daftar peran yang diizinkan.
 * Harus digunakan SETELAH `authenticateToken`.
 * @param {string|string[]} allowedRoles - Satu peran string atau array string peran yang diizinkan.
 */
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            // Ini seharusnya tidak terjadi jika authenticateToken berjalan dengan benar dan user memiliki role
            return res.status(403).json({ 
                status: 'fail',
                message: 'Forbidden. User role not available for authorization.' 
            });
        }

        const userRole = req.user.role;
        const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!rolesArray.includes(userRole)) {
            return res.status(403).json({ 
                status: 'fail',
                message: `Forbidden. Role '${userRole}' is not authorized to access this resource.` 
            });
        }

        next(); // Pengguna memiliki peran yang diizinkan
    };
};


module.exports = {
    authenticateToken,
    authorizeRole
};