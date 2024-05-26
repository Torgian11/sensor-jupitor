import { createRouter, createWebHistory } from "vue-router";
import store from "./store/store";
import HomePage from "./pages/HomePage.vue";
import LoginPage from "./pages/LoginPage.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
    meta: { requiresAuth: true },
  },
  {
    path: "/signin",
    name: "Login",
    component: LoginPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !store.state.token) {
    next({ name: "Login" });
  } else if (to.name === "Login" && store.state.token) {
    next({ name: "Home" });
  } else {
    next();
  }
});

export default router;
