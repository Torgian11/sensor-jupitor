<template>
  <v-container>
    <v-card>
      <v-card-title>Add Workout</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="addWorkout">
          <v-text-field
            v-model="workoutName"
            label="Workout Name"
            required
          ></v-text-field>
          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="workoutDate"
                label="Workout Date"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="workoutDate"
              @input="menu = false"
            ></v-date-picker>
          </v-menu>
          <v-btn type="submit" color="primary">Add Workout</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "AddWorkout",
  data() {
    return {
      workoutName: "",
      workoutDate: "",
      menu: false,
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
