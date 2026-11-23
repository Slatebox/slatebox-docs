---
description: Add https://app.slatebox.com/mcp to Claude, ChatGPT or any MCP client, sign in to Slatebox, and your assistant can draw and edit your slates.
agentPrompt: >-
  Help me connect my assistant to Slatebox through MCP. Use the hosted address https://app.slatebox.com/mcp (or /mcp on my own Slatebox)
  unless I ask to run the server on my machine. Tell me the exact steps for my client, and what the Slatebox consent page will ask.
  Once connected, list the tools and make one small mind map with import_mermaid to prove it works, then give me the slate link.
  Never ask me to paste a token into chat.
---

# Connect an assistant: Agents and MCP

Add `https://app.slatebox.com/mcp` to your assistant as a remote MCP server. It sends you to Slatebox to sign in and choose what it may do, and then it can draw mind maps, flowcharts and project plans on your slates. On your own Slatebox, the address is `/mcp` on its origin.

## What your assistant gets

`exec` and `describe` are always listed. `exec` runs a short script against the typed Slatebox client, so one call can read a slate, decide and save; `describe` returns the client's methods and types. [How exec works](exec.md)

Beside them, the server lists one typed tool per client method, generated from the same contract as the client. Each typed tool is an exec script of one call, so it meets the same checks, holds and audit record as a script.

| Tool | Reads or writes | Does |
| --- | --- | --- |
| `create_slate` | Writes | Create a private flowchart from steps written as `A -> B`, or a decision map from a one-line question, and return its link |
| `import_mermaid` | Writes | Draw a mind map, flowchart or project plan (Gantt chart) written in Mermaid as editable notes and lines |
| `get_slate` | Reads | Read a slate's notes, lines, boards, comments and revision |
| `edit_slate` | Writes | Add, change, connect, lay out or remove notes and lines, and edit boards; `mode: "preview"` saves nothing |
| `export_mermaid` | Reads | Read a slate as Mermaid text |
| `list_components` | Reads | List the boards and starters you can add to a slate, such as pipeline and budget boards |
| `get_component` | Reads | Read one board or starter in full |
| `check_board_move` | Reads | Check whether a card may move to a lane, and why not, without moving it |
| `create_slate_invite` | Writes | Turn on a slate's unlisted invitation link, or change its role |
| `revoke_slate_invite` | Writes | Withdraw the invitation link and make the slate private again |
| `show_plan` | Writes | Show the people on a slate a short checklist of what the assistant is about to do |
| `tick_plan_step` | Writes | Mark a step of that checklist as doing, done or skipped |
| `get_account` | Reads | Read your account: name, team and what you can use |
| `describe_instance` | Reads | Describe the Slatebox server: name, version and what it can do |
| `get_ai_settings` | Reads | Read your AI connections and which one each feature uses; keys are never returned |
| `update_ai_settings` | Writes | Add, change or remove AI connections, and choose one per feature |
| `check_ai_connection` | Writes | Test an AI connection before Slatebox drafts with it |

Every tool has a title and says whether it reads, deletes, repeats safely and reaches outside Slatebox, so your client can ask you before a change.

**Prompts.** `mind_map`, `flowchart`, `project_plan` and `presentation` start the matching drawing from a topic.

**Resources.** `slatebox://client/slatebox.d.ts` (the client's types), `slatebox://client/guide.md` (its rules, errors, limits and examples), and any slate you can open as `slatebox://slates/{shareId}` (JSON) or `slatebox://slates/{shareId}/mermaid`.

**Only exec.** To list only `exec` and `describe`, set `SLATEBOX_MCP_TYPED_TOOLS=off` on a self-hosted Slatebox, or start the local server with `--typed-tools off`. `exec` and `describe` stay either way.

## Connect Claude

1. In Claude, open **Settings → Connectors** and choose **Add custom connector**.
2. Name it Slatebox and enter `https://app.slatebox.com/mcp`. Choose **Add**, then **Connect**.
3. Slatebox opens in your browser. Sign in, check the permissions and choose **Allow**. [What happens when you connect](#what-happens-when-you-connect)

You get the Slatebox tools in your conversations. Ask "Make a mind map of our Q1 launch ideas" and Claude replies with the slate link.

In Claude Code, add the server, then sign in from the `/mcp` menu:

<!-- tabs -->

```sh Shell
claude mcp add --transport http slatebox https://app.slatebox.com/mcp
```

<!-- /tabs -->

## Connect ChatGPT

1. In ChatGPT's settings, turn on developer mode for apps and connectors.
2. Create an app named Slatebox with the MCP server URL `https://app.slatebox.com/mcp` and OAuth authentication.
3. Slatebox opens in your browser. Sign in, check the permissions and choose **Allow**.

## Connect another client

Any client that supports remote MCP servers with OAuth connects the same way: give it `https://app.slatebox.com/mcp`. The first request answers 401 with the address of `/.well-known/oauth-protected-resource/mcp`; the client registers itself, opens the consent page, and exchanges the code with PKCE (S256).

| Client setting | Value |
| --- | --- |
| Server URL | `https://app.slatebox.com/mcp`, or `/mcp` on your own Slatebox |
| Transport | Streamable HTTP |
| Authentication | OAuth 2.1 with dynamic client registration |
| Redirect addresses | HTTPS, `http://localhost` or `http://127.0.0.1`, or the app's own scheme |

## Connect with a personal token

A client without sign-in sends a personal token instead. Create one in **Profile → Developer access** and keep it in your secret store.

<!-- tabs -->

```json JSON
{
  "mcpServers": {
    "slatebox": {
      "type": "http",
      "url": "https://app.slatebox.com/mcp",
      "headers": { "Authorization": "Bearer ${SLATEBOX_API_TOKEN}" }
    }
  }
}
```

<!-- /tabs -->

## What happens when you connect

1. The consent page asks you to sign in to Slatebox, with your password or an emailed link. A guest account cannot connect apps.
2. It names the app, says that Slatebox has not checked this app, and shows where you go back to afterwards.
3. It lists each permission the app asked for. Untick any you do not want; you cannot add ones it did not ask for.
4. Choose **Allow** to go back to the app signed in, or **Deny** to refuse.

| Permission | Scope |
| --- | --- |
| **Read slates** | `slates:read` |
| **Create and edit slates** | `slates:write` |
| **Manage invitation links on slates I own** | `slates:share` |
| **Read, change and test my own AI connections** | `ai:settings` |
| **Change and test my team's or this server's AI (team admins and administrators only)** | `ai:admin` |

An app that asks for nothing in particular gets **Read slates** and **Create and edit slates**. Each access token lasts 1 hour and the app renews it itself; a connection unused for 30 days lapses, and the app asks you again. These sign-in tokens work on `/mcp` only and never open `/api/v1`.

The app acts as you: it reaches only the slates you can open, and deletes, large rewrites and wider sharing wait for your confirmation as they do for any script. [Saves that wait for confirmation](exec.md#saves-that-wait-for-confirmation)

## Disconnect an app

Open **Profile → Developer access**. **Connected apps** lists each app with its permissions, when it connected and when it was last used. Choose **Disconnect**: the app's next request is refused, and it must ask you again.

An account can have 25 connected apps; they do not count against your personal tokens.

## Run it on your machine

Install `slatebox-mcp` when you want the server, or the `slatebox` command, on your own computer. It lists the same tools, prompts and resources, but scripts run in your own process with your rights and no sandbox. Download `slatebox-mcp-0.3.1.tgz` and its checksum, then point your client at the executable. [Install the package and CLI](terminal-and-agents.md#install-the-package)
