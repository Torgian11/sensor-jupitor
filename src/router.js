import { createRouter, createWebHistory } from "vue-router";
import store from "./store/store";
import HomePage from "./pages/HomePage.vue";
import LoginPage from "./pages/LoginPage.vue";
import TrainingPlanPage from "./pages/TrainingPlanPage.vue";
import ChartPage from "./pages/ChartPage.vue";

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
  {
    path: "/training-plan",
    name: "TrainingPlan",
    component: TrainingPlanPage,
  },
  {
    path: "/chart-page",
    name: "ChartPage",
    component: ChartPage,
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
