<template>
  <v-app>
    <v-app-bar color="primary">
      <v-app-bar-title>
        <v-row class="mt-2 ml-2" align-content="center">
          <span>My App</span>
          <v-switch
            label="Dark Mode"
            v-model="$store.state.theme"
            true-value="dark"
            false-value="light"
            class="ml-5"
            @change="$store.commit('setTheme', $store.state.theme)"
          ></v-switch>
        </v-row>
      </v-app-bar-title>
      <v-img src="./assets/logo.png"></v-img>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
@import "vuetify/styles";
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
