# Team addresses

## Agent prompt

```text
Help me give my own Slatebox a team address at https://<name>.slatebox.team. Ask me for the name (3 to 32 characters: a-z, 0-9 and hyphens) and where Slatebox runs, then give me the exact npx slatebox install --team-address command. Tell me I approve a short code in my browser to claim the name, and that the installer then prints a one-time setup link in my terminal that creates the first account (slatebox setup-link prints a new one). Never ask me to paste a token or a credential into this conversation.

Read the official guide at https://docs.slatebox.com/Installation/team-addresses.md first. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Installation/team-addresses.md.
```

A team address is a free name for your own Slatebox, `https://<name>.slatebox.team`. You get HTTPS and live collaboration with no DNS, ports or certificates to set up.

<!-- tabs -->

```sh Shell
npx slatebox install --team-address acme
```

<!-- /tabs -->

The installer prints a short code and offers to open your browser. Sign in to your Slatebox account, approve the code, and `acme.slatebox.team` is claimed for you. Slatebox starts and the installer prints the address once it answers, with a one-time setup link, `https://acme.slatebox.team/setup/…`. Open it to create the first account: you become the server administrator. Nobody can sign up before that, so the public address is safe to share from the start. The link works once and expires in 24 hours; `slatebox setup-link` prints a new one.

## How it works

- The container connects out to Cloudflare through a secure tunnel. Cloudflare ends HTTPS and carries the app and live editing to it.
- Nothing is opened on your machine or router. Only `127.0.0.1` is published on the host.
- The container starts again when the machine does, and reconnects on the same address.
- Your address is public; your slates are not. People still sign in or open a share link.
- The tunnel takes uploads of up to 100 MB, more than Slatebox itself accepts, so uploads work as they do anywhere else.

The install keeps one credential for the address, on the computer that installed: `~/.slatebox/installs/<name>/credentials.json`, mode 0600. It can fetch the tunnel token again and give the address back, and nothing else.

## Names

- 3 to 32 characters: a-z, 0-9 and hyphens. Case does not matter.
- An account holds up to 3 team addresses.
- Claiming a name needs a Slatebox account with a verified email.

## Rename, rotate and release

<!-- tabs -->

```sh Shell
slatebox status                 # the address and the tunnel's connections
slatebox setup-link             # before the first account: a new one-time setup link
slatebox rename acme-boards     # move to https://acme-boards.slatebox.team
slatebox address rotate         # a new tunnel token; the old one stops working
slatebox address release        # give the address back; Slatebox keeps running on this computer
slatebox uninstall              # also gives the address back, unless --keep-address
```

<!-- /tabs -->

Each claim, rename or reconnect is approved in your browser.

## When an address is released

| When | What happens |
| --- | --- |
| It never connects within 24 hours of the claim | It is released |
| It has not connected for 60 days | The owner gets an email |
| It has not connected for 90 days | It is released |
| You release it | The name is held for your account for 30 days |

Report abuse of a team address to abuse@slatebox.com.

## Leave for your own domain

- `npx slatebox install --domain boards.example.com` moves the install to your own domain, with HTTPS certificates renewed automatically or your own proxy. [Your own domain](install-with-docker.md#your-own-domain)
- A tunnel in your own Cloudflare account works the same way. [Your own tunnel](install-with-docker.md#your-own-tunnel)
