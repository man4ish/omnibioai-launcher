# OmniBioAI Launcher

A standalone React UI that lets users open any OmniBioAI registry object
directly in their preferred analysis environment — JupyterLab, VS Code,
or RStudio — with object context automatically injected.

This repository is intentionally separate from
[omnibioai-sdk](https://github.com/man4ish/omnibioai_sdk), which is the
pure Python API client. The launcher is a browser-based entry point; the
SDK is for programmatic use in notebooks and scripts.

---

## Supported environments

| Environment | What happens |
|---|---|
| **Notebook** | Opens JupyterLab with `omnibioai_object_id` injected via URL parameter |
| **VS Code** | Copies `export` env var block to clipboard — paste in the VS Code terminal |
| **R / RStudio** | Downloads a ready-to-run `.R` starter script; signals the backend to open RStudio |

---

## How the launcher receives an object

The launcher reads the `object_id` from the URL query string:

```
http://127.0.0.1:5190/?object_id=56d3fc3a-709b-4ed0-bf17-8cb73c6746b0
```

If no `object_id` is present, the app shows a searchable registry list
where the user can browse and select an object. Clicking an object opens
a detail view (metadata, lineage, job log), and from there the user can
open it in an environment.

The OmniBioAI platform backend generates these URLs and redirects users
to them. You can also link directly from any HTML:

```html
<a href="http://127.0.0.1:5190/?object_id=<object_id>">Analyze</a>
```

---

## Development

```bash
cp .env.example .env    # fill in values for your local setup
npm install
npm start               # dev server on http://localhost:3000
```

The `proxy` field in `package.json` forwards API calls to
`http://127.0.0.1:8000` during development, so the OmniBioAI backend
must be running locally.

---

## Production build

```bash
npm run build
```

The `build/` output is a static site. Serve it with nginx (see
`nginx.conf`) or any static file server:

```bash
npx serve -s build -l 5190
```

---

## Docker

Build and run the launcher as a self-contained nginx container on port 5190:

```bash
docker build -t omnibioai-launcher .
docker run -p 5190:5190 omnibioai-launcher
```

The Dockerfile uses a two-stage build: Node 20 compiles the React app,
then nginx:alpine serves the static output.

To point the launcher at a non-default backend at build time:

```bash
docker build \
  --build-arg REACT_APP_OMNIBIOAI_BASE_URL=https://api.omnibioai.com \
  --build-arg REACT_APP_OMNIBIOAI_TOKEN=mytoken \
  -t omnibioai-launcher .
```

---

## Environment variables

All variables are prefixed `REACT_APP_` and baked into the JS bundle at
build time by Create React App. Copy `.env.example` to `.env` and edit
before running `npm start` or `npm run build`.

| Variable | Default | Purpose |
|---|---|---|
| `REACT_APP_OMNIBIOAI_BASE_URL` | `http://127.0.0.1:8000` | OmniBioAI backend API base URL |
| `REACT_APP_OMNIBIOAI_TOKEN` | `dev` | Bearer token sent with every API request |
| `REACT_APP_JUPYTER_BASE` | `http://127.0.0.1:8890` | JupyterLab host used to build the notebook launch URL |
| `REACT_APP_JUPYTER_TOKEN` | `devtoken` | JupyterLab auth token appended as `?token=` |
| `REACT_APP_USE_MOCK` | `false` | Set to `true` to use hardcoded mock objects instead of hitting the API |

---

## API calls made by the launcher

The launcher talks to the OmniBioAI backend directly from the browser:

| Method | Endpoint | When |
|---|---|---|
| `GET` | `/api/dev/objects/` | Object list (paginated, supports `search` and `type` filters) |
| `GET` | `/api/dev/objects/{id}/` | Single object detail |
| `GET` | `/api/dev/objects/?parent_id={id}` | Children / siblings for lineage view |
| `POST` | `/api/dev/launch/rstudio/` | Signal backend to open RStudio after R script download |

All requests carry `Authorization: Bearer <token>`.

---

## Mock mode

Set `REACT_APP_USE_MOCK=true` (or pass `?object_id=test` in the URL) to
run entirely on hardcoded data without a backend. Useful for UI
development and screenshots.

---

## Project structure

```
omnibioai-launcher/
├── src/
│   ├── App.jsx                 # All view logic: list, detail, launcher
│   ├── App.css                 # Dark-theme styles
│   ├── index.js                # React root mount
│   └── components/
│       ├── EnvCard.jsx         # Clickable environment tile
│       ├── ObjectCard.jsx      # Object metadata display
│       ├── InstallModal.jsx    # Fallback modal when desktop app not found
│       └── Toast.jsx           # Ephemeral status notification
├── public/
│   └── index.html
├── .env.example
├── package.json
├── nginx.conf
└── Dockerfile
```

---

## License

Apache License 2.0
