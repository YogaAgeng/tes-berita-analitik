# Aplikasi Pengelolaan Berita dengan Trending Topics & Analitik

Proyek ini menyediakan aplikasi full-stack berbasis Docker untuk:

- CRUD data berita lokal
- Sinkronisasi berita dari API publik (NewsAPI)
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
2. Jalankan:

```bash
docker compose up --build
```

3. Akses aplikasi:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

## Endpoint Backend Utama

- `GET /api/news` - list berita (search/filter/sort)
- `POST /api/news` - tambah berita
- `PUT /api/news/:id` - update berita
- `DELETE /api/news/:id` - hapus berita
- `POST /api/news/sync` - sinkronisasi dari API publik
- `GET /api/news/last-sync` - info sinkronisasi terakhir
- `GET /api/news/dashboard` - data dashboard analitik

## Catatan

- File `backend/.env` saat ini berisi placeholder API key; ganti sebelum menjalankan fitur sinkronisasi.
- `trending_keywords` diperbarui berdasarkan kata pada judul berita (dengan stop words sederhana EN/ID).
