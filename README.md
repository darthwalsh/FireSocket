# FireSocket

A drop-in replacement for WebSocket using [Firebase Realtime Database](https://firebase.google.com/docs/database)

### Roadmap to release 1.0
- Basic parity with ws functionality
- A/B testing source compatibility between FireSocket and WebSocket
- Client authentication
- Server authentication, supporting example
- Example express(?) server setup with HTTP serving the script file
- npm limit files released
- generate .d.ts 
  - Maybe use https://www.npmjs.com/package/tsd-jsdoc
  - Or use 3.7 beta of tsc? https://dev.to/open-wc/generating-typescript-definition-files-from-javascript-5bp2
- set up CI/CD that builds/tests/publishes to npm



## Copy-Paste from Austerity:

### Websocket
The default client-server communication, and by far the fastest.

Downsides:

* Hosting servers don't allow many simultaneous connections, if any
* Game state is not persisted, so a server reboot will wipe out any games

### Firebase Database

Using [Firebase Realtime Database](https://firebase.google.com/docs/database), it is possible to emulate the websocket messages. This gives the added benefit of messages being persisted in the database, so if the server restarts it can event-source its state from the database, and recover an active game without interaction from the client.

Realtime Database was picked over Firestore because the average round trip latency of 600ms is fast enough to barely be noticed by users, while Firestore is noticeably slower at 1500ms.
[source](https://medium.com/@d8schreiber/firebase-performance-firestore-and-realtime-database-latency-13effcade26d)

[Info on Data Model, Auth, Queues](https://howtofirebase.com/firebase-data-modeling-939585ade7f4)

#### Database Schema

Each game is composed of messages from server to client, and v/v.

Each firebase client listens for child_added on their message queue.

Here, user* is a userID from Firebase Authentication

    userMessage:
        userWQ3mVT:
            0: Message: Connected to Game
            1: Choice: New Game, Refresh
            2: Message: Cards
            3: Choice: Play Copper, Buy Copper
        user7f8pR:
            0: Message: Connected to Game
            1: Choice: New Game, Refresh, alice's game
    serverMessage:
        userWQ3mVT:
            0: Name: alice
            1: Choice: New Game
            2: Start: Militia, Moat, ...
        user7f8pR:
            0: Name: bob
            1: Choice: Refresh

### P1
- [ ] Anonymous login (hopefully persists on refresh, or cache token in local storage?)
- [ ] Message flow
- [ ] Database permission rules, with read permission on userMessage and write on serverMessage
- [ ] Unit testing different database restart scenarios
- [ ] App server has admin write permission, with deployment secret
- [ ] Investigate moving hosting to Google node server, fix TODO in main README
- [ ] When to delete data?

### P2 
- [ ] firebase disconnect messages [using onDisconnect](https://firebase.google.com/docs/database/web/offline-capabilities#how-ondisconnect-works)
- [ ] OAuth/email sign-in, so users can roam between machines
- [ ] Move hosting to Google node server if possible