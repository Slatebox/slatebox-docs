---
label: Slatebox App Development
icon: rocket
---

### Quickstart

!!! warning
Note this guide is to install and run Slatebox on your own development machine. If you want to host on your server, it is recommended that you [follow the docker installation guide](../Installation/install-with-docker.md).
!!!

Want to run Slatebox with the source code? This assumes a Linux environment - 5 easy steps:

```
   npm install -g meteor
```

```
   git clone git@github.com:Slatebox/slatebox.git
```

```
  cd slatebox/web/app
```

```
   meteor npm install
```

```
  npm run start
```

And boom, you should see `=> App running at: http://localhost:3000/` in your command line. Navigate there, and you will have Slatebox running on your machine, ready for local development. :muscle:

### Environment Variables

Environment variables can be set to extend Slatebox's functionality, but they are not necessary (the quickstart above does not set them). The environment variables available are the same as when [running Slatebox via Docker](../Installation/install-with-docker.md):

| Env Variable Name                       | Description                                                                                                                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NOUN_PROJECT_KEY                        | Enable custom shape searching in Slatebox via the NounProject. It has access to over 3 million shapes. <br/> [link](https://thenounproject.com/developers/)                          |
| NOUN_PROJECT_SECRET                     |
| CHATWOOT_TOKEN                          | Chatwoot lets you add a drop-in support widget to the site <br/> [link](https://www.chatwoot.com/)                                                                                   |
| MAIL_URL                                | Provide an smtp mail server for outgoing messages <br/> [link](https://help.mailgun.com/hc/en-us/articles/203380100-Where-Can-I-Find-My-API-Key-and-SMTP-Credentials-)               |
| GOOGLE_API_KEY                          | Google's API key is needed both for retrieving fonts <br/> [link](https://developers.google.com/custom-search/v1/overview?hl=ro)                                                     |
| GOOGLE_IMAGE_SEARCH_API_KEY             | Google's Image API key is needed both for searching images                                                                                                                           |
| PIXABAY_API_KEY                         | An API key from Pixabay is needed to search slate background images <br/> [link](https://pixabay.com/)                                                                               |
| AWS_SECRET_KEY                          | AWS credentials are required to use the copy-to-cloud-url feature when exporting a slate <br/> [link](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html)         |
| AWS_ACCESS_KEY                          | "                                                                                                                                                                                    |
| AWS_S3_IMAGE_BUCKET                     | "                                                                                                                                                                                    |
| IMAGE_CLOUD_URL                         | You can set up an alias to the cloudfront cdn (or otherwise) and use that DNS name here <br/> [link](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html) |
| GOOGLE_DOCS_CLIENT_ID                   | Google Docs can be integrated with these env variables <br/> [link](https://developers.google.com/docs/api/how-tos/overview)                                                         |
| GOOGLE_DOCS_PROJECT_ID                  | "                                                                                                                                                                                    |
| GOOGLE_DOCS_AUTH_URI                    | "                                                                                                                                                                                    |
| GOOGLE_DOCS_TOKEN_URI                   | "                                                                                                                                                                                    |
| GOOGLE_DOCS_AUTH_PROVIDER_X509_CERT_URL | "                                                                                                                                                                                    |
| GOOGLE_DOCS_CLIENT_SECRET               | "                                                                                                                                                                                    |
| GOOGLE_DOCS_REDIRECT_URIS               | "                                                                                                                                                                                    |
| GOOGLE_DOCS_JAVASCRIPT_ORIGINS          | "                                                                                                                                                                                    |
| DAILY_API_KEY                           | Integrate into daily.co for audio and video huddles <br/> [link](https://docs.daily.co/]                                                                                             |
| DAILY_URL                               | "                                                                                                                                                                                    |

Set whichever environment variables you'd lik to enable (e.g., `export PIXABAY_API_KEY='xyx'`), then restart the app with `npm run start`.
