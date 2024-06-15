// loginService.js
import axios from "axios";

const login = async (username, password) => {
  try {
    const response = await axios.post("login/", {
      username,
      password,
    });
    return response.data;
  } catch (e) {
    throw e.response.data.error;
  }
};

export default login;
