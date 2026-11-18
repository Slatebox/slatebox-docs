# Trace who can still use your product during a sign-in outage

## Agent prompt

```text
Help me try the Slatebox example “Trace who can still use your product during a sign-in outage”. Use the linked example and guide to reproduce its main interaction. Show me the resulting slate or observable behavior.

Read https://docs.slatebox.com/Examples/sign-in-outage.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/sign-in-outage.md.
```

A customer on the phone can still see their workspace. A new customer has just tried signing in and can’t open theirs. Put both accounts on one whiteboard so support can tell which answer to give.

1. On the diagram, follow the arrows from the new customer to the sign-in problem. Find the separate path for someone with an existing session.
2. Move the support note beside the blocked customer. Watch the connector follow the note. Choose **Write the fallback** and type the answer support would give a caller. Open the diagram in Slatebox to keep both changes.
3. Invite a teammate to edit. Ask engineering to add a connected note describing what would make the existing session stop working. Each person can challenge the other’s assumptions on the same diagram.
4. Reopen the saved slate at your next review. Choose **Present notes together** and have support follow along. Show the blocked sign-in path, then the existing session. Ask which customers can still open their work and what support should tell the others. [Present a whiteboard together](../Using-Slatebox/readme.md#present-a-whiteboard-together)

The diagram records what your team knows about its product. Your team supplies the dependencies and fallback. Slatebox keeps the connections attached as the drawing changes.

[Try the example whiteboard](https://slatebox.com/assets/product/sign-in-outage.html) · [Open the outage diagram in Slatebox](https://app.slatebox.com/new/sign-in-outage) · [Add a connected note](./connected-notes.md)
