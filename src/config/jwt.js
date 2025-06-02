const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRATION,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION,
};