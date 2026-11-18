# Hand an incident timeline to the next shift

## Agent prompt

```text
Help me try the Slatebox example “Hand an incident timeline to the next shift”. Use the linked example and guide to reproduce its main interaction. Show me the resulting slate or observable behavior.

Read https://docs.slatebox.com/Examples/incident-handoff.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/incident-handoff.md.
```

The gateway timed out at 02:12. By 02:26 the queue had drained. The next shift still needs to know who owns the retry limit.

1. In the example, move the next-shift note beside the queue recovery note. Open your timeline as a private slate.
2. Open **Share** and choose **Create edit link**, then **Copy link** and **Done**. Send the invitation to the teammate collecting the second account. Anyone who receives this unlisted link can edit.
3. Ask the incoming responder to open the same board and edit the handoff note to include a name and a concrete check, such as “Mara will check the retry limit at 03:00.”
4. If the responder edited while signed out, choose **Keep in My Slates** after the note saves. This keeps the invitation in this browser without registration. Choose **Open My Slates** and look under **Recently joined**. A responder who edited while signed in can go straight to that list.
5. At shift change, select **02:26 · On-call handoff**. Follow the arrows from the timeout to the next check and read the team’s latest notes. If you skipped **Keep in My Slates**, reopen the original invitation instead.

[Try the collaboration example](https://slatebox.com/product/collaboration/) · [Open a fresh incident timeline](https://app.slatebox.com/new/incident-timeline)
