<p align='center'>
  <img src='https://images.unsplash.com/photo-1611996575749-79a3a250f948?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80' alt='Simple Games' width='600'/>
</p>


<p align='center'>
  <b>Simple Games</b><br>
</p>

<br>
<!--
<p align='center'>
<a href="https://vitesse.netlify.app/">Live Demo</a>
</p>
-->
<br>

## Packages

- 🎨 [Frontend](./packages/frontend) - Based off vite and vue 3

- 💻 [Backend](./packages/backend) - Based off [nakama](https://github.com/heroiclabs/nakama/) for websockets and DB.


<br>


## Project Goal


### MVP 1
Create a realtime game where people in a browser can play tic tac toe.


### End Goal
Then expand to other simple party games where each person can use their phone as a controller while casting a board to a TV.

- Planning Points
- Poker triva
- any multiplay party game.




## History and Technolgy Stack

I orginally started this project in Flutter and Firebase/firestore.  However firestore Functions don't allow for Cloud Firestore triggers to watch for Firestore db changes when writen in dart. So I'd have to maintain both a typescript version of the backend logic and Dart for the frontend.....

I'll note someone tried to write a solution for dart [here](https://github.com/pulyaevskiy/firebase-functions-interop) but i had issues getting it to work it and the repo appears to be a dead. Also Google apperently has no intedension to support firestore triggers from dart as a issue is several years old and they've stated there are no plans to support it. 

Also the billing model for Firestore can be scary. Being charged for any query i didn't design tables with lookup documents. That takes alot of planning and if you fail to do so end up having to query every document. Thats a billable action.

I then started working a version of this project that used flutter and websockets to a node backend.  However, even with `socket.io` there is a lot of coniderations and design that needs to go into how to setup your message passing. Which i never worked out. 

So when i decieded to try this project for the thrid time I was looking for an example of a good socket based web game and i found [nakama](https://github.com/heroiclabs/nakama/) which looks to provid even better functionality for my use case.

Also as I'm already rather provifent in Typescript and Vue, I should be much more productive than I this time vs trying to learn flutter at the same time. 






