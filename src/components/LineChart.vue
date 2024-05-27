<template>
  <Line
    v-if="chartData"
    ref="chart"
    :data="chartData"
    :options="chartOptions"
  />
  <div v-else>No chart data</div>
</template>
<script>
import { defineComponent } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale
);

export default defineComponent({
  name: "LineChart",
  components: { Line },
  props: {
    chartData: {
      type: Object,
      default: () => ({ labels: [], datasets: [] }),
    },
    chartOptions: {
      type: Object,
      default: null,
    },
  },
});
</script>
