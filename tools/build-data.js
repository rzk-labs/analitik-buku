// Ubah CSV Goodbooks-10k (Goodreads) -> data/goodreads.json ringkas
const fs = require('fs');
const path = require('path');
const Papa = require(path.join(__dirname, 'papaparse.min.js'));
const src = process.argv[2];
if (!src) { console.error('pakai: node build-data.js <folder-csv>'); process.exit(1); }
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
  'literary-fiction':'Literary Fiction','chick-lit':'Chick Lit','lgbt':'LGBT','urban-fantasy':'Urban Fantasy'
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
fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'data', 'goodreads.json'), JSON.stringify(out));
const cnt = {}; out.forEach(r => r[5].forEach(g => cnt[g] = (cnt[g] || 0) + 1));
console.log('buku:', out.length, '| tanpa genre:', out.filter(r => !r[5].length).length, '| tahun:', Math.min(...out.map(r => r[2] ?? 9e9)), '-', Math.max(...out.map(r => r[2] ?? -9e9)));
console.log(Object.entries(cnt).sort((a, b) => b[1] - a[1]).map(e => e.join(':')).join(', '));
