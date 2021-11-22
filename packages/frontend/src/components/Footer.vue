<script setup lang="ts">
import { isDark, toggleDark } from '~/composables'

</script>

<template>
  <v-card>
    <v-footer>
      <v-card
        flat
        tile
        width="100%"
        class="red lighten-1 text-center"
      >
        <v-card-text>
          <v-btn
            class="mx-4"
            icon
          >
            <mdi-handshake-outline size="48" />
          </v-btn>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-text class="white--text">
          {{ new Date().getFullYear() }} — <strong>Twin Games</strong>
        </v-card-text>
      </v-card>
    </v-footer>
  </v-card>
</template>
