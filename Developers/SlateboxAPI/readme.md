---
label: Slatebox API
icon: star
order: 100
---

### Introduction

The Slatebox API is a server-side API available to Slatebox PRO teams. The API lets you interact with your organization's slates programmatically, as well as manage your organization and its members. With a single prompt, you can produce editable slates for your users, programmatically integrating Slatebox visualizations with your own ecosystem.

### Authentication

Once you [sign up](https://form.jotform.com/231197009478058) for the Slatebox Private Team beta, you will be provisioned API credentials. Use the API credentials with the below code samples to authenticate with the Slatebox API.

+++ Deno

```
import "https://deno.land/std@0.184.0/dotenv/load.ts";
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";
import { crypto } from "https://deno.land/std@0.193.0/crypto/crypto.ts";
import {
  decode as base64Decode,
  encode as base64Encode,
} from "https://deno.land/std@0.166.0/encoding/base64.ts";
import process from "https://deno.land/std@0.177.0/node/process.ts";

const publicKey = Deno.env.get("YOUR_PUBLIC_KEY");
const secretKey = Deno.env.get("YOUR_SECRET_KEY");
const baseUrl = "https://api.slatebox.com/v1;
const timestamp = new Date().toISOString();

const token = hmac(
  "sha256",
  secretKey,
  `${publicKey}:${timestamp}`,
  "utf8",
  "base64"
);

// Once you have the token above, ensure both the token and the timestamp are included as headers on the call
// headers: { authorization: token, timestamp: timestamp, accept: "application/json", content-type: "application/json" }

```

+++ Python

```
import requests
import hmac
import hashlib
import datetime
import base64

baseUrl = "https://api.slatebox.com/v1"

publicKey = "YOUR_PUBLIC_KEY"
secretKey = "YOUR_SECRET_KEY"

now = datetime.datetime.now()
timestamp = now.strftime("%Y-%m-%dT%H:%M:%SZ")

msg = f"{publicKey}:{timestamp}"
# Compute the HMAC of the message using the SHA-256 hash function
hmac_value = base64.b64encode(
    hmac.new(
        secretKey.encode("utf-8"),
        msg.encode("utf-8"),
        hashlib.sha256,
    ).digest()
).decode()

auth = f"{publicKey}:{hmac_value}"

# Ensure the request has the headers
headers = {
    "authorization": base64.b64encode(auth.encode()).decode(),
    "accept": "application/json",
    "timestamp": timestamp,
    "content-type": "application/json",
}
```
