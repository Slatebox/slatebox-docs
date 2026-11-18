# Slatebox user guide

## Start your first slate

Choose **Open a blank slate** for a freeform canvas. Add a note for the decision, add one for the evidence, and connect them. Choose **Create an interactive map** when participants should move a token along paths you define. [Start a slate](https://app.slatebox.com/start)

Select a shape and tap one of its round connection handles to add a blank shape beside it. To place the new shape somewhere specific, drag the handle into open space. Double-tap the new shape to name it, or select it and press **F2**. [Try a connector on the sound map](https://docs.slatebox.com/#slatebox-documentation)

Give your slate a recognizable name. If you began as a guest, register the guest account in that browser before relying on access from another device. Keep the canvas link. People opening a private link still need permission.

## Add a branch to an interactive map

On **Start**, choose **Create an interactive map**. Your private **Untitled map** opens with one token and a path from **Start** to **Next step**. To explore a finished example first, choose **Try a sample map** on the same start screen. [Create an interactive map](https://app.slatebox.com/new/map) · [Try a sample map](https://app.slatebox.com/workshops?format=map)

1. Choose **Add a branch**. Under **Branch from**, select **Next step**.
2. For **Name**, enter “Listening buoy”. For **On arrival**, enter “Record the bell before the tide turns.” Choose **Save branch**.
3. Move **Token → Next step**, then **Token → Listening buoy**. The arrival text appears with the token. Reopen the slate to pick up where you left it.
4. Choose **Present** and advance with **Next station** to show the listening buoy and its cue. To let someone explore the saved map at their own pace, choose **Share**, select **Unlisted**, leave **Link permission** on **read**, then choose **Create link** and **Copy link**.

To show a photo or illustration when someone takes a branch, select the destination on the map and open **Add a station image**. Paste its HTTPS address, describe the image for someone who cannot see it, and choose **Save changes**. You can replace or remove it under **Edit station image**. [Try a map with artwork](https://slatebox.com/product/interactive-diagrams/#gallery-guide)

## Start a blank workshop

A field-recording team has one recorder on Friday. Give everyone a place to pitch sounds, then let the team choose which one gets the slot. [Start a blank workshop](https://app.slatebox.com/new/workshop)

1. The new private slate opens as **Untitled workshop** with two empty lanes. Select the **Lane 1** heading, change **Name** to “Pitches” and choose **Save changes**. Rename **Lane 2** to “Record on Friday”, set **Capacity** to **1**, and save.
2. In **Pitches**, choose **Add card**. Enter “Dawn chorus” under **Card name** and choose **Add card** to save it. Add “Ferry horn” and “Rain on glass” the same way. For another destination, choose **Add lane**, give it a name and set a capacity if needed.
3. Share an edit link with a teammate. Drag “Dawn chorus” to **Record on Friday**, or open **Move a card by name** and select the lane. The single slot is full. To choose “Ferry horn” instead, move the chorus back to **Pitches**, then move the horn into Friday. Both editors see the same choice. [Share an edit link](#work-with-a-team)

To keep “Dawn chorus” out of a third lane, open **Edit an object**, select the card and find **Where this card can move**. Clear **Any lane, including new lanes**, choose **Record on Friday** and save. The card keeps its current lane, and teammates see only the permitted destinations that have room.

## Turn a workshop into a decision

Try the listening room. Move the horn toward the glass chimes until both recordings overlap. Open your mix as a slate, rename a sound source, and present the mix you chose. Your teammate can reopen the same board and try another balance. [Try the listening room](https://slatebox.com/product/workshops/)

To show what a move means, choose **Edit an object**, select a card and choose **Add placement outcome**. Pick its destination and write what teammates should see with the card there and with it elsewhere. Save the change, move the card, then present that destination to read the result. [Try it with a theatre cue](../Examples/theatre-cues.md)

## Work with a team

For a team slate, open **Share → Private**. Choose **edit** beside the teammate who will contribute, or **read** for someone reviewing the board. A team administrator can invite a new member through team settings. [Manage team members](../Developers/SlateboxAPI/organizations.md)

To invite someone to edit a private slate, open **Share**, choose **Create edit link**, then **Copy link** and **Done**. Send that unlisted link to your collaborator. Anyone with it can edit. On a regular canvas, they can acknowledge the welcome and edit a note. For an interactive workshop, a first-time visitor can choose **Join to edit** and make a move as a guest. You should both see the change and find it on the same board after reloading. For a read-only invitation, choose **Unlisted**, leave **Link permission** on **read** and select **Create link**. To change an existing link, choose a permission and select **Apply access**. [Try a two-person incident handoff](../Examples/incident-handoff.md)

<span id="find-a-workshop-you-joined" aria-hidden="true"></span>

### Return to a shared slate

Open **My Slates → Recently joined** and choose the board’s current title. On a whiteboard, saving an edit through a teammate’s invitation adds that exact link to your list if you are signed in, including as a Slatebox guest. Opening a board to read it leaves your list unchanged.

If you edit while signed out, your changes save to the shared board. After the first saved edit, choose **Keep in My Slates** to remember this invitation in this browser without registering. When you see **Saved to My Slates**, choose **Open My Slates**, then select the board under **Recently joined**. If you skip this step, keep the invitation to return.

On an interactive workshop, choosing **Join to edit** creates a guest session and adds the workshop to your list. If you started as a guest, open **Profile → Save my Slatebox** in the same browser before signing in on another device. [Open My Slates](https://app.slatebox.com/)

If the owner switches the invitation to **read**, the same link opens the board for viewing. Opening **Share → Private** and choosing **Make private** revokes the invitation and removes the entry. If the owner shares the slate again, ask for the new invitation. The old link stays revoked.

## Present or publish

### Present a workshop together

A curator and a reviewer can visit the same detail at the same time. In the gallery guide, add **Look at the brushwork**, then choose **Open my guide in Slatebox** to save your map. [Build a gallery guide](https://slatebox.com/product/interactive-diagrams/#gallery-guide)

1. On the saved map, choose **Share** and give the reviewer a link with **read** access. They can follow with that permission.
2. As an editor, choose **Present together**. Ask the reviewer to open the shared board link and choose **Follow presentation**.
3. Advance to **Look at the brushwork**. The reviewer’s player follows you to the same detail and arrival text. The reviewer can choose **Leave presentation** to return to the board. Choose **End presentation** when you’re done to return the remaining followers to the board.

This also works on saved workshops with lanes and cards. Choose **Present** for a self-paced rehearsal.

### Send a presentation for later

Choose **Publish presentation** on a saved workshop to share its current scenes with readers. Readers can advance on their own in the standalone player or a team handbook. To include later changes, republish the workshop. [Publish and embed a walkthrough](../Examples/embed-a-walkthrough.md)

## Choose where to work

Individuals can create unlimited slates on the free hosted plan. Pro adds AI capabilities. Team plans support a shared organization. Open the plan chooser for current features and billing options. Organizations with their own infrastructure can operate the app, relay and database together. [Hosted plans](https://app.slatebox.com/plans) · [Self-host with Docker](../Installation/install-with-docker.md)

## Manage a hosted subscription

Open **Profile → Billing** to see your subscription in Stripe. If you schedule a cancellation, the portal shows the date your subscription ends. You can keep using paid workshop tools until then. When a Pro subscription ends, your individual account returns to Free. [Open your profile](https://app.slatebox.com/profile)
