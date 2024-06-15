<template>
  <div>
    <h2>Add Workout</h2>
    <form @submit.prevent="addWorkout">
      <input v-model="workoutName" placeholder="Workout Name" required />
      <input v-model="workoutDate" type="date" required />
      <button type="submit">Add Workout</button>
    </form>
  </div>
</template>

<script>
export default {
  name: "WorkoutForm",
  data() {
    return {
      workoutName: "",
      workoutDate: "",
    };
  },
  methods: {
    addWorkout() {
      this.$emit("add-workout", {
        name: this.workoutName,
        date: this.workoutDate,
      });
      this.workoutName = "";
      this.workoutDate = "";
    },
  },
};
</script>
