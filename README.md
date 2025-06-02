# Authentication & Authorization API (Node.js, Express, MySQL)

Proyek ini merupakan sistem backend untuk autentikasi dan otorisasi pengguna menggunakan standar keamanan OAuth2 (konsep dasar) dan JSON Web Token (JWT). API ini menyediakan endpoint yang aman untuk registrasi, login, refresh token, serta membatasi akses berdasarkan peran pengguna.

## Fitur Utama

*   Registrasi & Login Pengguna
*   Generasi Token JWT (Access & Refresh Token)
*   Mekanisme Refresh Token
*   Role-Based Access Control (RBAC)
*   Hashing Password yang Aman (bcryptjs)
*   Middleware Autentikasi & Otorisasi
*   Logout & Pencabutan Token (Spesifik & Semua Sesi)

## Teknologi yang Digunakan

*   Node.js
*   Express.js
*   MySQL (dengan `mysql2` driver)
*   JSON Web Token (`jsonwebtoken`)
*   BcryptJS (`bcryptjs`)
*   Dotenv (`dotenv`)
*   Express Validator (`express-validator`)
*   CORS (`cors`)

## API Endpoints (Ringkasan)

*   `POST /api/auth/register`
*   `POST /api/auth/login`
*   `POST /api/auth/refresh-token`
*   `GET /api/auth/profile` (Protected)
*   `POST /api/auth/logout`
*   `POST /api/auth/logout-all` (Protected)
*   `GET /api/auth/admin/dashboard-summary` (Protected, Admin Role)

---

Proyek ini dilisensikan di bawah [Lisensi MIT](LICENSE.md).