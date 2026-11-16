# WEBAPP-CLIPBOARD

A fast, responsive, browser-only clipboard workspace.

## Project Rules

This project is intentionally completely static.

- No database
- No backend
- No API
- No localStorage
- No sessionStorage
- No cookies
- No login or signup
- No user accounts
- No environment variables
- No build process or package installation

Clipboard entries are stored **only in JavaScript memory while the page is open**. Refreshing or closing the page clears the snippets.

## Features

- Add clipboard snippets with optional titles
- Copy, edit, duplicate, and delete snippets
- Clear all snippets
- Search snippets
- Sort by newest, oldest, title, or longest content
- Character counter
- Dark and light themes
- Responsive desktop and mobile layouts
- Touch-friendly controls
- Keyboard shortcut: `Ctrl + Enter` / `Command + Enter`
- Browser Clipboard API with a compatible fallback
- No persistent storage

## GitHub Pages Hosting

This repository is configured as a plain static website. GitHub Pages deployment is automated with GitHub Actions.

**Published URL:** https://shreebalaji767.github.io/WEBAPP-CLIPBOARD/

Deployment details:

- Source branch: `main`
- Site directory: repository root (`./`)
- Build command: none
- Dependencies: none
- Environment variables: none
- Deployment workflow: `.github/workflows/pages.yml`

Every push to `main` automatically publishes the static files. You can also run the workflow manually from the **Actions** tab using **Deploy static site to GitHub Pages**.

If this repository has not previously used GitHub Pages with Actions, open **Settings → Pages** once and set **Build and deployment → Source** to **GitHub Actions**. No other hosting setup is required.

## Project Structure

```text
WEBAPP-CLIPBOARD/
├── .github/
│   └── workflows/
│       └── pages.yml
├── .nojekyll
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    └── app.js
```

## Run Locally

Open `index.html` directly in a modern browser, or run a local static server:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000.

## Privacy and Storage Model

The application keeps snippets in a normal JavaScript array in memory:

```javascript
const state = {
  snippets: []
};
```

This means:

1. Open the website.
2. Add snippets.
3. Use the snippets while the page remains open.
4. Refresh or close the page and the snippets are cleared.

Nothing is sent to a server or saved in browser storage by this application.

## Clipboard Permissions

The app uses `navigator.clipboard.writeText()` when supported. GitHub Pages serves the site over HTTPS, which supports the modern Clipboard API in compatible browsers. A fallback copy method is also included.

## Browser Compatibility

Designed for modern desktop and mobile browsers, including Chrome, Edge, Firefox, Safari, Android Chrome, and iOS Safari.

## License

You may use, modify, deploy, and customize this project as needed.
