<template>
  <div class="survey-creation-page">
    <h2>Survey Creation Page</h2>
    <div class="questions-container">
      <div
        class="question-bar"
        v-for="(question, index) in questions"
        :key="index"
      >
        <input class="question-input" type="text" v-model="question.text" />
        <div class="grades-container">
          <select class="grade-select" v-model="question.selectedGrade">
            <option
              v-for="(grade, gradeIndex) in question.grades"
              :key="gradeIndex"
              :value="grade"
            >
              {{ grade }}
            </option>
          </select>
        </div>
        <button class="edit-button" @click="displayEditModal(question)">
          Edit Question
        </button>
        <button class="delete-button" @click="deleteQuestion(question)">
          Delete Question
        </button>
      </div>
    </div>
    <button class="add-button" @click="showAddModal = true">
      Add New Question
    </button>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="modal">
      <div class="modal-content">
        <form @submit.prevent="addNewQuestion">
          <label>Question:</label>
          <input type="text" v-model="newQuestion.text" />
          <br />
          <label>Grading:</label>
          <ul>
            <li v-for="(grade, index) in newQuestion.grades" :key="index">
              <input type="text" v-model="newQuestion.grades[index]" />
              <button @click.prevent="removeGrade(index)">Remove Grade</button>
            </li>
          </ul>
          <button @click.prevent="addGrade">Add Grade</button>
          <br />
          <button type="submit">Add Question</button>
        </form>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <form @submit.prevent="updateQuestion">
          <label>Question:</label>
          <input type="text" v-model="editingQuestion.text" />
          <br />
          <label>Grading:</label>
          <ul>
            <li v-for="(grade, index) in editingQuestion.grades" :key="index">
              <input type="text" v-model="editingQuestion.grades[index]" />
              <button @click.prevent="removeGrade(index)">Remove Grade</button>
            </li>
          </ul>
          <button @click.prevent="addGrade">Add Grade</button>
          <br />
          <button type="submit">Update Question</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    const questions = ref([
      // Initialize with the 10 required questions
      { text: "Required Question 1", grades: ["A", "B"], selectedGrade: "" },
      { text: "Required Question 2", grades: ["A", "B"], selectedGrade: "" },
      // ...
      { text: "Required Question 10", grades: ["A", "B"], selectedGrade: "" },
    ]);

    const showAddModal = ref(false);
    const showEditModal = ref(false);
    const newQuestion = ref({ text: "", grades: ["A", "B"] });
    const editingQuestion = ref(null);

    const addNewQuestion = () => {
      questions.value.push({ ...newQuestion.value, selectedGrade: "" });
      newQuestion.value = { text: "", grades: ["A", "B"] };
      showAddModal.value = false;
    };

    const updateQuestion = () => {
      const index = questions.value.indexOf(editingQuestion.value);
      if (index !== -1) {
        questions.value.splice(index, 1, editingQuestion.value);
      }
      showEditModal.value = false;
    };

    const displayEditModal = (question) => {
      editingQuestion.value = question;
      showEditModal.value = true;
    };

    const addGrade = () => {
      if (showAddModal.value) {
        newQuestion.value.grades.push("");
      } else if (showEditModal.value) {
        editingQuestion.value.grades.push("");
      }
    };

    const removeGrade = (index) => {
      if (showAddModal.value) {
        if (newQuestion.value.grades.length > 2) {
          newQuestion.value.grades.splice(index, 1);
        }
      } else if (showEditModal.value) {
        if (editingQuestion.value.grades.length > 2) {
          editingQuestion.value.grades.splice(index, 1);
        }
      }
    };

    const deleteQuestion = (question) => {
      const index = questions.value.indexOf(question);
      if (index !== -1) {
        questions.value.splice(index, 1);
      }
    };

    return {
      questions,
      showAddModal,
      showEditModal,
      newQuestion,
      editingQuestion,
      addNewQuestion,
      updateQuestion,
      displayEditModal,
      addGrade,
      removeGrade,
      deleteQuestion,
    };
  },
};
</script>

<style>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.survey-creation-page {
  padding: 20px;
}

.questions-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question-bar {
  background-color: #34c759;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.question-input {
  background-color: #fff;
  border: none;
  padding: 10px;
  width: 300px;
  font-size: 16px;
}

.grades-container {
  margin-left: 20px;
}

.grade-select {
  padding: 10px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
}

.grade-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px #007bff;
}

.edit-button,
.delete-button {
  background-color: #4caf50;
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.edit-button:hover,
.delete-button:hover {
  background-color: #3e8e41;
}

.add-button {
  background-color: #4caf50;
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.add-button:hover {
  background-color: #3e8e41;
}
</style>
