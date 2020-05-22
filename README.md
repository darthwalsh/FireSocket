[![npm](https://img.shields.io/npm/v/firesocket)](https://www.npmjs.com/package/firesocket)

# FireSocket

A drop-in replacement for WebSocket using [Firebase Realtime Database](https://firebase.google.com/docs/database).

## Examples

An example showing dynamically switching between FireSocket and WebSocket is in [example/](example/).

A [full example](https://github.com/darthwalsh/FireSocketExample) is running at https://firesocketexample.appspot.com/.

### Code changes

#### Before with WebSocket

server:

```javascript
const express = require("express");
const ws = require("ws");
const app = express();
const wss = new ws.Server({server});

wss.on("connection", ws => ...
```

client:

```javascript
const ws = new WebSocket(window.location.href.replace("http", "ws"));
ws.addEventListener("open", () => ...
```

#### Using FireSocket

server:

```javascript
const firesocket = require("firesocket");
const express = require("express");
const app = express();
const wss = firesocket.Server.createFromCreds(databaseUrl, {app, firebaseConfig});

wss.on("connection", ws => ...
```

client:

```javascript
const ws = new FireSocket(); // Args are ignored
ws.addEventListener("open", () => ...
```

### Firebase setup

- Run `npm install firesocket`
- [Install](https://firebase.google.com/docs/cli#install_the_firebase_cli) `firebase` cli
- Set up [Realtime Database](https://firebase.google.com/docs/database) security rules
  - Run `firebase login`
  - Run `firebase init` 
    - Create new project or use existing project created in [Console](https://console.firebase.google.com/)
    - Select Database
    - For security rules, use the path `node_modules/firesocket/database.rules.json`
    - Don't delete the existing file
  - Run `firebase deploy --only database`
- Set up [Authentication](https://firebase.google.com/docs/auth)
  - https://console.firebase.google.com/u/0/project/_/authentication
  - Enable Anonymous, and/or another provider to allow for resumption of socket connection
- Set up [Admin Authentication](https://firebase.google.com/docs/database/admin/start#admin-sdk-authentication) using a [Service Account](https://developers.google.com/identity/protocols/OAuth2ServiceAccount#overview)
  - Open [IAM Service accounts](https://console.developers.google.com/iam-admin/serviceaccounts)
  - Permissing needed is "Firebase Realtime Database Admin": `roles/firebasedatabase.admin`
  - If running in GCP, add admin policy to your default service account
  - OR
  - Create new service account, name i.e. "server", give admin policy
  - For non-GCP servers or local testing, create service account credentials and [store it securely](https://cloud.google.com/iam/docs/understanding-service-accounts#managing_service_account_keys)
    - `gcloud iam service-accounts keys create .test-creds.json --iam-account example@example.com`
    - set `$env:GOOGLE_APPLICATION_CREDENTIALS=".test-creds.json"`

### App setup

- On the web server, change `WebSocket` to `FireSocket`
  - `require("firesocket")`
  - (TODO split up browser part) If clients are browser-based, use `firesocket.Server.createFromCreds` factory to create Server.
  - The returned `FireSocket.Server` object is API-compatible with `WebSocket.Server`
- Download the Firebase client public [JSON config](https://support.google.com/firebase/answer/7015592) for web app
  - The web server is expected to serve this JSON at `/firebase-config.json`
  - (TODO API) the `firesocket.Server` helper will add this to your express server
- Add the script `/firesocket.js` before your web app's logic
  - Replace `WebSocket` with `FireSocket` (constructor args are ignored)
  - The `FireSocket` object is API-compatible with `WebSocket`
  - (TODO API) the `firesocket.Server` helper will serve this script

## Roadmap to release 1.0
- Basic parity with ws functionality
  - ~~message~~
  - ~~send~~
  - ~~readyState~~
  - open waits until server connects
  - ~~close~~
- ~~A/B testing source compatibility between FireSocket and WebSocket~~
- ~~Server admin authentication, supporting example server app and cli~~
- ~~Database read/write limitations on user/server~~
- Server lib for wiping some/all message state
- ~~Client authentication~~
  - ~~web~~
  - ~~cli~~
- ~~Example express server setup with HTTP serving the script file~~
- ~~npm limit files for pack release~~
- ~~bot to update dependencies~~
- ~~generate .d.ts prepack or something~~
- set up CI/CD that builds/tests/publishes to npm
  - ~~running tests in Cloud Build~~
  - ~~Set up using separate project~~
  - ~~Link from here to README in spec doc~~
  - ~~npm badge~~
  - [build badges](https://ljvmiranda921.github.io/notebook/2018/12/21/cloud-build-badge/)
  - ~~Github status checks on build success~~
  - ~~https://medium.com/@Philmod/npm-release-automation-adb970e49066~~
- firebase disconnect messages [using onDisconnect](https://firebase.google.com/docs/database/web/offline-capabilities#how-ondisconnect-works)
- Get vs code typing for firesocket.Server working
- Any TODOs left in README
- Any TODOs left in code, maybe won't fix

## Future improvements

- [ ] Authentication is pluggable, so app can swap in email/SMS/OAuth sign-in
- [ ] [Generate type declarations](https://github.com/microsoft/TypeScript/pull/32372) instead of relying on cast to WebSocket 

## Testing

Run `npm test` to run all tests. This includes unit tests, and mock tests using the firebase emulator and a local WebSocket server. See [spec/](spec/README.md) for more information.

The [example/](example/) can be useful for manually debugging changes.

## Motivation for client-server communication

### WebSocket
The default client-server communication, and by far the fastest. It's pretty simple for a [web game](https://github.com/darthwalsh/Austerity/blob/3bd2cfb825eaf8d537945c02da5b96bfe38ddca7/server/connection.js) to just update state and issue questions based on player events.

Downsides:

* Cheap hosting servers don't allow many simultaneous connections, if any
* Messages are not persisted, so a server reboot will wipe out any app state

### Firebase Database

Using [Firebase Realtime Database](https://firebase.google.com/docs/database), it is possible to emulate WebSocket messages. 

This fixes both limitations:

* Firebase is free for [100 connections users](https://firebase.google.com/pricing/), with pay-as-you-go up to 200k.
* When the server restarts it can event-source state from the database

Realtime Database was picked over Firestore because the average round trip latency of 600ms is fast enough to barely be noticed by users, while Firestore is noticeably slower at 1500ms.
[medium.com](https://medium.com/@d8schreiber/firebase-performance-firestore-and-realtime-database-latency-13effcade26d)

Guide: [Info on Data Model, Auth, Queues](https://howtofirebase.com/firebase-data-modeling-939585ade7f4)

#### Database Schema

Each game is composed of messages from server to client, and v/v.

Each firebase client listens for `child_added` on their message queue.

Here, user* is a userID from Firebase Authentication

    user:
        userWQ3mVT:
            0: Message: Connected to Game
            1: Choice: New Game, Refresh
            2: Message: Cards
            3: Choice: Play Copper, Buy Copper
        user7f8pR:
            0: Message: Connected to Game
            1: Choice: New Game, Refresh, alice's game
    server:
        userWQ3mVT:
            0: Name: alice
            1: Choice: New Game
            2: Start: Militia, Moat, ...
        user7f8pR:
            0: Name: bob
            1: Choice: Refresh
