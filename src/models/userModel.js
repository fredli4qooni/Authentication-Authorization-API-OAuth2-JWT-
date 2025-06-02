const dbPool = require('../config/database'); // Pool koneksi database yang sudah di buat

/**
 * Mencari pengguna berdasarkan email atau username.
 * Berguna untuk login atau memeriksa apakah pengguna sudah ada.
 * Mengembalikan data pengguna beserta nama perannya.
 * @param {string} identifier - Bisa berupa email atau username.
 * @returns {Promise<Object|null>} Objek pengguna jika ditemukan, atau null.
 */
const findUserByEmailOrUsername = async (identifier) => {
    const query = `
        SELECT 
            u.id, 
            u.username, 
            u.email, 
            u.password_hash, 
            u.role_id,
            r.name as role_name  -- Mengambil nama peran dari tabel roles
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.email = ? OR u.username = ?;
    `;
    try {
        const [rows] = await dbPool.query(query, [identifier, identifier]);
        return rows[0] || null; // Kembalikan pengguna pertama atau null jika tidak ada
    } catch (error) {
        console.error('Error in findUserByEmailOrUsername:', error);
        throw error; // Lemparkan error agar bisa ditangani di controller
    }
};

/**
 * Mencari pengguna berdasarkan ID.
 * Mengembalikan data pengguna (tanpa password_hash) beserta nama perannya.
 * @param {number} id - ID pengguna.
 * @returns {Promise<Object|null>} Objek pengguna jika ditemukan, atau null.
 */
const findUserById = async (id) => {
    const query = `
        SELECT 
            u.id, 
            u.username, 
            u.email, 
            u.role_id,
            r.name as role_name 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?;
    `;
    try {
        const [rows] = await dbPool.query(query, [id]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error in findUserById:', error);
        throw error;
    }
};

/**
 * Membuat pengguna baru.
 * @param {string} username
 * @param {string} email
 * @param {string} passwordHash - Password yang sudah di-hash.
 * @param {string} roleName - Nama peran (default 'user').
 * @returns {Promise<Object>} Objek pengguna yang baru dibuat (tanpa password_hash).
 */
const createUser = async (username, email, passwordHash, roleName = 'user') => {
    let connection;
    try {
        connection = await dbPool.getConnection(); // Dapatkan koneksi dari pool
        await connection.beginTransaction(); // Mulai transaksi

        // 1. Dapatkan role_id berdasarkan roleName
        const [roleRows] = await connection.query('SELECT id FROM roles WHERE name = ?;', [roleName]);
        if (roleRows.length === 0) {
            await connection.rollback(); // Batalkan transaksi jika role tidak ditemukan
            throw new Error(`Role '${roleName}' not found.`);
        }
        const roleId = roleRows[0].id;

        // 2. Insert pengguna baru
        const insertUserQuery = 'INSERT INTO users (username, email, password_hash, role_id) VALUES (?, ?, ?, ?);';
        const [result] = await connection.query(insertUserQuery, [username, email, passwordHash, roleId]);
        
        await connection.commit(); // Commit transaksi jika semua berhasil

        return {
            id: result.insertId,
            username,
            email,
            role_id: roleId,
            role_name: roleName // roleName-nya dari input
        };

    } catch (error) {
        if (connection) await connection.rollback(); // Rollback jika ada error
        console.error('Error in createUser:', error);
        if (error.code === 'ER_DUP_ENTRY') { // Error jika username atau email sudah ada (karena UNIQUE constraint)
            if (error.message.includes('users.username')) {
                throw new Error('Username already exists.');
            } else if (error.message.includes('users.email')) {
                throw new Error('Email already exists.');
            }
        }
        throw error; // Lemparkan error lainnya
    } finally {
        if (connection) connection.release(); 
    }
};

module.exports = {
    findUserByEmailOrUsername,
    findUserById,
    createUser
};