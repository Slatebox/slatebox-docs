---
label: Slatebox App Development
icon: rocket
---

### Quickstart

!!! warning
Note this guide is to install and run Slatebox on your own development machine. If you want to host on your server, it is recommended that you [follow the docker installation guide](../Installation/install-with-docker.md).
!!!

Want to run Slatebox with the source code? This assumes a Linux environment - 5 easy steps:

1. ```
   npm install -g meteor
   ```

2. ```
   git clone git@github.com:Slatebox/slatebox.git
   ```

3. ```
   cd slatebox/web/app
   ```

4. ```
   meteor npm install
   ```

5. ```
   npm run start
   ```

And boom, you should see `=> App running at: http://localhost:3000/` in your command line. Navigate there, and you will have Slatebox running on your machine, ready for local development. :muscle:

### Environment Variables

Environment variables can be set to extend Slatebox's functionality, but they are not necessary (the quickstart above does not set them). The environment variables available are the same as when [running Slatebox via Docker](../Installation/using-docker.md):

| Env Variable Name           | Description                                                                                            | Link                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| NOUN_PROJECT_KEY            | Enable custom shape searching in Slatebox via the NounProject. It has access to over 3 million shapes. | https://thenounproject.com/developers/                                                                 |
| NOUN_PROJECT_SECRET         |                                                                                                        | https://thenounproject.com/developers/                                                                 |
| CHATWOOT_TOKEN              | Chatwoot lets you add a drop-in support widget to the site                                             | https://www.chatwoot.com/                                                                              |
| MAIL_URL                    | Provide an smtp mail server for outgoing messages                                                      | https://help.mailgun.com/hc/en-us/articles/203380100-Where-Can-I-Find-My-API-Key-and-SMTP-Credentials- |
| GOOGLE_API_KEY              | Google's API key is needed both for retrieving fonts                                                   | https://developers.google.com/custom-search/v1/overview?hl=ro                                          |
| GOOGLE_IMAGE_SEARCH_API_KEY | Google's Image API key is needed both for searching images                                             | https://developers.google.com/custom-search/v1/overview?hl=ro                                          |
| PIXABAY_API_KEY             | An API key from Pixabay is needed to search slate background images                                    | https://pixabay.com/                                                                                   |

Set whichever environment variables you'd lik to enable (e.g., `export PIXABAY_API_KEY='xyx'`), then restart the app with `npm run start`.
