# Authentication & Authorization API (Node.js, Express, MySQL)

![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

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
*   **Respons Sukses (Status 201 Created):**
![alt text](./images/register.png)
*   **Respons Gagal (Username Sudah Ada - Status 409 Conflict):**
![alt text](./images/register-.png)
*   `POST /api/auth/login`
*   **Respons Sukses (Status 200 Ok):**
![alt text](./images/login.png)
*   **Respons Gagal (Status 401 Kredensial Salah):**
![alt text](./images/login-.png)
*   `POST /api/auth/refresh-token`
*   **Respons Sukses (Status 200 Ok):**
![alt text](./images/refresh_token.png)
*   `GET /api/auth/profile` (Protected)
*   **Respons Sukses (Status 200 Ok):**
![alt text](./images/profile.png)
*   `POST /api/auth/logout`
**Respons Sukses (Status 200 Ok):**
![alt text](./images/logout.png)

---

Proyek ini dilisensikan di bawah [Lisensi MIT](LICENSE.md).
