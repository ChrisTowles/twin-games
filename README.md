<p align='center'>
  <img src='https://images.unsplash.com/photo-1611996575749-79a3a250f948?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80' alt='Twin Games' width='600'/>
</p>


<p align='center'>
  <b>Twin Games</b><br>
</p>

<br>
<!--
<p align='center'>
<a href="https://vitesse.netlify.app/">Live Demo</a>
</p>
-->
<br>

## Packages

- 🎨 [Frontend](./packages/frontend) - Based off [vite](https://vitejs.dev/) and [Vue 3](https://v3.vuejs.org/).
- 💻 [Backend](./packages/backend) - Based off [nakama](https://github.com/heroiclabs/nakama/) for web sockets and DB.
- 📦 [Shared](./packages/shared) - Shared Lib to shared code between frontend and backend.

## Quick Start

To get the project up and running will need.

- `node 16`
- `pnpm`
- `docker`



### Tab 1

This will compile Shared, Frontend and Backend and watch for file changes.

```bash
pnpm install
pnpm run dev
```

### Tab 2

This will build the docker images for the DB and nakama server and launch them.

The `--build` is to make sure it always loads with the newest compiled backend code. 
```bash
cd packages/backend
docker compose up --build
```

## Project Goal

### MVP 1
Create a real-time game where people in a browser can play tic-tac-toe.


### End Goal
Then expand to other simple party games where each person can use their phone as a controller while casting a board to a TV.

- Planning Points
- Poker trivia
- any multiplayer party game.


## Links

- [About](./about.md)
