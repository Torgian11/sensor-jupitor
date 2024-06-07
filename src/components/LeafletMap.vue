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
    selectedPoint: {
      type: Object,
      default: () => null,
    },
  },
  emits: ["update-point-data"],
  data() {
    return {
      currentMarkers: [],
      newMarker: null,
      frozen: false,
      myIcon: L.icon({
        iconUrl: markerIcon,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
    };
  },
  watch: {
    selectedPoint(newVal) {
      if (newVal) {
        this.addIconToMap(newVal);
      }
    },
  },
  mounted() {
    this.initMap();
    const data = this.points;
    const latlngs = data
      .map((point) =>
        point && point.latitude && point.longitude
          ? L.latLng(point.latitude, point.longitude)
          : null
      )
      .filter(Boolean);
    this.addMarkers(data, latlngs);
    this.handleMapEvents(latlngs);
  },
  methods: {
    addIconToMap(pointData) {
      if (this.newMarker) {
        this.map.removeLayer(this.newMarker);
      }
      console.log(pointData);
      // this.newMarker = L.marker([pointData.lat, pointData.lng]).addTo(this.map);
    },
    addMarkers(data, latlngs) {
      const numMarkers = 10;
      const startPoint = data[0];
      const markers = this.createMarkers(data, numMarkers, startPoint);
      this.addMarkersToMap(markers);
      this.currentMarkers = markers;
      this.map.fitBounds(latlngs);
    },

    addMarkersToMap(markers) {
      for (let marker of markers) {
        const mark = L.marker([marker.latitude, marker.longitude], {
          icon: this.myIcon,
          draggable: true,
        }).bindPopup(this.createPopupContent(marker));

        mark.addTo(this.map);

        mark.on("dragend", (event) => {
          let newLatLng = event.target.getLatLng();
          let nearestPoint = null;
          let minDistance = Infinity;
          this.points.forEach((point) => {
            let distance = null;
            if (point.latitude && point.longitude) {
              distance = newLatLng.distanceTo(
                L.latLng(point.latitude, point.longitude)
              );
            }
            if (distance && distance < minDistance) {
              minDistance = distance;
              nearestPoint = point;
            }
          });
          if (nearestPoint && nearestPoint.latitude && nearestPoint.longitude) {
            event.target.setLatLng(
              L.latLng(nearestPoint.latitude, nearestPoint.longitude)
            );
            mark.latitude = nearestPoint.latitude;
            mark.longitude = nearestPoint.longitude;
            mark.distance = nearestPoint.distance;
            mark.elevation = nearestPoint.elevation;
            mark.cadence = nearestPoint.cadence;
            mark.power = nearestPoint.power;
            mark.speed = nearestPoint.speed;
            mark.bindPopup(this.createPopupContent(nearestPoint));
            mark.on("popupclose", () => {
              this.frozen = false;
            });
          }
        });
      }
    },

    createMarkers(data, numMarkers, startPoint) {
      const interval = Math.floor((data.length - 2) / (numMarkers - 2));
      const markers = [startPoint];
      let dataIndex = 1;
      let currentDatalength = data.length - 1;
      let endPoint = data[currentDatalength];

      for (let i = 1; i < numMarkers - 1; i++) {
        while (
          dataIndex < data.length &&
          (!data[dataIndex].latitude || !data[dataIndex].longitude)
        ) {
          dataIndex++;
        }

        const distanceToStart = this.getDistance(startPoint, data[dataIndex]);
        const distanceToEnd = this.getDistance(endPoint, data[dataIndex]);
        const minDistance = 0.01;

        if (distanceToStart < minDistance || distanceToEnd < minDistance) {
          dataIndex++;
          i--;
        } else {
          markers.push(data[dataIndex]);
          dataIndex += interval;
        }
      }

      while (!endPoint.latitude && !endPoint.longitude) {
        endPoint = data[currentDatalength];
        currentDatalength -= 1;
      }
      markers.push(endPoint);
      return markers;
    },

    distance(p1, p2) {
      const x = p2.lng - p1.lng;
      const y = p2.lat - p1.lat;
      return Math.sqrt(x * x + y * y);
    },

    handleMapEvents(latlngs) {
      const iconPath = `<img class="bicycle-icon" src="${require("../assets/bicycle_icon.svg")}" />`;
      const hoverIcon = L.marker([0, 0], {
        icon: L.divIcon({
          className: "bicycle-icon",
          html: iconPath,
          iconAnchor: [15, 41],
        }),
      });

      const polyline = L.polyline(latlngs, { color: "red" }).addTo(this.map);
      this.map.on("click", (e) => {
        const latlng = e.latlng;
        if (!this.frozen) {
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

            this.frozen = true;

            popup.on("remove", () => {
              this.frozen = false;
            });
          }
        }
      });

      this.map.on("popupclose", () => {
        this.frozen = false;
      });

      this.map.on("mousemove", (e) => {
        if (this.frozen) return;

        const mouseLatLng = e.latlng;
        const closestPoint = polyline.closestLayerPoint(
          this.map.latLngToLayerPoint(mouseLatLng)
        );

        if (closestPoint) {
          const closestDataPoint = this.findClosestPoint(e.latlng, latlngs, 40);
          const closestDataPointIndex = latlngs.indexOf(closestDataPoint);

          const dist = this.distance(
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
        }
      });

      this.map.on("mouseout", () => {
        hoverIcon.removeFrom(this.map);
      });
    },

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
    //     cadence
    // :
    // 74
    // distance
    // :
    // 3.7037742506826405
    // elevation
    // :
    // 166.4
    // heart_rate
    // :
    // 127
    // latitude
    // :
    // 35.713725
    // longitude
    // :
    // 139.299307
    // power
    // :
    // 283
    // speed
    // :
    // 13.333587302457506
    createPopupContent(marker) {
      const popupContent = `
          <b>Point</b><br>
          <p>Latitude: ${marker.latitude}</p>
          <p>Longitude: ${marker.longitude}</p>
          <p>Distance: ${marker.distance} meters</p>
          <p>Elevation: ${marker.elevation} meters</p>
            
        `;
      return popupContent;
    },

    deg2rad(deg) {
      return (deg * Math.PI) / 180;
    },

    // helper function to calculate the distance between two points
    getDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // radius of the Earth in km
      const dLat = this.deg2rad(lat2 - lat1);
      const dLon = this.deg2rad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.deg2rad(lat1)) *
          Math.cos(this.deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return distance;
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
