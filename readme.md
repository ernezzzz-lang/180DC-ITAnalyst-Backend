# Ernesta Naufal Abyan - 180DC Department Case IT Analyst

Repo ini berisi code backend REST API untuk memenuhi **180DC Phase 3 Recruitment IT Analyst  Department Case**. Di sini saya mengimplementasikan user auth system  serta CRUD dengan proteksi keamana dan integrated dengan database cloud

## Tech Stack
- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (Hosted via Supabase Cloud)
- **Library :** `pg` (PostgreSQL Client), `jsonwebtoken`, `bcryptjs`, `dotenv`, `nodemon` (Development tool)

## How to run?

### 1. Install Dependencies
Make sure Node.js sudah terinstal, and then run command berikut di terminal untuk donglod semua library:
```bash
npm install

### 2. Environment Config
Buat  file  `.env` di main directory project sejajar dengan file `server.js`.

Demi menjaga keamanan data, file `.env` asli telah dimasukkan ke dalam `.gitignore` dan tidak di-upload ke GitHub. Silakan buat file `.env` baru di lokal Anda dan isi dengan format variabel berikut (sesuaikan dengan kredensial database Supabase Anda sendiri):

PORT=5000
DATABASE_URL=paste_URI_database_supabase_kamu_di_sini
JWT_SECRET=buat_kunci_rahasia_jwt_bebas_di_sini

Contoh : 

PORT=5000
DATABASE_URL=postgresql://postgres:rahasia123@db.xyzproject.supabase.co:5432/postgres
JWT_SECRET=supersecretkey180dc

### 3. Run Server
Untuk menyalakan server backend dengan fitur auto-reload dari nodemon, run command berikut di terminal:
npm run dev








Dibuat dengan penuh dedikasi untuk pemenuhan seleksi IT Analyst - 180 Degrees Consulting