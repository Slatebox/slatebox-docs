# Run your own Slatebox

## Agent prompt

```text
Help me decide where my team should use Slatebox while the self-host installer is coming soon. Explain that Slatebox Cloud is free today, and who will pay for what on a self-hosted Slatebox.

Read the official guide at https://docs.slatebox.com/Installation/self-hosting.md first. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Installation/self-hosting.md.
```

Self-hosting is coming soon. One command will install Slatebox on this computer, a Linux server or a Kubernetes cluster: the app, the collaboration relay and the database in one container. The installer and the image are not published yet, so this guide will appear here once they are.

Until then, [use Slatebox Cloud](https://app.slatebox.com/start). It is free. [Pricing on Slatebox Cloud](../Using-Slatebox/pricing.md)

## What a self-hosted Slatebox will be

- **The same app.** Every feature of Slatebox Cloud. Outside-agent connections (inviting agents such as GitHub, Linear or Excalidraw onto a slate) are in the image, switched off, until an on-prem license from Slatebox, a flat yearly fee per install, switches them on. The app, the SlateboxJS engine and the relay are MIT licensed, except the app's `enterprise/` folder, which holds those connections.
- **Single sign-on, free.** Keycloak is in the image. It needs no license.
- **Free, with your own AI and calls.** No limits from us. AI is whatever you and your people connect, local or cloud, or none; calls use your own Daily account. Slatebox Pro and balances exist only on Slatebox Cloud. [Who pays for what on your own server](self-host-costs.md) · [Choose your AI](../Using-Slatebox/choose-your-ai.md)
- **Your agents too.** The image runs exec, so agents work with your own slates the same way. [Exec: how agents work with Slatebox](../Developers/SlateboxAPI/exec.md)

Would rather not run a server? Slatebox Cloud is free and fully managed, and Slatebox Business adds a shared pool of AI and calls for a team. [Slatebox Business](../Using-Slatebox/slatebox-business.md)
