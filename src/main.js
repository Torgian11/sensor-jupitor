import { createApp } from "vue";

import vuetify from "../plugins/vuetify.js";

import store from "./store/store";
import router from "./router";
import App from "./App.vue";
import "@mdi/font/css/materialdesignicons.css";

createApp(App).use(store).use(router).use(vuetify).mount("#app");
