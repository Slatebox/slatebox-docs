---
feature: self-host
whileHeld: /installation/self-hosting/
description: Let people sign in to your own Slatebox with their company account, through the Keycloak built into the image.
agentPrompt: >-
  Help me turn on single sign-on for my own Slatebox, which runs the image ghcr.io/slatebox/slatebox with Docker or Docker Compose.
  First check the running container: its name, its options (docker inspect, or compose.yaml), and that it is healthy.
  Ask which company sign-in we use (Microsoft Entra ID, Okta, Google Workspace, another SAML or OpenID Connect provider, or LDAP or Active Directory),
  and whether passwords and guests should be switched off (SLATEBOX_SSO_ONLY=true).
  Take a backup into a file with docker exec slatebox slatebox backup > slatebox-backup.gz, and check that the command printed Backup complete and that the file is not empty; stop if it is not.
  Only then start the container again with SLATEBOX_SSO=keycloak added, keeping the same volume and every other option.
  Wait until it is healthy, run docker exec slatebox slatebox sso, and give me the admin console address.
  Never print the admin password or the SCIM secret into our chat; tell me the command that shows it instead.
  Then walk me through adding our provider in the Keycloak admin console, step by step, following the guide's advice on Trust Email (not for Microsoft Entra ID unless its email addresses are controlled by our administrators) and on the first login flow for people provisioned ahead with SCIM or LDAP.
  Confirm with me that a test person can sign in with "Sign in with SSO".
  Once our provider works, offer to close the admin console on the public address with SLATEBOX_SSO_ADMIN=closed (the same backup and restart steps).
---

# Single sign-on

Let people sign in to your own Slatebox with their company account. The image includes Keycloak, an open-source identity server, which connects to your company's sign-in: a SAML 2.0 or OpenID Connect provider, or an LDAP or Active Directory server.

Single sign-on is off by default, and Keycloak does not run while it is off. It is for Slatebox you run yourself.

## Turn it on

Take a backup, then start the container again with `SLATEBOX_SSO=keycloak` and the options you already use:

<!-- tabs -->

```sh Docker
docker exec slatebox slatebox backup > slatebox-backup.gz
docker rm -f slatebox
docker run -d --name slatebox --restart unless-stopped \
  -p 80:80 -p 443:443 \
  -e SLATEBOX_URL=https://boards.example.com \
  -e SLATEBOX_SSO=keycloak \
  -v slatebox-data:/data ghcr.io/slatebox/slatebox
```

```yaml Docker Compose
# Back up:  docker compose exec -T slatebox slatebox backup > slatebox-backup.gz
# Add SLATEBOX_SSO to compose.yaml, then run: docker compose up -d
services:
  slatebox:
    image: ghcr.io/slatebox/slatebox
    container_name: slatebox
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    environment:
      SLATEBOX_URL: https://boards.example.com
      SLATEBOX_SSO: keycloak
    volumes: [slatebox-data:/data]
volumes:
  slatebox-data:
    name: slatebox-data
```

<!-- /tabs -->

On that start, Slatebox sets everything up by itself:

- Keycloak runs inside the container, on the same address under `/auth`.
- A realm named `slatebox`, a client for the app and a client for SCIM provisioning, each with a generated secret.
- A first Keycloak administrator, `admin`, with a generated password.

The log says where the admin console is:

```text Output
[slatebox] Single sign-on: Keycloak's admin console is at https://boards.example.com/auth/admin/ (user "admin").
[slatebox] Single sign-on: show the admin password with: docker exec <container> slatebox sso admin-password
```

