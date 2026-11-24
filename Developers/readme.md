# Build with Slatebox

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
| Run your own Slatebox | <!-- feature:self-host -->[One Docker command](../Installation/install-with-docker.md)<!-- /feature:self-host --><!-- feature:!self-host -->[Coming soon](../Installation/self-hosting.md)<!-- /feature:!self-host --> |

The Slatebox app, the SlateboxJS engine and the collaboration relay are MIT licensed, except the app's `enterprise/` folder (see [Licenses](#licenses)). One Docker image runs all three with a database. <!-- feature:self-host -->[What the image contains](../Installation/install-with-docker.md#what-is-inside-and-its-licenses) · <!-- /feature:self-host -->[App source](https://github.com/Slatebox/slatebox) · [Relay source](https://github.com/Slatebox/y-websocket)

## Licenses

| Part | License |
| --- | --- |
| The Slatebox app, except `enterprise/` | MIT |
| The app's `enterprise/` folder: outside-agent connections, which run only on Slatebox Cloud | Slatebox Enterprise License: source-available. You can read, change and test it; running it in production needs an agreement with Slatebox LLC, and Slatebox Cloud's terms cover people using it there |
| SlateboxJS engine | MIT |
| Collaboration relay | MIT |

A self-hosted Slatebox is built without `enterprise/`, so everything it runs from Slatebox is MIT licensed. MIT code in the app never imports `enterprise/`; Slatebox Cloud loads it at start. The app's `LICENSE.md` and `enterprise/LICENSE` hold the full texts.
