# Slatebox user guide

## Start your first slate

1. Choose **Create slate**. [Create a slate](https://app.slatebox.com/new)
2. Sketch on the canvas, or describe the work in the conversation beside it. “Draw a flow from Request to Review to Approve” gives you three connected, editable notes.
3. Paste steps or interview notes to give the conversation material. Ask a follow-up such as “Diagram the services in these notes. Show which depend on storage, and leave the reporting job separate.” It uses the notes and connections already on the canvas, and your AI: your own connection, or Pro credits.
4. Review the proposed notes and arrows, then choose **Keep changes**.

To add a shape, select one and tap a round connection handle: a connected shape appears, ready for its name. Drag the handle into open space to place it. To rename a shape, select it and type, or double-tap it. [Try a connector on the sound map](https://docs.slatebox.com/#slatebox-documentation)

To see a source next to its diagram, open the call-status example and choose **Open the call diagram in a private slate**. [See the call diagram](https://slatebox.com/product/intelligence/)

Name your slate and keep its link. People opening a private link still need permission. If you began as a guest, register in that browser before you rely on the slate from another device.

## Export or import Mermaid

Choose **Mermaid** in the slate menu to copy or download any slate as Mermaid, or to paste Mermaid in as real notes and lines. It is free and uses no AI. [Export and import Mermaid](mermaid.md)

## Add a branch to an interactive map

A map has stations, paths between them and a token the team moves. Send each change in the conversation, try it in the preview, and choose **Keep changes** or **Discard**. [Open a slate](https://app.slatebox.com/new)

1. Send `First upload → Preview 10 rows → Import clients`.
2. Send `Add Review duplicates after Preview 10 rows`.
3. Send `At Review duplicates, Keep the original customer record` to give the branch an outcome. Reopen the slate to see it saved. **Undo last change** restores the previous saved map while an undo is available.
4. Choose **Present** to walk a teammate through it.

You can also ask Canvas AI for changes in your own words, with your own AI connection or Pro credits. If someone edits while you review a proposal, discard it and ask again.

To add artwork, send “For Review duplicates, set image https://example.org/review.jpg with description A highlighted duplicate customer record” with your own HTTPS image. [Try a map with artwork](https://slatebox.com/product/interactive-diagrams/#gallery-guide)

## Start a blank workshop

Example: a field-recording team has one recorder on Friday.

1. Choose **Create slate** and send “Make a workshop with Pitches and Record on Friday, limit Record on Friday to one card.” Check the preview and choose **Keep changes**. The workshop shares the slate's private URL. [Create a slate](https://app.slatebox.com/new)
2. Send `Add card Dawn chorus to Pitches`. Add “Ferry horn” and “Rain on glass” the same way.
3. Drag “Dawn chorus” to **Record on Friday**, or send `Move Dawn chorus to Record on Friday`. The lane holds one card, so move it back to **Pitches** before choosing “Ferry horn”.

| To | Send |
| --- | --- |
| Change a lane's limit | `Set capacity of Record on Friday to 2` |
| Restrict a card to some lanes | `Allow Dawn chorus in Pitches, Record on Friday`. New lanes stay closed to it until you change the rule. |

Give a teammate an [edit link](#work-with-a-team) to move cards together.

## Turn a workshop into a decision

Give a move a consequence. In the theatre example, send `Set outcome Entrance call for Warm sidelight up in Door opens: Bring up the sidelight | Hold the actor in shadow`, keep it, and move the cue to hear the new call in the presentation. [Try the theatre cue](../Examples/theatre-cues.md)

For a budget, try moving $200 of the $600 pilot from a newsletter placement to concierge onboarding and watch assisted imports change. Open it as a slate to keep and share it. [Try the pilot budget](https://slatebox.com/product/workshops/#example)

## Work with a team

| To | Do this |
| --- | --- |
| Give a teammate access | **Share → Private**, then **edit** or **read** beside their name. |
| Invite a new team member | A team administrator opens **Manage team** in the menu. |
| Share an edit link | **Share → Create edit link → Copy link → Done**. Anyone with the link can edit. |
| Share a read-only link | **Share → Unlisted**, leave **Link permission** on **read**, then **Create link**. |
| Change an existing link | Choose a permission, then **Apply access**. |

On an interactive workshop, a first-time visitor chooses **Join to edit** to move a card as a guest. Both of you see the change, and it is still there after a reload. [Try a two-person incident handoff](../Examples/incident-handoff.md)

<span id="find-a-workshop-you-joined" aria-hidden="true"></span>

### Return to a shared slate

Open **My Slates → Recently joined** and choose the board. A board appears there after you save an edit through an invitation while signed in, including as a guest. Opening a board only to read it does not add it. [Open My Slates](https://app.slatebox.com/)

- **Signed out:** your edits still save. After the first one, choose **Keep in My Slates**, then **Open My Slates**. Otherwise keep the invitation link.
- **Interactive workshop:** **Join to edit** creates a guest session and adds the workshop to your list. Before signing in on another device, open **Profile → Save my Slatebox** in the same browser.
- **Owner changes the link:** switched to **read**, the link opens the board for viewing. **Share → Private → Make private** revokes it for good; ask for a new invitation.

## Present or publish

### Present a whiteboard together

The customer-file sample follows an upload through a fictional import service. Replace its retention note with your own policy before showing a customer. [Open the customer-file whiteboard](https://app.slatebox.com/new/customer-file)

1. Choose **Share** and give your teammate a **read** link.
2. Choose **Presentation options → Present to everyone here** (the arrow beside **Present**). Your teammate chooses **Follow presentation**.
3. Use **Next** and **Previous** to move through the notes together.
4. Your teammate can choose **Leave presentation** to explore alone. **End presentation** brings everyone back to the board.

To rehearse alone, choose **Present**. [Try the three views](https://slatebox.com/product/presentations/#example)

### Present a workshop together

1. In the conversation, set the order: **Present Repair missing rows first**, or **Present Approve cutover after Compare row counts**, using your scene names. Check the sequence and choose **Keep changes**. [Try the backfill review](../Examples/review-a-backfill.md)
2. Choose **Share** and give your reviewer a **read** link.
3. Choose **Presentation options → Present to everyone here**. The reviewer opens the slate and chooses **Follow presentation**.
4. Use **Next** and **Previous**. **Leave presentation** returns the reviewer to the board; **End presentation** ends the session.

To rehearse alone, choose **Present**.

### Send a presentation for later

Choose **Publish presentation** on a saved workshop. Readers step through its scenes on their own, in the standalone player or embedded in a handbook. Publish again to include later changes. [Publish and embed a walkthrough](../Examples/embed-a-walkthrough.md)

## Choose where to work

Slatebox Cloud is free. AI and calls are free with your own keys, or come with Slatebox Pro. [Pricing](pricing.md) · [Slatebox Pro](slatebox-pro.md) · <!-- feature:self-host -->[Run your own Slatebox](../Installation/install-with-docker.md)<!-- /feature:self-host --><!-- feature:!self-host -->[Run your own Slatebox](../Installation/self-hosting.md)<!-- /feature:!self-host --><!-- feature:private --> · [Have us run one for your company](slatebox-private.md)<!-- /feature:private -->
