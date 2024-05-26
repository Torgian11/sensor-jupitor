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
                  v-model="tcxFileToUpload"
                  label="File input"
                  :accept="'.tcx, .gpx'"
                ></v-file-input>
                <v-btn @click="uploadFile" :disabled="!tcxFileToUpload"
                  >Upload File</v-btn
                >
              </v-list-item>
              <v-list-item @click="uploadGpxFile" :disabled="!gpxFileToUpload">
                <v-list-item-title>Upload GPX</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list-item>
        <v-list-item v-if="!rail" @click="fetchTCXFiles">
          <v-list-item-title>Fetch TCX Files</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="rail">
          <v-tooltip anchor="end">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-cloud-download"
                color="blue"
                @click="fetchTCXFiles"
              ></v-btn>
            </template>
            <span>Fetch TCX Files</span>
          </v-tooltip>
        </v-list-item>
        <v-list-item v-if="!rail" @click="fetchGPXFiles">
          <v-list-item-title>Fetch GPX Files</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="rail">
          <v-tooltip anchor="end">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-cloud-download"
                color="green"
                @click="fetchGPXFiles"
              ></v-btn>
            </template>
            <span>Fetch GPX Files</span>
          </v-tooltip>
        </v-list-item>
        <v-list-item
          v-if="!rail"
          @click="fetchTCXChart"
          :disabled="!tcxFiles.length"
        >
          <v-list-item-title>Fetch TCX Chart</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="rail">
          <v-tooltip anchor="end">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-chart-line"
                color="blue"
                @click="fetchTCXChart"
                :disabled="!tcxFiles.length"
              ></v-btn>
            </template>
            <span>Fetch TCX Chart</span>
          </v-tooltip>
        </v-list-item>
        <v-list-item
          v-if="!rail"
          @click="fetchGPXChart"
          :disabled="!gpxFiles.length"
        >
          <v-list-item-title>Fetch GPX Chart</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="rail">
          <v-tooltip anchor="end">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-chart-line"
                color="green"
                @click="fetchGPXChart"
                :disabled="!gpxFiles.length"
              ></v-btn>
            </template>
            <span>Fetch GPX Chart</span>
          </v-tooltip>
        </v-list-item>
        <v-list-item
          v-if="!rail"
          @click="displayMap = !displayMap"
          :disabled="!chartPoints.length"
        >
          <v-list-item-title>Display TCX Map</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="rail">
          <v-tooltip anchor="end">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-map-marker"
                color="blue"
                @click="displayMap = !displayMap"
                :disabled="!chartPoints.length"
              ></v-btn>
            </template>
            <span>Display TCX Map</span>
          </v-tooltip>
        </v-list-item>
        <v-list-item v-if="!rail" @click="displayGPXMap = !displayGPXMap">
          <v-list-item-title>Display GPX Map</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="rail">
          <v-tooltip anchor="end">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-map-marker"
                color="green"
                @click="displayGPXMap = !displayGPXMap"
              ></v-btn>
            </template>
            <span>Display GPX Map</span>
          </v-tooltip>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid fill-height class="home-container">
        <v-row>
          <v-col>
            <div v-for="file in tcxFiles" :key="file.id">
              Title: {{ file.title }}
            </div>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <div v-if="displayMap || displayGPXMap" class="map-container">
              <leaflet-map
                :points="chartPoints"
                @update-point-data="updatePointData"
              />
            </div>
          </v-col>
        </v-row>

        <v-row justify="center">
          <v-col cols="12" md="8">
            <line-chart
              v-if="selectedPoint"
              :chart-data="chartData"
              :chart-options="chartOptions"
            />
          </v-col>
        </v-row>

        <v-row justify="center">
          <v-col cols="12" md="8">
            <div>
              <point-data :point-data="currentPointData" />
            </div>
          </v-col>
        </v-row>
        <v-overlay :model-value="loading" class="align-center justify-center">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
      </v-container>
    </v-main>
  </v-app>
