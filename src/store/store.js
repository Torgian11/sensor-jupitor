import { createStore } from "vuex";
import vuetify from "../../plugins/vuetify";

export default createStore({
  state: {
    theme: "light",
    token: null,
    user: null,
    selectedChartFile: null,
  },
  mutations: {
    setSelectedChartFile(state, chartFile) {
      state.selectedChartFile = chartFile;
    },
    removeSelectedChartFile(state) {
      state.selectedChartFile = null;
    },
    setTheme(state, theme) {
      state.theme = theme;
      vuetify.theme.global.name.value = theme;
    },
    setToken(state, token) {
      state.token = token;
      window.sessionStorage.setItem("token", token);
    },
    removeToken(state) {
      state.token = null;
      window.sessionStorage.removeItem("token");
    },
    setUser(state, user) {
      state.user = user;
    },
    removeUser(state) {
      state.user = null;
    },
  },
});
