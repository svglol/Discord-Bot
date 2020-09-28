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
        Soundboard
      </p>
    </header>
    <div class="card-content">
      <div class="content">
        <p class="label">
          Total Soundboard Usage
        </p>
        <p class="data">
          {{ user.soundboards.length }}
        </p>
        <p class="label">
          Last Soundboard Used
        </p>
        <datereadable :date="user.soundboards[user.soundboards.length-1].date" />

        <vue-frappe
          v-if="renderChart"
          id="soundChart"
          :labels="[
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
          ]"
          title="Monthly Soundboard Usage"
          type="line"
          :height="300"
          :colors="['#0072c9']"
          :data-sets="chartData"
          :line-options="{regionFill: 1}"
          :tooltip-options="{
            formatTooltipX: d => (d + '').toUpperCase(),
            formatTooltipY: d => d + ' messages',
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

        <vue-frappe
          v-if="renderChart"
          id="commandsChart"
          :labels="commandsLabels"
          title="Most Used Commands"
          type="bar"
          :height="300"
          :colors="['#0072c9']"
          :data-sets="commandsData"
          :line-options="{regionFill: 1}"
          :tooltip-options="{
            formatTooltipX: d => (d + '').toUpperCase(),
            formatTooltipY: d => d + ' uses',
          }"
        />
      </div>
    </div>
  </div>
</template>

<script>

const currentYear = new Date().getFullYear();

export default {
  props: { user: {
    type: Object,
    required: true
  }},
  data () {
    return {
      yearFilter: '',
      yearFilterOptions: [],
      chartData: [],
      renderChart: false,
      commandsLabels: [],
      commandsData: []
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

    // get top 10 most used sound commands
    let soundCommandsUsed = [];
    this.user.soundboards.forEach((item, i) => {
      let scItem = soundCommandsUsed.find(element => element.command === item.command);
      if (scItem) {
        let num = scItem.count + 1;
        scItem.count = num;
      } else {
        soundCommandsUsed.push({command: item.command, count: 1});
      }
    });
    soundCommandsUsed.sort(function (a, b) {
      return b.count - a.count;
    });

    const topTen = soundCommandsUsed.filter(function (item) {
      if (this.count < 5) {
        this.count++;
        return true;
      }
      return false;
    }, {count: 0});
    let values = [];
    this.commandsData = [];
    topTen.forEach((item, i) => {
      this.commandsLabels.push(item.command);
      values.push(item.count);
    });
    this.commandsData.push({values: values});
  },
  methods: {
    filter () {
      this.renderChart = false;
      let monthlySoundboards = new Map();
      for (var i = 0; i < 12; i++) {
        monthlySoundboards.set(i, 0);
      }
      this.user.soundboards.forEach((item, i) => {
        let soundboardDate = new Date(item.date);
        let soundboardMonth = soundboardDate.getMonth();
        if (soundboardDate.getFullYear() === this.yearFilter) {
          let month = monthlySoundboards.get(soundboardMonth);
          let num = month + 1;
          monthlySoundboards.set(soundboardMonth, num);
        }
      });
      let values = [];
      this.chartData = [];
      monthlySoundboards.forEach((item, i) => {
        values.push(item);
      });

      this.chartData.push({values: values});
      this.renderChart = true;
    }
  }
};
</script>

<style scoped>
.label{
  margin-bottom: 0!important;
}
</style>
