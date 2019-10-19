# FireSocket

A drop-in replacement for WebSocket using [Firebase Realtime Database](https://firebase.google.com/docs/database).

## Example

TODO(example) example snippet
TODO(example) example code showing where to plugin public/secret firebase config

## Installation

`npm install` TODO(npm)

### Roadmap to release 1.0
- Basic parity with ws functionality
  - ~~message~~
  - ~~send~~
  - ~~readyState~~
  - open waits until server connects
  - close
- A/B testing source compatibility between FireSocket and WebSocket
- Database read/write limitations on user/server
- Server admin authentication, supporting example server app and cli
- Server lib for wiping some/all message state
- Client authentication
  - ? pluggable, so can swap to email/OAuth sign-in?
- Example express server setup with HTTP serving the script file
- npm limit files for pack release
- generate .d.ts prepack or something
  - Maybe use https://www.npmjs.com/package/tsd-jsdoc
  - Or use 3.7 beta of tsc? https://dev.to/open-wc/generating-typescript-definition-files-from-javascript-5bp2
- set up CI/CD that builds/tests/publishes to npm
    - https://medium.com/@Philmod/npm-release-automation-adb970e49066
- [ ] firebase disconnect messages [using onDisconnect](https://firebase.google.com/docs/database/web/offline-capabilities#how-ondisconnect-works)
- Any TODOs left in README
- Any TODOs left in code, maybe won't fix

## Motivation for client-server communication

### Websocket
The default client-server communication, and by far the fastest. It's pretty simple for a [web game](https://github.com/darthwalsh/Austerity/blob/3bd2cfb825eaf8d537945c02da5b96bfe38ddca7/server/connection.js) to just update state and issue questions based on player events.

Downsides:

* Cheap hosting servers don't allow many simultaneous connections, if any
* Messages are not persisted, so a server reboot will wipe out any app state

### Firebase Database

Using [Firebase Realtime Database](https://firebase.google.com/docs/database), it is possible to emulate websocket messages. 

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
