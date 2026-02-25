# Aplikasi Pengelolaan Berita dengan Trending Topics & Analitik

Proyek ini menyediakan aplikasi full-stack berbasis Docker untuk:

- CRUD data berita lokal
- Sinkronisasi berita dari API publik (NewsAPI `everything` endpoint)
- Anti-duplikasi berdasarkan URL (`INSERT IGNORE` + unique key)
- Dashboard analitik (kategori, tren harian, trending keywords)

## Tech Stack

- Frontend: React + Vite + Tailwind CSS + Tremor
- Backend: Node.js + Express
- Database: MySQL 8.0
- Infra: Docker Compose

## Struktur Proyek

- `frontend/` - UI manajemen berita dan dashboard
- `backend/` - API CRUD, sync, analytics
- `db/init.sql` - skema database awal
- `docker-compose.yml` - orchestration service lokal

## Menjalankan Proyek

1. Isi API key pada `backend/.env` (`NEWS_API_KEY=...`).
2. (Opsional) Atur query sinkronisasi default seperti `NEWS_API_QUERY`, `NEWS_API_LANGUAGE`, dan `NEWS_API_SORT_BY`.
3. Jalankan:

```bash
docker compose up --build
```

4. Akses aplikasi:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

## Endpoint Backend Utama

- `GET /api/news` - list berita (search/filter/sort, opsional pagination `page` + `limit`)
- `POST /api/news` - tambah berita
- `PUT /api/news/:id` - update berita
- `DELETE /api/news/:id` - hapus berita
- `POST /api/news/sync` - sinkronisasi dari API publik (response detail: fetched/inserted/duplicated; topik wajib dikirim via query params seperti `?q=bitcoin&language=en`)
- `GET /api/news/last-sync` - info sinkronisasi terakhir
- `GET /api/news/dashboard` - data dashboard analitik

## Catatan

- File `backend/.env` saat ini berisi placeholder API key; ganti sebelum menjalankan fitur sinkronisasi.
- Sync bersifat per-request: topik wajib dikirim saat memanggil endpoint (contoh `q=bitcoin`) atau dari input Topik di UI.
- Variabel `.env` kini dipakai untuk konfigurasi teknis sinkronisasi (endpoint, bahasa, sort, page size), bukan untuk topik default.
- `SYNC_ADMIN_TOKEN` bisa diisi untuk melindungi endpoint sync lewat header `x-sync-token`.
- Sync memiliki rate limit sederhana via `SYNC_RATE_LIMIT_SECONDS` (default 15 detik per IP).
- Sinkronisasi NewsAPI memakai timeout + retry ringan (`NEWS_API_TIMEOUT_MS`, `NEWS_API_RETRIES`) untuk mengurangi kegagalan karena network/intermittent error.
- `trending_keywords` diperbarui berdasarkan kata pada judul berita (dengan stop words sederhana EN/ID).
