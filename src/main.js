import { createApp } from "vue";

import vuetify from "../plugins/vuetify.js";

import axios from "axios";
import store from "./store/store";
import router from "./router";
import App from "./App.vue";
import "vuetify/dist/vuetify.min.css";
import "@mdi/font/css/materialdesignicons.css";

const token = window.sessionStorage.getItem("token");

async function verifyToken(token) {
  try {
    const response = await axios.post("api/verify-token", { token });
    return response.data.valid;
  } catch (error) {
    console.error(error);
    return false;
  }
}

if (token) {
  verifyToken(token).then((valid) => {
    if (valid) {
      store.commit("setToken", token);
    } else {
      localStorage.removeItem("token");
    }
  });
}

createApp(App).use(store).use(router).use(vuetify).mount("#app");
