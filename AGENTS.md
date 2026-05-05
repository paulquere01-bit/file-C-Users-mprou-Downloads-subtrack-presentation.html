# AGENTS.md

## Cursor Cloud specific instructions

This is a zero-dependency, fully client-side SaaS MVP (PostPilot AI) for generating LinkedIn posts. No backend, no database, no API keys required.

### Runtime requirements

- **Node.js** (v22+, via nvm at `/home/ubuntu/.nvm`): used for tests and linting only.
- **Python 3**: used as the static dev server (`python3 -m http.server 5173`).

### Key commands (all from repo root)

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (serves on `http://localhost:5173`) |
| Lint | `npm run lint` |
| Tests | `npm test` |

### Gotchas

- Node.js is installed under `/home/ubuntu/.nvm`. You must source nvm before running any `npm`/`node` commands:
  ```bash
  export NVM_DIR="/home/ubuntu/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  ```
- The dev server is Python's built-in HTTP server — it does not hot-reload. After changing HTML/JS/CSS, simply refresh the browser.
- There are no npm dependencies to install (`package.json` has no `dependencies` or `devDependencies`).
- Tests use Node.js built-in test runner (`node --test`), no test framework installation needed.
