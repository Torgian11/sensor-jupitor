<template>
  <Line
    v-if="allChartData"
    ref="chart"
    :data="allChartData"
    :options="chartOptions"
    :key="chartKey"
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
  data() {
    return {
      allChartData: this.chartData,
      chartKey: 1,
    };
  },
  watch: {
    chartData: {
      handler(value) {
        this.allChartData = { ...value };
        this.allChartData.datasets[1].data = value.datasets[1].data;
        console.log(this.allChartData);
      },
    },
  },
});
</script>
