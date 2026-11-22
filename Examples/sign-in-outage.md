# Trace who can still use your product during a sign-in outage

## Agent prompt

```text
Help me try the Slatebox example “Trace who can still use your product during a sign-in outage”. Use the linked example and guide to reproduce its main interaction. Show me the resulting slate or observable behavior.

Read https://docs.slatebox.com/Examples/sign-in-outage.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/sign-in-outage.md.
```

A customer on the phone can still see their workspace. A new customer can’t sign in to open theirs. Put both on one whiteboard so support knows which answer to give.

1. Follow the arrows from the new customer to the sign-in problem. Find the separate path for someone who is already signed in.
2. Move the support note beside the blocked customer; the connector follows. Choose **Write the fallback** and type what support should tell a caller. Open the diagram in Slatebox to keep both changes.
3. Invite a teammate to edit. Ask engineering to add a connected note saying what would break existing sessions too.
4. At your next review, reopen the slate and choose **Presentation options → Present to everyone here** so support follows along. Walk through the blocked path, then the signed-in one, and agree what to tell each group.

The diagram records what your team knows; you supply the dependencies and the fallback. Connections stay attached as the drawing changes.

[Try the example whiteboard](https://slatebox.com/assets/product/sign-in-outage.html) · [Open the outage diagram in Slatebox](https://app.slatebox.com/new/sign-in-outage) · [Add a connected note](connected-notes.md) · [Present a whiteboard together](../Using-Slatebox/readme.md#present-a-whiteboard-together)