</template>
<script>
import { mdiChevronLeft } from "@mdi/js";
import LeafletMap from "../components/LeafletMap.vue";
import PointData from "@/components/PointData.vue";
// import ExperimentalPage from "../components/ExperimentalPage.vue";
import { debounce } from "lodash";
import axios from "axios";
import LineChart from "../components/LineChart.vue";

export default {
  name: "HomePage",
  components: {
    LeafletMap,
    LineChart,
    PointData,
  },
  data() {
    return {
      drawer: true,
      selectedPoint: null,
      chartData: {},
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
      chartPoints: [],
      currentPointData: null,
      displayMap: false,
      displayGPXMap: false,
      gpxFileToUpload: null,
      tcxFileToUpload: null,
      chartKey: 1,
      user: this.$store.state.user,
      tcxFiles: [],
      gpxFiles: [],
      loading: false,
      rail: true,
      series: [
        {
          name: "Distance",
          data: [], // Initialize with empty data
        },
      ],
      fileTitle: null,
    };
  },
  computed: {
    menuIcon() {
      return mdiChevronLeft;
    },
  },
  methods: {
    onFileChanged(event) {
      this.fileToUpload = event.target.files[0];
    },
    async fetchTCXFiles() {
      try {
        this.loading = true;
        const response = await axios.get("/api/tcx-files/", {
          headers: {
            Authorization: "Token " + this.$store.state.token,
          },
        });

        this.tcxFiles = response.data;
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async fetchTCXChart() {
      try {
        this.loading = true;
        const firstFile = this.tcxFiles[5].tcx_data_id;
        const response = await axios.get(
          `/api/tcxdata/${firstFile}/chart-data`
        );
        this.chartPoints = JSON.parse(response.data.chart_data.position_data);
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async fetchGPXFiles() {
      try {
        this.loading = true;
        const response = await axios.get("/api/gpx-files/", {
          headers: {
            Authorization: "Token " + this.$store.state.token,
          },
        });

        this.gpxFiles = response.data;
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async fetchGPXChart() {
      try {
        this.loading = true;
        const firstFile = this.gpxFiles[0].id;
        const response = await axios.get(`/api/gpx-files/${firstFile}/`);
        this.chartPoints = response.data.chart_data;
        this.series[0].data = this.chartPoints.map((cp) => cp.distance);
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    uploadGpxFile() {
      const fileInfo = this.gpxFileToUpload;
      let formData = new FormData();
      formData.append("file", fileInfo);
      formData.append("user_profile", this.$store.state.user.id);

      axios
        .post("/api/gpx-files/", formData)
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    uploadFile() {
      const fileInfo = this.tcxFileToUpload;
      let formData = new FormData();
      formData.append("file", fileInfo);
      formData.append("title", this.fileTitle);
      formData.append("user_profile", this.$store.state.user.id);

      axios
        .post("/api/tcx-files/", formData)
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    },

    calculateDistance(p1, p2) {
      console.log(p1, p2);
      const x = p2.longitude - p1.longitude;
      const y = p2.latitude - p1.latitude;
      console.log(x, y);
      return Math.sqrt(x * x + y * y);
    },

    generateChartData() {
      if (this.selectedPoint) {
        const pointDistance = this.selectedPoint.distance;

        // assuming this.polyline is an array of objects with distance property
        const polylineData = this.chartPoints.map((point) => point.distance);
        console.log(polylineData);
        this.chartPoints = {
          labels: polylineData,
          datasets: [
            {
              label: "Distance",
              backgroundColor: "#f87979",
              data: polylineData,
              pointRadius: 0,
            },
            {
              label: "Selected Point",
              backgroundColor: "#000",
              data: [pointDistance],
              pointRadius: 10,
            },
          ],
        };
        console.log(this.chartPoints);
      }
    },

    updatePointData: debounce(function (pointData) {
      this.selectedPoint = pointData.point;
      this.generateChartData(pointData);
    }, 300),

    // updateMarkerPosition(pointData) {
    //   const markerX = pointData.index;
    //   const markerY = pointData.point.distance;

    //   this.chartOptions.series[0].markPoint.data = [
    //     { coord: [markerX, markerY] },
    //   ];
    // },
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
</style>
