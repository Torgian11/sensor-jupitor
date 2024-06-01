<template>
  <div class="calendar">
    <!-- Calendar header with month and year -->
    <div class="calendar-header">
      <h2>{{ currentMonth }} {{ currentYear }}</h2>
    </div>

    <!-- Calendar grid -->
    <div class="calendar-grid">
      <div class="day" v-for="(day, index) in days" :key="index">
        <span>{{ day.date }}</span>
        <span v-if="hasTrainingPlan(day.date)">-</span>
        <v-btn @click="openModal(day.date)">
          <!-- Show training plan details if available -->
          <span v-if="getTrainingPlan(day.date)">
            {{ getTrainingPlan(day.date).trainingType }}
          </span>
        </v-btn>
      </div>
    </div>

    <!-- Modal popup -->
    <v-dialog v-model="showModal">
      <v-card>
        <v-card-title>
          <v-text-field
            v-model="trainingPlanTitle"
            label="Title"
            required
          ></v-text-field>
        </v-card-title>
        <v-card-text>
          <v-date-picker
            v-model="trainingPlan.startDate"
            @update:modelValue="
              handleDateRangeSelect(
                trainingPlan.startDate,
                trainingPlan.endDate
              )
            "
          ></v-date-picker>
          <v-date-picker
            v-model="trainingPlan.endDate"
            @update:modelValue="
              handleDateRangeSelect(
                trainingPlan.startDate,
                trainingPlan.endDate
              )
            "
          ></v-date-picker>
          <template v-if="selectedDateRange.length > 0">
            <v-tabs v-model="tab">
              <v-tab v-for="(date, index) in selectedDateRange" :key="index">
                {{ date }}
              </v-tab>
            </v-tabs>
            <v-tabs-window v-model="tab">
              <v-tabs-window-item
                v-for="(date, index) in selectedDateRange"
                :key="index"
              >
                <!-- Workout list selector or create new workout button goes here -->
                <!-- <v-select
                  v-model="trainingPlan.workouts[date]"
                  :items="workouts"
                  multiple
                ></v-select> -->
                <v-btn @click="openWorkoutCreatorModal(date)">
                  Create New Workout
                </v-btn>
              </v-tabs-window-item>
            </v-tabs-window>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="handleSubmit">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog class="workout-modal" v-model="workoutCreatorModel" scrollable>
      <workout-form :selected-date="selectedWorkoutCreationDate" />
    </v-dialog>
  </div>
</template>

<script>
import WorkoutForm from "../components/WorkoutForm.vue";
// import { VWindow, VWindowGroup } from 'vuetify/components';

export default {
  name: "TrainingPlanPage",
  components: {
    WorkoutForm,
    // VWindow,
    // VWindowGroup
  },
  data() {
    return {
      activeTab: 0,
      tab: null,
      currentMonth: "",
      currentYear: "",
      days: [],
      showModal: false,
      selectedDateRange: [],
      selectedWorkoutCreationDate: null,
      trainingPlan: {
        title: "Training Plan",
        startDate: null,
        endData: null,
        workouts: {},
      },
      trainingPlanTitle: "Training Plan",
      trainingPlanWorkouts: {}, // Object to store workouts for each day
      workoutCreatorModel: false,
    };
  },
  methods: {
    openModal(date) {
      this.selectedDate = date;
      this.showModal = true;
      this.trainingPlan = {
        title: "Training Plan",
        startDate: null,
        endDate: null,
        dateRange: [],
        workouts: {},
      };
    },
    openWorkoutCreatorModal(date) {
      this.workoutCreatorModel = true;
      this.selectedWorkoutCreationDate = date; // You'll need to define selectedDate in your data
    },
    getDateKey(date) {
      return date.replace(/-/g, ""); // convert date string to YYYYMMDD format
    },
    handleDateRangeSelect(startDate, endDate) {
      if (startDate && endDate) {
        const formattedStartDate = startDate.toISOString().split("T")[0];
        const formattedEndDate = endDate.toISOString().split("T")[0];

        const dateRange = [];
        const currentDate = new Date(formattedStartDate);
        const endDateObj = new Date(formattedEndDate);

        while (currentDate <= endDateObj) {
          dateRange.push(currentDate.toISOString().split("T")[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }

        this.trainingPlan.dateRange = dateRange;
        this.selectedDateRange = dateRange;
        console.log(this.selectedDateRange);
        this.trainingPlanWorkouts = {}; // Reset workouts when date range changes
      }
      this.trainingPlanWorkouts = {};
    },
    handleWorkoutSelect(day, workout) {
      if (!this.trainingPlanWorkouts[day]) {
        this.trainingPlanWorkouts[day] = [];
      }
      this.trainingPlanWorkouts[day].push(workout);
    },
    handleCreateNewWorkout() {
      // Open new modal for workout creator
    },
    handleSubmit() {
      const payload = {
        title: this.trainingPlan.title,
        dateRange: this.trainingPlan.dateRange,
        workouts: this.trainingPlan.workouts,
      };
      // Send payload to backend API (to be implemented)
      console.log(payload);
      this.showModal = false;
    },
    hasTrainingPlan() {
      // Check if there's a training plan for the given date
      // (to be implemented)
      return false;
    },
    getTrainingPlan() {
      // Return the training plan details for the given date
      // (to be implemented)
      // console.log(date);
      return null;
    },
  },
  created() {
    // Initialize the calendar with the current month and year
    const today = new Date();
    this.currentMonth = today.toLocaleString("default", { month: "long" });
    this.currentYear = today.getFullYear();

    // Generate the calendar grid
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      this.days.push({ date });
    }
  },
};
</script>

<style scoped>
.calendar {
  width: 800px; /* Increased the width to 800px */
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  text-align: center;
  margin-bottom: 20px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-gap: 10px;
}

.day {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #f9f9f9;
  cursor: pointer;
}

.day:hover {
  background-color: #f2f2f2;
}

.workout-modal {
  background-color: #fff;
}

:deep(.v-overlay__scrim) {
  background-color: white !important;
}
</style>
