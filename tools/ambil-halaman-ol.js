// Jumlah halaman untuk buku Goodbooks-10k (tidak punya kolom halaman) dari Open Library,
// dicocokkan lewat ISBN-10. Hasil: { goodreads_book_id: halaman }.
// node ambil-halaman-ol.js <folder-goodbooks-csv> <keluaran.json>
const fs = require('fs');
const path = require('path');
const Papa = require(path.join(__dirname, 'papaparse.min.js'));
const [src, outFile] = process.argv.slice(2);
if (!src || !outFile) { console.error('pakai: node ambil-halaman-ol.js <folder-goodbooks-csv> <keluaran.json>'); process.exit(1); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
const books = Papa.parse(fs.readFileSync(path.join(src, 'books.csv'), 'utf8'), { header: true, skipEmptyLines: true }).data;
const out = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : {};
const todo = books.map(b => ({ id: b.goodreads_book_id, isbn: /^[0-9]{1,9}[0-9X]$/i.test(b.isbn || '') ? b.isbn.toUpperCase().padStart(10, '0') : null }))
  .filter(b => b.isbn && !(b.id in out));
console.log('perlu dicari:', todo.length);
(async () => {
  for (let i = 0; i < todo.length; i += 50) {
    const part = todo.slice(i, i + 50);
    const u = new URL('https://openlibrary.org/search.json');
    u.searchParams.set('q', 'isbn:(' + part.map(b => b.isbn).join(' OR ') + ')');
    u.searchParams.set('fields', 'isbn,number_of_pages_median');
    u.searchParams.set('limit', '100');
    let j = null;
    for (let t = 0; t < 3 && !j; t++) {
      await sleep(1000 * (t + 1));
      try { const r = await fetch(u, { headers: { 'User-Agent': 'analitik-buku (personal)' } }); if (r.ok) j = await r.json(); else console.warn('HTTP', r.status); }
      catch (e) { console.warn('gagal', e.message); }
    }
    if (!j) continue;
    for (const b of part) {
      const d = j.docs.find(d => (d.isbn || []).includes(b.isbn));
      out[b.id] = d && d.number_of_pages_median > 0 ? d.number_of_pages_median : 0;
    }
    if ((i / 50) % 20 === 0) { fs.writeFileSync(outFile, JSON.stringify(out)); console.log('  ', i + part.length, '/', todo.length); }
  }
  fs.writeFileSync(outFile, JSON.stringify(out));
  const v = Object.values(out); console.log('selesai:', v.length, '| ada halaman:', v.filter(x => x > 0).length);
})();
