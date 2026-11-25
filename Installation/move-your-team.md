---
title: Move to Cloud or to your own server
description: Move your team from your own Slatebox to Slatebox Cloud, or from Slatebox Cloud to your own server, with one command. You check what arrives before anyone sees it.
agentPrompt: >-
  Help me move my Slatebox team between my own server and Slatebox Cloud.
  Ask me which way, then give me the exact command: npx slatebox migrate --to cloud (my own server to Cloud) or npx slatebox import --from cloud (Cloud to my own server).
  Tell me I need to be a team admin on the side I move from, and the owner of my team (or in no team yet) on the side I move to.
  Tell me my own server's access token goes in the SLATEBOX_API_TOKEN environment variable or is asked for with hidden input, and that I sign in to Slatebox Cloud with a code in my browser.
  Never ask me to paste a token, passphrase or setup link into this conversation.
---
# Move to Cloud or to your own server

Move your whole team between your own Slatebox and Slatebox Cloud with one command. You see a report of what arrives, and nothing is visible on the other side until you confirm.

<!-- tabs -->

```sh To Cloud
npx slatebox migrate --to cloud
```

```sh To your own server
npx slatebox import --from cloud
```

<!-- /tabs -->

## What you need

| Side | You need to be | Sign-in |
| --- | --- | --- |
| The side you move from | A team admin | Its access token, or the browser code for Cloud |
| The side you move to | The owner of your team there, or in no team yet | Its access token, or the browser code for Cloud |

- **Your own server:** make an access token in **Profile** → **Developer** with **Export everything my team owns** and **Move a team here**. Put it in `SLATEBOX_API_TOKEN`, or paste it when the command asks (nothing shows while you type). Its address comes from the install this computer made, `SLATEBOX_BASE_URL`, or `--from`/`--to <url>`.
- **Slatebox Cloud:** the command prints a short code and opens your browser. Sign in and approve it. In a script, set `SLATEBOX_CLOUD_TOKEN` instead.

## What happens

1. The command checks both sides first. If one says no, nothing is copied.
2. It shows the plan: the team, how many slates and people, and where it lands. You agree.
3. It exports everything your team owns, encrypted with a passphrase made for this move.
4. The other side reads it into a hidden team and answers with a report: slates, files, people, library items, and anything left out.
5. You confirm. The team goes live:
   - **In no team yet:** it becomes your team, and you are its owner.
   - **As a team owner:** it joins your team. Your brand kit and agent choices stay.
6. You choose whether to email the other people an invitation (`--invite`, or answer yes when asked). Nobody gets an account they can sign in to without that email.

The team stays where it was. Remove it there when you are ready.

## What moves

| Moves | Does not move |
| --- | --- |
| Slates, boards and smart components | Passwords |
| Recent versions and comments | Agent and call keys (add them again) |
| Presentations and uploaded files | Access tokens (make them again) |
| The brand kit, with its logos | Connected agents and integrations (connect them again) |
| Your library items, as drafts to send for review | |
| People, as placeholders until they accept the invitation | |

Board rules arrive switched off until a team admin reviews them. Published links get new addresses.

## Other ways

| Command | Does |
| --- | --- |
| `npx slatebox install --from cloud` | Installs a new server, then prints the steps to bring your Cloud team over after you create the first account |
| `npx slatebox export --out acme.sbxteam --passphrase prompt` | Writes a team export file |
| `npx slatebox import acme.sbxteam --to cloud --passphrase prompt` | Moves a team export file in |
| `--replace-waiting` | Discards a move already waiting on the other side, then starts again |
| `--keep-archive` | Keeps the encrypted archive in `~/.slatebox/moves/` after the move |

A move holds up to 2 GB. A move waiting for your confirmation is removed after 14 days. Moving the same archive twice keeps the first move.

The file format is open: see [Team export format](https://github.com/Slatebox/slatebox/blob/main/docs/team-export.md).
