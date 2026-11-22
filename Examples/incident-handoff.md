# Hand an incident timeline to the next shift

## Agent prompt

```text
Help me try the Slatebox example “Hand an incident timeline to the next shift”. Use the linked example and guide to reproduce its main interaction. Show me the resulting slate or observable behavior.

Read https://docs.slatebox.com/Examples/incident-handoff.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/incident-handoff.md.
```

The gateway timed out at 02:12 and the queue drained by 02:26. The next shift still needs to know who owns the retry limit.

1. In the example, move the next-shift note beside the queue-recovery note. Open your timeline as a private slate.
2. Open **Share**, choose **Create edit link**, then **Copy link** and **Done**. Anyone with this unlisted link can edit, so send it only to the incoming responder.
3. The responder opens the board and edits the handoff note with a name and a concrete check, such as “Mara will check the retry limit at 03:00.”
4. If they edited while signed out, they choose **Keep in My Slates** after the note saves. The slate then appears under **Recently joined** in **My Slates** in that browser, with no sign-up. Signed-in responders find it there already.
5. At shift change, select **02:26 · On-call handoff**. Follow the arrows from the timeout to the next check and read the latest notes.

Without **Keep in My Slates**, reopen the slate from the original link.

[Try the collaboration example](https://slatebox.com/product/collaboration/) · [Open a fresh incident timeline](https://app.slatebox.com/new/incident-timeline)
