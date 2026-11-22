// Ambil nominasi Goodreads Choice Awards (tahun tertentu) + rating dari halaman buku.
// Pemakaian pribadi, pelan (jeda antar-permintaan), HTML di-cache agar bisa dilanjutkan.
// node ambil-choice-awards.js <folder-cache> <keluaran.json> 2025 2026   (OFFLINE=1 = hanya dari cache)
const fs = require('fs');
const path = require('path');
const [cacheDir, outFile, ...years] = process.argv.slice(2);
if (!cacheDir || !outFile || !years.length || years.some(y => !/^20\d\d$/.test(y))) {
  console.error('pakai: node ambil-choice-awards.js <folder-cache> <keluaran.json> <tahun...>'); process.exit(1);
}
fs.mkdirSync(cacheDir, { recursive: true });
const JEDA = +process.env.JEDA_MS || 3000;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(url) {
  const f = path.join(cacheDir, url.replace(/^https:\/\/www\.goodreads\.com\//, '').replace(/[^a-z0-9-]+/gi, '_') + '.html');
  if (fs.existsSync(f) && fs.statSync(f).size > 5000) return fs.readFileSync(f, 'utf8');
  if (process.env.OFFLINE) return null; // OFFLINE=1: hanya pakai cache
  for (let i = 0; i < 4; i++) {
    await sleep(JEDA * (i + 1) ** 2);
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (personal book list)' } });
      if (r.ok) { const t = await r.text(); if (t.length > 5000) { fs.writeFileSync(f, t); return t; } console.warn('  balasan kosong, coba lagi', url); continue; }
      console.warn('  HTTP', r.status, url);
    } catch (e) { console.warn('  gagal', e.message); }
  }
  return null;
}
const clean = s => decode(s).replace(/\s+/g, ' ').trim();
const decode = s => String(s).replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
(async () => {
  const books = new Map(); // id -> {cat, year}
  for (const y of years) {
    const idx = await get(`https://www.goodreads.com/choiceawards/best-books-${y}`);
    if (!idx) { console.warn('indeks', y, 'gagal'); continue; }
    const cats = [...new Set([...idx.matchAll(new RegExp(`href="(/choiceawards/[a-z-]+-${y})"`, 'g'))].map(m => m[1]))];
    console.log(y, 'kategori:', cats.length);
    for (const c of cats) {
      const html = await get('https://www.goodreads.com' + c); if (!html) continue;
      const ids = [...new Set([...html.matchAll(/pollAnswer__bookLink" href="\/book\/show\/(\d+)/g)].map(m => m[1]))];
      ids.forEach(id => { if (!books.has(id)) books.set(id, { award: +y }); });
      console.log(' ', c.replace('/choiceawards/', ''), ids.length);
    }
  }
  console.log('buku unik:', books.size);
  const out = []; let n = 0;
  for (const [id, meta] of books) {
    n++; const html = await get(`https://www.goodreads.com/book/show/${id}`);
    if (!html) continue;
    const ld = html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/);
    let j; try { j = JSON.parse(ld[1]); } catch { console.warn('  tanpa data', id); continue; }
    const ar = +j.aggregateRating?.ratingValue, rc = +j.aggregateRating?.ratingCount;
    if (!j.name || !isFinite(ar) || !isFinite(rc)) continue;
    const pt = html.match(/"publicationTime":(\d+)/);
    const year = pt ? new Date(+pt[1]).getUTCFullYear() : meta.award;
    const genres = [...new Set([...html.matchAll(/"__typename":"Genre","name":"([^"]+)"/g)].map(m => decode(m[1])))].slice(0, 10);
    out.push({ title: clean(j.name), author: clean(j.author?.[0]?.name || ''), year, rating: ar, count: rc, genres, pages: +j.numberOfPages || 0, id: +id, img: j.image || '' });
    if (n % 25 === 0) console.log('  buku', n, '/', books.size);
  }
  fs.writeFileSync(outFile, JSON.stringify(out));
  console.log('selesai:', out.length, 'buku ->', outFile);
})();
