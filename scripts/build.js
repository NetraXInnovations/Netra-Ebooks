'use strict';

// Builds the Netra eBooks lists the Netra Plus app reads. No server: GitHub Actions runs this every
// day for free and commits the files; the app reads them through jsDelivr (or GitHub raw).
// Run by hand with:  node scripts/build.js
//
// Output: data/<language>/<category>.json  first 30 books  { books, page, total, hasMore }
// Searches, more pages and details come straight from Internet Archive on the phone.
// A list that cannot be fetched today keeps yesterday's file, so an outage never empties the app.
//
// Languages and categories: settings.json ("languages", "categories"), else scripts/catalog.js.
// Keep them the same as data/catalog.json in NetraXInnovations/netra-content, which the app uses
// for its language and category menus.

const fs = require('fs');
const path = require('path');
const catalog = require('./catalog');
const src = require('./sources');

const ROOT = path.join(__dirname, '..', 'data');
const SETTINGS = path.join(__dirname, '..', 'settings.json');
const PARALLEL = 3;

function settings() {
  const s = fs.existsSync(SETTINGS) ? JSON.parse(fs.readFileSync(SETTINGS, 'utf8')) : {};
  return {
    languages: Array.isArray(s.languages) && s.languages.length ? s.languages : catalog.LANGUAGES,
    categories: Array.isArray(s.categories) && s.categories.length ? s.categories : catalog.BOOK_CATEGORIES,
  };
}

function write(file, value) {
  const full = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(value) + '\n');
}

async function retry(fn, times = 3) {
  let last;
  for (let i = 0; i < times; i++) {
    try { return await fn(); } catch (e) { last = e; await new Promise((r) => setTimeout(r, 2000 * (i + 1))); }
  }
  throw last;
}

async function main() {
  const s = settings();
  const jobs = [];
  for (const language of s.languages) {
    for (const category of s.categories) {
      jobs.push({ file: `${language.id}/${category.id}.json`, load: () => src.searchBooks({ language, category, query: '', page: 1 }) });
    }
  }
  let next = 0; let ok = 0; let failed = 0;
  async function worker() {
    while (next < jobs.length) {
      const job = jobs[next++];
      try {
        write(job.file, await retry(job.load));
        ok++;
      } catch (e) {
        failed++;
        console.warn('kept old file', job.file, String(e.message || e));
      }
    }
  }
  await Promise.all(Array.from({ length: PARALLEL }, worker));
  console.log(`Done: ${ok} lists written, ${failed} kept from before.`);
  if (ok === 0 && jobs.length) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
