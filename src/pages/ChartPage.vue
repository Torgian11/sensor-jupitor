<template>
  <div v-if="chartPoints && chartPoints.length">
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
          ref="lineChart"
          :chart-data="lineChartPoints"
          :chart-options="chartOptions"
        />
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="12" md="8">
        <div>
          <point-data :point-data="selectedPoint" />
        </div>
      </v-col>
    </v-row>
  </div>
  <div v-else>No data</div>
  <v-overlay :model-value="loading" class="align-center justify-center">
    <v-progress-circular indeterminate size="64"></v-progress-circular>
  </v-overlay>
  <v-dialog v-model="warningDialog" max-width="400">
    <v-card>
      <v-card-title class="red darken-4 white--text">
        No Data Available
      </v-card-title>
      <v-card-text class="black--text">
        There is no data available for this file.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red darken-4" text @click="confirmWarning"> OK </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import LeafletMap from "../components/LeafletMap.vue";
import PointData from "@/components/PointData.vue";
import LineChart from "../components/LineChart.vue";
import { debounce } from "lodash";
import axios from "axios";
export default {
  name: "ChartPage",
  components: {
    LeafletMap,
    LineChart,
    PointData,
  },
  data() {
    return {
      drawer: true,
      selectedPoint: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        tooltips: {
          callbacks: {
            label: (tooltipItem) => {
              return tooltipItem.datasetIndex === 1
                ? `Point ${this.selectedPoint.idx + 1}: ${
                    this.selectedPoint.distance
                  }`
                : `Point ${tooltipItem.index + 1}: ${tooltipItem.value}`;
            },
          },
        },
      },
      chartPoints: [],
      currentChartId: null,
      lineChartPoints: [],
      currentPointData: null,
      displayMap: false,
      displayGPXMap: false,
      chartKey: 1,
      chartType: null,
      user: this.$store.state.user,
      loading: false,
      rail: true,
      series: [
        {
          name: "Distance",
          data: [], // Initialize with empty data
        },
      ],
      warningDialog: false,
    };
  },
  mounted() {
    const chartInfo = this.$store.state.selectedChartFile;
    if (!chartInfo) {
      this.$router.push({ name: "Home" });
      return;
    }
    console.log(chartInfo);
    this.chartType = chartInfo.type;
    this.currentChartId =
      chartInfo.type === "tcx" ? chartInfo.tcx_data_id : chartInfo.id;
    try {
      if (chartInfo.type === "tcx") {
        this.fetchTCXChart();
      } else {
        this.fetchGPXChart();
      }
    } catch (error) {
      console.log(error);
    }
  },
  methods: {
    calculateDistance(p1, p2) {
      const x = p2.longitude - p1.longitude;
      const y = p2.latitude - p1.latitude;
      return Math.sqrt(x * x + y * y);
    },
    confirmWarning() {
      this.warningDialog = false;
      this.$router.push({ name: "Home" });
    },
    async fetchTCXChart() {
      try {
        this.loading = true;
        const response = await axios.get(
          `/api/tcxdata/${this.currentChartId}/chart-data`
        );
        this.chartPoints = JSON.parse(response.data.chart_data.position_data);
        if (!this.chartPoints?.length) {
          this.noDataAlert();
        } else {
          this.initChartData();
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async fetchGPXChart() {
      try {
        this.loading = true;
        const response = await axios.get(
          `/api/gpx-files/${this.currentChartId}/`
        );
        this.chartPoints = response.data.chart_data;
        // this.series[0].data = this.chartPoints.map((cp) => cp.distance);
        if (!this.chartPoints?.length) {
          this.noDataAlert();
        } else {
          this.initChartData();
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    initChartData() {
      if (this.chartPoints?.length) {
        const labels = this.chartPoints.map(
          (_point, idx) => `Point ${idx + 1}`
        );
        const polylineData = this.chartPoints.map((point) => point.distance);

        this.lineChartPoints = {
          labels: labels,
          datasets: [
            {
              label: "Distance",
              backgroundColor: "#f87979",
              data: polylineData,
              pointRadius: 0,
              pointBackgroundColor: [],
              pointHoverBackgroundColor: "#000", // black color when hovered
            },
            {
              label: "Selected Point",
              backgroundColor: "#000",
              data: [],
              pointRadius: 10,
            },
          ],
        };

        if (this.type === "tcx") {
          this.displayMap = true;
        } else {
          this.displayGPXMap = true;
        }
      }
    },
    noDataAlert() {
      this.warningDialog = true;
    },
    updateChartData() {
      if (this.selectedPoint) {
        const pointDistance = this.selectedPoint.distance;
        const selectedIndex =
          this.lineChartPoints.datasets[0].data.indexOf(pointDistance);

        const updatedLineChartPoints = { ...this.lineChartPoints };

        updatedLineChartPoints.datasets[0].pointBackgroundColor =
          updatedLineChartPoints.datasets[0].data.map((distance, idx) => {
            if (idx === selectedIndex) {
              return "#000"; // Black
            } else {
              return "#f87979";
            }
          });
        updatedLineChartPoints.datasets[1].data = [pointDistance];
        this.lineChartPoints = updatedLineChartPoints;

        this.$nextTick(() => {
          if (this.$refs.lineChart?.chart) {
            this.$refs.lineChart.chart.setActiveElements([
              {
                datasetIndex: 0,
                index: selectedIndex,
              },
            ]);
          }
        });
      }
    },
    updatePointData: debounce(function (pointData) {
      this.selectedPoint = pointData.point;
      this.updateChartData(pointData);
    }, 300),
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
