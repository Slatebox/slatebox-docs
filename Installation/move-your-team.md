# Move to Cloud or to your own server

## Agent prompt

```text
Help me move my Slatebox team between my own server and Slatebox Cloud. Ask me which way, then give me the exact command: npx slatebox migrate --to cloud (my own server to Cloud) or npx slatebox import --from cloud (Cloud to my own server). Tell me I need to be a team admin on the side I move from, and the owner of my team (or in no team yet) on the side I move to. Tell me my own server's access token goes in the SLATEBOX_API_TOKEN environment variable or is asked for with hidden input, and that I sign in to Slatebox Cloud with a code in my browser (the page says "Move your team"). Tell me the command asks once whether to send invitations to the other members (yes by default), and that --invite or --no-invite answers it ahead in a script. Never ask me to paste a token, passphrase or setup link into this conversation.

Read the official guide at https://docs.slatebox.com/Installation/move-your-team.md first. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Installation/move-your-team.md.
```

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
- **Slatebox Cloud:** the command prints a short code and opens your browser. Sign in and approve it on the page titled **Move your team**. The sign-in can only export your team and move a team in, and it ends after an hour. In a script, set `SLATEBOX_CLOUD_TOKEN` instead (an access token with the same two permissions).

## What happens

1. The command checks both sides first. If one says no, nothing is copied.
2. It shows the plan: the team, how many slates and people, and where it lands. You agree.
3. It exports everything your team owns, encrypted with a passphrase made for this move.
4. The other side reads it into a hidden team and answers with a report: slates, files, people, library items, and anything left out.
5. You confirm. The team goes live:
   - **In no team yet:** it becomes your team, and you are its owner.
   - **As a team owner:** it joins your team. Your brand kit and agent choices stay.
6. The command asks once: **Send invitations to the other members now?** Press Enter for yes. In a script, nobody is invited unless you add `--invite` (or `--no-invite` to say no ahead).
7. It asks whether to delete the archive from this computer. Press Enter to keep it. The command prints how to delete it later.

The team stays where it was. Remove it there when you are ready.

## Invitations

- Each person gets an email to set a password and claim their account. Nobody can sign in without that email.
- Someone who already has an account on the other side gets an invitation to join instead. They sign in with that account and accept. Nothing changes for them until they do. If they are in another team there, they leave it first.
- Addresses the old server never verified are not invited. Check each one, then invite it.
- To invite later, use the move id the command printed:

```sh
npx slatebox migrate invite <move id> --to cloud
npx slatebox migrate invite <move id> --email carol@example.com --to cloud
```

## Limits and checks

Nobody at Slatebox reviews a move into Slatebox Cloud. Instead:

- A move holds up to 2 GB.
- Each archive is checked as untrusted: new addresses for everything, private until you confirm, board rules off, no keys.
- You can start up to 3 moves a day.
- Each move is recorded for the server's administrators.

## What moves

| Moves | Does not move |
| --- | --- |
| Slates, boards and smart components | Passwords |
| Recent versions and comments | Agent and call keys (add them again) |
| Presentations and uploaded files | Access tokens (make them again) |
| The brand kit, with its logos | Connected agents and integrations (connect them again) |
| Your library items, sent to the other side's review queue | |
| People, as placeholders until they accept the invitation | |

Board rules arrive switched off until a team admin reviews them. Published links get new addresses. Library items show in the library only after that server's administrators approve them.

## Other ways

| Command | Does |
| --- | --- |
| `npx slatebox install --from cloud` | Installs a new server, then prints the steps to bring your Cloud team over after you create the first account |
| `npx slatebox export --out acme.sbxteam --passphrase prompt` | Writes a team export file |
| `npx slatebox import acme.sbxteam --to cloud --passphrase prompt` | Moves a team export file in |
| `--invite`, `--no-invite` | Answers the invitations question ahead |
| `--delete-archive`, `--keep-archive` | Deletes the encrypted archive in `~/.slatebox/moves/` after the move, or keeps it without asking |
| `--replace-waiting` | Discards a move already waiting on the other side, then starts again |

A move waiting for your confirmation is removed after 14 days. Moving the same archive twice keeps the first move.

## Versions

Slatebox Cloud is updated first, so it reads exports from any older server. If your own server is older than the export, the move stops with **update this server**. Update it, then run the same command again. The archive is kept, so nothing is exported twice.

The file format is open: see [Team export format](https://github.com/Slatebox/slatebox/blob/main/docs/team-export.md).
