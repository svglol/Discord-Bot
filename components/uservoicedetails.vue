<template>
  <div
    class="card"
    style="width:100%"
  >
    <header
      class="card-header"
      style="background-color:rgba(0,114,201,1)"
    >
      <p
        class="card-header-title"
        style="color:white"
      >
        Voice
      </p>
    </header>
    <div class="card-content">
      <div class="content">
        <p class="label">
          Total Connection Time
        </p>
        <mstime :time="calculateConnectedTime(user.connections)" />
        <p class="label">
          Total Connections
        </p>
        <p class="data">
          {{ user.connections.length }}
        </p>
        <p class="label">
          Last Connection
        </p>
        <DateReadable :date="lastConnection()" />

        <vue-frappe
          v-if="renderChart"
          id="chart1"
          :labels="[
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
          ]"
          title="Monthly Connection Time"
          type="line"
          :height="300"
          :colors="['#0072c9']"
          :data-sets="chartData"
          :line-options="{regionFill: 1}"
          :tooltip-options="{
            formatTooltipX: d => (d + '').toUpperCase(),
            formatTooltipY: d => d + ' hours',
          }"
        />
        <b-field
          label="Year"
          label-position="inside"
        >
          <b-select
            v-model="yearFilter"
            placeholder="Filter"
          >
            <option
              v-for="option in yearFilterOptions"
              :key="option"
              :value="option"
            >
              {{ option }}
            </option>
          </b-select>
        </b-field>
      </div>
    </div>
  </div>
</template>

<script>

import mstime from '~/components/mstime.vue';
const currentYear = new Date().getFullYear();

export default {
  components: {mstime},
  props: { user: {
    type: Object,
    required: true
  }},
  data () {
    return {
      yearFilter: '',
      yearFilterOptions: [],
      chartData: [],
      renderChart: false
    };
  },
  watch: {
    monthFilter () {
      this.filter();
    },
    yearFilter () {
      this.filter();
    }
  },
  mounted () {
    // get current month
    this.yearFilter = currentYear;
    // create year filter options
    this.yearFilterOptions.push(currentYear);
    for (var i = 0; i < (currentYear - 2020); i++) {
      this.yearFilterOptions.push(currentYear - (i + 1));
    }
  },
  methods: {
    filter () {
      this.renderChart = false;
      let monthlyConnectionTime = new Map();
      for (var i = 0; i < 12; i++) {
        monthlyConnectionTime.set(i, 0);
      }
      this.user.connections.forEach((item, i) => {
        let connectionDate = new Date(item.connectTime);
        let connectionMonth = connectionDate.getMonth();
        if (connectionDate.getFullYear() === this.yearFilter) {
          let month = monthlyConnectionTime.get(connectionMonth);
          if (!isNaN(item.connectionLength)) {
            let num = month + item.connectionLength;
            monthlyConnectionTime.set(connectionMonth, num);
          }
        }
      });
      let values = [];
      this.chartData = [];
      monthlyConnectionTime.forEach((item, i) => {
        values.push(msToHours(item));
      });

      this.chartData.push({values: values});
      this.renderChart = true;
    },
    calculateConnectedTime (connections) {
      var totalMs = 0;
      connections.forEach((item, i) => {
        if (!isNaN(item.connectionLength)) {
          totalMs += item.connectionLength;
        }
      });

      return totalMs;
    },
    lastConnection () {
      return Math.max(this.user.connections[this.user.connections.length - 1].connectTime, this.user.lastConnection);
    }
  }
};

function msToHours (duration) {
  var hours = Math.floor((duration / (1000 * 60 * 60)));
  return hours;
}
</script>

<style scoped>
.label{
  margin-bottom: 0!important;
}
</style>
