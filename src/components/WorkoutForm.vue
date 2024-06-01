<template>
  <v-form class="form-area">
    <v-text-field v-model="workout.title" label="Title" required></v-text-field>
    <v-select
      v-model="workout.ride_type"
      :items="rideTypes"
      label="Ride Type"
      required
    ></v-select>
    <v-text-field
      v-model="workout.distance"
      label="Distance"
      required
    ></v-text-field>
    <v-text-field
      v-model="workout.duration"
      label="Duration"
      required
    ></v-text-field>
    <v-textarea v-model="workout.description" label="Description"></v-textarea>
    <v-textarea v-model="workout.goals" label="Goals"></v-textarea>
    <workout-chart
      :workout="workout"
      @update:chart="updateChart"
    ></workout-chart>
    <v-btn @click="saveWorkout"> Save Workout </v-btn>
  </v-form>
</template>

<script>
import WorkoutChart from "../components/WorkoutChart.vue";

export default {
  name: "WorkoutForm",
  components: {
    WorkoutChart,
  },
  props: {
    selectedDate: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      workout: {
        title: "",
        ride_type: "",
        distance: "",
        duration: "",
        description: "",
        goals: "",
        chart: [], // assuming chart data is an array
      },
      rideTypes: ["Road", "Mountain", "Indoor", "Other"], // example ride types
    };
  },
  methods: {
    updateChart(chartData) {
      this.workout.chart = chartData;
    },
    saveWorkout() {
      // Send workout data to backend API (to be implemented)
      console.log(this.workout);
    },
  },
};
</script>
<style scoped>
.form-area {
  overflow: auto;
}
</style>
