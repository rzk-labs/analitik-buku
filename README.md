# Analitik Buku

PWA untuk menjelajah buku: urutkan **rating** / **total rating** / tahun, filter **kategori** dan **rentang tahun**.

- **Goodreads 10k**: 10.000 buku terpopuler Goodreads dari [Goodbooks-10k](https://github.com/zygmuntz/goodbooks-10k) (CC BY-SA 4.0, data s/d 2017). Diolah oleh `tools/build-data.js` (pakai PapaParse, MIT).
- **Open Library (live)**: API pencarian openlibrary.org (jutaan buku; rating pengguna Open Library, bukan Goodreads).

Goodreads tidak punya API publik sejak 2020, jadi seluruh database Goodreads tidak bisa diambil secara langsung.

Data `data/goodreads.json` berlisensi CC BY-SA 4.0 (turunan Goodbooks-10k).
