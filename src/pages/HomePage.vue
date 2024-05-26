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
        <v-list-item-title>Actions</v-list-item-title>
      </v-list-item>
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item>
          <v-menu offset-y :close-on-content-click="false">
            <template v-slot:activator="{ props }">
              <v-btn color="primary" v-bind="props"> Upload Files </v-btn>
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
        <v-list-item @click="fetchTCXFiles">
          <v-list-item-title>Fetch TCX Files</v-list-item-title>
        </v-list-item>
        <v-list-item @click="fetchGPXFiles">
          <v-list-item-title>Fetch GPX Files</v-list-item-title>
        </v-list-item>
        <v-list-item @click="fetchTCXChart" :disabled="!tcxFiles.length">
          <v-list-item-title>Fetch TCX Chart</v-list-item-title>
        </v-list-item>
        <v-list-item @click="fetchGPXChart" :disabled="!gpxFiles.length">
          <v-list-item-title>Fetch GPX Chart</v-list-item-title>
        </v-list-item>
        <v-list-item
          @click="displayMap = !displayMap"
          :disabled="!chartPoints.length"
        >
          <v-list-item-title>Display TCX Map</v-list-item-title>
        </v-list-item>
        <v-list-item @click="displayGPXMap = !displayGPXMap">
          <v-list-item-title>Display GPX Map</v-list-item-title>
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
            <div :style="{ width: '100%', height: '400px' }">
              <v-chart :option="chartOptions" autoresize />
            </div>
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
// import VueApexCharts from "vue3-apexcharts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  MarkPointComponent,
} from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";

// import ExperimentalPage from "../components/ExperimentalPage.vue";
import { debounce } from "lodash";
import axios from "axios";

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  MarkPointComponent,
]);

export default {
  name: "HomePage",
  components: {
    LeafletMap,
    PointData,
    VChart,
    // VueApexCharts,
    // ExperimentalPage,
  },
  provide: {
    [THEME_KEY]: "light",
  },
  data() {
    return {
      chartOptions: {
        xAxis: {
          type: "category",
          data: [],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: [],
            type: "line",
            markPoint: {
              symbol: "circle",
              symbolSize: 20,
              itemStyle: {
                color: "red",
              },
              data: [
                // Initial marker position
                { coord: [0, 0] },
              ],
            },
          },
        ],
      },
      chartPoints: [],
      currentPointData: null,
      displayMap: false,
      displayGPXMap: false,
      drawer: true,
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

    updatePointData: debounce(function (pointData) {
      this.currentPointData = pointData.point;
      this.chartOptions.xAxis.data = this.chartPoints.map(
        (item, index) => index
      );
      this.chartOptions.series[0].data = this.series[0].data;
      this.updateMarkerPosition(pointData);
    }, 300),
    updateMarkerPosition(pointData) {
      const markerX = pointData.index;
      const markerY = pointData.point.distance;

      this.chartOptions.series[0].markPoint.data = [
        { coord: [markerX, markerY] },
      ];
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
</style>
