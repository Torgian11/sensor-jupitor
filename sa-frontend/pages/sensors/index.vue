<template lang="pug">
.sensor-list
    h2 List of Sensors
    div(v-if="sensors.value.length")
        v-simple-table
            template(v-slot:default)
                thead: tr
                    th(v-for="header in tableHeaders" :key="header") {{ header }}
                tbody
                    tr(v-for="sensor in sensors.value" :key="sensor.id")
                        td {{ sensor }}
                        //- td {{ item.name }}
                        //- td {{ item.description }}
                        //- td {{ item.}}
    div(v-else)
        span No Sensors Available 

</template>
<script lang="ts">
import { useSensorStore } from '~/stores/sensors'

import { Sensors } from '~/composables/useSensors'

export default defineComponent({
    name: "Sensors",

    setup() {
        const sensorsStore = useSensorStore()

        useAsyncData(async() => await sensorsStore.getSensors())

        const sensors = ref<Sensors>(sensorsStore.sensorList)

        const tableHeaders = [
            {title: 'Name', key: 'name'},
            {title: 'Desc', key: 'description'},
            {title: 'Link', key: 'Datastreams@iot.navigationLink'},
        ]
        return {
            sensors,
            tableHeaders,
        }
    }
})
</script>