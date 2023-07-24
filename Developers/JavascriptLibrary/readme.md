---
label: Javascript Library
icon: star
order: 100
---

### Introduction

Slateboxjs is an [MIT-licensed standalone javascript library](https://github.com/Slatebox/Slateboxjs) that can be used to create diagrams, mind-maps, and more on an infinite campus. It's the same underlying library used in the self-hostable [Slatebox App](./development.md) and the cloud offering at [Slatebox.com](https://app.slatebox.com).

---

### Quick Slate

Here is a simple codepen example of a slate with 2 connected nodes.

<iframe height="600" style="width: 100%;" scrolling="no" title="Slatebox - 2 Nodes" src="https://codepen.io/timheckel/embed/JjMNKmP?default-tab=js%2Cresult&editable=true&theme-id=dark" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/timheckel/pen/JjMNKmP">
  Slatebox - 2 Nodes</a> by Tim Heckel (<a href="https://codepen.io/timheckel">@timheckel</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

---

#### Installation

The easiest is just as an npm module.

`npm i slateboxjs`

---

### Development

Do you want to contribute to the slateboxjs core to do bug fixes or feature enhancements? Excellent. Please reach out on the [community forums](https://community.slatebox.com) with questions.

Follow these steps to get slateboxjs running locally:

`git clone git@github.com:Slatebox/slateboxjs.git`

`cd slateboxjs`

`npm install`

`npm run start`

This will open up `http://localhost:1234` with a node and a slate attached.

!!!
Under the covers, Slateboxjs uses the [parcel](https://parceljs.org) library to build and serve the module.
!!!
