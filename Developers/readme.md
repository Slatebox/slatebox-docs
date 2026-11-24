# Build with Slatebox

## Agent prompt

```text
Help me implement “Build with Slatebox” with SlateboxJS in my project. Use the documented library interfaces and provide a runnable example that verifies the result.

Read https://docs.slatebox.com/Developers/readme.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/readme.md.
```

Pick the interface that owns the data you want to change.

| Goal | Start here |
| --- | --- |
| Draw a board in your own web page and control its storage | [SlateboxJS quick slate](JavascriptLibrary/readme.md) |
| Read a hosted slate or preview a repeatable edit | [HTTP API](SlateboxAPI/readme.md) |
| Connect Claude, ChatGPT or another assistant to your slates | [Connect an assistant: Agents and MCP](SlateboxAPI/mcp.md) |
| Let an agent read and edit your slates with one tool | [Exec: how agents work with Slatebox](SlateboxAPI/exec.md) |
| Run exec from a terminal or an MCP client | [Install the CLI and MCP server](SlateboxAPI/terminal-and-agents.md) |
| Show a published board on another site | [Presentation embed](SlateboxAPI/readme.md#embed-a-published-board) |
| Work on the app, engine or relay | [Development](development.md) |
| Run your own Slatebox | [One Docker command](../Installation/install-with-docker.md) |

The Slatebox app, the SlateboxJS engine and the collaboration relay are MIT licensed, except the app's `enterprise/` folder (see [Licenses](#licenses)). One Docker image runs all three with a database. [What the image contains](../Installation/install-with-docker.md#what-is-inside-and-its-licenses) · [App source](https://github.com/Slatebox/slatebox) · [Relay source](https://github.com/Slatebox/y-websocket)

## Licenses

| Part | License |
| --- | --- |
| The Slatebox app, except `enterprise/` | MIT |
| The app's `enterprise/` folder: outside-agent connections | Slatebox Enterprise License: source-available. You can read, change and test it; running it in production needs an agreement with Slatebox LLC, and Slatebox Cloud's terms cover people using it there |
| SlateboxJS engine | MIT |
| Collaboration relay | MIT |

Slatebox Cloud runs `enterprise/`. A self-hosted Slatebox carries it switched off: it runs only once an on-prem license key from Slatebox LLC switches it on for that install, checked offline at start. Everything else a self-hosted Slatebox runs from Slatebox, single sign-on included, is MIT licensed. MIT code in the app never imports `enterprise/`; the app loads it at start where it is switched on. The app's `LICENSE.md` and `enterprise/LICENSE` hold the full texts.
