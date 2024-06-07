<template>
  <div :id="chartId" class="chart-wrapper"></div>
</template>

<script>
import * as d3 from "d3";

export default {
  props: {
    chartData: {
      type: Object,
      default: () => ({ labels: [], datasets: [] }),
    },
    chartId: {
      type: String,
      default: "chart",
    },
    selectedPoint: {
      type: Object,
      default: null,
    },
    totalDistance: {
      type: Number,
      default: 0,
    },
  },
  mounted() {
    console.log(this.chartData);
    if (this.chartData.labels.length && this.chartData.datasets.length) {
      this.renderChart();
    }
  },
  methods: {
    renderChart() {
      const margin = { top: 10, right: 30, bottom: 30, left: 60 };
      const chartWidth = parseInt(this.totalDistance / 100);
      const wrapperWidth = document.getElementById(this.chartId).clientWidth;
      const width = Math.max(chartWidth, wrapperWidth);
      const height = 400 - margin.top - margin.bottom;

      const svg = d3
        .select(`#${this.chartId}`)
        .append("svg")
        .attr("width", width + 100)
        .attr("height", height + 30)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      const xScale = d3
        .scaleLinear()
        .domain([0, this.chartData.labels.length - 1])
        .range([0, width]);

      const yScale = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(this.chartData.datasets, (d) =>
            Array.isArray(d?.data) ? d3.max(d.data) : 0
          ),
        ])
        .range([height, 0]);

      svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

      svg.append("g").call(d3.axisLeft(yScale));

      const elevationLine = d3
        .area()
        .x((d, i) => xScale(i))
        .y0(height)
        .y1((d) => yScale(d));

      svg
        .append("path")
        .datum(this.chartData.datasets[4].data)
        .attr("fill", "rgba(128, 128, 128, 0.2)")
        .attr("d", elevationLine);

      svg
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "transparent")
        .on("mouseover", (event) => {
          const [x] = d3.pointer(event, svg.node());
          const i = Math.round(xScale.invert(x));

          const point = {
            cadence: this.chartData.datasets[0].data[i],
            elevation: this.chartData.datasets[4].data[i],
            heartRate: this.chartData.datasets[3].data[i],
            power: this.chartData.datasets[2].data[i],
          };

          this.displayTooltip(svg, point, x, yScale(point.elevation));
        })
        .on("mouseout", () => {
          svg.selectAll(".tooltip").remove();
          this.$emit("point-hovered", null);
        });

      this.chartData.datasets.forEach((dataset, index) => {
        const lineId = {
          1: "cadence-line",
          2: "empty",
          3: "power-line",
          4: "heart-line",
          5: "elevation-line",
        };
        if (dataset?.data) {
          svg
            .append("path")
            .datum(dataset.data)
            .attr("id", lineId[index + 1])
            .attr("fill", "none")
            .attr("stroke", dataset.borderColor)
            .attr("stroke-width", dataset.borderWidth)
            .attr(
              "d",
              d3
                .line()
                .x((_d, i) => xScale(i))
                .y((d) => yScale(d))
            );
        }
      });

      const legend = svg
        .selectAll(".legend")
        .data(this.chartData.datasets.filter((d) => d.data?.length > 0))
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

      legend
        .append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", (d) => d.borderColor);

      legend
        .append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text((d) => d.label);

      legend.on("click", (event, d) => {
        const lineId = {
          Cadence: "cadence-line",
          Power: "power-line",
          "Heart Rate": "heart-line",
          Elevation: "elevation-line",
        };
        const line = svg.select(`#${lineId[d.label]}`);
        if (line.style("visibility") === "hidden") {
          line.style("visibility", "visible");
        } else {
          line.style("visibility", "hidden");
        }
      });
    },

    displayTooltip(svg, point, x, y) {
      const tooltip = svg
        .append("g")
        .attr("class", "tooltip")
        .attr("transform", `translate(${x}, ${y})`);

      tooltip
        .append("circle")
        .attr("r", 5)
        .attr("fill", "black")
        .attr("stroke", "black");

      tooltip
        .append("rect")
        .attr("x", 10)
        .attr("y", -25)
        .attr("width", 125)
        .attr("height", 75)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("rx", 5) // rounded corners
        .attr("ry", 5)
        .style("z-index", 1000);

      tooltip
        .append("text")
        .attr("x", 15)
        .attr("y", -5)
        .text(`Cadence: ${point.cadence}`);

      tooltip
        .append("text")
        .attr("x", 15)
        .attr("y", 10)
        .text(`Elevation: ${point.elevation}`);

      tooltip
        .append("text")
        .attr("x", 15)
        .attr("y", 25)
        .text(`Heart Rate: ${point.heartRate}`);

      tooltip
        .append("text")
        .attr("x", 15)
        .attr("y", 40)
        .text(`Power: ${point.power}`);

      this.$emit("point-hovered", point);
    },
  },
};
</script>
<style>
.tooltip {
  z-index: 1000;
}

.chart-wrapper {
  width: 100%;
  height: 400px;
  overflow: auto;
}
</style>
