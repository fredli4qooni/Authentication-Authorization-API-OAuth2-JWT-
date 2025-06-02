const { body, validationResult } = require('express-validator');

/**
 * Middleware untuk memproses hasil validasi.
 * Jika ada error, kirim response 400. Jika tidak, lanjutkan ke handler berikutnya.
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

/**
 * Aturan validasi untuk registrasi pengguna.
 */
const registerValidationRules = () => {
    return [
        body('username')
            .trim()
            .notEmpty().withMessage('Username is required.')
            .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters.')
            .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores.'),

        body('email')
            .trim()
            .notEmpty().withMessage('Email is required.')
            .isEmail().withMessage('Please provide a valid email address.')
            .normalizeEmail(), // Mengubah email menjadi format standar (misalnya, lowercase domain)

        body('password')
            .notEmpty().withMessage('Password is required.')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
            // Anda bisa menambahkan aturan kompleksitas password di sini jika diperlukan
            // .matches(/\d/).withMessage('Password must contain a number')
            // .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
            // .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
            // .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain a special character')
    ];
};

/**
 * Aturan validasi untuk login pengguna.
 */
const loginValidationRules = () => {
    return [
        body('identifier') // Bisa username atau email
            .trim()
            .notEmpty().withMessage('Username or email is required.'),
        
        body('password')
            .notEmpty().withMessage('Password is required.')
    ];
};

/**
 * Aturan validasi untuk refresh token.
 */
const refreshTokenValidationRules = () => {
    return [
        body('token')
            .trim()
            .notEmpty().withMessage('Refresh token is required.')
            .isJWT().withMessage('Invalid refresh token format.')
    ];
};


module.exports = {
    registerValidationRules,
    loginValidationRules,
    refreshTokenValidationRules,
    handleValidationErrors // Middleware untuk menangani hasil validasi
};