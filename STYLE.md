# Slatebox docs style guide

Every page answers three questions fast: what is this, how do I do it, what do I get.

## Writing

- Lead with the task. The first sentence says what the page or section lets you do.
- Short, plain sentences. One idea per paragraph. Two to four sentences per paragraph at most.
- Cut preambles ("In this guide…", "Slatebox lets you…", "Note that…"), repetition and asides.
- Prefer lists and tables to prose. Steps are numbered lists. Options are tables.
- Say what the reader gets after each step: the response, the screen, the file.
- Keep every fact that is true and needed. Do not invent features. Check the app, the exec package
  (`slatebox-mcp`) and the engine (`slateboxjs`) before you write a method, flag or field.
- Second person, present tense, active voice. "Run", not "You may want to run".
- Bold for UI labels (**Share**). Code font for code, paths, env vars, field names.
- One link per idea, at the end of the sentence or paragraph that needs it. No link walls.

## Greenfield

There is one Slatebox: the current one. Never write about earlier versions.

- Delete: older versions, 1.x/2.x, migrations, deprecated or retired endpoints, "previously",
  "no longer", "used to", "older examples", "compatibility interface", legacy keys, "if you are on an
  older release", former subscribers, release kits, historical images.
- Rephrase troubleshooting without time words: "`slatebox sso admin-password` shows the first
  generated password" (not "no longer works").
- Hardware limits are not version caveats ("a Raspberry Pi 4 cannot run it" is fine).
- Invisible redirect anchors in `scripts/legacy-routes.json` stay (they keep old links working). If you
  delete a page, delete its entry there too.
- A deleted page keeps its address: add it to `scripts/redirects.json` (old path → the page that now
  answers). The build writes a small page there with a canonical link and a meta refresh.

## Facts that must stay consistent

| Topic | Write |
| --- | --- |
| Self-host image | `ghcr.io/slatebox/slatebox`: one container with the app, the relay and MongoDB. All images are `ghcr.io/slatebox/*`. Never Docker Hub, never `timheckel/*`. |
| Single sign-on | Keycloak is built into the image, off until `SLATEBOX_SSO=keycloak`. |
| Price | Slatebox is free: MIT-licensed and open source, free for individuals and companies alike. No tiers, and no feature is sold separately. One optional purchase for one person on Cloud: Slatebox Pro, $5 a month or $50 a year, plus tax where applicable, with "Pro credits" worth about $3.75 a month of provider cost (about 180 drafts a month, up to 30 a day, about 5½ hours of four-person calls and about 1 hour of four-person video, each its own allowance; the figures are the app's, in `scripts/pro-figures.json`) for the AI and calls Slatebox pays for. Only AI and video/voice calls are metered; your own keys are always free, and top-ups work with or without Pro. Say "Slatebox Pro" or "Pro credits", never "the Pro plan", "upgrade" or "unlock". A self-hosted Slatebox is free, with no meters and no Slatebox Pro. For a team on Cloud: Slatebox Business, $6 a person a month or $60 a person a year, plus tax where applicable, with the team's shared pool of AI and calls; sold by talking to us ("Talk to us about Business", `mailto:tim@slatebox.com?subject=Slatebox%20Business`, the site's link while its contact form is off) until its billing is built. Single sign-on and the audit log are not on Cloud yet: say they will be free for every team when they come, never that they are free today. Never "dedicated server", sizes, or "Slatebox Private". |
| Agents | One `exec` tool (plus `describe`) on every surface: API (`POST /api/v1/exec`), CLI (`slatebox exec`), MCP. |
| API base | `/api/v1` on your Slatebox origin; `https://app.slatebox.com` for Slatebox Cloud. OpenAPI at `/api/v1/openapi.json`. |
| Company | Slatebox LLC. MIT licensed app, engine and relay. |
| Vendors | Name a third party only when the instruction needs it (Docker; a provider you paste a key for; an identity provider you configure). No vendor comparisons, quotes or logos. |

## Code examples and the language picker

The site is built by `scripts/build.mjs` (marked), not Retype. `retype.yml` is unused by the build.

Every fenced block gets a label bar. Put a label after the language in the info string:

````md
```js Node.js
```
````

Without a label the bar shows a default (`sh` → Shell, `js` → JavaScript, `json` → JSON …).

### Picker groups

Wrap alternatives in HTML comments. The comments are invisible on GitHub and in the agent
Markdown mirror; on the site they become tabs.

````md
<!-- tabs -->

```js Node.js
…
```

```python Python
…
```

```sh curl
…
```

<!-- /tabs -->
````

- The reader's pick is remembered in this browser and applied to every picker on every page, and
  across open tabs. With no pick yet, the first tab shows. Node.js is first, so Node.js is the default.
- Tab order (enforced by `scripts/check-style.mjs`): Node.js › JavaScript › TypeScript › React ›
  React + TypeScript › Python › curl › CLI › Docker › Docker Compose. Use only the ones that apply.
- Every tab must do the same thing and give the same result. Same names, same values.
- Without JavaScript all tabs show, each with its label.

### Which tabs each kind of example gets

| Example | Tabs |
| --- | --- |
| HTTP API call | **Node.js** (built-in `fetch`, Node 22+, no install) · **Python** (`requests`) · **curl** |
| HTTP call that also has a CLI form | Node.js · Python · curl · **CLI** (`npx --no-install slatebox exec …`) |
| Exec script (the code an agent runs) | **JavaScript** · **TypeScript** (the exec tool runs JS or TS only, so no Python) |
| Running an exec script | **Node.js** (`createClient` from `slatebox-mcp/client`, or `fetch` to `POST /api/v1/exec`) · Python · curl · CLI |
| Browser library (SlateboxJS) code | **JavaScript** · **TypeScript** (types ship in `dist/*.d.ts`). React samples: React · React + TypeScript |
| Pure model code that runs in Node (`slateboxjs/workshops/model`, `node:fs`) | **Node.js** · TypeScript |
| Serve a downloaded HTML file locally | **Node.js** (`npx --yes http-server -p 8000 -a 127.0.0.1`) · Python (`python3 -m http.server 8000 --bind 127.0.0.1`) |
| Self-host commands | **Docker** (`docker run …`) · Docker Compose (an exact translation of the same flags) when it helps; otherwise a single labelled Shell block |
| HTML markup, JSON bodies and responses, log output | Single labelled block (HTML, JSON, Output). One honest form, no picker. |

Never add a language that is not real for the task (no Python exec scripts, no Python browser code).
If a single form is the only honest option, use one labelled block and do not explain why in prose.

### Code conventions

- Node.js examples are ES modules with top-level `await`; read `SLATEBOX_API_TOKEN` and
  `SLATEBOX_BASE_URL` from `process.env`; use `crypto.randomUUID()` for idempotency keys.
- Python examples read `os.environ`, use `uuid.uuid4()` and `requests`.
- curl examples use `--fail-with-body --silent --show-error` and `$(uuidgen)`.
- Placeholders are lowercase prose (`your-share-id`), never ALL-CAPS tokens.
- Show the response shape (status and key fields) once, after the picker, in a sentence or a JSON block.

## Page shape

1. `# Title` that names the task ("Run your own Slatebox").
2. One or two sentences: what it is and what you get.
3. The shortest working path (often one command or one picker).
4. `##` sections for options, details and troubleshooting, each leading with the task.
5. Troubleshooting as a table: symptom | fix.

## Gate

`npm run build && npm test` must pass. `node scripts/check-style.mjs --strict` lists remaining
examples outside a picker and old-version wording; it must be clean before publishing.
