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
| Let an agent read and edit your slates with one tool | [Exec: how agents work with Slatebox](SlateboxAPI/exec.md) |
| Run exec from a terminal or an MCP client | [Install the CLI and MCP server](SlateboxAPI/terminal-and-agents.md) |
| Show a published board on another site | [Presentation embed](SlateboxAPI/readme.md#embed-a-published-board) |
| Work on the app, engine or relay | [Development](development.md) |
| Run your own Slatebox | [Coming soon](../Installation/self-hosting.md) |

The Slatebox app, the SlateboxJS engine and the collaboration relay are MIT licensed. One Docker image runs all three with a database. [Relay source](https://github.com/Slatebox/y-websocket)
