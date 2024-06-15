<template>
  <div class="cycling-calendar">
    <vue-cal
      :events="events"
      :time="false"
      default-view="month"
      :disable-views="['years']"
      @event-click="onEventClick"
      @cell-click="onCellClick"
      @event-drop="onEventDrop"
      :editable-events="{ title: false, drag: true, resize: false }"
    >
      <template #header>
        <div class="add-workout-button" @click="addWorkout">
          <i class="fas fa-plus-circle" style="color: #34c759"></i>
          <span>stuff</span>
        </div>
      </template>
    </vue-cal>
    <div v-if="showEditModal" class="modal">
      <h2>Edit Workout</h2>
      <form @submit.prevent="submitEdit">
        <label for="workout-name">Workout Name:</label>
        <input type="text" id="workout-name" v-model="editedWorkout.name" />
        <br />
        <label for="workout-type">Workout Type:</label>
        <select id="workout-type" v-model="editedWorkout.type">
          <option value="sprint">Sprint</option>
          <option value="endurance">Endurance</option>
          <option value="intervals">Intervals</option>
          <option value="hillRepeats">Hill Repeats</option>
          <option value="recovery">Recovery</option>
        </select>
        <br />
        <button type="submit">Submit</button>
        <button @click="cancelEdit">Cancel</button>
      </form>
    </div>
    <div v-if="showAddModal" class="modal">
      <h2>Add Workout</h2>
      <form @submit.prevent="submitAdd">
        <label for="workout-name">Workout Name:</label>
        <input type="text" id="workout-name" v-model="newWorkout.name" />
        <br />
        <label for="workout-type">Workout Type:</label>
        <select id="workout-type" v-model="newWorkout.type">
          <option value="sprint">Sprint</option>
          <option value="endurance">Endurance</option>
          <option value="intervals">Intervals</option>
          <option value="hillRepeats">Hill Repeats</option>
          <option value="recovery">Recovery</option>
        </select>
        <br />
        <button type="submit">Submit</button>
        <button @click="cancelAdd">Cancel</button>
      </form>
    </div>
    <button v-if="changedWorkouts.length > 0" @click="finalizeChanges">
      Finalize Changes
    </button>
  </div>
</template>

<script>
import VueCal from "vue-cal";
import "vue-cal/dist/vuecal.css";
import "font-awesome/css/font-awesome.css";

export default {
  components: {
    VueCal,
  },
  props: {
    workouts: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      showEditModal: false,
      showAddModal: false,
      editedWorkout: {},
      newWorkout: {},
      changedWorkouts: [],
    };
  },
  computed: {
    events() {
      return this.workouts.map((workout) => ({
        title: workout.name,
        start: workout.date,
        end: workout.date,
        icon: this.getWorkoutIcon(workout.type),
        class: this.getWorkoutClass(workout.type),
        content: this.getWorkoutContent(workout),
      }));
    },
  },
  methods: {
    onEventClick(event) {
      this.showEditModal = true;
      this.editedWorkout = event;
    },
    onCellClick(cell) {
      this.showAddModal = true;
      this.newWorkout.date = cell.startDate;
    },
    onEventDrop(event) {
      this.changedWorkouts.push(event);
    },
    submitEdit() {
      // Send the edited workout to the backend
      // You can use Axios or the Fetch API for this
      // For example:
      fetch("/api/workouts/" + this.editedWorkout.id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.editedWorkout),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
          this.showEditModal = false;
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    cancelEdit() {
      this.showEditModal = false;
      this.editedWorkout = {};
    },
    addWorkout() {
      this.showAddModal = true;
    },
    submitAdd() {
      // Send the new workout to the backend
      // You can use Axios or the Fetch API for this
      // For example:
      fetch("/api/workouts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.newWorkout),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
          this.showAddModal = false;
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    cancelAdd() {
      this.showAddModal = false;
      this.newWorkout = {};
    },
    finalizeChanges() {
      // Send the changed workouts to the backend
      // You can use Axios or the Fetch API for this
      // For example:
      fetch("/api/workouts/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.changedWorkouts),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
          this.changedWorkouts = [];
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    getWorkoutIcon(type) {
      switch (type) {
        case "sprint":
          return "fas fa-bolt";
        case "endurance":
          return "fas fa-road";
        case "intervals":
          return "fas fa-stopwatch";
        case "hillRepeats":
          return "fas fa-mountain";
        case "recovery":
          return "fas fa-bed";
        default:
          return "";
      }
    },
    getWorkoutClass(type) {
      switch (type) {
        case "sprint":
          return "sprint-workout";
        case "endurance":
          return "endurance-workout";
        case "intervals":
          return "intervals-workout";
        case "hillRepeats":
          return "hill-repeats-workout";
        case "recovery":
          return "recovery-workout";
        default:
          return "";
      }
    },
    getWorkoutContent(workout) {
      if (this.changedWorkouts.includes(workout)) {
        return '<i class="fas fa-edit"></i>';
      } else {
        return "";
      }
    },
  },
};
</script>

<style>
.cycling-calendar {
  height: 100vh;
}

.vuecal__cell {
  height: 100px;
  padding: 10px;
}

.vuecal__event {
  cursor: pointer;
}

.add-workout-button {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}

.sprint-workout {
  background-color: #ff69b4;
}

.endurance-workout {
  background-color: #34c759;
}

.intervals-workout {
  background-color: #ffc107;
}

.hill-repeats-workout {
  background-color: #795548;
}

.recovery-workout {
  background-color: #c9e4ca;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}
</style>
