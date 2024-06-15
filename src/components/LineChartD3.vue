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
  data() {
    return {
      xScale: null,
      yScale: null,
    };
  },
  mounted() {
    if (this.chartData.labels.length && this.chartData.datasets.length) {
      this.renderChart();
    }
  },
  watch: {
    selectedPoint(newPoint) {
      this.updateChart(newPoint);
    },
  },
  methods: {
    updateChart(pointData) {
      if (!pointData) return;
      const index = this.chartData.labels.findIndex((label) =>
        label.includes(pointData.index)
      );
      if (index < 0) return;
      const chart = d3.select(`#${this.chartId} svg`);
      chart.selectAll(".vertical-line").remove();

      chart
        .append("line")
        .attr("class", "vertical-line")
        .attr("id", "selectedLine")
        .attr("x1", this.xScale(index))
        .attr("x2", this.xScale(index))
        .attr("y1", 40)
        .attr("y2", 380)
        .style("stroke", "orange")
        .style("stroke-width", 2)
        .style("opacity", 0.75);

      const line = document.getElementById("selectedLine");
      const xCoord = line.getAttribute("x1");
      const viewPort = document.getElementById("svgChart");
      const viewportWidth = viewPort.getBoundingClientRect();
      const scrollPosition = xCoord - viewportWidth.width / 2;
      viewPort.scrollRight = scrollPosition;
    },
    renderChart() {
      const margin = { top: 10, right: 30, bottom: 30, left: 60 };
      const wrapperWidth = window.innerWidth;
      const width = wrapperWidth;
      const height = 400 - margin.top - margin.bottom;

      const svg = d3
        .select(`#${this.chartId}`)
        .append("svg")
        .attr("id", "svgChart")
        .attr("width", "100%")
        .attr("height", height + 30)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      this.xScale = d3
        .scaleLinear()
        .domain([0, this.chartData.labels.length - 1])
        .range([0, width]);

      this.yScale = d3
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
        .call(d3.axisBottom(this.xScale));

      svg.append("g").call(d3.axisLeft(this.yScale));

      const elevationLine = d3
        .area()
        .x((d, i) => this.xScale(i))
        .y0(height)
        .y1((d) => this.yScale(d));

      svg
        .append("path")
        .datum(this.chartData.datasets[4].data)
        .attr("fill", "rgba(128, 128, 128, 0.2)")
        .attr("d", elevationLine);

      svg
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", "100%")
        .attr("height", height)
        .attr("fill", "transparent")
        .on("mouseover", (event) => {
          const [x] = d3.pointer(event, svg.node());
          const i = Math.round(this.xScale.invert(x));

          console.log(this.chartData);
          const point = {
            cadence: this.chartData.datasets[0].data[i],
            elevation: this.chartData.datasets[4].data[i],
            heartRate: this.chartData.datasets[3].data[i],
            power: this.chartData.datasets[2].data[i],
            latitude: this.chartData.datasets[5].data[i].latitude,
            longitude: this.chartData.datasets[5].data[i].longitude,
          };

          this.displayTooltip(svg, point, x, this.yScale(point.elevation));
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
                .x((_d, i) => this.xScale(i))
                .y((d) => this.yScale(d))
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

      this.$emit("point-hovered", point, { fromUser: true });
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

.legend {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
