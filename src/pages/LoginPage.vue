<template>
  <v-container fluid fill-height>
    <v-row>
      <v-col>
        <v-card class="elevation-12 pa-6 center-login" width="400px">
          <v-card-title class="text-h5">Login</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleSubmit">
              <v-text-field
                v-model="username"
                label="Username"
                prepend-icon="mdi-account"
                required
              >
              </v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                prepend-icon="mdi-lock"
                type="password"
                required
              ></v-text-field>
              <v-btn type="submit" color="primary" block>Login</v-btn>
            </v-form>
            <v-alert v-if="error" type="error" prominent border="left">
              {{ error }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref } from "vue";
import axios from "axios";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import login from "../utilities/loginService";
// import CryptoJS from "crypto-js";

export default {
  name: "LoginPage",
  setup() {
    const username = ref("");
    const password = ref("");
    // const hashedPassword = CryptoJS.SHA256(password.value).toString();
    const error = ref(null);
    const store = useStore();
    const router = useRouter();

    const handleSubmit = async () => {
      try {
        const { token, user } = await login(username.value, password.value);
        store.commit("setToken", token);
        store.commit("setUser", user);
        axios.defaults.headers.common["Authorization"] =
          "Token " + store.state.token;

        router.push("/");
      } catch (e) {
        error.value = e;
      }
    };

    return {
      username,
      password,
      error,
      handleSubmit,
    };
  },
};
</script>
<style scoped>
.center-login {
  margin-left: auto;
  margin-right: auto;
}
</style>
