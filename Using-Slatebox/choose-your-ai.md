---
title: Choose your AI
description: Connect any cloud provider with your key, or any OpenAI-compatible endpoint on your computer, your network or a host. Mix them per feature. Your own AI costs nothing on Slatebox.
---

# Choose your AI

Slatebox uses the AI you choose: a cloud provider with your key, or any model behind an OpenAI-compatible endpoint, on your computer, your network or a host. Mix them freely, one model for conversation and another for images. Your own AI costs nothing on Slatebox.

## Connect a model

1. Open **Profile → AI** and choose **Connect a model**.
2. Enter a **Name** (lowercase letters, digits and dashes, such as `desk-model`) and choose a **Type**.
3. Fill in the fields for that type.
4. Choose **Test connection**. You see whether Slatebox reached the address, the key was accepted, the model answered and it called a test tool. Where an endpoint lists its models, choose one to fill in **Model**.
5. Choose **Save**. The connection appears under **Yours**, ready to choose for a feature.

| Type | Address | Model | Key |
| --- | --- | --- | --- |
| OpenAI-compatible endpoint | The address up to `/v1`, such as `https://llm.example.com/v1` | The model name the endpoint serves | Only if the endpoint needs one |
| OpenAI | Filled in | Required | Required |
| Anthropic | Filled in | Required | Required |
| DeepInfra | Filled in | Optional: empty follows each feature's default model | Required |

Under the key, say what the model can do, where you know it: **Calls tools** and **Reads images** (**Yes**, **No** or **Not sure (try it)**), and **Makes images**. A capability you leave unknown is tried. Image generation needs **Makes images** ticked.

Keys are encrypted with the server's key and never shown again; a saved connection says "key saved". To change a key, choose **Change** and enter the new one. Changing the address of a connection with a key needs the key again. **Remove** deletes the connection and its key at once.

## Choose a model for each feature

Each feature has a menu under your connections. Set **Default for every feature**, then change only the features that need another model.

| Menu | Covers | The model must |
| --- | --- | --- |
| **Default for every feature** | Every feature left **Not set** | Do what each of those features needs |
| **Conversation and edits** | The conversation beside the canvas and the edits it proposes | Call tools |
| **Drafts and layouts** | New drafts and layouts of a slate | Call tools |
| **Presentation planning** | Planning the order and scenes of a presentation | Call tools |
| **Reading images and diagrams** | Images you paste or attach in the conversation | Read images |
| **Generating images** | Images AI makes for a slate | Make images |

Each menu lists your connections (**Mine:**), your team's (**Team:**), this server's (**Server:**) and **The AI this server provides**. **Which AI each feature uses**, at the top of the tab, shows what answers each feature now and marks your own.

Image search always uses the AI this server provides.

## When a model can't do something

The feature stops, names the model and asks you to choose another. Slatebox never sends the request to another model instead. For example, with a default that cannot make images:

```text Output
your-model-name at 192.168.1.30:8000 cannot make images. Choose another model for generating images in your AI settings.
```

Choose a model that makes images, or **The AI this server provides**, for **Generating images**. The same applies to a model that cannot call tools or read images.

## Who decides

Slatebox looks for a choice in this order and uses the first it finds, for each feature:

1. Yours: your choice for that feature, then your default.
2. Your team's, set by a team admin under **Your team's** in **Profile → AI**.
3. This server's, set by an administrator under **This server's (administrators)**, or by the operator in the server settings.
4. **The AI this server provides**.

Your choice always wins. The one exception is a server whose operator turns off people's own AI (`SLATEBOX_AI_OWN_PROVIDERS=off`, or the **People may use their own AI** switch): everyone then uses the server's AI, and the AI tab says so. You can still remove what you saved.

## What is metered

| AI | On Slatebox Cloud | On your own server |
| --- | --- | --- |
| Your connections and your team's | Free, with no limit from Slatebox. Your provider bills you directly, or nobody does for your own model. | No meters |
| **The AI this server provides** | Your free amount, then your balance | No meters |
| Image search | Your free amount, then your balance | No meters |

[Pricing and free amounts](pricing.md) · [A self-hosted Slatebox has no meters](../Installation/self-host-meters.md)

## Where a model may be

| | Slatebox Cloud | Your own server |
| --- | --- | --- |
| Your endpoints and your team's | A public `https` address | Public addresses, your network and `host.docker.internal`, over `http` or `https`. Not the server itself (`localhost`) or a link-local address. `SLATEBOX_AI_PRIVATE_ENDPOINTS=off` allows public addresses only. |
| The operator's endpoints | — | Any address |

Requests never go to a cloud metadata address, and Slatebox follows no redirects. Each address is checked when it is saved and again on every request.

### Reach a model on the same machine

Inside the Slatebox container, `localhost` is the container itself. A model server on the Docker host is at `host.docker.internal`, for example `http://host.docker.internal:8000/v1`.

