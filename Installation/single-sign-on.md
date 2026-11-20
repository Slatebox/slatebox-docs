---
description: Let people sign in to your own Slatebox with their company account, through the Keycloak bundled in the image.
agentPrompt: >-
  Help me turn on single sign-on for my own Slatebox, which runs with Docker from the image ghcr.io/slatebox/slatebox.
  First check the running container: its name, its docker run options (docker inspect), and that it is healthy.
  Ask which company sign-in we use (Microsoft Entra ID, Okta, Google Workspace, another SAML or OpenID Connect provider, or LDAP or Active Directory),
  and whether passwords and guests should be switched off (SLATEBOX_SSO_ONLY=true).
  Take a backup into a file with docker exec slatebox slatebox backup > slatebox-backup.gz, and check that the command printed Backup complete and that the file is not empty; stop if it is not.
  Only then remove the container and run the same docker run command again with -e SLATEBOX_SSO=keycloak added, keeping the same volume and every other option.
  Wait until docker ps reports it healthy, run docker exec slatebox slatebox sso, and give me the admin console address.
  Never print the admin password or the SCIM secret into our chat; tell me the command that shows it instead.
  Then walk me through adding our provider in the Keycloak admin console, step by step, following the guide's advice on Trust Email (not for Microsoft Entra ID unless its email addresses are controlled by our administrators) and on the first login flow for people provisioned ahead with SCIM or LDAP.
  Confirm with me that a test person can sign in with "Sign in with SSO".
  Once our provider works, offer to close the admin console on the public address with -e SLATEBOX_SSO_ADMIN=closed (the same backup, remove and run steps).
---

# Single sign-on

