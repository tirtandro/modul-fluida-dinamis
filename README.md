# Modul Pembelajaran Interaktif: Fluida Dinamis

Modul pembelajaran interaktif berbasis web untuk materi Fisika (Fluida Dinamis). Aplikasi ini dilengkapi dengan simulasi interaktif, kuis evaluasi, serta sistem pelacakan (tracking) kemajuan belajar siswa untuk dipantau oleh guru.

## Fitur Utama

- **Sistem Autentikasi Siswa:** Login praktis tanpa password (menggunakan Nama, Kelas, dan NIS).
- **Materi Interaktif:** Presentasi materi berbasis slide yang dinamis (Hukum Bernoulli, Asas Kontinuitas, dll).
- **Simulasi Virtual:** Kanvas HTML5 interaktif yang memungkinkan siswa memanipulasi variabel fisika secara *real-time*.
- **Kuis Evaluasi:** Soal evaluasi dengan *feedback* instan (Pilihan Ganda & Benar/Salah).
- **Pelacakan Kemajuan (Progress Tracking):** Menyimpan sejauh mana siswa telah membaca materi dan skor kuis mereka.
- **Dasbor Guru (Admin):** Halaman khusus untuk memantau nilai kuis dan riwayat akses seluruh siswa dalam bentuk tabel.

## Teknologi yang Digunakan

- **Backend:** Python (Flask), SQLite (untuk *database* ringan)
- **Frontend:** HTML5, Vanilla JavaScript, CSS3 (tanpa *framework* eksternal untuk *styling*)
- **Grafis & Animasi:** HTML5 Canvas API

## Cara Menjalankan Secara Lokal

1. Pastikan Anda telah menginstal **Python 3.8+**.
2. *Clone* repositori ini:
   ```bash
   git clone https://github.com/tirtandro/modul-fluida-dinamis.git
   cd modul-fluida-dinamis
   ```
3. (Opsional) Buat dan aktifkan *virtual environment*:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
4. Instal *requirements*:
   ```bash
   pip install -r requirements.txt
   ```
5. Buat file `.env` di folder utama aplikasi dan tambahkan *secret key* untuk Flask:
   ```env
   FLASK_SECRET_KEY=isi_dengan_kunci_rahasia_bebas
   ```
6. Jalankan aplikasi:
   ```bash
   python app.py
   ```
7. Buka browser dan akses `http://localhost:5000`.

## Dasbor Guru (Admin)

Untuk mengakses dasbor guru, buka `http://localhost:5000` dan masukkan kredensial berikut pada Form Login:
- **Nama:** `admin`
- **Kelas:** (abaikan / isi bebas)
- **NIS:** `guru123`

## Struktur Database

Data disimpan secara otomatis pada file `database.db` saat aplikasi dijalankan.
- Tabel `users`: Menyimpan data Nama, Kelas, NIS.
- Tabel `progress`: Menyimpan rekaman aktivitas siswa per sesi pembelajaran (halaman yang diakses, status selesai).
- Tabel `quiz_scores`: Menyimpan nilai akhir evaluasi kuis siswa.

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
