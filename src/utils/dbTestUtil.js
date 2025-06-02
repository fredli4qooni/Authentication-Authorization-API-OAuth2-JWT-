const testConnection = async (pool) => {
    try {
        const connection = await pool.getConnection();
        console.log(`(App Startup) Successfully connected to the database '${process.env.DB_NAME}'.`);
        connection.release();
        return true;
    } catch (error) {
        console.error('(App Startup) Error connecting to the database:', error.message);
        return false;
    }
};
module.exports = { testConnection };