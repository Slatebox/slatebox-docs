# Manage team access

## /v1/organization endpoint

The hosted API retired the organization directory and member-list endpoints. Existing clients that used `GET /v1/organization` or `GET /v1/organization/users` should remove those calls and direct administrators to team settings. There is no bearer-token endpoint for enumerating organizations or inviting members. [Team settings](https://app.slatebox.com/team/settings)

## Invite a teammate

Sign in with an account that administers the team. In team settings, add the member's first name, last name and email address. Review the invitation and any displayed seat cost, then choose **Send Invites**. On a self-hosted installation, configure the email service to deliver invitations. [Docker setup](../../Installation/install-with-docker.md)

Team membership and access to an individual private slate are separate decisions. Open the slate's sharing controls and grant the teammate the level needed for their work. API requests inherit the token owner's current permissions. [User guide](../../Using-Slatebox/readme.md)
