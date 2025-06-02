const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt'); // Konfigurasi JWT (secret, expiry)
const dbPool = require('../config/database'); // Untuk menyimpan dan memvalidasi refresh token
const { v4: uuidv4 } = require('uuid'); 

// Helper function untuk mengonversi string durasi (mis. "15m", "7d") ke milidetik
// Ini dibutuhkan untuk menghitung `expires_at` untuk refresh token di database.
const parseExpiry = (durationString) => {
    if (typeof durationString === 'number') return durationString; 
    const unit = durationString.slice(-1);
    const value = parseInt(durationString.slice(0, -1));
    let multiplier;
    switch (unit) {
        case 's': multiplier = 1000; break;
        case 'm': multiplier = 60 * 1000; break;
        case 'h': multiplier = 60 * 60 * 1000; break;
        case 'd': multiplier = 24 * 60 * 60 * 1000; break;
        default: throw new Error('Invalid time unit for JWT expiration');
    }
    return value * multiplier;
};


/**
 * Membuat Access Token.
 * @param {Object} user - Objek pengguna yang berisi id, username, email, role_name.
 * @returns {string} Access Token JWT.
 */
const generateAccessToken = (user) => {
    const payload = {
        id: user.id,
        username: user.username,
        role: user.role_name 
    };
    return jwt.sign(payload, jwtConfig.accessSecret, { expiresIn: jwtConfig.accessExpiresIn });
};

/**
 * Membuat Refresh Token, menyimpannya ke database, dan mengembalikannya.
 * @param {Object} user - Objek pengguna yang berisi id.
 * @returns {Promise<string>} Refresh Token JWT.
 */
const generateRefreshToken = async (user) => {
    const payload = { 
        id: user.id,
    };
    const token = jwt.sign(payload, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn });

    const expiresInMs = parseExpiry(jwtConfig.refreshExpiresIn);
    const expiresAt = new Date(Date.now() + expiresInMs);

    try {
        const insertQuery = 'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?);';
        await dbPool.query(insertQuery, [user.id, token, expiresAt]);
        return token;
    } catch (error) {
        console.error('Error saving refresh token to DB:', error);
        throw new Error('Could not generate or save refresh token');
    }
};

/**
 * Memverifikasi Refresh Token.
 * Mengecek apakah token valid (signature, expiry) dan ada di database,
 * belum dicabut (is_revoked = false), dan belum kadaluarsa di DB.
 * @param {string} token - Refresh Token JWT.
 * @returns {Promise<Object|null>} Payload token jika valid, atau null.
 */
const verifyRefreshToken = async (tokenString) => {
    try {
        // 1. Verifikasi signature dan expiry JWT itu sendiri
        const decodedPayload = jwt.verify(tokenString, jwtConfig.refreshSecret);
        
        // 2. Cek di database
        const query = `
            SELECT user_id, is_revoked, expires_at 
            FROM refresh_tokens 
            WHERE token = ? AND user_id = ?;
        `;
        const [rows] = await dbPool.query(query, [tokenString, decodedPayload.id]);

        if (rows.length === 0) {
            console.warn(`Refresh token not found in DB or user ID mismatch: ${tokenString.substring(0,20)}...`);
            return null; // Token tidak ditemukan di DB atau user ID tidak cocok
        }

        const tokenRecord = rows[0];

        if (tokenRecord.is_revoked) {
            console.warn(`Attempt to use revoked refresh token: ${tokenString.substring(0,20)}... for user ${decodedPayload.id}`);
            return null; // Token sudah dicabut
        }

        if (new Date(tokenRecord.expires_at) < new Date()) {
            console.warn(`Refresh token expired in DB: ${tokenString.substring(0,20)}... for user ${decodedPayload.id}`);
            return null; // Token sudah kadaluarsa menurut DB
        }

        return decodedPayload; // Mengembalikan payload jika semua verifikasi berhasil

    } catch (error) {
        // Tangani error spesifik dari jwt.verify
        if (error instanceof jwt.TokenExpiredError) {
            console.warn(`JWT refresh token expired: ${tokenString.substring(0,20)}...`);
        } else if (error instanceof jwt.JsonWebTokenError) {
            console.warn(`Invalid JWT refresh token: ${tokenString.substring(0,20)}... - ${error.message}`);
        } else {
            console.error('Error verifying refresh token:', error);
        }
        return null; // Token tidak valid karena error JWT atau lainnya
    }
};

/**
 * Mencabut (revoke) sebuah Refresh Token.
 * @param {string} token - Refresh Token yang akan dicabut.
 * @returns {Promise<boolean>} True jika berhasil, false jika token tidak ditemukan.
 */
const revokeRefreshToken = async (tokenString) => {
    try {
        const query = 'UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = ? AND is_revoked = FALSE;';
        const [result] = await dbPool.query(query, [tokenString]);
        return result.affectedRows > 0; // true jika ada baris yang diupdate
    } catch (error) {
        console.error('Error revoking refresh token:', error);
        throw new Error('Could not revoke refresh token');
    }
};

/**
 * Mencabut (revoke) semua Refresh Token milik seorang pengguna.
 * Berguna untuk fitur "logout from all devices".
 * @param {number} userId - ID pengguna.
 * @returns {Promise<number>} Jumlah token yang berhasil dicabut.
 */
const revokeAllUserRefreshTokens = async (userId) => {
    try {
        const query = 'UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = ? AND is_revoked = FALSE;';
        const [result] = await dbPool.query(query, [userId]);
        return result.affectedRows; // Jumlah baris yang diupdate
    } catch (error) {
        console.error('Error revoking all user refresh tokens:', error);
        throw new Error('Could not revoke all user refresh tokens');
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    revokeRefreshToken,
    revokeAllUserRefreshTokens,
    parseExpiry 
};