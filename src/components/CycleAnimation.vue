<template>
  <canvas ref="canvas" width="800" height="400"></canvas>
</template>

<script>
export default {
  props: {
    chartPoints: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      ctx: null,
      cyclistX: 0,
      cyclistSpeed: 2,
    };
  },
  mounted() {
    this.ctx = this.$refs.canvas.getContext("2d");
    this.draw();
    this.animateCyclist();
  },
  methods: {
    draw() {
      this.ctx.clearRect(0, 0, 800, 400);

      // Draw the road
      this.ctx.beginPath();

      const canvasWidth = 800;
      const canvasHeight = 400;
      const totalDistance = this.chartPoints.reduce(
        (sum, point) => sum + point.distance,
        0
      );
      const maxElevation = Math.max(
        ...this.chartPoints.map((point) => point.elevation)
      );
      const minElevation = Math.min(
        ...this.chartPoints.map((point) => point.elevation)
      );
      const elevationRange = maxElevation - minElevation;

      let accumulatedDistance = 0;

      for (let i = 1; i < this.chartPoints.length; i++) {
        accumulatedDistance += this.chartPoints[i - 1].distance;
        const prevPoint = this.chartPoints[i - 1];
        const point = this.chartPoints[i];

        const prevX =
          ((accumulatedDistance - prevPoint.distance) / totalDistance) *
          canvasWidth;
        const x = (accumulatedDistance / totalDistance) * canvasWidth;

        // Scale elevation to fit within canvas height and center vertically
        const y =
          canvasHeight -
          ((point.elevation - minElevation) / elevationRange) * canvasHeight;
        const prevY =
          canvasHeight -
          ((prevPoint.elevation - minElevation) / elevationRange) *
            canvasHeight;

        if (i === 1) {
          this.ctx.moveTo(prevX, prevY);
        }
        this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();

      // Draw the cyclist (simple circle)
      this.ctx.beginPath();
      const cyclistY = this.getCyclistYPosition(
        this.cyclistX,
        minElevation,
        elevationRange
      );
      this.ctx.arc(this.cyclistX, cyclistY, 10, 0, 2 * Math.PI);
      this.ctx.fill();
    },
    getCyclistYPosition(x, minElevation, elevationRange) {
      const canvasWidth = 800;
      const canvasHeight = 400;
      const totalDistance = this.chartPoints.reduce(
        (sum, point) => sum + point.distance,
        0
      );
      const cyclistDistance = (x / canvasWidth) * totalDistance;

      let accumulatedDistance = 0;

      for (let i = 0; i < this.chartPoints.length - 1; i++) {
        accumulatedDistance += this.chartPoints[i].distance;
        const point1 = this.chartPoints[i];
        const point2 = this.chartPoints[i + 1];

        if (
          cyclistDistance >= accumulatedDistance &&
          cyclistDistance <= accumulatedDistance + point2.distance
        ) {
          const ratio =
            (cyclistDistance - accumulatedDistance) / point2.distance;
          const elevation =
            point1.elevation + ratio * (point2.elevation - point1.elevation);
          return (
            canvasHeight -
            ((elevation - minElevation) / elevationRange) * canvasHeight
          );
        }
      }

      return (
        canvasHeight -
        ((this.chartPoints[this.chartPoints.length - 1].elevation - minElevation) /
          elevationRange) *
          canvasHeight
      );
    },
    animateCyclist() {
      this.cyclistX += this.cyclistSpeed;

      if (this.cyclistX > 800) {
        this.cyclistX = 0;
      }

      this.draw();
      requestAnimationFrame(this.animateCyclist);
    },
  },
};
</script>
