# Slatebox user guide

## Start your first slate

Choose **Create slate**. Sketch on the canvas or describe the work in the conversation beside it. Try “Draw a flow from Request to Review to Approve” for three connected, editable notes. Paste steps or interview notes to give the conversation material to work with. [Create a slate](https://app.slatebox.com/new)

Ask a follow-up about the drawing. It uses your free AI for the day. For example, “Diagram the services in these notes. Show which depend on storage, and leave the reporting job separate.” Slatebox can use the notes and connections already on the canvas. Review the proposed notes and arrows, then choose **Keep changes** to add them.

To see a source and its diagram together, open the call-status example. The two paths show what happened to new and existing calls during an outage. **Open the call diagram in a private slate** gives you the same drawing to edit. [See the call diagram](https://slatebox.com/product/intelligence/)

Select a shape and tap one of its round connection handles. A connected shape appears beside it, ready for you to type its name. To place the new shape somewhere specific, drag the handle into open space. To rename any shape, select it and start typing, or double-tap it. [Try a connector on the sound map](https://docs.slatebox.com/#slatebox-documentation)

Give your slate a recognizable name. If you began as a guest, register the guest account in that browser before relying on access from another device. Keep the canvas link. People opening a private link still need permission.

If a teammate sends you an older template bookmark, the preview shows the template they chose. Choose **Use this template** to make a private copy. When the link includes a topic, you can see the name your copy will have before you open it.

## Add a branch to an interactive map

Ask the side conversation to make the flow interactive. A map has stations, paths between them and a token the team can move. The conversation can name a station, add a branch and change what happens on arrival. You can also ask Canvas AI to draft changes in your own words, from your free AI for the day. [Open a slate](https://app.slatebox.com/new)

1. Send `First upload → Preview 10 rows → Import clients`. Try the path in the preview, then choose **Keep changes**.
2. Send `Add Review duplicates after Preview 10 rows`. Try the new branch. Choose **Keep changes** to save it or **Discard** to return to the saved map.
3. Send `At Review duplicates, Keep the original customer record` to give the branch an outcome. Keep it and reopen the slate to see the result. **Undo last change** restores the previous saved map while an undo is available.
4. Choose **Present** to walk a teammate through the map. Give a teammate **edit** access to work on the same slate or **read** access to show the saved result. If someone edits while you are reviewing a proposal, discard it and ask again on the updated map.

To add artwork, send “For Review duplicates, set image https://example.org/review.jpg with description A highlighted duplicate customer record”, substituting your own HTTPS image and description. Review the change and choose **Keep changes**. [Try a map with artwork](https://slatebox.com/product/interactive-diagrams/#gallery-guide)

## Start a blank workshop

A field-recording team has one recorder on Friday. Open **Create slate**, then send “Make a workshop with Pitches and Record on Friday, limit Record on Friday to one card.” Check the names and capacity in the preview, then choose **Keep changes**. The workshop and your original drawing share one private URL. [Create a slate](https://app.slatebox.com/new)

Send each change in the conversation beside the board. Check the preview and choose **Keep changes** when it looks right.

1. If you want a different limit later, send `Set capacity of Record on Friday to 2`. Keep the single slot for this example.
2. Send `Add card Dawn chorus to Pitches`. Add “Ferry horn” and “Rain on glass” the same way.
3. Give a teammate an edit link. Drag “Dawn chorus” to **Record on Friday** or send `Move Dawn chorus to Record on Friday`. To choose “Ferry horn” instead, move the chorus back to **Pitches** first. [Share an edit link](#work-with-a-team)

To restrict a card to these two destinations, send `Allow Dawn chorus in Pitches, Record on Friday`. Future lanes stay outside its allowed destinations until you change that rule.

## Turn a workshop into a decision

Try the $600 pilot budget. Move a $200 allocation from a newsletter placement to concierge onboarding and watch the number of assisted imports change. Open the budget as a slate to keep that allocation and share it with your cofounder. [Try the pilot budget](https://slatebox.com/product/workshops/#example)

Give the move a consequence in the conversation. In the theatre example, send `Set outcome Entrance call for Warm sidelight up in Door opens: Bring up the sidelight | Hold the actor in shadow`. Keep the change and move the cue to hear the new call in the presentation. [Try the theatre cue](../Examples/theatre-cues.md)

## Work with a team

For a team slate, open **Share → Private**. Choose **edit** beside the teammate who will contribute, or **read** for someone reviewing the board. A team administrator can invite a new member through **Manage Team**. [Manage team members](../Developers/SlateboxAPI/organizations.md)

To invite someone to edit a private slate, open **Share**, choose **Create edit link**, then **Copy link** and **Done**. Send that unlisted link to your collaborator. Anyone with it can edit. On a regular canvas, they can acknowledge the welcome and edit a note. For an interactive workshop, a first-time visitor can choose **Join to edit** and make a move as a guest. You should both see the change and find it on the same board after reloading. For a read-only invitation, choose **Unlisted**, leave **Link permission** on **read** and select **Create link**. To change an existing link, choose a permission and select **Apply access**. [Try a two-person incident handoff](../Examples/incident-handoff.md)

<span id="find-a-workshop-you-joined" aria-hidden="true"></span>

### Return to a shared slate

Open **My Slates → Recently joined** and choose the board’s current title. On a whiteboard, saving an edit through a teammate’s invitation adds that exact link to your list if you are signed in, including as a Slatebox guest. Opening a board to read it leaves your list unchanged.

If you edit while signed out, your changes save to the shared board. After the first saved edit, choose **Keep in My Slates** to remember this invitation in this browser without registering. When you see **Saved to My Slates**, choose **Open My Slates**, then select the board under **Recently joined**. If you skip this step, keep the invitation to return.

On an interactive workshop, choosing **Join to edit** creates a guest session and adds the workshop to your list. If you started as a guest, open **Profile → Save my Slatebox** in the same browser before signing in on another device. [Open My Slates](https://app.slatebox.com/)

If the owner switches the invitation to **read**, the same link opens the board for viewing. Opening **Share → Private** and choosing **Make private** revokes the invitation and removes the entry. If the owner shares the slate again, ask for the new invitation. The old link stays revoked.

## Present or publish

### Present a whiteboard together

When a customer asks where their uploaded file goes, show them the path on your whiteboard. The sample follows a file through a fictional import service. Replace its retention note with your own policy before showing it to a customer. [Open the customer-file whiteboard](https://app.slatebox.com/new/customer-file)

1. Choose **Share** and give your teammate a link with **read** access. Have them open the link while you stay on the board.
2. Choose **Present notes together**. Your teammate can choose **Follow presentation** to see the note you’re discussing.
3. Use **Next** to go from the upload to the worker and then to the retained data. **Previous** takes both of you back when someone has a question.
4. Your teammate can choose **Leave presentation** to explore on their own. Choose **End presentation** to bring everyone still following back to the board.

For a solo rehearsal, choose **Present**. [Try the three views on the product page](https://slatebox.com/product/presentations/#example)

### Present a workshop together

When a reviewer needs the recovery plan first, open the conversation beside your map and type **Present Repair missing rows first**, using the scene name on your board. Check the numbered sequence, then choose **Keep changes**. To move a later scene, type **Present Approve cutover after Compare row counts**. [Try the backfill review](../Examples/review-a-backfill.md)

1. Choose **Share** and give your reviewer a link with **read** access.
2. Choose **Present together**. The reviewer opens the shared slate and chooses **Follow presentation**.
3. Use **Next station** and **Previous** to walk through the decision together. The reviewer follows your scene and its arrival instruction. **Leave presentation** returns the reviewer to the board. **End presentation** ends the live session.

This also works on saved workshops with lanes and cards. Choose **Present** for a self-paced rehearsal.

### Send a presentation for later

Choose **Publish presentation** on a saved workshop to share its current scenes with readers. Readers can advance on their own in the standalone player or a team handbook. To include later changes, republish the workshop. [Publish and embed a walkthrough](../Examples/embed-a-walkthrough.md)

## Choose where to work

Slatebox Cloud is free. AI and calls you start come with a free amount each month. [Pricing and free amounts](pricing.md) · [Self-host with Docker](../Installation/install-with-docker.md)
