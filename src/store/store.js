import { createStore } from "vuex";
import vuetify from "../../plugins/vuetify";

export default createStore({
  state: {
    theme: "light",
    token: null,
    user: null,
  },
  mutations: {
    setTheme(state, theme) {
      state.theme = theme;
      vuetify.theme.global.name.value = theme;
    },
    setToken(state, token) {
      state.token = token;
      localStorage.setItem("token", token);
    },
    removeToken(state) {
      state.token = null;
      localStorage.removeItem("token");
    },
    setUser(state, user) {
      state.user = user;
    },
    removeUser(state) {
      state.user = null;
    },
  },
});
