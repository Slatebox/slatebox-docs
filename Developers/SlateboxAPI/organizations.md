# Manage team access

## Agent prompt

```text
Help me use the documented Slatebox HTTP API for “Manage team access”. Use the documented method, path and permissions. Show the request with credential placeholders and verify the response on my chosen slate.

Read https://docs.slatebox.com/Developers/SlateboxAPI/organizations.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/SlateboxAPI/organizations.md.
```

## /v1/organization endpoint

The hosted API retired the organization directory and member-list endpoints. Existing clients that used `GET /v1/organization` or `GET /v1/organization/users` should remove those calls and direct administrators to **Manage Team**. There is no bearer-token endpoint for enumerating organizations or inviting members. [Manage Team](https://app.slatebox.com/team)

## Invite a teammate

Open **Manage Team** with an account that can invite members. Under **Invite New Members**, enter a first name, last name and email address, then choose **Add to invitation list**. Review the list and choose **Send Invites**. If Slatebox shows a seat charge, review it before confirming. On a self-hosted installation, configure the email service to deliver invitations. [Docker setup](../../Installation/install-with-docker.md)

The teammate opens the enrollment email, sets a password and selects **Join team**. To share a private board, its owner opens **Share → Private** and chooses **edit** or **read** beside that teammate’s name. The board then appears in **Team Slates** for the teammate, who can open it from a new session. API requests inherit the token owner's current permissions. [User guide](../../Using-Slatebox/readme.md)
