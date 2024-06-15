<template>
  <v-container>
    <workout-list :workouts="workouts" />
  </v-container>
</template>

<script>
import WorkoutList from "../components/WorkoutList.vue";
// import axios from "axios";

export default {
  name: "ViewTrainingPlansPage",
  components: {
    WorkoutList,
  },
  data() {
    return {
      workouts: [
        {
          id: Date.now(),
          name: "WorkoutOne",
          date: "14/JUN/2024",
        },
        {
          id: Date.now(),
          name: "WorkoutTwo",
          date: "15/JUN/2024",
        },
      ],
    };
  },
  mounted() {
    // GET request to retrieve workouts from backend, adjust as necessary
    // axios.get("/api/workouts").then((res) => {
    //   this.workouts = res.data;
    // });
  },
};
</script>
