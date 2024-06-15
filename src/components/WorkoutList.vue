<template>
  <div>
    <h2>Workout List</h2>
    <v-list>
      <v-list-item v-for="workout in workouts" :key="workout.id">
        <v-list-item-title
          >{{ workout.name }}: {{ workout.date }}</v-list-item-title
        >
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
export default {
  name: "WorkoutList",
  props: {
    workouts: {
      type: Array,
      default: () => [],
    },
  },
};
</script>
