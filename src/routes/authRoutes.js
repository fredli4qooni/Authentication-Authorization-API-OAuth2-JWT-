const express = require('express');
const router = express.Router(); // Membuat instance router Express

// Impor Controller
const authController = require('../controllers/authController');

// Impor Middleware Validasi
const {
    registerValidationRules,
    loginValidationRules,
    refreshTokenValidationRules,
    handleValidationErrors 
} = require('../middleware/validationMiddleware');

// Impor Middleware Autentikasi & Otorisasi
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

//====================================
// RUTE PUBLIK (no Token)
//====================================

/**
 * @route   POST /api/auth/register
 * @desc    Registrasi pengguna baru
 * @access  Public
 */
router.post(
    '/register',
    registerValidationRules(), // Jalankan aturan validasi
    handleValidationErrors,   // Tangani hasil validasi
    authController.register   // Jika validasi lolos, lanjutkan ke controller
);

/**
 * @route   POST /api/auth/login
 * @desc    Login pengguna dan dapatkan token
 * @access  Public
 */
router.post(
    '/login',
    loginValidationRules(),
    handleValidationErrors,
    authController.login
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Dapatkan access token baru menggunakan refresh token
 * @access  Public (tapi memerlukan refresh token yang valid di body)
 */
router.post(
    '/refresh-token',
    refreshTokenValidationRules(),
    handleValidationErrors,
    authController.refreshTokenHandler
);


//===================================================================
// RUTE PRIVAT (Memerlukan Access Token yang Valid)
//===================================================================

/**
 * @route   POST /api/auth/logout
 * @desc    Logout pengguna (mencabut refresh token spesifik)
 * @access  Private (memerlukan refresh token di body, bukan access token di header untuk aksi ini)
 *          Namun, endpoint ini tetap bisa dianggap 'private' dalam arti memerlukan suatu bentuk otentikasi (kepemilikan RT).
 */
router.post(
    '/logout',
    // Tidak ada authenticateToken di sini secara default karena logout bergantung pada refresh token di body.
    // untuk memastikan body request 'refreshToken' ada.
    authController.logout 
);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout pengguna dari semua perangkat (mencabut semua refresh token pengguna)
 * @access  Private (memerlukan Access Token yang valid)
 */
router.post(
    '/logout-all',
    authenticateToken, // Middleware untuk verifikasi access token
    authController.logoutAll
);

/**
 * @route   GET /api/auth/profile
 * @desc    Dapatkan profil pengguna yang sedang login
 * @access  Private (memerlukan Access Token yang valid)
 */
router.get(
    '/profile',
    authenticateToken,
    authController.getProfile
);


//===================================================================
// RUTE PRIVAT DENGAN ROLE-BASED ACCESS CONTROL (RBAC)
//===================================================================

/**
 * @route   GET /api/auth/admin/dashboard-summary
 * @desc    Contoh endpoint yang hanya bisa diakses oleh role 'admin'
 * @access  Private (Admin Role)
 */
router.get(
    '/admin/dashboard-summary',
    authenticateToken,              // Pertama, pastikan user terautentikasi
    authorizeRole('admin'),        // Kedua, pastikan user memiliki role 'admin'
    (req, res) => {                 // Handler sederhana 
        res.status(200).json({
            status: 'success',
            message: `Welcome Admin ${req.user.username}! This is your dashboard summary.`,
            data: {
                usersOnline: Math.floor(Math.random() * 100),
                newRegistrationsToday: Math.floor(Math.random() * 20)
            }
        });
    }
);

/**
 * @route   GET /api/auth/content/editor-area
 * @desc    Contoh endpoint yang bisa diakses oleh role 'admin' ATAU 'editor'
 * @access  Private (Admin or Editor Role)
 */
router.get(
    '/content/editor-area',
    authenticateToken,
    authorizeRole(['admin', 'editor']), // Berikan array peran yang diizinkan
    (req, res) => {
        res.status(200).json({
            status: 'success',
            message: `Welcome ${req.user.role} ${req.user.username}! You have access to the editor area.`,
            data: {
                draftArticles: Math.floor(Math.random() * 10),
                publishedArticles: Math.floor(Math.random() * 50)
            }
        });
    }
);


module.exports = router; 