# Analitik Buku

PWA untuk menjelajah buku: urutkan **rating** / **total rating** / tahun, filter **kategori** dan **rentang tahun**.

- **Goodreads** (±14.500 buku, rating asli Goodreads):
  - 10.000 buku terpopuler dari [Goodbooks-10k](https://github.com/zygmuntz/goodbooks-10k) (CC BY-SA 4.0, data s/d 2017).
  - ±4.500 nominasi Goodreads Choice Awards 2011–2024 dari [FIT-SE23/GoodreadsChoiceAwards](https://github.com/FIT-SE23/GoodreadsChoiceAwards) (tanpa lisensi; hanya untuk pemakaian pribadi non-komersial).
  - Diolah oleh `tools/build-data.js <folder-goodbooks> <final_books_data_2011_2024.csv>` (PapaParse, MIT).
- **Open Library (live)**: API pencarian openlibrary.org (jutaan buku; rating pengguna Open Library, bukan Goodreads).

Goodreads tidak punya API publik sejak 2020, jadi seluruh database Goodreads tidak bisa diambil secara langsung.

Data `data/goodreads.json` berlisensi CC BY-SA 4.0 (turunan Goodbooks-10k).
