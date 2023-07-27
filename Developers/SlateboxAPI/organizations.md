---
label: Organizations
icon: star
order: 400
---

### /v1/organization endpoint

!!!
You must have a Slatebox TEAM subscription to make these call. [Sign up for FREE access here](https://form.jotform.com/231197009478058).
!!!

## `/v1/organization/users`

The `/v1/organization/users` endpoint gives you information about what users are in your org (determined via your authentication).

Below are code samples of how to make this GET call, but note you must [produce the authentication header](./readme.md) to send along with the request.

+++ Deno/Node

```
const resp = await fetch(`${baseUrl}/v1/organization/users`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: base64Encode(`${publicKey}:${token}`),
    Timestamp: timestamp,
  }
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

url = f"{baseUrl}/v1/organization/users"
resp = requests.get(url, headers=headers)

res = resp.json()
print(res)
```

+++

### Response

The calls will return the below JSON:

```
{
  "_id": "xxx", // userId - important: this MUST be provided in the /v1/slate/create call
  "created": "123", // timestamp of creation
  "firstName": "Tim",
  "lastName": "Slate",
  "email": "timslate@slatebox.com",
  "isEmailVerified": true,
  "clientId": "xxx",
  "whiteListedIPs": "*",
  "isPro": true,
  "isOrgOwner": true
}

```

## `/v1/organization`

The `/v1/organization` endpoint gives you information about your own org on Slatebox (determined via your authentication).

Below are code samples of how to make this GET call, but note you must [produce the authentication header](./readme.md) to send along with the request.

+++ Deno/Node

```
const resp = await fetch(`${baseUrl}/v1/organization`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: base64Encode(`${publicKey}:${token}`),
    Timestamp: timestamp,
  }
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

url = f"{baseUrl}/v1/organization"
resp = requests.get(url, headers=headers)

res = resp.json()
print(res)
```

+++

### Response

The calls will return the below JSON:

```
{
  _id: "xxx",
  name: "MyOrgName",
  isPro: true,
  hasProvisionedAPIKeys: true,
}
```
