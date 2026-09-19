# WEBAPP-CLIPBOARD

A fast, responsive, browser-only clipboard workspace.

## Project Rules

This project is intentionally completely static.

* No database
* No backend
* No API
* No localStorage
* No sessionStorage
* No cookies
* No login
* No signup
* No user accounts
* No environment variables
* No build process

Clipboard entries are stored **only in JavaScript memory while the page is open**.

If the user refreshes or closes the page, the snippets are removed.

## Features

* Add clipboard snippets
* Optional snippet titles
* Copy snippets with one click
* Edit snippets
* Duplicate snippets
* Delete individual snippets
* Clear all snippets
* Search snippets
* Sort by newest
* Sort by oldest
* Sort by title
* Sort by longest content
* Character counter
* Dark mode
* Light mode
* Responsive desktop layout
* Responsive mobile layout
* Touch-friendly controls
* Keyboard shortcut: `Ctrl + Enter`
* Mac shortcut: `Command + Enter`
* Browser Clipboard API support
* Clipboard fallback for compatible browsers
* No persistent storage

## Project Structure

```text
WEBAPP-CLIPBOARD/
│
├── index.html
├── README.md
│
├── css/
│   └── style.css
│
└── js/
    └── app.js
```

## Run Locally

This is a plain static website and does not require Node.js, Python, PHP, or any other server-side framework.

You can open `index.html` directly in a browser.

For a local static server, Python can also be used:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Render Static Site

The project can be deployed as a Render Static Site.

Recommended configuration:

```text
Repository:
shreebalaji767/WEBAPP-CLIPBOARD

Branch:
main

Root Directory:
leave empty

Build Command:
leave empty

Publish Directory:
./
```

No environment variables are required.

## Privacy / Storage Model

The application does not save clipboard snippets permanently.

There is no:

```text
Database
Backend
API
localStorage
sessionStorage
Cookie
Login
Signup
Account
```

The application stores snippets in an ordinary JavaScript array in memory.

For example:

```javascript
const state = {
    snippets: []
};
```

This means:

1. User opens the website.
2. User adds snippets.
3. Snippets remain available while that page is open.
4. User can search, edit, duplicate, copy, or delete them.
5. Refreshing the page clears the workspace.
6. Closing the page clears the workspace.

## Clipboard Permissions

The application uses:

```javascript
navigator.clipboard.writeText()
```

when supported by the browser.

HTTPS is recommended for the modern Clipboard API.

A fallback copy method is also included for compatible browsers where the modern Clipboard API is unavailable.

## No Build System

There is no:

```text
npm install
npm run build
webpack
vite
react
node_modules
```

The browser loads:

```text
index.html
```

which loads:

```text
css/style.css
js/app.js
```

## Browser Compatibility

The application is designed for modern browsers including:

* Google Chrome
* Microsoft Edge
* Mozilla Firefox
* Safari
* Android Chrome
* iPhone/iPad Safari
* Android tablets
* Desktop browsers

## Keyboard Shortcut

Press:

```text
Ctrl + Enter
```

on Windows/Linux, or:

```text
Command + Enter
```

on macOS to add the current snippet.

## License

You may use, modify, deploy, and customize this project as needed.
