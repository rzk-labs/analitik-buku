# Analitik Buku

PWA untuk menjelajah buku: urutkan **rating** / **total rating** / tahun / **jumlah halaman**, filter **kategori**, **rentang tahun** dan **jumlah halaman**.

- **Goodreads** (±14.500 buku, rating asli Goodreads):
  - 10.000 buku terpopuler dari [Goodbooks-10k](https://github.com/zygmuntz/goodbooks-10k) (CC BY-SA 4.0, data s/d 2017).
  - ±4.500 nominasi Goodreads Choice Awards 2011–2024 dari [FIT-SE23/GoodreadsChoiceAwards](https://github.com/FIT-SE23/GoodreadsChoiceAwards) (tanpa lisensi; hanya untuk pemakaian pribadi non-komersial).
  - ±850 buku "paling populer" Goodreads per tahun (2010–2022) dan per bulan (2023–2026), lewat `tools/ambil-choice-awards.js --populer` (22 Nov 2026).
  - Diolah oleh `tools/build-data.js <folder-goodbooks> <final_books_data_2011_2024.csv>` (PapaParse, MIT).


Satu sumber: Goodreads. API publik Goodreads ditutup sejak 2020, jadi data berasal dari dataset + nominasi Choice Awards (bukan seluruh database).

Data `data/goodreads.json` berlisensi CC BY-SA 4.0 (turunan Goodbooks-10k).

Jumlah halaman: Choice Awards & 2025–2026 dari Goodreads; buku Goodbooks-10k dari Open Library per ISBN (tools/ambil-halaman-ol.js). Halaman < 30 dianggap tidak diketahui.