- **Mac:** run the model server on the Mac itself, not in Docker: Docker on a Mac cannot use the Mac's GPU. Docker Desktop provides `host.docker.internal`.
- **Windows:** Docker Desktop provides `host.docker.internal`.
- **Linux:** start Slatebox with `--add-host=host.docker.internal:host-gateway`, and have the model server listen on the Docker bridge or on all interfaces, not only `127.0.0.1`.

## Set the server's AI

An operator sets the AI everyone on a self-hosted server gets by default. One endpoint for every feature:

<!-- tabs -->

```sh Docker
docker run -d --name slatebox -p 7070:7070 -v slatebox-data:/data \
  --add-host=host.docker.internal:host-gateway \
  -e SLATEBOX_AI_URL=http://host.docker.internal:8000/v1 \
  -e SLATEBOX_AI_MODEL=your-model-name \
  ghcr.io/slatebox/slatebox
```

```yaml Docker Compose
services:
  slatebox:
    image: ghcr.io/slatebox/slatebox
    container_name: slatebox
    ports: ["7070:7070"]
    extra_hosts: ["host.docker.internal:host-gateway"]
    environment:
      SLATEBOX_AI_URL: http://host.docker.internal:8000/v1
      SLATEBOX_AI_MODEL: your-model-name
    volumes: [slatebox-data:/data]
volumes:
  slatebox-data:
    name: slatebox-data
```

<!-- /tabs -->

`SLATEBOX_AI_KEY` is the endpoint's bearer token, if it needs one.

For a mix, set `SLATEBOX_AI_CONFIG` to JSON instead. This one uses a model on the host for everything, and a cloud provider for reading and making images:

<!-- tabs -->

```sh Docker
docker run -d --name slatebox -p 7070:7070 -v slatebox-data:/data \
  --add-host=host.docker.internal:host-gateway \
  -e SLATEBOX_AI_CONFIG='{
    "connections": {
      "desk": { "type": "openai-compatible", "url": "http://host.docker.internal:8000/v1", "model": "your-model-name" },
      "cloud": { "type": "openai", "key": "your-provider-key", "model": "your-image-model-name", "vision": true, "images": true }
    },
    "use": { "default": "desk", "vision": "cloud", "images": "cloud" }
  }' \
  ghcr.io/slatebox/slatebox
```

```yaml Docker Compose
services:
  slatebox:
    image: ghcr.io/slatebox/slatebox
    container_name: slatebox
    ports: ["7070:7070"]
    extra_hosts: ["host.docker.internal:host-gateway"]
    environment:
      SLATEBOX_AI_CONFIG: |
        {
          "connections": {
            "desk": { "type": "openai-compatible", "url": "http://host.docker.internal:8000/v1", "model": "your-model-name" },
            "cloud": { "type": "openai", "key": "your-provider-key", "model": "your-image-model-name", "vision": true, "images": true }
          },
          "use": { "default": "desk", "vision": "cloud", "images": "cloud" }
        }
    volumes: [slatebox-data:/data]
volumes:
  slatebox-data:
    name: slatebox-data
```

<!-- /tabs -->

| Field | Value |
| --- | --- |
| `connections` | Named connections. `type` is `openai-compatible` (with `url`), `openai`, `anthropic` or `deepinfra`. `model` is the model name; `key` is needed for the three providers. |
| `tools`, `vision`, `images` | `true` or `false`: what the model can do, where you know it. Unset is tried; making images needs `"images": true`. |
| `maxTokens` | The longest answer, 256 to 200000. Default 16384. |
| `use` | Which connection serves `default`, `chat`, `generation`, `presentation`, `vision` and `images`. A value is a connection name, or `builtin` for the built-in AI (`SLATEBOX_AI_KEY` without `SLATEBOX_AI_URL`). |
| `ownProviders` | `off` keeps everyone on the AI set here. Same as `SLATEBOX_AI_OWN_PROVIDERS`. |
| `privateEndpoints` | `off` keeps people's and teams' endpoints on public addresses. Same as `SLATEBOX_AI_PRIVATE_ENDPOINTS`. |

A mistake in any of it stops the container with the reason. Keys go to the app's settings only, never to the log. To test every server connection:

<!-- tabs -->

```sh Docker
docker exec slatebox slatebox ai check
```

```sh Docker Compose
docker compose exec slatebox slatebox ai check
```

<!-- /tabs -->

Each connection gets one line: reached, key accepted, model listed, answered and called tools. `docker exec slatebox slatebox ai` lists the connections and choices without keys. Administrators can also add server connections in **Profile → AI**.

## Set it up with an agent

An agent reads, changes and tests AI settings with a token that has the `ai:settings` permission. Changing or testing a team's or the server's AI also needs `ai:admin`, and the token's owner must be a team admin or an administrator. Create the token in **Profile → Developer access**.

