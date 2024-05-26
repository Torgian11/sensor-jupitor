import { createApp } from "vue";

import vuetify from "../plugins/vuetify.js";

import store from "./store/store";
import router from "./router";
import App from "./App.vue";

createApp(App).use(store).use(router).use(vuetify).mount("#app");
