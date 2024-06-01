<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :permanent="$vuetify.display.mdAndUp"
      :rail="rail"
      :rail-width="80"
    >
      <v-list-item nav>
        <template v-slot:append>
          <v-btn variant="text" @click.stop="rail = !rail">{{
            rail ? "Open" : "Close"
          }}</v-btn>
        </template>
      </v-list-item>

      <v-list-item>
        <v-list-item-title v-if="!rail">Actions</v-list-item-title>
      </v-list-item>
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item>
          <v-menu offset-y :close-on-content-click="false">
            <template v-slot:activator="{ props }">
              <v-tooltip anchor="end">
                <template v-slot:activator="{ props: tooltipProps }">
                  <v-btn
                    v-if="rail"
                    v-bind="{ ...props, ...tooltipProps }"
                    icon="mdi-menu-down"
                    color="primary"
                  ></v-btn>
                  <v-btn v-else v-bind="{ ...props, ...tooltipProps }" text
                    >Menu</v-btn
                  >
                </template>
                <span>Upload Files</span>
              </v-tooltip>
            </template>
            <v-list>
              <v-list-item capture>
                <v-text-field v-model="fileTitle" label="Title"></v-text-field>
                <v-file-input
                  v-model="fileToUpload"
                  label="File input"
                  :accept="'.tcx, .gpx'"
                ></v-file-input>
                <v-btn @click="uploadFile" :disabled="!fileToUpload"
                  >Upload File</v-btn
                >
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid fill-height class="home-container">
        <v-row v-if="tcxFiles.length">
          <v-col>
            <select v-model="selectedFile" class="file-selector">
              <option
                v-for="(trainingFile, idx) in allFiles"
                :key="trainingFile.id"
                :value="trainingFile"
              >
                {{ trainingFile.title || `Untitled${trainingFile.type}` + idx }}
              </option>
            </select>
          </v-col>
        </v-row>
        <v-btn :disabled="!selectedFile" @click="navToChartPage"
          >View Ride</v-btn
        >
        <v-overlay :model-value="loading" class="align-center justify-center">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mdiChevronLeft } from "@mdi/js";
import axios from "axios";

export default {
  name: "HomePage",
  data() {
    return {
      drawer: true,
      gpxFileToUpload: null,
      tcxFileToUpload: null,
      user: this.$store.state.user,
      tcxFiles: [],
      fileToUpload: null,
      gpxFiles: [],
      loading: false,
      rail: true,
      selectedFile: null,
      fileTitle: null,
    };
  },
  computed: {
    allFiles() {
      return [...this.tcxFiles, ...this.gpxFiles].map((file) => ({
        ...file,
        type: file.tcx_data_id ? "tcx" : "gpx",
      }));
    },
    menuIcon() {
      return mdiChevronLeft;
    },
  },
  async mounted() {
    await this.fetchFiles();
  },
  methods: {
    navToChartPage() {
      console.log(this.$store);
      this.$store.commit("setSelectedChartFile", this.selectedFile);

      this.$router.push({
        name: "ChartPage",
      });
    },
    onFileChanged(event) {
      this.fileToUpload = event.target.files[0];
    },
    async fetchFiles() {
      try {
        this.loading = true;
        const authToken = this.$store.state.token;
        let tcxFileRequest = await axios.get("/api/tcx-files/", {
          headers: {
            Authorization: "Token " + authToken,
          },
        });

        let gpxFileRequest = await axios.get("/api/gpx-files/", {
          headers: {
            Authorization: "Token " + authToken,
          },
        });

        [this.tcxFiles, this.gpxFiles] = await Promise.all([
          tcxFileRequest.data,
          gpxFileRequest.data,
        ]);
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async uploadFile() {
      try {
        this.loading = true;
        const fileInfo = this.fileToUpload;
        let formData = new FormData();
        formData.append("file", fileInfo);
        formData.append("user_profile", this.$store.state.user.id);
        let endpoint = "";

        if (fileInfo.name.includes(".gpx")) {
          endpoint = "/api/gpx-files/";
        }
        if (fileInfo.name.includes(".tcx")) {
          endpoint = "/api/tcx-files/";
        }

        await axios.post(endpoint, formData);
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.home-container {
  padding: 20px;
}

.map-container {
  height: 400px; /* Adjust as needed */
}

.file-selector {
  width: 300px;
  max-width: 300px;
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

/* button[type="button"] {
  width: 100%;
  background-color: #4CAF50;
  color: #fff;
  padding: 14px 20px;
  margin: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button[type="button"]:hover {
  background-color: #3e8e41;
} */
</style>