You get a **Sign in with SSO** button on the sign-in page. Passwords and guests keep working unless you turn on [SSO only](#sso-only).

Print every address you need (admin console, issuer, the redirect address for your provider, the SCIM endpoint):

<!-- tabs -->

```sh Docker
docker exec slatebox slatebox sso
```

```sh Docker Compose
docker compose exec slatebox slatebox sso
```

<!-- /tabs -->

## Sign in to the admin console

Open `https://boards.example.com/auth/admin/` and sign in as `admin` with this password:

<!-- tabs -->

```sh Docker
docker exec slatebox slatebox sso admin-password
```

```sh Docker Compose
docker compose exec slatebox slatebox sso admin-password
```

<!-- /tabs -->

1. Create your own administrator in the `master` realm: **Users** → **Add user**, then **Role mapping** → **Assign role** → `admin`. Give them a long password.
2. Sign in as that person and delete `admin`. The generated password is for the first sign-in only.
3. Choose the `slatebox` realm at the top left. Every setting below is in that realm.

Slatebox keeps brute-force protection and sign-in events on in the `master` realm at every start, so password guessing is slowed and recorded.

Once your company's sign-in works, close the console on the public address: start the container again with `SLATEBOX_SSO_ADMIN=closed`. `/auth/admin/` and the `master` realm then answer "not found", and sign-in keeps working. To change settings later, start it without that option. Behind your own proxy, you can instead allow `/auth/admin/` and `/auth/realms/master/` only from your network.

## Add your company's sign-in

In the `slatebox` realm, open **Identity providers** and add one. Register the **Redirect URI** Keycloak shows (`https://boards.example.com/auth/realms/slatebox/broker/<alias>/endpoint`) with your provider.

| Your provider | In Keycloak | What to enter |
| --- | --- | --- |
| Microsoft Entra ID | **OpenID Connect v1.0** | Discovery endpoint `https://login.microsoftonline.com/<tenant id>/v2.0/.well-known/openid-configuration`; client ID and secret of an Entra ID app registration with Keycloak's Redirect URI. |
| Okta | **OpenID Connect v1.0** | Discovery endpoint `https://<your org>.okta.com/.well-known/openid-configuration`; client ID and secret of an Okta web app integration. |
| Google Workspace | **Google** | Client ID and secret of an OAuth client. Set **Hosted domain** to your company's domain. |
| Any SAML 2.0 provider | **SAML v2.0** | The provider's metadata URL or file. Give the provider Keycloak's SP metadata: `https://boards.example.com/auth/realms/slatebox/broker/<alias>/endpoint/descriptor`. |
| Any other OpenID Connect provider | **OpenID Connect v1.0** | Its discovery endpoint, client ID and secret. |

### Trust Email

Slatebox accepts an SSO sign-in only with a verified email address, and uses it to find the Slatebox account. Keycloak treats a provider's address as verified only when **Trust Email** is on for that provider. Anyone who can choose their own address at a trusted provider can sign in as that address's owner.

| Provider | Trust Email |
| --- | --- |
| Okta, Google Workspace, your own directory | On: your administrators set or verify the addresses. |
| Microsoft Entra ID | Off, unless it is a single-tenant app registration whose mail attributes only your administrators can set. The `email` claim is not verified. Otherwise set **Email verified** per person in Keycloak. |
| Another SAML or OpenID Connect provider | On only if it verifies addresses or only administrators set them. |

### People who exist in Keycloak before their first sign-in

Someone provisioned with [SCIM](#provisioning-with-scim), or made by hand, stops at "Account already exists" on their first company sign-in. For a provider with **Trust Email** on:

1. Set **First login flow override** to `link by trusted email`. Slatebox creates this flow; it links the person to the Keycloak user with the same address.
2. Set **Sync mode** to `Force`. Keycloak then takes the address from the provider at each sign-in and marks it verified. Without it, Slatebox refuses SCIM users.

Do not use this flow for a provider with **Trust Email** off.

To skip Keycloak's page and go straight to your provider: **Authentication** → `browser` flow → **Identity Provider Redirector** → settings, and enter the provider's alias as the default.

### LDAP and Active Directory

1. Open **User federation** → **Add LDAP providers** and choose the vendor.
2. Enter the connection URL (`ldaps://dc.example.com`), bind DN and password, and the users DN. Keep **Edit mode** on `READ_ONLY`.
3. Turn on **Trust Email**. Without it, Slatebox refuses every directory user.
4. Use **Test connection** and **Test authentication**, then save.
5. Turn on **Periodic changed users sync**.

People then sign in with their directory name and password. The container must reach the directory server.

### People made in Keycloak

**Users** → **Add user**. Turn on **Email verified** and set a password under **Credentials**.

## What happens at sign-in

1. **Sign in with SSO** sends the browser to Keycloak, and on to your provider. Slatebox uses the OpenID Connect authorization code flow with PKCE; the code is exchanged inside the container.
2. On the first sign-in, Slatebox picks the account in this order:
   - the account already linked to this person;
   - the Slatebox account with the same address, if Slatebox verified that address itself or nobody can use the account yet (an unaccepted team invitation);
   - a new account with the name and address the provider sent. No invitation is needed.
3. The session lasts as long as a normal Slatebox session. Slatebox checks with Keycloak in the background that the person still has access.
4. A sign-in belongs to the browser tab that started it.

When an account is linked, it signs in with SSO only. Its password is removed, and its sessions, API tokens and one-time sign-in links end. The person makes new API tokens after signing in.

Slatebox refuses an SSO sign-in when the provider has not verified the address; when an account with that address was never verified and someone can use it; when that account is linked to another SSO identity; or when it belongs to a guest. The page then says to ask an administrator.

## Removing access

Disable or delete the person in Keycloak (**Users** → the person → **Enabled** off, or **Delete**). Within about 90 seconds Slatebox signs them out everywhere, stops their API tokens and removes their one-time sign-in links. They cannot sign in again while disabled.

Slatebox renews each SSO person's offline session at Keycloak every minute. When Keycloak refuses, Slatebox ends that person's sessions and revokes their tokens. If Keycloak cannot be reached, nobody is signed out.

Keycloak learns that someone was disabled at your provider only when that person next signs in there. For removal to reach Slatebox on its own, do one of these:

- provision people with [SCIM](#provisioning-with-scim), so your provider deactivates them in Keycloak;
- use [LDAP or Active Directory](#ldap-and-active-directory) with periodic sync;
- disable the person in Keycloak too.

Signing out of Slatebox does not sign out of Keycloak or the company account. While that session lasts, **Sign in with SSO** signs the person in without a password.

## Provisioning with SCIM

Slatebox turns on Keycloak's SCIM 2.0 endpoint in the `slatebox` realm. Your provider creates, updates and deactivates people in Keycloak through it.

| | |
| --- | --- |
| SCIM base URL | `https://boards.example.com/auth/realms/slatebox/scim/v2` |
| Authentication | OAuth 2.0 client credentials |
| Token URL | `https://boards.example.com/auth/realms/slatebox/protocol/openid-connect/token` |
| Client ID | `scim` |
| Client secret | `docker exec slatebox slatebox sso scim-secret` |

- Provisioned people sign in through your provider, which needs **Trust Email**, **Sync mode** `Force` and the `link by trusted email` flow ([see above](#people-who-exist-in-keycloak-before-their-first-sign-in)).
- The Slatebox account appears at the first Slatebox sign-in, not when SCIM creates the person. Slatebox teams are not filled from SCIM groups.
- The client must fetch tokens with client credentials; Keycloak's tokens expire after a few minutes, so a fixed bearer token does not work.
- SCIM cannot set passwords.
- The addresses follow `SLATEBOX_URL`. Update them in your provider when the address changes.

## Sign-in events

Keycloak records sign-ins, failed sign-ins and administrator changes in the `slatebox` realm, and administrators' own sign-ins and changes in `master`. Sign-in events are kept 90 days; admin events until you remove them. Read them under **Events** in the admin console, or:

<!-- tabs -->

```sh Docker
docker exec slatebox slatebox sso events 100
```

```sh Docker Compose
docker compose exec slatebox slatebox sso events 100
```

<!-- /tabs -->

Each line has the time, type, user name, Keycloak user ID, client and IP address. Change retention under **Realm settings** → **Events**.

Keycloak does not record Slatebox's background renewals or Slatebox sign-outs. Slatebox's own log records, by account ID, when single sign-on creates, links or signs out an account. Slatebox keeps no audit log of what people do on slates.

## SSO only

Add `SLATEBOX_SSO_ONLY=true` to make single sign-on the only way in:

- The sign-in page shows only **Sign in with SSO**, and every page sends signed-out people there.
- Signed-out people see nothing else: no public slates, published presentations or embeds.
- Password sign-in, sign-up, password reset, one-time sign-in links and guests are refused.
- API tokens keep working for their accounts until access is removed.
- Existing accounts sign in with SSO, matched by email address. Team invitations still work.

## Your data

Keycloak's database is in `/data/keycloak` and its secrets in `/data/secrets`. `slatebox backup` includes both, so a restore at any address brings back the same people, providers and accounts. At a new address, give your providers the new Redirect URI and SCIM addresses. With single sign-on off, Keycloak writes nothing to the volume.

Keycloak keeps its data in an embedded H2 file, so single sign-on needs no second database. That suits a team-sized realm; in a very large organization the file grows with every person and event. Back up before every upgrade, because Keycloak updates its own tables when a new image starts.

## Memory

Single sign-on adds about 0.5 GB of memory while idle and a few seconds to each start. Give the machine at least 1.5 GB of free memory, and 2.5 GB for a team.

## Troubleshooting

| What you see | Fix |
| --- | --- |
| No **Sign in with SSO** button | Start the container with `SLATEBOX_SSO=keycloak`. The log shows `SSO: off` near the top. |
| `SLATEBOX_SSO_ONLY=true also needs SLATEBOX_SSO=keycloak` | Set both. |
| After the provider, the sign-in page says the account cannot be used | A `sso: sign-in refused` log line gives the reason: the address is not verified (turn on **Trust Email**, or **Email verified** for the person); a Slatebox account with that address was never verified (its owner confirms it from the verification mail, or changes that account's address); or the account is linked to another SSO identity. |
| Keycloak says "Account already exists" | The person was provisioned ahead. Set **First login flow override** to `link by trusted email` and **Sync mode** to `Force`, with **Trust Email** on. |
| Every directory user is refused | Turn on **Trust Email** in the LDAP provider. |
| `/auth/admin/` answers "not found" | The container runs with `SLATEBOX_SSO_ADMIN=closed`. Start it without that option. |
| Keycloak shows `HTTPS required` | Use an `https://` address in `SLATEBOX_URL`. |
| The password from `slatebox sso admin-password` is refused | It is the first, generated password, which stops working once you change it or delete `admin`. Sign in as the administrator you created. Keep two administrators. |
| `Single sign-on could not be set up` | The lines before it give the reason. Slatebox sets up single sign-on through the `slatebox-init` client in the `master` realm; do not delete it. |

`slatebox health` includes Keycloak when single sign-on is on.
