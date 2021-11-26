<script setup lang="ts">

/*
import { useUserStore } from '~/stores/user'

const user = useUserStore()
const name = ref(user.savedName)

const router = useRouter()
const go = () => {
  if (name.value)
    router.push(`/hi/${encodeURIComponent(name.value)}`)
}
*/
</script>

<template>
  <v-card class="elevation-11">
    <v-card-title primary-title>
      Home
    </v-card-title>
    <v-card-text>
      Welcome to the start of Twin Games!

      <br />

      <tic-tac-toe-game></tic-tac-toe-game>

    </v-card-text>
  </v-card>
</template>

<route lang="yaml">
meta:
  layout: default
</route>
