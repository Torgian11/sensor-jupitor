<template>
  <Line
    ref="lineChart"
    :data="allChartData"
    :options="chartOptions"
    :key="chartKey"
    @chart:render="onChartRender"
  />
</template>
<script>
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

export default {
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
  methods: {
    onChartRender(chart) {
      chart.canvas.addEventListener("mousemove", this.handleMouseMove);
    },
    handleMouseMove(event) {
      console.log(event, "mouse move event");
      const chart = this.$refs.lineChart.chartInstance;
      const elements = chart.getElementsAtEventForMode(
        event,
        "nearest",
        { intersect: true },
        true
      );
      if (elements.length > 0) {
        const index = elements[0].index;
        const pointData = this.chartData.datasets[0].data[index];
        this.$emit("point-hovered", pointData);
      }
    },
  },
};
</script>
