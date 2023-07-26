---
label: Slates
icon: star
order: 300
---

### /v1/slates endpoint

The `/v1/slates` endpoint lets you dynamically produce a slate.

To make the invocation, you need to POST the below JSON to `/v1/slates/create`:

```
{
  "imageId": "image_1", // optional id for your image
  "type": "scratch",  # scratch|url|template
  "prompt": "Long form prompt (or short form) of what you want the slate about", // for URL type, this should be the URL
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
