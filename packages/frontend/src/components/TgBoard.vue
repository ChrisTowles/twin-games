<template>
  <div class="container">
    <h1>{{ headerText }}</h1>

    <header v-if="!playingMatch" class="header">
      <button class="reset" @click="findMatchBtn()">
        Play Game
      </button>
    </header>

    <div class="board">
      <span class="vertical-line-1"></span>
      <span class="vertical-line-2"></span>
      <tg-square
        v-for="(mark, i) in board"
        :key="`square-${i}`"
        :label="`square-${i}`"
        :mark="mark"
        @click="makeMove(i)"
      ></tg-square>
    </div>

    <tg-timer v-if="showTimer" :duration-msec="timer" />
  </div>
</template>

<script lang="ts">
import { BoardPosition } from '@twin-games/shared'
import { defineComponent, onMounted, onUpdated } from 'vue'
import Nakama from '../game/nakama'
import { useGameServer } from '../composables/useGameServer'

export default defineComponent({
  setup() {
    onMounted(async() => {
      console.log('mounted!')
      await Nakama.authenticate()
    })
    onUpdated(() => {
      console.log('updated!')
    })
    // if we want this to be async, need to use suspense - https://v3.vuejs.org/guide/migration/suspense.html
    const { board, headerText, playerMark, playingMatch, findMatch, nakamaListener, serverTimeDiffMsec, timer, showTimer } = useGameServer()
    const findMatchBtn = async() => {
      await findMatch()
      nakamaListener()
    }
    const makeMove = async(index: number) => {
      await Nakama.makeMove(index as BoardPosition)
    }

    return { board, headerText, playerMark, playingMatch, findMatchBtn, makeMove, serverTimeDiffMsec, timer, showTimer }
  },
})

</script>

<style scoped>

.container {
    display: grid;
    place-items: center;
    gap: 4rem;
    position: relative;
}

.header {
    display: grid;
    gap: 1rem;
}
.reset {
    background: #35495e;
    border: none;
    border-radius: 5px;
    padding: 1rem 1.5rem;
    color: white;
    text-transform: uppercase;
}
.board {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
}
.board::before,
.board::after {
    background: linear-gradient(to right, #41b883, #35495e);
}
.vertical-line-1,
.vertical-line-2 {
    background: linear-gradient(to right, #41b883, #35495e);
}
.board::before,
.board::after {
    content: '';
    width: 100%;
    height: 5px;
    position: absolute;
    border-radius: 1rem;
}
.board::before {
    top: 33%;
}
.board::after {
    top: 66%;
}
.confetti-origin {
    position: absolute;
}
.vertical-line-1,
.vertical-line-2 {
    position: absolute;
    width: 100%;
    height: 5px;
    top: 50%;
    border-radius: 1rem;
    transform: translate(-50%, -50%) rotate(90deg);
}
.vertical-line-1 {
    left: 33%;
}
.vertical-line-2 {
    left: 66%;
}
</style>