| To | Exec | HTTP |
| --- | --- | --- |
| Read the connections and what serves each feature, without keys | `slatebox.ai.get` | `GET /api/v1/ai` |
| Add, change or remove connections, and choose them | `slatebox.ai.update` | `PUT /api/v1/ai` |
| Test a saved or unsaved connection | `slatebox.ai.check` | `POST /api/v1/ai/check` |

A choice names a connection as `me:<name>`, `team:<name>` or `server:<name>`, or is `builtin` for the AI this server provides. `level` is `me`, `team` or `server`.

This exec script connects a keyless model on the host, makes it your default and tests it:

<!-- tabs -->

```js JavaScript
await slatebox.ai.update({
  level: "me",
  connections: [{ name: "desk-model", type: "openai-compatible", baseUrl: "http://host.docker.internal:8000/v1", model: "your-model-name" }],
  use: { default: "me:desk-model" },
})
const check = await slatebox.ai.check({ level: "me", name: "desk-model" })
return { ok: check.ok, tools: check.tools, message: check.message }
```

```ts TypeScript
await slatebox.ai.update({
  level: "me",
  connections: [{ name: "desk-model", type: "openai-compatible", baseUrl: "http://host.docker.internal:8000/v1", model: "your-model-name" }],
  use: { default: "me:desk-model" },
})
const check = await slatebox.ai.check({ level: "me", name: "desk-model" })
const result: { ok: boolean; tools: string; message: string } = { ok: check.ok, tools: check.tools, message: check.message }
return result
```

<!-- /tabs -->

Exec holds `ai.update` for your confirmation, because it changes where your slates are sent. [How exec works](../Developers/SlateboxAPI/exec.md)

Exec keeps a run's code, so send a key through `PUT /api/v1/ai` instead of writing it into a script. This adds a cloud provider and uses it for reading images:

<!-- tabs -->

```js Node.js
const res = await fetch(`${process.env.SLATEBOX_BASE_URL}/api/v1/ai`, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${process.env.SLATEBOX_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    level: 'me',
    connections: [{ name: 'cloud', type: 'openai', model: 'your-model-name', apiKey: process.env.AI_PROVIDER_KEY, capabilities: { vision: true } }],
    use: { vision: 'me:cloud' },
  }),
})
console.log(res.status, (await res.json()).effective)
```

```python Python
import os, requests

res = requests.put(
    f"{os.environ['SLATEBOX_BASE_URL']}/api/v1/ai",
    headers={"Authorization": f"Bearer {os.environ['SLATEBOX_API_TOKEN']}"},
    json={
        "level": "me",
        "connections": [{"name": "cloud", "type": "openai", "model": "your-model-name", "apiKey": os.environ["AI_PROVIDER_KEY"], "capabilities": {"vision": True}}],
        "use": {"vision": "me:cloud"},
    },
)
print(res.status_code, res.json()["effective"])
```

```sh curl
curl --fail-with-body --silent --show-error -X PUT \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" \
  -H 'Content-Type: application/json' \
  --data "{\"level\":\"me\",\"connections\":[{\"name\":\"cloud\",\"type\":\"openai\",\"model\":\"your-model-name\",\"apiKey\":\"$AI_PROVIDER_KEY\",\"capabilities\":{\"vision\":true}}],\"use\":{\"vision\":\"me:cloud\"}}" \
  "$SLATEBOX_BASE_URL/api/v1/ai"
```

<!-- /tabs -->

You get `200` and the settings as `GET /api/v1/ai` returns them. `effective` names what serves each feature now. `POST /api/v1/ai/check` returns `ok`, `reachable`, `models` (where the endpoint lists them), `chat`, `tools` (`yes`, `no` or `unknown`) and a `message`. It saves nothing, sends a saved key only to the address it was saved for, and allows 20 tests per person every 10 minutes.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| "That address is this server itself" | Use `host.docker.internal` or the model machine's address on your network, not `localhost`. |
| "That address is not public" | Slatebox Cloud reaches public `https` addresses only. On your own server, the operator has set `SLATEBOX_AI_PRIVATE_ENDPOINTS=off`. |
| **Test connection** cannot reach a model on a Linux host | Add `--add-host=host.docker.internal:host-gateway` and have the model server listen beyond `127.0.0.1`. |
| "The endpoint did not accept the key" | Enter the key again with **Change**. |
| The model answers without calling the test tool | Conversation, drafts and presentation planning need a model that calls tools. Choose another for those features. |
| "…cannot make images" | Choose a model with **Makes images**, or **The AI this server provides**, for **Generating images**. |
| A key cannot be saved; "A connection without a key can still be saved" | The server has no `SLATEBOX_KEY_ENCRYPTION_KEY`. Keyless endpoints still work. [Options](../Installation/install-with-docker.md#options) |
| "This server uses the AI its operator set up" | The operator has turned off people's own AI. |
