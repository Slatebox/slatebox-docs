# Build with Slatebox

## Agent prompt

```text
Help me implement “Build with Slatebox” with SlateboxJS in my project. Use the documented library interfaces and provide a runnable example that verifies the result.

Read https://docs.slatebox.com/Developers/readme.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/readme.md.
```

Choose the interface that owns the data you want to change.

| Goal | Starting point |
| --- | --- |
| Draw a board in your own web page and control its storage | [SlateboxJS quick slate](JavascriptLibrary/readme.md) |
| Read a hosted slate or preview a repeatable edit | [HTTP API](SlateboxAPI/readme.md) |
| Edit a private board from a shell or an MCP client | [Terminal and agent tools](SlateboxAPI/terminal-and-agents.md) |
| Show a published board on another site | [Presentation embed](SlateboxAPI/readme.md#embed-a-published-board) |
| Work on the app, engine or relay | [Development](development.md) |
| Run an installation for your organization | [Install with Docker](../Installation/install-with-docker.md) |

The app and SVG.js engine are MIT licensed. Request their source or a matched Docker release from Slatebox. The collaboration relay source is public. [Get a self-host release](../Installation/install-with-docker.md#get-the-release) · [Read the relay source](https://github.com/Slatebox/y-websocket)
