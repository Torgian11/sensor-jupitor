<template>
  <div v-if="pointData">
    <p>Latitude: {{ pointData.latitude }}</p>
    <p>Longitude: {{ pointData.longitude }}</p>
    <p>Distance: {{ pointData.distance }}</p>
    <p>Elevation: {{ pointData.elevation }}</p>
    <p>Power: {{ pointData.power }}</p>
    <p>Cadence: {{ pointData.cadence }}</p>
    <!-- <p>Elevation: {{ pointData.elevation }}m</p>
    <p>Time: {{ pointData.time }}</p>
    <p>Heart rate: {{ pointData.heartRate }}bpm</p> -->
    <!-- Add other GPX data properties as needed -->
  </div>
</template>
<script>
export default {
  name: "PointData",
  props: {
    pointData: {
      type: Object,
      default: () => null,
    },
  },
};
</script>
