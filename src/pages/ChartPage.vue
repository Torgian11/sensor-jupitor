<template>
  <div v-if="chartPoints && chartPoints.length">
    <v-row>
      <v-col cols="12">
        <div v-if="displayMap || displayGPXMap" class="map-container">
          <leaflet-map
            :points="chartPoints"
            :selected-point="selectedPoint"
            @update-point-data="updatePointData"
          />
        </div>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="12" md="8">
        <line-chart-d3
          v-if="lineChartPoints"
          :chart-data="lineChartPoints"
          :chart-options="chartOptions"
          :selected-point="selectedPoint"
          :total-distance="totalDistance"
          @point-hovered="handlePointHovered"
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
import LineChartD3 from "../components/LineChartD3.vue";
import { debounce } from "lodash";
import axios from "axios";
export default {
  name: "ChartPage",
  components: {
    LeafletMap,
    LineChartD3,
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
        interaction: {
          mode: "index",
          intersect: false,
        },
        spanGaps: true,
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
      totalDistance: 0,
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
      chartInfo.type === "tcx" ? chartInfo.tcx_data_id : chartInfo.gpx_data_id;
    try {
      this.fetchChartData(chartInfo.type);
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
    async fetchChartData(extension) {
      try {
        this.loading = true;
        const url =
          extension === "tcx"
            ? `/api/tcxdata/${this.currentChartId}/chart-data`
            : `/api/gpx-data/${this.currentChartId}/`;
        const response = await axios.get(url);
        this.chartPoints =
          extension === "tcx"
            ? JSON.parse(response.data.chart_data.position_data)
            : response.data.position_data;

        this.totalDistance = response.data.total_distance;
        if (!this.chartPoints?.length) {
          this.noDataAlert();
        } else {
          this.initChartData();
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    initChartData() {
      if (this.chartPoints?.length) {
        const labels = this.chartPoints.map(
          (_point, idx) => `Point ${idx + 1}`
        );
        const elevationData = this.chartPoints.map((point) => point.elevation);
        const cadenceData = this.chartPoints.map((point) => {
          return point.cadence;
        });
        const powerData = this.chartPoints.map((point) => point.power);
        const heartRateData = this.chartPoints.map((point) => point.heart_rate);
        console.log(cadenceData.includes(NaN));

        this.lineChartPoints = {
          labels: labels,
          datasets: [
            {
              label: "Cadence",
              data: cadenceData,
              borderColor: "rgba(255, 0, 0, 1)",
              borderWidth: 1,
              pointRadius: 0,
            },
            {
              data: [],
            },
            {
              label: "Power",
              data: powerData,
              borderColor: "rgba(0, 255, 0, 1)",
              borderWidth: 1,
              pointRadius: 0,
            },
            {
              label: "Heart Rate",
              data: heartRateData,
              borderColor: "rgba(0, 0, 255, 1)",
              borderWidth: 1,
              pointRadius: 0,
            },
            {
              label: "Elevation",
              backgroundColor: "rgba(128, 128, 128, 0.2)",
              borderColor: "rgba(128, 128, 128, 1)",
              borderWidth: 1,
              data: elevationData,
              fill: "end",
              pointRadius: 0,
              pointHoverBackgroundColor: "#000", // black color when hovered
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
    handlePointHovered(value) {
      console.log(value);
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
