# Run your own Slatebox

## Agent prompt

```text
Help me decide where my team should use Slatebox while the self-host installer is coming soon. Explain that Slatebox Cloud is free today, and what a self-hosted Slatebox will and will not meter.

Read the official guide at https://docs.slatebox.com/Installation/self-hosting.md first. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Installation/self-hosting.md.
```

Self-hosting is coming soon. One command will install Slatebox on this computer, a Linux server or a Kubernetes cluster: the app, the collaboration relay and the database in one container. The installer and the image are not published yet, so this guide will appear here once they are.

Until then, [use Slatebox Cloud](https://app.slatebox.com/start). It is free; AI and calls come with Slatebox Pro, or a balance you top up. Own AI and call keys are for self-hosted Slatebox. [Pricing](../Using-Slatebox/pricing.md)

## What a self-hosted Slatebox will be

- **The same app.** Every feature, the same as Slatebox Cloud. The app, the SlateboxJS engine and the relay are MIT licensed.
- **No meters.** No Slatebox Pro, no top-ups and no limits from us. AI is whatever you and your people connect, local or cloud, or none. [A self-hosted Slatebox has no meters](self-host-meters.md) · [Choose your AI](../Using-Slatebox/choose-your-ai.md)
- **Your agents too.** The image runs exec, so agents work with your own slates the same way. [Exec: how agents work with Slatebox](../Developers/SlateboxAPI/exec.md)

Would rather not run a server? Slatebox Cloud is free and fully managed, and Slatebox Business adds a shared pool of AI and calls for a team. [Slatebox Business](../Using-Slatebox/slatebox-business.md)
