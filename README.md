## Cara Menjalankan Aplikasi

### Prasyarat

- Docker Desktop aktif
- Port `3000`, `5000`, `3306` tidak dipakai proses lain

### Konfigurasi

Isi `backend/.env` minimal:

```env
NEWS_API_KEY=your_api_key_here
```

Opsional:

```env
NEWS_API_BASE_URL=https://newsapi.org/v2/everything
NEWS_API_LANGUAGE=id
NEWS_API_SORT_BY=publishedAt
NEWS_API_PAGE_SIZE=50
NEWS_API_TIMEOUT_MS=10000
NEWS_API_RETRIES=2
SYNC_ADMIN_TOKEN=
SYNC_RATE_LIMIT_SECONDS=15
```

### Start

```bash
docker compose up -d --build
```

### Akses

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- Healthcheck: `http://localhost:5000/api/health`

## Kontrak API (Penting)

### `GET /api/news`

Response sekarang selalu konsisten:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 1
  }
}
```

Catatan:

- Default pagination: `page=1`, `limit=20`
- Batas `limit`: `1..100`

### Endpoint lainnya

- `POST /api/news` - create berita
- `PUT /api/news/:id` - update berita
- `DELETE /api/news/:id` - delete berita
- `POST /api/news/sync?q=<topic>` - sync dari NewsAPI
- `GET /api/news/last-sync` - data sync terakhir
- `GET /api/news/dashboard` - payload analitik dashboard

## Contoh Curl

```bash
curl -s http://localhost:5000/api/health
curl -s "http://localhost:5000/api/news?page=1&limit=20"
curl -s "http://localhost:5000/api/news?search=bitcoin&category=general&page=1&limit=20"
curl -s "http://localhost:5000/api/news/dashboard"
curl -s -X POST "http://localhost:5000/api/news/sync?q=bitcoin&language=en&pageSize=5"
```

Jika `SYNC_ADMIN_TOKEN` diisi, sertakan header:

```bash
curl -s -X POST "http://localhost:5000/api/news/sync?q=bitcoin" \
  -H "x-sync-token: <your_token>"
```

## Panduan UI Horizon

Tema utama yang dipakai:

- Background utama: `#F4F7FE`
- Heading utama: `#2B3674`
- Teks pendukung: `#A3AED0`
- Primary action: `#4318FF` (hover `#3311DB`)
- Card style: `rounded-[20px]`, `shadow-[0px_18px_40px_rgba(112,144,176,0.12)]`

Tooltip donut chart (`Distribusi Kategori`) sudah dikunci behavior berikut:

- tooltip mengikuti kursor (tanpa fixed position)
- `pointer-events-none` pada wrapper custom tooltip
- `wrapperStyle={{ pointerEvents: 'none' }}` pada komponen Recharts Tooltip
- ada `offset` agar tidak menempel ke kursor

## Refactor Clean Code yang Sudah Diterapkan

- Standarisasi kontrak list API (`/api/news`) jadi shape tunggal `{ data, pagination }`
- Refactor logic berita ke custom hook: `useNewsManagement`
- Pemisahan UI section manajemen berita:
  - `NewsFilterSyncSection`
  - `NewsTableSection`
- Penghapusan dead/commented code di wrapper utama `App.jsx`

## Checklist Fungsional

Setelah deploy lokal, cek:

- CRUD berita berjalan (create/edit/delete)
- Filter search + kategori berjalan
- Sync topik berjalan dan update `Last Sync`
- Tabel render dengan pagination metadata
- Chart dashboard tampil, tooltip donut follow cursor