Your own Slatebox can let people sign in with their company account. The Docker image includes [Keycloak](https://www.keycloak.org), an open-source identity server, for this. Keycloak connects to your company's sign-in: Microsoft Entra ID, Okta, Google Workspace, any SAML 2.0 or OpenID Connect provider, or an LDAP or Active Directory server. Slatebox then signs people in through Keycloak.

Single sign-on is off by default and costs nothing while it is off: Keycloak is not started. It is for installations you run yourself; Slatebox Cloud does not offer it.

## Turn it on

Add `-e SLATEBOX_SSO=keycloak` to your `docker run` command. To change an option, take a backup, remove the container and run it again on the same volume:

```sh
docker exec slatebox slatebox backup > slatebox-backup.gz
docker rm -f slatebox
docker run -d --name slatebox --restart unless-stopped \
  -p 80:80 -p 443:443 \
  -e SLATEBOX_URL=https://boards.example.com \
  -e SLATEBOX_SSO=keycloak \
  -v slatebox-data:/data ghcr.io/slatebox/slatebox
```

Keep the options you already use. On the first start with single sign-on on, Slatebox:

- starts Keycloak inside the container and serves it on the same address and port, under `/auth`;
- creates a Keycloak realm named `slatebox`, a client for the app with a generated secret, and a client for SCIM provisioning;
- creates Keycloak's first administrator, `admin`, with a generated password;
- keeps those secrets in the volume, next to the others, and connects the app to Keycloak.

Nothing needs to be configured by hand. The log shows where the admin console is, and once only:

```
[slatebox] Single sign-on: Keycloak's admin console is at https://boards.example.com/auth/admin/ (user "admin").
[slatebox] Single sign-on: show the admin password with: docker exec <container> slatebox sso admin-password
```

The sign-in page now has a **Sign in with SSO** button. Email and password sign-in and guests keep working, unless you also turn on [SSO only](#sso-only).

`docker exec slatebox slatebox sso` prints every address you will need: the admin console, the issuer, the redirect address to give your company's provider, and the SCIM endpoint.

## Sign in to the admin console

Open `https://boards.example.com/auth/admin/` and sign in as `admin` with the password from:

```sh
docker exec slatebox slatebox sso admin-password
```

Keycloak marks this first administrator as temporary. Create your own administrator in the `master` realm (**Users** → **Add user**, then **Role mapping** → **Assign role** → `admin`), give them a long password, sign in as that person, and delete `admin`. The generated password is only for that first sign-in; `slatebox sso admin-password` keeps showing it after you change it.

Choose the `slatebox` realm in the realm list at the top left before you change anything else. Every setting below is in that realm.

The admin console is served on your public address, and signs administrators in through Keycloak's `master` realm. At every start Slatebox keeps brute-force protection on in the `master` realm (repeated wrong passwords lock the account for a while) and keeps its sign-in and admin events, so password guessing is slowed and recorded.

Once your company's sign-in works, close the console on the public address: run the container again with `-e SLATEBOX_SSO_ADMIN=closed` (take a backup, remove the container and run it again on the same volume, as above). `/auth/admin/` and the `master` realm then answer "not found" on the published port, and sign-in through the `slatebox` realm keeps working. To change a setting later, run it again without that option. If your own proxy is in front of Slatebox, you can instead keep `/auth/admin/` and `/auth/realms/master/` reachable only from your network.

## Add your company's sign-in

In the `slatebox` realm, open **Identity providers** and add one. Keycloak calls the address it gives you the **Redirect URI**; it has the form `https://boards.example.com/auth/realms/slatebox/broker/<alias>/endpoint`. Register it with your company's provider.

| Your provider | In Keycloak | What to enter |
| --- | --- | --- |
| Microsoft Entra ID | **OpenID Connect v1.0** | Discovery endpoint `https://login.microsoftonline.com/<tenant id>/v2.0/.well-known/openid-configuration`, and the client ID and secret of an app registration in Entra ID whose redirect URI is Keycloak's Redirect URI. |
| Okta | **OpenID Connect v1.0** | Discovery endpoint `https://<your org>.okta.com/.well-known/openid-configuration`, and the client ID and secret of an Okta web app integration. |
| Google Workspace | **Google** | The client ID and secret of an OAuth client in your Google Cloud project. Set **Hosted domain** to your company's domain so that only its accounts are accepted. |
| Any SAML 2.0 provider (ADFS, Ping, OneLogin, Shibboleth and others) | **SAML v2.0** | The provider's metadata URL or file. Give the provider Keycloak's SP metadata from `https://boards.example.com/auth/realms/slatebox/broker/<alias>/endpoint/descriptor`. |
| Any other OpenID Connect provider | **OpenID Connect v1.0** | Its discovery endpoint, client ID and secret. |

Slatebox accepts an SSO sign-in only with a verified email address, and uses that address to find an existing Slatebox account. Keycloak treats an address from a provider as verified only when that provider's **Trust Email** is on. Turn it on only for a provider whose addresses are controlled by your administrators, because anyone who can choose their own address at the provider could then sign in as the person who owns that address:

- **Okta, Google Workspace and your own directory:** addresses are set or verified by your administrators. Turn **Trust Email** on.
- **Microsoft Entra ID:** the `email` claim is not a verified claim. Anyone whose mail attribute can be changed (a guest from another tenant, or someone a delegated administrator manages) could be given another person's address. Turn **Trust Email** on only for a single-tenant app registration whose users' mail attributes only your administrators can set; otherwise leave it off and set **Email verified** for each person in Keycloak.
- **Another SAML or OpenID Connect provider:** turn it on only if that provider verifies addresses or only administrators set them.

### People who exist in Keycloak before their first company sign-in

When someone already exists in Keycloak with the same address (provisioned with [SCIM](#provisioning-with-scim), or made by hand), Keycloak's default first sign-in through a company provider stops at "Account already exists" and asks for a Keycloak password that person does not have. For a provider with **Trust Email** on, open the provider's settings and set **First login flow override** to `link by trusted email`. Slatebox creates that flow in the `slatebox` realm: the person is linked to the existing Keycloak user with the same address, and anyone else is created as usual. Do not choose it for a provider with **Trust Email** off.

To send people straight to your company's sign-in instead of Keycloak's page, open **Authentication** → the `browser` flow → **Identity Provider Redirector** → settings, and enter the provider's alias as the default.

### LDAP and Active Directory

Open **User federation** → **Add LDAP providers**. Choose the vendor (Active Directory or another), enter the connection URL (`ldaps://dc.example.com`), the bind DN and its password, and the DN that holds your users. Keep **Edit mode** on `READ_ONLY`. Turn on **Trust Email** in the provider's settings: without it, the addresses Keycloak imports from the directory are not verified, and Slatebox refuses every directory user. Use **Test connection** and **Test authentication**, save, then turn on **Periodic changed users sync** under the provider's synchronization settings. People then sign in with their directory name and password. The container must be able to reach the directory server.

### People made in Keycloak

You can also make people in Keycloak itself (**Users** → **Add user**). Set **Email verified** on, and set a password under **Credentials**.

## What happens at sign-in

1. **Sign in with SSO** sends the browser to Keycloak (and from there, to your company's sign-in when you set one up). Slatebox uses the OpenID Connect authorization code flow with PKCE; the code is exchanged inside the container, never over the network.
2. The first time someone signs in, Slatebox finds their account:
   - the account already linked to them;
   - otherwise the Slatebox account with the same email address, which is then linked. Slatebox links it only when it has verified that address itself (its owner followed the verification link Slatebox mailed), or when nobody can use that account yet (a team invitation not yet accepted). Anyone can type any address into their own account, so an unverified address proves nothing;
   - otherwise a new account, with the name and address their provider sent. Nobody has to be invited first.
3. Their Slatebox session lasts as long as a normal Slatebox session, while Slatebox checks with Keycloak in the background that they still have access.
4. The sign-in is tied to the browser tab that started it: a link to the last step of someone else's sign-in signs nobody in.

When an account is linked, it signs in with SSO from then on: its password is removed, and its earlier sessions, API tokens and one-time sign-in links end. The person makes new API tokens after signing in.

An SSO sign-in is refused when the provider has not verified the address, when an account with that address exists but Slatebox never verified it and someone can use that account, when the account with that address is linked to a different SSO identity, or when it belongs to a guest. The sign-in page then says to ask an administrator.

## Removing access

Disable or delete the person in Keycloak (**Users** → the person → **Enabled** off, or **Delete**). Within about 90 seconds (75 seconds in our tests) Slatebox signs them out everywhere: open tabs lose their session, a reload does not bring it back, their API tokens stop working and their one-time sign-in links are removed. They cannot sign in again with SSO while they are disabled, and an account linked to SSO never signs in with a password.

This works because Slatebox keeps an offline session for each person who has signed in with SSO at Keycloak and renews it every minute, whether or not they have a Slatebox page open. When Keycloak refuses the renewal, Slatebox removes all of that person's Slatebox sessions and revokes their API tokens. If Keycloak cannot be reached, nobody is signed out for that.

Keycloak only knows what your company's provider has told it. When you disable someone in Entra ID, Okta or Google, Keycloak does not hear of it until that person signs in there again. For removal to reach Slatebox on its own, also do one of these:

- provision people into Keycloak with [SCIM](#provisioning-with-scim), so that your provider deactivates them in Keycloak;
- use [LDAP or Active Directory](#ldap-and-active-directory) with periodic sync, so that a disabled directory account is disabled in Keycloak;
- disable the person in Keycloak as well.

Signing out of Slatebox does not sign the person out of Keycloak or of their company account. While that session lasts, **Sign in with SSO** signs them in again without asking for a password.

## Provisioning with SCIM

Keycloak has a SCIM 2.0 endpoint, and Slatebox turns it on for the `slatebox` realm:

| | |
| --- | --- |
| SCIM base URL | `https://boards.example.com/auth/realms/slatebox/scim/v2` |
| Authentication | OAuth 2.0 client credentials |
| Token URL | `https://boards.example.com/auth/realms/slatebox/protocol/openid-connect/token` |
| Client ID | `scim` |
| Client secret | `docker exec slatebox slatebox sso scim-secret` |

Your provider creates, updates and deactivates people in Keycloak through it. A provisioned person signs in through your company's provider, which needs **Trust Email** and the `link by trusted email` first login flow on that provider (see [People who exist in Keycloak before their first company sign-in](#people-who-exist-in-keycloak-before-their-first-company-sign-in)). Their Slatebox account is created the first time they sign in to Slatebox, and a person your provider deactivates loses access to Slatebox as described in [Removing access](#removing-access).

The SCIM address follows `SLATEBOX_URL`: Slatebox updates it at every start, including after a restore at another address. Update the SCIM base URL and token URL in your provider when you change the address.

Be aware of what this is and is not:

- The provisioning client must be able to fetch a token with OAuth 2.0 client credentials. A provider that only accepts a fixed bearer token cannot use it, because Keycloak's tokens expire after a few minutes.
- SCIM provisions Keycloak, not Slatebox directly: Slatebox accounts appear at first sign-in, not when SCIM creates the person. Teams in Slatebox are not filled from SCIM groups.
- SCIM cannot set passwords. People provisioned this way sign in through your company's provider.

## Sign-in events

Keycloak keeps a record of sign-ins and failed sign-ins (including those refused because the person is disabled) in the `slatebox` realm for 90 days, and of every change an administrator makes to the `slatebox` realm. Administrators' own sign-ins and changes are kept in the `master` realm. It does not record the background renewals Slatebox makes, and signing out of Slatebox does not reach Keycloak; Slatebox's own log records when it signs someone out. Admin events are kept until you remove them. Read them in the admin console under **Events**, or from the terminal:

```sh
docker exec slatebox slatebox sso events 100
```

Each line is one event, with its time, type, the person's user name, Keycloak's user ID, the client and the IP address. Change how long events are kept under **Realm settings** → **Events**.

Slatebox's own log records, by account ID only, when single sign-on creates an account, links one, or signs one out. Slatebox does not keep an audit log of what people do on their slates.

## SSO only

Add `-e SLATEBOX_SSO_ONLY=true` as well, to make single sign-on the only way in:

- the sign-in page shows only **Sign in with SSO**;
- every page sends people who are not signed in to the sign-in page;
- the server answers nothing but signing in to anyone without a session: public slates, published presentations and embeds are not shown to them;
- the server refuses password sign-in, sign-up, password reset, one-time sign-in links and guests;
- API tokens keep working for the accounts that made them, until access is removed;
- existing accounts sign in with SSO and are matched by their email address;
- team invitations still work: the invited person signs in with SSO.

## Your data

Keycloak's database is in the volume under `/data/keycloak`, and its secrets are in `/data/secrets` with the others. `slatebox backup` includes both, so a restore into a new installation, at the same or another address, brings back the same people, providers and accounts. Your company's providers still need Keycloak's Redirect URI and the SCIM address at the new address. With single sign-on off, nothing of Keycloak is written to the volume.

Keycloak keeps its data in an embedded H2 database file. Be aware that Keycloak supports H2 for development only and recommends PostgreSQL, MySQL, MariaDB, Microsoft SQL Server or Oracle in production. Those are all separate database servers; Keycloak cannot embed one. Slatebox uses H2 so that single sign-on needs no second database and stays one container, which suits a team-sized realm. In return:

- take a backup before every upgrade. Keycloak updates its tables itself when a newer image starts, but the H2 file format has changed in the past between Keycloak versions;
- for a very large organisation, plan for Keycloak's data to grow with every person and event.

## Memory

Single sign-on adds Keycloak and a Java runtime to the running container: about 0.5 GB of memory while idle (measured: 946 MiB for the whole container with single sign-on on, 497 MiB with it off), and a few seconds to each start. Give the machine at least 1.5 GB of free memory, and 2.5 GB for a team.

## Troubleshooting

| What you see | What to do |
| --- | --- |
| The sign-in page has no **Sign in with SSO** button | The container was started without `-e SLATEBOX_SSO=keycloak`. `docker logs slatebox` shows `SSO: off` near the top. |
| The log says `SLATEBOX_SSO_ONLY=true also needs SLATEBOX_SSO=keycloak` | Add both options. |
| After signing in at your provider, the sign-in page says the account cannot be used | `docker logs slatebox` gives the reason on a `sso: sign-in refused` line. The provider has not verified the address (turn on **Trust Email** for the identity provider or the LDAP provider, or **Email verified** for the person); or a Slatebox account with that address exists but its address was never verified (its owner can confirm it from the verification mail, or change that account's address); or it belongs to an account linked to another SSO identity. |
| Keycloak says "Account already exists" after the company sign-in | The person was provisioned ahead (SCIM, LDAP or by hand). Set the provider's **First login flow override** to `link by trusted email`, with **Trust Email** on. |
| Every directory user is refused | Turn on **Trust Email** in the LDAP provider's settings. |
| `/auth/admin/` answers "not found" | The container runs with `SLATEBOX_SSO_ADMIN=closed`. Run it again without it to use the console. |
| Keycloak shows `HTTPS required` | You opened Slatebox over plain HTTP from outside your network. Use an `https://` address in `SLATEBOX_URL`. |
| `slatebox sso admin-password` no longer works in the console | It shows the first, generated password, which stops working once you change it or delete `admin`. Sign in as the administrator you created. Keep two administrators so that losing one password does not lock you out. |
| The log says `Single sign-on could not be set up` | The lines before it name the reason. Single sign-on is set up through the `slatebox-init` client in the `master` realm; do not delete it. |

`docker exec slatebox slatebox health` includes Keycloak when single sign-on is on.
