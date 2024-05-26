<template>
  <v-card>
    <div id="map"></div>
  </v-card>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";

export default {
  name: "LeafletMap",
  props: {
    points: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update-point-data"],
  data() {
    return {
      chartData: [],
      currentMarkers: [],
      myIcon: L.icon({
        iconUrl: markerIcon,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
    };
  },
  mounted() {
    this.initMap();
    this.fetchChartData();
  },
  methods: {
    initMap() {
      this.map = L.map("map").setView(
        [45.524007584899664, 13.59806134365499],
        13
      );

      // Add a tile layer (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(this.map);

      L.control.scale().addTo(this.map);
    },
    updateVisibleMarkers() {
      const bounds = this.map.getBounds();

      this.currentMarkers.filter((marker) => {
        return bounds.contains([marker.latitude, marker.longitude]);
      });
      // this.currentMarkers.forEach((marker) => marker.remove());
      // visibleMarkers.slice(0, 10).forEach((marker) => marker.addTo(this.map));
    },
    async fetchChartData() {
      const data = this.points;
      const latlngs = data.map((point) =>
        L.latLng(point.latitude, point.longitude)
      );

      this.addMarkers(data, latlngs);
      this.addCenterControl(latlngs);
    },

    addMarkers(data, latlngs) {
      const numMarkers = 10;
      const startPoint = data[0];
      const endPoint = data[data.length - 1];

      function distance(p1, p2) {
        const x = p2.lng - p1.lng;
        const y = p2.lat - p1.lat;
        return Math.sqrt(x * x + y * y);
      }

      const iconPath = `<img class="bicycle-icon" src="${require("../assets/bicycle_icon.svg")}" />`;
      const hoverIcon = L.marker([0, 0], {
        icon: L.divIcon({
          className: "bicycle-icon",
          html: iconPath,
          iconAnchor: [15, 41],
        }),
      });

      let frozen = false;
      // let currentPoint = null;

      const polyline = L.polyline(latlngs, { color: "red" }).addTo(this.map);
      this.map.on("click", (e) => {
        const latlng = e.latlng;
        if (!frozen) {
          frozen = true;
          const closestPointToCursor = polyline.closestLayerPoint(
            this.map.latLngToLayerPoint(latlng)
          );
          const distanceFromCursor = L.latLng(latlng).distanceTo(
            this.map.layerPointToLatLng(closestPointToCursor)
          );

          if (distanceFromCursor < 250) {
            const closestPoint = this.findClosestPoint(
              e.latlng,
              latlngs,
              20 // Tolerance
            );

            const closestPointIndex = latlngs.indexOf(closestPoint);
            const popupContent = this.createPopupContent(
              this.points[closestPointIndex]
            );

            let popup = L.popup()
              .setLatLng(closestPoint)
              .setContent(popupContent)
              .openOn(this.map);

            popup.on("remove", function () {
              frozen = false;
            });
          }
          // const clickLatLng = e.latlng;
          // const clickPoint = this.map.latLngToLayerPoint(clickLatLng);
          // const dist = distance(clickLatLng, currentPoint);
        } else {
          frozen = true;
          // currentPoint = e.latlng;
        }

        // const closestPointToCursor = polyline.closestLayerPoint(
        //   this.map.latLngToLayerPoint(latlng)
        // );
        // const distanceFromCursor = L.latLng(latlng).distanceTo(
        //   this.map.layerPointToLatLng(closestPointToCursor)
        // );

        // console.log(distanceFromCursor);
        // if (distanceFromCursor < 250) {
        //   const closestPoint = this.findClosestPoint(
        //     e.latlng,
        //     latlngs,
        //     20 // Tolerance
        //   );

        //   const closestPointIndex = latlngs.indexOf(closestPoint);
        //   const popupContent = this.createPopupContent(
        //     this.points[closestPointIndex]
        //   );

        //   L.popup()
        //     .setLatLng(closestPoint)
        //     .setContent(popupContent)
        //     .openOn(this.map);
        // }
      });

      function unfreezeHover() {
        frozen = false;
      }

      this.map.on("popupclose", () => {
        unfreezeHover();
      });

      this.map.on("mousemove", (e) => {
        if (frozen) return;

        const mouseLatLng = e.latlng;
        const closestPoint = polyline.closestLayerPoint(
          this.map.latLngToLayerPoint(mouseLatLng)
        );
        const closestDataPoint = this.findClosestPoint(e.latlng, latlngs, 40);
        const closestDataPointIndex = latlngs.indexOf(closestDataPoint);

        const dist = distance(
          mouseLatLng,
          this.map.layerPointToLatLng(closestPoint)
        );

        if (dist < 50) {
          hoverIcon.setLatLng(this.map.layerPointToLatLng(closestPoint));
          hoverIcon.addTo(this.map);
          this.$emit("update-point-data", {
            point: this.points[closestDataPointIndex],
            index: closestDataPointIndex,
          });
        } else {
          hoverIcon.removeFrom(this.map);
        }
      });

      this.map.on("mouseout", () => {
        // Remove the hover icon from the map when the mouse moves out
        hoverIcon.removeFrom(this.map);
      });
      // Calculate the interval for selecting intermediate markers
      const interval = Math.floor((data.length - 2) / (numMarkers - 2));

      // Select the intermediate markers
      const markers = [startPoint];
      for (let i = 1; i < numMarkers - 1; i++) {
        const index = i * interval;
        markers.push(data[index]);
      }
      markers.push(endPoint);
      for (let marker of markers) {
        const mark = L.marker([marker.latitude, marker.longitude], {
          icon: this.myIcon,
          draggable: true,
        }).bindPopup(this.createPopupContent(marker));
        mark.addTo(this.map);

        mark.on("dragend", (event) => {
          // get the new location of the marker
          let newLatLng = event.target.getLatLng();

          let nearestPoint = null;
          let minDistance = Infinity;
          data.forEach((point) => {
            let distance = newLatLng.distanceTo(
              L.latLng(point.latitude, point.longitude)
            );
            if (distance < minDistance) {
              minDistance = distance;
              nearestPoint = point;
            }
          });
          event.target.setLatLng(
            L.latLng(nearestPoint.latitude, nearestPoint.longitude)
          );
          // update the point information with the new location
          mark.latitude = nearestPoint.latitude;
          mark.longitude = nearestPoint.longitude;
          mark.distance = nearestPoint.distance;
          mark.bindPopup(this.createPopupContent(nearestPoint));
          mark.on("popupclose", () => {
            unfreezeHover();
          });
        });
      }

      this.currentMarkers = markers;

      // Adjust the map view to fit all points
      this.map.fitBounds(latlngs);
    },

    addCenterControl(latlngs) {
      L.Control.Center = L.Control.extend({
        onAdd: function (map) {
          const button = L.DomUtil.create("button");
          button.innerHTML = "Center Map";
          button.onclick = function () {
            map.fitBounds(latlngs); // Fit to all GPS points
          };
          return button;
        },
      });

      L.control.center = function (opts) {
        return new L.Control.Center(opts);
      };
      L.control.center({ position: "topleft" }).addTo(this.map);
    },

    createPopupContent(marker) {
      const popupContent = `
          <b>Point</b><br>
          <p>Latitude: ${marker.latitude}</p>
          <p>Longitude: ${marker.longitude}</p>
          <p>Distance: ${marker.distance} meters</P.<br>
        `;
      return popupContent;
    },

    getDistanceAtPoint(index) {
      return this.points[index].distance;
    },

    findClosestPoint(point, points) {
      let closestPoint = null;
      let minDistance = Infinity;

      for (const p of points) {
        const distance = L.latLng(point).distanceTo(L.latLng(p));
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = p;
        }
      }

      return closestPoint;
    },
  },
};
</script>

<style scoped>
#map {
  height: 400px;
}

:deep(.leaflet-marker-icon > .bicycle-icon) {
  width: 30px !important; /* adjust this to the width of your icon */
  height: 30px !important; /* adjust this to the height of your icon */
  animation: move 2s infinite;
  z-index: 0;
}

@keyframes move {
  0% {
    transform: translateX(0) translateY(0) rotate(0deg);
  }
  10% {
    transform: translateX(2px) translateY(-1px) rotate(0deg);
  }
  20% {
    transform: translateX(4px) translateY(0) rotate(0deg);
  }
  30% {
    transform: translateX(4px) translateY(1px) rotate(0deg);
  }
  40% {
    transform: translateX(6px) translateY(0) rotate(0deg);
  }
  50% {
    transform: translateX(8px) translateY(0px) rotate(0deg);
  }
  60% {
    transform: translateX(6px) translateY(0) rotate(0deg);
  }
  70% {
    transform: translateX(4px) translateY(0px) rotate(0deg);
  }
  80% {
    transform: translateX(4px) translateY(0) rotate(0deg);
  }
  90% {
    transform: translateX(2px) translateY(-1px) rotate(0deg);
  }
  100% {
    transform: translateX(0) translateY(0) rotate(0deg);
  }
}
</style>
