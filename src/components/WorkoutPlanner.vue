<template>
  <v-container>
    <v-card>
      <v-card-title>Workout Planner</v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="submitWorkouts" v-model="valid">
          <v-text-field
            v-model="workoutName"
            label="Workout Name"
            :rules="nameRules"
            required
          ></v-text-field>
          <v-text-field
            v-model="workoutDate"
            label="Workout Date"
            type="date"
            :rules="dateRules"
            required
          ></v-text-field>
          <v-btn :disabled="!valid" color="green" @click="addWorkout"
            >Add Workout"</v-btn
          >
          <v-btn type="submit" :disabled="!workouts.length" color="primary"
            >Save Workouts</v-btn
          >
        </v-form>
        <v-list>
          <v-list-item v-for="workout in workouts" :key="workout.id">
            <v-list-item-title>{{ workout.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ workout.date }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
    <workout-calendar :workouts="workouts" />
  </v-container>
</template>

<script>
import WorkoutCalendar from "@/components/WorkoutCalendar.vue";

export default {
  name: "WorkoutPlanner",
  components: {
    WorkoutCalendar,
  },
  data() {
    return {
      workoutName: "",
      workoutDate: "",
      workouts: [],
      menu: false,
      valid: false,
      nameRules: [
        (v) => !!v || "Workout name is required",
        (v) =>
          (v && v.length <= 100) || "Name must be less than 100 characters",
      ],
      dateRules: [(v) => !!v || "Workout date is required"],
    };
  },
  methods: {
    addWorkout() {
      if (this.$refs.form.validate()) {
        this.workouts.push({
          id: Date.now(),
          name: this.workoutName,
          date: this.workoutDate,
        });
        this.workoutName = "";
        this.workoutDates = "";
      }
    },
    submitWorkouts() {
      // Put request here
    },
  },
};
</script>
