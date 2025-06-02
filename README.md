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

## Prasyarat

*   Node.js (v18.x atau lebih baru direkomendasikan)
*   NPM atau Yarn
*   Server MySQL berjalan
*   Git

## Instalasi & Setup

1.  **Clone repository ini (jika sudah di GitHub):**
    ```bash
    git clone https://github.com/NAMA_ANDA/NAMA_REPO_ANDA.git
    cd NAMA_REPO_ANDA
    ```
    (Langkah ini untuk pengguna lain setelah Anda unggah)

2.  **Install dependensi:**
    ```bash
    npm install
    ```
    atau
    ```bash
    yarn install
    ```

3.  **Setup Variabel Lingkungan:**
    *   Salin file `.env.example` menjadi `.env`:
        ```bash
        cp .env.example .env
        ```
    *   Buka file `.env` dan isi semua variabel yang diperlukan sesuai dengan konfigurasi lokal Anda (kredensial database, secret JWT, dll.).
        ```env
        PORT=3001
        DB_HOST=localhost
        DB_USER=your_db_user
        DB_PASSWORD=your_db_password
        DB_NAME=auth_db_detailed
        DB_PORT=3306
        JWT_ACCESS_SECRET=generate_a_strong_secret_key
        JWT_REFRESH_SECRET=generate_another_strong_secret_key
        JWT_ACCESS_EXPIRATION=15m
        JWT_REFRESH_EXPIRATION=7d
        ```

4.  **Setup Database:**
    *   Pastikan server MySQL Anda berjalan.
    *   Buat database dengan nama yang Anda tentukan di `.env` (misalnya, `auth_db_detailed`).
    *   Jalankan skrip SQL yang ada di `DATABASE_SETUP.sql` (Anda perlu membuat file ini atau meletakkan query SQL di README) untuk membuat tabel `roles`, `users`, dan `refresh_tokens`, serta mengisi data awal untuk `roles`.
        ```sql
        -- Contoh isi DATABASE_SETUP.sql (atau letakkan di sini)
        -- CREATE DATABASE auth_db_detailed;
        -- USE auth_db_detailed;
        -- ... (query CREATE TABLE dari langkah-langkah sebelumnya) ...
        -- INSERT INTO roles (name) VALUES ('admin'), ('user'), ('guest');
        ```

## Menjalankan Aplikasi

*   **Mode Pengembangan (dengan auto-restart menggunakan nodemon):**
    ```bash
    npm run dev
    ```
*   **Mode Produksi:**
    ```bash
    npm start
    ```
Aplikasi akan berjalan di `http://localhost:PORT` (sesuai `.env`).

## Struktur Proyek (Ringkasan)
auth-api-/
├── src/
│ ├── config/ # Konfigurasi database, JWT
│ ├── controllers/ # Logika endpoint
│ ├── middleware/ # Middleware auth, validasi
│ ├── models/ # Interaksi database
│ ├── routes/ # Definisi rute API
│ ├── services/ # Layanan token
│ └── utils/ # Utilitas password, dll.
├── .env # Variabel lingkungan 
├── .gitignore # File yang diabaikan Git
├── app.js # Setup aplikasi Express
├── server.js # Titik masuk server
├── package.json
└── README.md

## API Endpoints (Ringkasan)

Lihat `src/routes/authRoutes.js` untuk detail atau [Postman Collection](#) (jika Anda menyediakannya).

*   `POST /api/auth/register`
*   `POST /api/auth/login`
*   `POST /api/auth/refresh-token`
*   `GET /api/auth/profile` (Protected)
*   `POST /api/auth/logout`
*   `POST /api/auth/logout-all` (Protected)
*   `GET /api/auth/admin/dashboard-summary` (Protected, Admin Role)

---

Proyek ini dilisensikan di bawah [Lisensi MIT](LICENSE.md).