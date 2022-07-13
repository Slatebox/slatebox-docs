---
label: Install With Docker
icon: zap
---

### Install Slatebox on your own server.

The easiest and recommended way to install Slatebox on your own server is to use the official Docker image and a Docker compose file.

!!! success
Note this guide is to install Slatebox on your own server. Alternatively, [Slatebox cloud](https://app.slatebox.com) is a free for teams, is highly scalable, and requires no setup.
!!!

!!! info
Want to modify the source code and run Slatebox as a developer instead? [Head over to the development guide](../Developers/development.md) to get started.
!!!

Ensure you have a server with [Docker](https://docs.docker.com/engine/install/) installed, then copy and paste the below into a new `docker-compose.yml` file on your server:

```
vversion: "3"

services:
  app:
    image: timheckel/slatebox-community:latest
    container_name: slatebox-community
    ports:
      - "80:3000"
    depends_on:
      - mongo
    environment:
      ROOT_URL: ${APP_ROOT_URL:-http://localhost}
      MONGO_URL: ${MONGO_URL:-mongodb://mongo:27017/meteor}
      PORT: 3000
      METEOR_SETTINGS: >
        {
          "nounProject": {
            "key": "${NOUN_PROJECT_KEY}",
            "secret": "${NOUN_PROJECT_SECRET}"
          },
          "chatWoot": {
            "userIdentityValidationToken": "${CHATWOOT_TOKEN}"
          },
          "mailGun": {
            "server": "${MAIL_URL}"
          },
          "daily": {
            "apiKey": "${DAILY_API_KEY}"
          },
          "aws": {
            "secretKey": "${AWS_SECRET_KEY}",
            "accessKey": "${AWS_ACCESS_KEY}",
            "imageBucket": "${AWS_S3_IMAGE_BUCKET}",
            "cloudUrl": "${IMAGE_CLOUD_URL}"
          },
          "googleDocs": {
            "web": {
              "client_id": "${GOOGLE_DOCS_CLIENT_ID}",
              "project_id": "${GOOGLE_DOCS_PROJECT_ID}",
              "auth_uri": "${GOOGLE_DOCS_AUTH_URI}",
              "token_uri": "${GOOGLE_DOCS_TOKEN_URI}",
              "auth_provider_x509_cert_url": "${GOOGLE_DOCS_AUTH_PROVIDER_X509_CERT_URL}",
              "client_secret": "${GOOGLE_DOCS_CLIENT_SECRET}",
              "redirect_uris": ["${GOOGLE_DOCS_REDIRECT_URIS}"],
              "javascript_origins": ["${GOOGLE_DOCS_JAVASCRIPT_ORIGINS}"]
            }
          },
          "public": {
            "env": "${MAIL_URL:-dev}",
            "dailyBaseUrl": "${DAILY_URL}",
            "baseUrl": "${BASE_URL:-http://localhost:3000}",
            "googleFontAPIKey": "${GOOGLE_API_KEY}",
            "googleImageSearchEngineKey": "${GOOGLE_IMAGE_SEARCH_API_KEY}",
            "googleImageSearchAPIKey": "${GOOGLE_API_KEY}",
            "pixabayAPIKey": "${PIXABAY_API_KEY}"
          }
        }
  mongo:
    image: mongo:latest
    container_name: mongo-slatebox
    command:
      - --storageEngine=wiredTiger
    volumes:
      - data:/data/db

volumes:
  data:
```

### Environment Variables

In order to use all of Slatebox's functionality, you'll have to set the following environment variables, as noted in the `docker-compose.yml` file above:

!!!
Note these variables are optional - you can run Slatebox with the associated functionality disabled if you do not provide these at startup.
!!!

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

Once the variables are set in your environment, run `docker compose up -d` in the same directory as your `docker-compose.yml` file. Once successfully launched, going to `http://localhost` on that server should bring up the Slatebox login page.
