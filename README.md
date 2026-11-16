# WEBAPP-CLIPBOARD

A fast, responsive, private clipboard workspace that runs entirely in your browser and is hosted as a static GitHub Pages site.

## Features

- Create snippets with titles, categories, and tags
- Copy, edit, duplicate, favorite, and search snippets
- Sort by newest, oldest, title, or content length
- Filter by category and favorites
- Persistent browser-only storage using localStorage
- Recycle bin with restore and permanent deletion
- Import and export JSON backups
- Recently copied history with copy-again action
- Bulk select, favorite, and move snippets to the recycle bin
- Character counter and quick formatting insertions
- Four themes: light, dark, ocean, and forest
- Keyboard shortcuts: Ctrl/Command + Enter to add, Ctrl/Command + K to search, Ctrl/Command + Shift + E to export
- Responsive desktop, tablet, and mobile layouts with touch-friendly controls
- Clipboard API with a legacy fallback
- No login, server, database, API, build step, package installation, or paid service

## Privacy and storage

Snippets, the recycle bin, copy history, and theme preference are saved in this browser's local storage on this device/profile. They are not uploaded or synchronized. Clearing browser site data, using private browsing, or changing browsers/devices can remove or hide this data. Export JSON backups regularly if the snippets matter.

The application never sends snippet contents to a server. GitHub Pages serves only the static application files.

## Import and export

Use **Export backup** to download a JSON file containing active snippets, recycle-bin items, and copy history. Use **Import backup** to merge snippets from a compatible JSON backup into the current workspace. Existing snippets are retained; colliding active snippet IDs are reassigned. Keep a separate copy of important backups.

## GitHub Pages hosting

**Published URL:** https://shreebalaji767.github.io/WEBAPP-CLIPBOARD/

- Source branch: main
- Site directory: repository root (./)
- Build command: none
- Dependencies: none
- Deployment workflow: .github/workflows/pages.yml

Every push to main automatically publishes the static files. If required, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.

## Run locally

Open index.html in a modern browser or run `python -m http.server 8000`, then visit http://localhost:8000.

## Project structure

- index.html — application markup
- css/style.css — responsive styling
- js/app.js — application behavior and browser storage
- assets/logo.svg and favicon.svg — app identity

## Browser compatibility

Designed for current Chrome, Edge, Firefox, Safari, Android Chrome, and iOS Safari. Browser storage and clipboard permissions are controlled by the browser.
