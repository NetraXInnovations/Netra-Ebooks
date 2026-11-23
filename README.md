# Netra eBooks

The Netra Plus app reads these books lists for free. No Firebase, no Cloud Functions, no server.

- `data/<language>/<category>.json`: the first 30 books for each language and category,
  for example `data/telugu/all.json`

The app reads them through jsDelivr, and through GitHub raw if jsDelivr does not answer:

    https://cdn.jsdelivr.net/gh/NetraXInnovations/Netra-Ebooks@main/data/telugu/all.json
    https://raw.githubusercontent.com/NetraXInnovations/Netra-Ebooks/main/data/telugu/all.json

Searches, more results and book details (PDF and EPUB links) come straight from the free Internet Archive (archive.org) on
the phone.

## Automatic daily refresh

A GitHub Action (`.github/workflows/refresh.yml`) rebuilds the lists every day at 02:00 India
time. Nothing needs to be uploaded by hand. To refresh now: Actions → "Refresh Netra eBooks lists" →
Run workflow.

## Languages and categories

The app's language and category menus come from `data/catalog.json` in
NetraXInnovations/netra-content. To change them here too, add `"languages"` or `"categories"`
to `settings.json` in the same format as `scripts/catalog.js`, then commit. To switch Netra eBooks off,
set `"ebooksEnabled": false` in netra-content's `settings.json`.

## Run it on a computer

    node scripts/build.js

Needs Node 18 or newer. If a list cannot be fetched, yesterday's file is kept.
