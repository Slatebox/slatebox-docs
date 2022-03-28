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
version: "3"

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
          "public": {
            "env": "${MAIL_URL:-dev}",
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

| Env Variable Name           | Description                                                                                            | Link                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| NOUN_PROJECT_KEY            | Enable custom shape searching in Slatebox via the NounProject. It has access to over 3 million shapes. | https://thenounproject.com/developers/                                                                 |
| NOUN_PROJECT_SECRET         |                                                                                                        | https://thenounproject.com/developers/                                                                 |
| CHATWOOT_TOKEN              | Chatwoot lets you add a drop-in support widget to the site                                             | https://www.chatwoot.com/                                                                              |
| MAIL_URL                    | Provide an smtp mail server for outgoing messages                                                      | https://help.mailgun.com/hc/en-us/articles/203380100-Where-Can-I-Find-My-API-Key-and-SMTP-Credentials- |
| GOOGLE_API_KEY              | Google's API key is needed both for retrieving fonts                                                   | https://developers.google.com/custom-search/v1/overview?hl=ro                                          |
| GOOGLE_IMAGE_SEARCH_API_KEY | Google's Image API key is needed both for searching images                                             | https://developers.google.com/custom-search/v1/overview?hl=ro                                          |
| PIXABAY_API_KEY             | An API key from Pixabay is needed to search slate background images                                    | https://pixabay.com/                                                                                   |

Once the variables are set in your environment, run `docker compose up -d` in the same directory as your `docker-compose.yml` file. Once successfully launched, going to `http://localhost` on that server should bring up the Slatebox login page.
