const bcrypt = require('bcryptjs');

/**
 * Melakukan hash pada password.
 * @param {string} password - Password teks biasa.
 * @returns {Promise<string>} - Hash password.
 */
const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Password hashing failed');
    }
};

/**
 * Membandingkan password teks biasa dengan hash password.
 * @param {string} plainPassword - Password teks biasa yang dimasukkan pengguna.
 * @param {string} hashedPasswordFromDb - Hash password yang tersimpan di database.
 * @returns {Promise<boolean>} - True jika password cocok, false jika tidak.
 */
const comparePassword = async (plainPassword, hashedPasswordFromDb) => {
    try {
        return await bcrypt.compare(plainPassword, hashedPasswordFromDb);
    } catch (error) {
        console.error('Error comparing password:', error);
        return false;
    }
};

module.exports = {
    hashPassword,
    comparePassword
};