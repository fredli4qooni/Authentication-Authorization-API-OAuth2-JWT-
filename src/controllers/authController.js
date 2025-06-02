const userModel = require('../models/userModel');
const passwordUtils = require('../utils/passwordUtils');
const tokenService = require('../services/tokenService');

/**
 * Registrasi pengguna baru.
 */
const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {

        const hashedPassword = await passwordUtils.hashPassword(password);
        
        // Buat user baru dengan role default 'user'
        const newUser = await userModel.createUser(username, email, hashedPassword, 'user');

        // Setelah registrasi berhasil, langsung generate token (auto-login)
        const accessToken = tokenService.generateAccessToken(newUser); // newUser sudah berisi id, username, role_name
        const refreshToken = await tokenService.generateRefreshToken(newUser); // newUser sudah berisi id

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully.',
            data: {
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role_name
                },
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        // Tangani error spesifik dari createUser (misal, username/email sudah ada)
        if (error.message.includes('already exists')) {
            return res.status(409).json({ // 409 Conflict
                status: 'fail',
                message: error.message 
            });
        }
        res.status(500).json({
            status: 'error',
            message: 'Server error during registration.'
        });
    }
};

/**
 * Login pengguna.
 */
const login = async (req, res) => {

    const { identifier, password } = req.body; // identifier bisa username atau email

    try {
        const user = await userModel.findUserByEmailOrUsername(identifier);

        if (!user) {
            return res.status(401).json({ // 401 Unauthorized
                status: 'fail',
                message: 'Invalid credentials. User not found.' 
            });
        }

        const isPasswordMatch = await passwordUtils.comparePassword(password, user.password_hash);
        if (!isPasswordMatch) {
            return res.status(401).json({ // 401 Unauthorized
                status: 'fail',
                message: 'Invalid credentials. Password incorrect.' 
            });
        }

        // User valid, buat token
        // Pastikan objek user yang dikirim ke tokenService memiliki properti yang dibutuhkan (id, username, role_name)
        const userPayloadForToken = {
            id: user.id,
            username: user.username,
            email: user.email, 
            role_name: user.role_name // untuk RBAC
        };

        const accessToken = tokenService.generateAccessToken(userPayloadForToken);
        const refreshToken = await tokenService.generateRefreshToken(userPayloadForToken); // Perlu user.id

        res.status(200).json({
            status: 'success',
            message: 'Login successful.',
            data: {
                user: { // Kirim data user yang relevan (tanpa hash password)
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role_name
                },
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during login.'
        });
    }
};

/**
 * Refresh Access Token menggunakan Refresh Token.
 */
const refreshTokenHandler = async (req, res) => {
    // Validasi input (keberadaan token) sudah ditangani oleh refreshTokenValidationRules dan handleValidationErrors
    const { token: providedRefreshToken } = req.body;

    try {
        const decodedRefreshToken = await tokenService.verifyRefreshToken(providedRefreshToken);
        
        if (!decodedRefreshToken) {
            // Jika verifyRefreshToken mengembalikan null, berarti token tidak valid, sudah dicabut, atau kadaluarsa
            // Pesan spesifik sudah di-log di tokenService.
            // berikan pesan generik ke client.
            return res.status(403).json({ // 403 Forbidden
                status: 'fail',
                message: 'Invalid or expired refresh token. Please log in again.'
            });
        }

        // Dapatkan data user terbaru (terutama role)
        const user = await userModel.findUserById(decodedRefreshToken.id);
        if (!user) {
            await tokenService.revokeRefreshToken(providedRefreshToken); // Cabut token yang bermasalah
            return res.status(403).json({
                status: 'fail',
                message: 'User associated with refresh token not found. Token has been revoked.'
            });
        }

        const userPayloadForToken = {
            id: user.id,
            username: user.username,
            role_name: user.role_name
        };

        const newAccessToken = tokenService.generateAccessToken(userPayloadForToken);

        res.status(200).json({
            status: 'success',
            data: {
                accessToken: newAccessToken
            }
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during token refresh.'
        });
    }
};

/**
 * Logout pengguna (mencabut refresh token yang digunakan).
 * Client harus mengirimkan refresh token yang ingin dicabut.
 */
const logout = async (req, res) => {
    const { refreshToken: tokenToRevoke } = req.body; 
    // Client harus mengirim refreshToken di body.

    if (!tokenToRevoke) {
        return res.status(400).json({
            status: 'fail',
            message: 'Refresh token is required to logout.'
        });
    }

    try {
        const revoked = await tokenService.revokeRefreshToken(tokenToRevoke);
        if (revoked) {
            res.status(200).json({ 
                status: 'success',
                message: 'Successfully logged out. Refresh token revoked.' 
            });
        } else {
            // Token tidak ditemukan atau sudah dicabut sebelumnya
            res.status(404).json({
                status: 'fail',
                message: 'Refresh token not found or already revoked.'
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during logout.'
        });
    }
};

/**
 * Logout dari semua perangkat (mencabut semua refresh token milik pengguna).
 * Membutuhkan access token yang valid untuk identifikasi pengguna.
 */
const logoutAll = async (req, res) => {
    // req.user sudah di-attach oleh middleware authenticateToken
    const userId = req.user.id;

    try {
        const countRevoked = await tokenService.revokeAllUserRefreshTokens(userId);
        res.status(200).json({
            status: 'success',
            message: `Successfully logged out from all devices. ${countRevoked} refresh token(s) revoked.`
        });
    } catch (error) {
        console.error('Logout all error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during logout from all devices.'
        });
    }
};

/**
 * Mendapatkan profil pengguna yang sedang login.
 * Membutuhkan access token yang valid.
 */
const getProfile = async (req, res) => {

    const { id, username, email, role } = req.user; // Ambil dari req.user yang sudah diproses

    res.status(200).json({
        status: 'success',
        data: {
            user: {
                id,
                username,
                email, 
                role
            }
        }
    });
};


module.exports = {
    register,
    login,
    refreshTokenHandler,
    logout,
    logoutAll,
    getProfile
};