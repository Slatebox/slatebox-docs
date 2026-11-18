# SlateboxJS 2.x and the current canvas

## Agent prompt

```text
Help me implement “SlateboxJS 2.x and the current canvas” with SlateboxJS in my project. Use the documented library interfaces and provide a runnable example that verifies the result.

Read https://docs.slatebox.com/Developers/slateboxjs-api.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/slateboxjs-api.md.
```

If your code creates a board with `new Slatebox.slate(...)`, you’re using the 2.x API. The public GitHub repository contains version 2.5.17. To build a new canvas with the engine used in Slatebox today, open the [current quickstart](JavascriptLibrary/readme.md#quick-slate). You can run and download a two-note board directly from that guide.

## Maintain a 2.x integration

Version 2.5.17 exports `Slatebox`. Its browser fixture shows how to create a slate and configure its canvas. Use the source from this version when looking up options for an existing integration. [2.x browser fixture](https://github.com/Slatebox/slateboxjs/blob/e79a3f49ab632a958997cbd5fe27314452c6a14a/tests/playwright/fixtures/slate-test.html) · [2.x slate implementation](https://github.com/Slatebox/slateboxjs/blob/e79a3f49ab632a958997cbd5fe27314452c6a14a/src/core/slate.js)

## Move an integration to the current engine

| Task | SlateboxJS 2.x | Current SlateboxJS |
| --- | --- | --- |
| Create a board | Construct `Slatebox.slate` with the board options. | Import `Slate` and pass a container and options to its constructor. |
| Add a note | Create a `Slatebox.node` and pass it to `slate.nodes.add(node)`. | Call `slate.addNode(options)` and await the returned node’s `ready` promise before connecting it. |

Try those changes on the [connected-notes example](../Examples/connected-notes.md). For a saved board, load a copy and check its labels, connections and shapes before switching your application. The [slate methods reference](JavascriptLibrary/slate-methods.md#loadjson) covers loading and saving.
