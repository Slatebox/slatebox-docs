# The shared library

## Agent prompt

```text
Help me complete my task in Slatebox using the official app guide. Ask which outcome I want, then walk me through the relevant steps and verify it on my slate.

Read https://docs.slatebox.com/Using-Slatebox/library.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Using-Slatebox/library.md.
```

The library holds smart components, slates and presentations that people built on Slatebox and shared. Copy any of them, add a component to your slate, or branch off one and make it your own. Browsing, copying, branching and publishing are free; only AI turns use Pro credits or your balance.

## Browse

Open **Library** in the menu, or go to [app.slatebox.com/library](https://app.slatebox.com/library). You do not need to sign in.

| To | Do this |
| --- | --- |
| Show one kind | Choose **Smart components**, **Slates** or **Presentations**. |
| Show one category | Choose **Plan**, **Decide**, **Meetings**, **Track** or **Map**. |
| Find something | Type in **Search the library**. |
| See what people use most | Sort by **Most used**. |

Each item's page shows a live picture of it, who made it, what it was branched or forked from, its version and its license. A component also lists phrases to say in chat on any slate. The same library is public at [slatebox.com/gallery](https://slatebox.com/gallery/).

## Use something from the library

| Item | Choose | You get |
| --- | --- | --- |
| Slate or presentation | **Open a copy** | A new private slate of yours. A presentation comes with its steps, ready to present. |
| Smart component | **Add to a slate** | The board on a new slate, or beside the boards of a slate you pick. A slate holds up to 8 boards. |
| Smart component | **Branch off** | A builder slate with your own copy of the board (see below). |

If you are not signed in, Slatebox makes you a guest first, so the copy is yours in this browser. Register before you rely on it from another device. Your copy says where it came from beside its name ("Copy of Launch plan by Ada Author"), which credits the original's author as its license asks.

In a slate, **Add to this slate** in Ask Slatebox lists the same components, your own under **Yours**.

## Build your own smart component

1. Start from scratch: on a new slate, choose **Build a board of my own** in Ask Slatebox. Or open a component in the library and choose **Branch off**.
2. Say what the board should do, or pick a shape: **Columns**, **Lists in lists**, a tree, a timeline or a 2 by 2. Check the preview and keep it. The board grows on the canvas with each change you keep.
3. Set how it behaves. Say it ("Let Review hold 3"), or drag the controls drawn on the board: a lane's limit line, the arrows between lanes, a deadline, a freeze band. Each control makes the same change chat would.
4. Choose **Save** in the bar above the canvas. Give it a name, one line on what it does, and a category. It is saved to your library: add it to any slate from **Add to this slate → Yours**.

A branch stays in the category of the component it came from, and says so in the bar.

### The controls on the board

On a builder slate the controls are always drawn on the board. On any other slate they show on a board you select, if you can edit the slate.

| On | Control | Does |
| --- | --- | --- |
| A board of columns | The limit line after a column's last slot | Drag it, or use its − and +, to set how many cards the column holds. Hold it (or right-click) to switch between refusing and only warning. |
| A board of columns | The archive box on a column's header | Makes the column an archive: it takes every card, whatever its limit, and deletes nothing. |
| A board of columns | The arrow between two columns | Lets cards move only one way between them. |
| A board of columns | **One column at a time** | Stops cards skipping columns. |
| A board of columns | The dashed column with a + | Adds a column. |
| A sales pipeline | Each stage's − and +, and its padlock | Sets the stage's limit, and whether a deal needs an amount to enter it. |
| A launch or hiring plan | Snap, the go-live line, what a slip does | Moves by day or week; makes go-live a hard or soft line; says whether a slip pushes what waits. |
| A nested board | The ladder of levels, and − and + | Sets how deep cards nest and how many a card holds. |

Point at a control, or select it with **Tab**, and it says what it does ("Make To do a bin that archives cards"). With the keyboard, then press **Enter** to tap it, the arrow keys to move it, or **Delete** to remove its rule. Anything else is set in chat, for example "Let Done hold 4"; the board lists every rule under "How this board behaves".

Each change is saved at once as one step of your history: the canvas's **Undo** (Ctrl+Z, ⌘Z on a Mac) takes it back, and **Redo** makes it again. The next card you drag follows the new rule.

### Start from a branch

**Branch off** gives you a copy of the component on a new builder slate. The bar says what it was branched from, for example "Branched from Retro (Meetings)". Change it as you like; the original is not changed, and its author is credited when you publish yours.

## Publish to the library

| What | Where | Choose |
| --- | --- | --- |
| A smart component | The bar on its builder slate | **Submit to the library** |
| A slate | **Share** | **Publish to the library**, then **Send for review** |
| A presentation | The presentation settings, after you publish it | **Publish to the library**, then **Send for review** |

Add a note for the reviewer if you like. Everything is reviewed before it is published; once it is, anyone can find it, use it and change their copy. Published items are shared under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), and the credit to you is shown automatically. You need an account to publish: a guest is asked to register first.

Follow your submissions in **My library** ([app.slatebox.com/library/mine](https://app.slatebox.com/library/mine)):

| Status | What it means | What you can do |
| --- | --- | --- |
| Submitted, In review | A reviewer has it. | **Withdraw** it, or write to the reviewer. |
| Changes asked for | The reviewer wrote what to change. | Change it, then **Send it again**. |
| Published | It is in the library for everyone. | Send an update; the published version stays until the update is approved. **Withdraw the update** takes back only the update. **Take it out of the library** removes the item. |
| Not accepted | The reviewer said why. | Change it and send it again. |

When a reviewer publishes your item, asks for changes, turns it down or writes to you, you get a notice under the bell and an email, with their message and a link to My library. Open an item in My library to read its whole thread and to write back.

The reviewer may make small changes before publishing, such as a clearer name or a tighter rule. They change a private review copy, never your slate. What is published is the reviewed copy. Saving a published component again changes nothing others see until your update is reviewed and approved.

## Review submissions (administrators)

A server administrator opens [app.slatebox.com/admin/library](https://app.slatebox.com/admin/library) to see what is waiting, oldest first.

1. Choose **Open for review**. Slatebox makes a private review copy and opens it beside a review panel.
2. Ask Slatebox in the panel to refine it ("Tighten the rules", "Put it in Decide"), or change the copy yourself. Each proposal shows what would change before you keep it.
3. Choose **Approve and publish**, **Send back** with a message for the author, or **Reject** with the reason. What you approve is the review copy, with your refinements.

Another administrator reviews what you submit yourself. If you are the server's only administrator, the review page offers **Review it myself**, and the thread records it. The refine chat is yours: the author sees what you decided and what changed, not what you asked the AI.

To take a published item down, choose **Take it out of the library**; copies people already made stay theirs. Agents and scripts can do every step too. [Library API](../Developers/SlateboxAPI/library.md)
