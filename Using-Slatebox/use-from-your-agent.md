---
title: Use Slatebox from your agent
description: Add https://app.slatebox.com/mcp to Claude, ChatGPT, Cursor or any MCP client, sign in, and ask for a mind map, a flowchart or a project plan. Your team edits the slate with you, live. Free.
agentPrompt: >-
  Help me use Slatebox from the agent I am talking to. Find out which client I use (Claude, Claude Code, ChatGPT, Cursor or another MCP client),
  give me the exact steps to add https://app.slatebox.com/mcp, and tell me what the Slatebox consent page will ask.
  Once connected, make one small mind map of a topic I choose and give me the slate link. Never ask me to paste a token into chat.
---

# Use Slatebox from your agent

Give your agent one address, `https://app.slatebox.com/mcp`, and sign in to Slatebox. Then ask it for a mind map, a flowchart, a project plan or a presentation: it draws on a slate and replies with the link, and your team edits the slate with you, live. Slatebox is free and open source, and so is its MCP server.

## Connect your agent

| Client | Steps |
| --- | --- |
| Claude | **Settings → Connectors → Add custom connector**. Name it Slatebox, enter `https://app.slatebox.com/mcp`, choose **Add**, then **Connect**. |
| Claude Code | Run `claude mcp add --transport http slatebox https://app.slatebox.com/mcp`, then sign in from the `/mcp` menu. |
| ChatGPT | In settings, turn on developer mode for apps and connectors. Create an app named Slatebox with the MCP server URL `https://app.slatebox.com/mcp` and OAuth authentication. |
| Cursor | Add a server named `slatebox` with the URL `https://app.slatebox.com/mcp` to your MCP settings (`mcp.json`), then sign in when Cursor asks. |
| Any other MCP client | Add `https://app.slatebox.com/mcp` as a remote server (Streamable HTTP, OAuth). A client without sign-in sends a personal token instead. |

Each client opens Slatebox in your browser. Sign in, check the permissions and choose **Allow**. A guest account cannot connect apps, so register first. [What happens when you connect](../Developers/SlateboxAPI/mcp.md#what-happens-when-you-connect)

<!-- tabs -->

```json JSON
{
  "mcpServers": {
    "slatebox": {
      "url": "https://app.slatebox.com/mcp"
    }
  }
}
```

<!-- /tabs -->

## Ask for a drawing

| Ask | You get |
| --- | --- |
| “Make a mind map of our Q1 launch ideas.” | A mind map on a new private slate, and its link. |
| “Draw a flowchart of our refund process: request, review, approve or decline.” | Connected notes, with the decision as a branch. |
| “Turn this Mermaid into a slate.” | Real notes and lines from a flowchart, mind map or Gantt chart. |
| “Plan a launch as a Gantt chart.” | A project plan you can move and present. |
| “Add a retro board to this slate.” | Lanes for Went well, Change and Try. |

Open the link and share it: your teammates edit the slate with you, live. When your agent changes a slate someone else is on, its edits arrive as suggestions anyone who can edit keeps or discards. [Keep or discard what agents suggest](agent-suggestions.md)

## What your agent can do

`exec` runs a short script against the typed Slatebox client, and one typed tool per method sits beside it: `create_slate`, `import_mermaid`, `edit_slate`, `export_mermaid`, `create_presentation` and more. The prompts `mind_map`, `flowchart`, `project_plan` and `presentation` start a drawing from a topic. [Every tool](../Developers/SlateboxAPI/mcp.md#what-your-assistant-gets)

Your agent acts as you: it reaches only the slates you can open, and deletes, large rewrites and wider sharing wait for your confirmation. On the slate it shows up as a named pointer with its plan as a checklist.

## Run it on your own Slatebox

A self-hosted Slatebox serves the same endpoint at `/mcp` on its own address. Give your agent that address instead. <!-- feature:self-host -->[Run your own Slatebox](../Installation/install-with-docker.md)<!-- /feature:self-host --><!-- feature:!self-host -->[Run your own Slatebox](../Installation/self-hosting.md)<!-- /feature:!self-host -->

## Questions

### Is the Slatebox MCP server free?

Yes. The MCP server, the command line and the HTTP API are free on Slatebox Cloud and on a self-hosted Slatebox. Tools that use Slatebox's own AI, such as `create_presentation` and `generate_shape`, come with Slatebox Pro or a balance on Slatebox Cloud. [See pricing](https://slatebox.com/plans/)

### Which agents work with Slatebox?

Any MCP client that supports remote servers, such as Claude, Claude Code, ChatGPT and Cursor. A client without OAuth sign-in can send a personal token from **Profile → Developer access**.

### Is Slatebox open source?

Yes. The app, the SlateboxJS engine and the relay are MIT licensed, except the app's `enterprise/` folder of outside-agent connections. [Licenses](../Developers/readme.md#licenses)

### How do I disconnect an agent?

Open **Profile → Developer access** and choose **Disconnect** beside the app under **Connected apps**. Its next request is refused.
