# KPM School Finder

Web app untuk mencari dan menganalisis sekolah KPM (Kementerian Pendidikan Malaysia) menggunakan data daripada risalah KPM.

## Ciri

- **Cari sekolah** – Carian mengikut nama, kod, negeri, PPD, jenis, lokasi.
- **Peta** – Paparan sekolah pada peta; pilihan "Dekat saya" dengan radius (km).
- **Statistik** – Dashboard agregat dan senarai sekolah "sesak" (nisbah murid-guru tinggi).
- **Data** – Diselaraskan setiap hari dari Google Sheet ke `data/schools.json` melalui GitHub Actions.

## Teknologi

- Next.js (App Router), TypeScript, Tailwind CSS, Shadcn-style UI (Radix), React Leaflet, Recharts.
- Tiada backend: data JSON dalam repo, dikemas kini oleh cron (GitHub Actions).

## Persediaan

1. Clone repo dan pasang dependensi:
   ```bash
   npm install
   ```
2. Jalankan pembangunan:
   ```bash
   npm run dev
   ```
3. Buka [http://localhost:3000](http://localhost:3000).

## Penyegerakan data

- **Dalam CI:** Workflow `.github/workflows/sync-schools.yml` berjalan setiap hari (2:00 UTC) dan pada `workflow_dispatch`. Ia memuat CSV dari Google Sheet dan menulis `data/schools.json`.
- **Tempatan:** Pastikan Google Sheet boleh dieksport sebagai CSV (sesiapa dengan pautan boleh lihat). Jalankan:
  ```bash
  npm run sync-schools
  ```

## Pembinaan

```bash
npm run build
npm start
```

Untuk export statik (contoh: GitHub Pages), tambah `output: 'export'` dalam `next.config.ts` dan jalankan `npm run build`.
