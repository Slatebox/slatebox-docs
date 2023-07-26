---
label: Slates
icon: star
order: 500
---

### /v1/slates endpoint

!!!
You must have a Slatebox TEAM subscription to make this call. [Sign up for FREE access here](https://form.jotform.com/231197009478058).
!!!

The `/v1/slates/create` endpoint lets you programmatically produce an editable slate, accessible via your TEAM portal at [slatebox](https://app.slatebox.com).

To make the invocation, you need to POST the below JSON to `/v1/slates/create`:

```
{
  "imageId": "image_1", // optional id for your image
  "type": "scratch",  # scratch|url|template
  "prompt": "Long form prompt (or short form) of what you want the slate about", // for URL type, this should be the URL
  "templateId": "" // necessary for a "template" type -- [the template ids are here](https://slatebox.com/templates)
  "async": true, // true if you want an id returned quickly that you can correlate with the webhooks; false if you want the POST to wait for the slate to be created
  "userId": "xxx", // userid pulled from your organization
  "tone": "witty", // what tone?  Whatever phrase you like
  "levelOfDetail": "5", // 1 = least detail, 10 = lots of detail
  "wordsPerNode": "25", // how many words per node?
  "themeId": "ocean", // one of Slatebox themes
  "webhooks": {
      "onComplete": "", // be notified via POST of the jobs's completion
      "onError": "", // be notified via POST of any failures.
  },
}
```

!!!
You MUST provide a valid userId from your organization to the `body` to make this call. You can get all the possible \_ids by making the `/v1/organization/users` call [described here](./organizations.md).
!!!

Currently, there are three types of visualizations you can make:

1. Scratch - this is a mindmap diagram "from scratch" about whatever `prompt` you provide.
2. Template - based on the [templates](https://slatebox.com/templates) at Slatebox, you can provide a `prompt` that describes the issue for which you're using the template, and a `templateId` like `pro-con` or `swot-analysis` that you'd like to generate.
3. URL - this produces a mindmap diagram based on the text of the URL provided in the `prompt`.

Below are code samples of how to make this call, but note you must [produce the authentication header](./readme.md) to send along with the request.

+++ Deno/Node

```
const body = {
  imageId: "image_1",
  type: "scratch", //url|template
  prompt:
    'long or short prompt',
  tone: "witty",
  levelOfDetail: "5",
  wordsPerNode: "25",
  themeId: "ocean",
  userId: "xyz",
  webhooks: {
    onComplete: "https://webhook.site/27078c5e-722f-4ce5-990d-9fc46911177a",
    onError: "https://webhook.site/27078c5e-722f-4ce5-990d-9fc46911177a",
  },
};

const resp = await fetch(`${baseUrl}/v1/slate/create`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: base64Encode(`${publicKey}:${token}`),
    Timestamp: timestamp,
  },
  body: JSON.stringify(body),
});

console.log("resp is ", await resp.json());
```

+++ Python

```
headers = {
    "authorization": base64.b64encode(auth.encode()).decode(),
    "accept": "application/json",
    "timestamp": timestamp,
    "content-type": "application/json",
}

body = {
    "imageId": "image_1",
    "type": "scratch",  # scratch|url|template
    "prompt": "The long tail of history in wwII memory",  # https://en.wikipedia.org/wiki/Manhattan_Project
    "async": False,
    "userId": "xxx",
    "tone": "witty",
    "levelOfDetail": "5",
    "wordsPerNode": "25",
    "themeId": "ocean",
    "userId": "xyz",
    "webhooks": {
        "onComplete": "https://webhook.site/58dc9462-2e64-488b-a539-c40b5df2d8bc",
        "onError": "https://webhook.site/58dc9462-2e64-488b-a539-c40b5df2d8bc",
    },
}

url = f"{baseUrl}/v1/slate/create"
resp = requests.post(url, headers=headers, json=body)

res = resp.json()
print(res)
```

+++

### Response

The calls will return the below JSON:

```
{
  "id": "image_1",
  "final": true,
  "error": false,
  "pngUrl": "https://files.slatebox.com/82c99f53_XXX.png", // URL to a PNG of the slate
  "slateUrl": "https://app.slatebox.com/canvas/XXX" // URL to the editable slate
}
```
