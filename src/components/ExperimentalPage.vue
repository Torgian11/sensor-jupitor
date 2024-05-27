<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <canvas ref="canvas" width="800" height="600"></canvas>
      </v-col>
      <v-col cols="12">
        <v-btn @click="generateArt">Generate Art</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { ref, onMounted } from "vue";

export default {
  setup() {
    const canvas = ref(null);

    onMounted(() => {
      generateArt();
    });

    function generateArt() {
      const ctx = canvas.value.getContext("2d");
      ctx.clearRect(0, 0, 800, 600);

      // Generate random circles
      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * 800,
          Math.random() * 600,
          Math.random() * 50,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = getRandomColor();
        ctx.fill();
      }

      // Generate random squares
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = getRandomColor();
        ctx.fillRect(
          Math.random() * 800,
          Math.random() * 600,
          Math.random() * 50,
          Math.random() * 50
        );
      }

      // Generate random lines
      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 800, Math.random() * 600);
        ctx.lineTo(Math.random() * 800, Math.random() * 600);
        ctx.strokeStyle = getRandomColor();
        ctx.stroke();
      }
    }

    function getRandomColor() {
      return `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
        Math.random() * 255
      }, ${Math.random()})`;
    }

    return { canvas, generateArt };
  },
};
</script>
