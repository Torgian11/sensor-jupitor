<template>
  <div class="chart-container">
    <canvas :ref="(el) => (ftpChart = el)"></canvas>
    <div :ref="(el) => (intervalsContainer = el)"></div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import Chart from "chart.js/auto";
import interact from "interactjs";

export default defineComponent({
  name: "WorkoutChart",
  setup() {
    const ftpChart = ref(null);
    const intervalsContainer = ref(null);
    const userFTP = 250; // Example FTP value
    let chart = null;

    onMounted(() => {
      const ctx = ftpChart.value.getContext("2d");

      chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: Array.from({ length: 61 }, (_, i) => i),
          datasets: [
            {
              label: "FTP Chart",
              data: [
                { x: 0, y: userFTP },
                { x: 1, y: userFTP },
              ],
              borderColor: "rgba(0, 0, 255, 0.5)",
              backgroundColor: "rgba(0, 0, 255, 0.1)",
              fill: true,
              borderWidth: 2,
              pointRadius: 0,
            },
          ],
        },
        options: {
          scales: {
            x: {
              type: "linear",
              ticks: {
                callback: (value) => {
                  const minutes = Math.floor(value / 60);
                  const seconds = value % 60;
                  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
                },
              },
              title: {
                display: true,
                text: "Time (M:SS)",
              },
            },
            y: {
              min: 0,
              max: userFTP * 2,
              ticks: {
                callback: (value) => `${Math.round((value / userFTP) * 100)}%`,
              },
              title: {
                display: true,
                text: "FTP %",
              },
            },
          },
          responsive: true,
          maintainAspectRatio: false,
        },
      });

      interact(ftpChart.value).on("click", (event) => {
        const activePoints = chart.getElementsAtEventForMode(
          event,
          "nearest",
          { intersect: true },
          true
        );
        if (activePoints.length > 0) {
          const point = activePoints[0];
          const datasetIndex = point.datasetIndex;
          // Highlight the rectangle
          chart.data.datasets[datasetIndex].backgroundColor =
            "rgba(255, 0, 0, 0.1)";
          chart.update();
          // Show a context menu or popup with options to delete or split the rectangle
        }
      });

      interact(ftpChart.value).draggable({
        onmove: (event) => {
          const activePoints = chart.getElementsAtEventForMode(
            event,
            "nearest",
            { intersect: true },
            true
          );
          if (activePoints.length > 0) {
            const point = activePoints[0];
            const datasetIndex = point.datasetIndex;
            const index = point.index;
            // Update the data point
            chart.data.datasets[datasetIndex].data[index].x = event.clientX;
            chart.data.datasets[datasetIndex].data[index].y = event.clientY;
            chart.update();
          }
        },
      });

      createInterval(50, 100, 100, 50); // Example initial interval
    });

    const createInterval = (x, y, width, height) => {
      const interval = document.createElement("div");
      interval.classList.add("interval");
      interval.style.left = `${x}px`;
      interval.style.top = `${y}px`;
      interval.style.width = `${width}px`;
      interval.style.height = `${height}px`;

      [
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
        "middle",
      ].forEach((position) => {
        const handle = document.createElement("div");
        handle.classList.add("handle", position);
        interval.appendChild(handle);
      });

      intervalsContainer.value.appendChild(interval);

      interact(interval)
        .draggable({
          allowFrom: ".handle.middle",
          onmove: dragMoveListener,
        })
        .resizable({
          edges: { left: true, right: true, bottom: true, top: true },
          listeners: {
            move(event) {
              let { x, y } = event.target.dataset;

              x = (parseFloat(x) || 0) + event.deltaRect.left;
              y = (parseFloat(y) || 0) + event.deltaRect.top;

              Object.assign(event.target.style, {
                width: `${event.rect.width}px`,
                height: `${event.rect.height}px`,
                transform: `translate(${x}px, ${y}px)`,
              });

              Object.assign(event.target.dataset, { x, y });
            },
          },
        })
        .on("doubletap", function (event) {
          splitInterval(event.target);
        });
    };

    const dragMoveListener = (event) => {
      const target = event.target;
      const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
      const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

      target.style.transform = `translate(${x}px, ${y}px)`;

      target.setAttribute("data-x", x);
      target.setAttribute("data-y", y);
    };

    const splitInterval = (interval) => {
      const rect = interval.getBoundingClientRect();
      const halfWidth = rect.width / 2;
      const height = rect.height;

      intervalsContainer.value.removeChild(interval);
      createInterval(rect.left, rect.top, halfWidth, height);
      createInterval(rect.left + halfWidth, rect.top, halfWidth, height);
    };

    return {
      ftpChart,
      intervalsContainer,
    };
  },
});
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 80%;
  height: 400px;
  margin: 0 auto;
}
.interval {
  position: absolute;
  background-color: rgba(0, 0, 255, 0.5);
  border: 2px solid blue;
}
.handle {
  width: 10px;
  height: 10px;
  background-color: red;
  position: absolute;
}
.handle.top-left {
  top: -5px;
  left: -5px;
  cursor: nwse-resize;
}
.handle.top-right {
  top: -5px;
  right: -5px;
  cursor: nesw-resize;
}
.handle.bottom-left {
  bottom: -5px;
  left: -5px;
  cursor: nesw-resize;
}
.handle.bottom-right {
  bottom: -5px;
  right: -5px;
  cursor: nwse-resize;
}
.handle.middle {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: move;
}
</style>
