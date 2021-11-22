
<template>
  <v-app>
    <v-app-bar density="compact">
      <v-app-bar-title>Twin Games</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn text>Developer</v-btn>
      <v-btn class="mr-3" text>Help</v-btn>
      <v-divider inset vertical></v-divider>
      <v-btn
        class="mr-4 ml-5"
        color="primary"
        plain
      >
        <mdi-handshake-outline class="mr-2" />
        <span>Chris Towles</span>
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-container grid-list-xl>
        <router-view />  
      </v-container>        
      
      
      
    </v-main>
    <Footer />
  </v-app>
</template>
