<script setup lang="ts">

import * as Phaser from 'phaser'
import { onMounted } from 'vue'
import MainMenu from '../game/scenes/MainMenu'
import Matchmaking from '../game/scenes/Matchmaking'
import InGame from '../game/scenes/InGame'
import { CONFIG } from '../game/config'


const config = {
  type: Phaser.AUTO,
  width: CONFIG.WIDTH,
  height: CONFIG.HEIGHT,
  backgroundColor: '#FF4C4C',
  scene: [MainMenu, Matchmaking, InGame],
  parent: 'game-container',

} as Phaser.Types.Core.GameConfig

onMounted(() => {
  const game = new Phaser.Game(config)
})

</script>

<template>


  <v-card>
    <v-card-title>
      Tac-Tac-Toe
    </v-card-title>
      <div id="game-container" :style="`height: ${config.height}, width: ${config.width}`">
      </div>
  </v-card>
</template>
