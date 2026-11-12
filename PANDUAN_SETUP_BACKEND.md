# ⚔️ PANDUAN LENGKAP INTEGRASI BACKEND & LOGIN GOOGLE (QUESTLOG)

Aplikasi QuestLog telah dilengkapi dengan **Cloud Synchronization Engine** dan **Local-First Architecture** menggunakan **Supabase PostgreSQL & Google OAuth**.

Dengan sistem ini:
1. **Pengguna dapat Login dengan Akun Gmail / Google**.
2. **Seluruh progres tersimpan otomatis di Cloud**: Level, EXP, Gold, HP, Quest aktif & riwayat, ransel/inventory, dan tema.
3. **Sinkronisasi Otomatis**: Jika pengguna membuka QuestLog di perangkat atau browser lain dengan akun Google yang sama, seluruh progres petualangan akan langsung terambil kembali dari Cloud.

---

## 🚀 Langkah 1: Buat Proyek Supabase (Gratis)
1. Buka [https://supabase.com](https://supabase.com) dan masuk dengan akun Anda.
2. Klik tombol **New Project**.
3. Beri nama proyek, misalnya: `QuestLog-DB`, lalu atur password database dan pilih region terdekat (misal: *Singapore*).
4. Setelah proyek selesai dibuat, buka menu **Project Settings** (ikon gear di kiri bawah) > **API**.
5. Salin:
   - **Project URL**
   - **Project API Keys (`anon` / `public`)**
6. Buka file `.env` di folder proyek ini dan ganti dengan kredensial baru Anda:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 🗄️ Langkah 2: Buat Tabel Database (1-Klik via SQL Editor)
Kami telah menyediakan skrip SQL lengkap di file: `supabase_schema.sql`.

1. Buka Dashboard Supabase Anda, lalu pilih menu **SQL Editor** di bilah kiri.
2. Klik **New Query**.
3. Buka file `supabase_schema.sql` di proyek ini, salin seluruh isinya, dan tempelkan ke SQL Editor Supabase.
4. Klik tombol **Run** (atau tekan `Ctrl + Enter`).
5. Selesai! Seluruh tabel berikut telah dibuat secara otomatis lengkap dengan keamanan **Row Level Security (RLS)**:
   - `profiles`: Menyimpan data Hero (level, HP, EXP, Gold, Streak, Avatar, Tema).
   - `quests`: Menyimpan daftar quest harian (DAILY) dan one-time quest (EVENT).
   - `inventory`: Menyimpan ransel item virtual (Potion Merah, Tenda Freeze, dll).
   - `quest_history`: Menyimpan riwayat quest selesai/gagal dan log perubahan EXP/Gold.
   - **Trigger Otomatis**: Setiap kali ada akun Google baru yang masuk, Supabase akan langsung menginisialisasi profil hero dan memberikan misi starter secara otomatis!

---

## 🔐 Langkah 3: Mengaktifkan Google OAuth di Supabase

Untuk mengizinkan pengguna masuk dengan Gmail / Akun Google:

### 3.1. Dapatkan Google Client ID & Secret
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat proyek baru (misal: *QuestLog App*).
3. Buka menu **APIs & Services** > **OAuth consent screen**:
   - Pilih **External**, isi nama aplikasi (*QuestLog*), email dukungan, dan email developer, lalu simpan.
4. Buka menu **Credentials** > klik **Create Credentials** > pilih **OAuth client ID**:
   - Application type: **Web application**
   - Name: `QuestLog Client`
   - Pada bagian **Authorized redirect URIs**, klik **Add URI** dan masukkan URL Callback dari Supabase Anda:
     ```
     https://<ID-PROYEK-SUPABASE-ANDA>.supabase.co/auth/v1/callback
     ```
     *(Contoh: `https://abcdefghijklmn.supabase.co/auth/v1/callback`)*
   - Klik **Create**.
   - Salin **Client ID** dan **Client Secret** yang muncul.

### 3.2. Aktifkan Provider Google di Supabase
1. Di Dashboard Supabase Anda, buka menu **Authentication** > **Providers** > klik **Google**.
2. Aktifkan toggle **Enable Google provider**.
3. Masukkan **Client ID** dan **Client Secret** yang Anda dapatkan dari Google Cloud Console tadi.
4. Klik **Save**.
5. Buka menu **Authentication** > **URL Configuration**:
   - Pada **Site URL**, masukkan URL aplikasi lokal Anda: `http://localhost:5173` (atau domain Anda jika sudah dideploy).
   - Pada **Redirect URLs**, tambahkan `http://localhost:5173/**`.
   - Klik **Save**.

---

## 🎮 Langkah 4: Uji Coba Aplikasi
1. Buka terminal di folder proyek ini dan jalankan:
   ```bash
   npm run dev
   ```
2. Buka `http://localhost:5173` di browser Anda.
3. Pada layar awal gerbang autentikasi (*LicenseGate*), klik tombol **"MASUK DENGAN GOOGLE"**.
4. Pilih akun Google Anda.
5. Anda akan langsung masuk ke QuestLog dengan lencana **`CLOUD SYNC`** aktif di bilah navigasi atas.
6. Selesaikan quest, tambah quest baru, atau beli item di toko — seluruh perubahan akan langsung tersimpan ke Supabase PostgreSQL secara real-time!
