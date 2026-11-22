// Ubah CSV Goodbooks-10k (Goodreads) -> data/goodreads.json ringkas
const fs = require('fs');
const path = require('path');
const Papa = require(path.join(__dirname, 'papaparse.min.js'));
const src = process.argv[2], gcaFile = process.argv[3], baruFile = process.argv[4];
if (!src) { console.error('pakai: node build-data.js <folder-goodbooks-csv> [choice-awards.csv] [choice-2025-2026.json]'); process.exit(1); }
const read = f => Papa.parse(fs.readFileSync(path.join(src, f), 'utf8'), { header: true, skipEmptyLines: true }).data;
const GENRE = {
  'fantasy':'Fantasy','science-fiction':'Sci-Fi','sci-fi':'Sci-Fi','romance':'Romance','mystery':'Mystery',
  'thriller':'Thriller','horror':'Horror','historical-fiction':'Historical Fiction','young-adult':'Young Adult',
  'ya':'Young Adult','classics':'Classics','non-fiction':'Non-Fiction','nonfiction':'Non-Fiction',
  'biography':'Biography','memoir':'Memoir','history':'History','self-help':'Self-Help','business':'Business',
  'psychology':'Psychology','philosophy':'Philosophy','science':'Science','poetry':'Poetry','childrens':'Children',
  'children':'Children','graphic-novels':'Graphic Novel','comics':'Graphic Novel','manga':'Manga',
  'contemporary':'Contemporary','dystopian':'Dystopian','paranormal':'Paranormal','crime':'Crime',
  'humor':'Humor','religion':'Religion','christian':'Religion','spirituality':'Spirituality','travel':'Travel',
  'cookbooks':'Cookbook','art':'Art','politics':'Politics','economics':'Economics','health':'Health',
  'productivity':'Productivity','adventure':'Adventure','war':'War','short-stories':'Short Stories',
  'literary-fiction':'Literary Fiction','self-help':'Self-Help','middle-grade':'Children','romantasy':'Fantasy','cooking':'Cookbook','food':'Cookbook','true-crime':'Crime','audiobook':null,'fiction':null,'chick-lit':'Chick Lit','lgbt':'LGBT','urban-fantasy':'Urban Fantasy'
};
const tagName = {}; for (const t of read('tags.csv')) tagName[t.tag_id] = t.tag_name;
const byBook = {};
for (const bt of read('book_tags.csv')) {
  const g = GENRE[tagName[bt.tag_id]]; if (!g) continue;
  const m = (byBook[bt.goodreads_book_id] ||= {}); m[g] = (m[g] || 0) + (+bt.count || 0);
}
const out = [];
for (const b of read('books.csv')) {
  const rc = +b.work_ratings_count || +b.ratings_count || 0, ar = +b.average_rating;
  if (!b.title || !isFinite(ar)) continue;
  const y = parseInt(b.original_publication_year, 10);
  const g = Object.entries(byBook[b.goodreads_book_id] || {}).sort((a, c) => c[1] - a[1]).slice(0, 4).map(e => e[0]);
  out.push([b.title, (b.authors || '').split(',')[0].trim(), isFinite(y) ? y : null, ar, rc, g, +b.goodreads_book_id,
    (b.small_image_url || '').includes('nophoto') ? '' : (b.image_url || '').replace('https://images.gr-assets.com/books/', '')]);
}
// --- Goodreads Choice Awards 2011-2024 (buku baru, rating Goodreads) ---
const norm = x => String(x || '').toLowerCase().replace(/(.*?)/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
if (gcaFile) {
  const idx = new Map(out.map((r, i) => [norm(r[0]) + '|' + norm(r[1]), i]));
  let add = 0, upd = 0;
  const gca = Papa.parse(fs.readFileSync(gcaFile, 'utf8'), { header: true, skipEmptyLines: true }).data;
  for (const b of gca) {
    const ar = parseFloat(b.rating), rc = parseInt(b.num_ratings, 10), y = parseInt(b.publication_year, 10);
    if (!b.title || !isFinite(ar) || !isFinite(rc)) continue;
    let tags = []; try { tags = JSON.parse(String(b.genres).replace(/'/g, '"')); } catch { tags = String(b.genres).replace(/[[]']/g, '').split(',').map(t => t.trim()); }
    const g = [...new Set(tags.map(t => GENRE[t.toLowerCase().replace(/ /g, '-')]).filter(Boolean))].slice(0, 4);
    const key = norm(b.title) + '|' + norm(b.author);
    if (idx.has(key)) { const r = out[idx.get(key)]; if (rc > r[4]) { r[3] = ar; r[4] = rc; upd++; } continue; }
    idx.set(key, out.length); out.push([b.title, b.author, isFinite(y) ? y : null, ar, rc, g, 0, '']); add++;
  }
  console.log('Choice Awards: tambah', add, '| perbarui', upd);
}
// --- Choice Awards 2025-2026 (hasil tools/ambil-choice-awards.js) ---
if (baruFile) {
  const idx = new Map(out.map((r, i) => [norm(r[0]) + '|' + norm(r[1]), i]));
  let add = 0, upd = 0;
  for (const b of JSON.parse(fs.readFileSync(baruFile, 'utf8'))) {
    const g = [...new Set(b.genres.map(t => GENRE[t.toLowerCase().replace(/ /g, '-')]).filter(Boolean))].slice(0, 4);
    const row = [b.title, b.author, b.year, b.rating, b.count, g, b.id, String(b.img).replace(/.jpg$/, '._SY160_.jpg')];
    const key = norm(b.title) + '|' + norm(b.author);
    if (idx.has(key)) { out[idx.get(key)] = row; upd++; } else { idx.set(key, out.length); out.push(row); add++; }
  }
  console.log('Choice Awards 2025-2026: tambah', add, '| perbarui', upd);
}
for (const r of out) { r[0] = String(r[0]).replace(/\s+/g, ' ').trim(); r[1] = String(r[1]).replace(/\s+/g, ' ').trim(); }
fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'data', 'goodreads.json'), JSON.stringify(out));
const cnt = {}; out.forEach(r => r[5].forEach(g => cnt[g] = (cnt[g] || 0) + 1));
console.log('buku:', out.length, '| tanpa genre:', out.filter(r => !r[5].length).length, '| tahun:', Math.min(...out.map(r => r[2] ?? 9e9)), '-', Math.max(...out.map(r => r[2] ?? -9e9)));
console.log(Object.entries(cnt).sort((a, b) => b[1] - a[1]).map(e => e.join(':')).join(', '));
