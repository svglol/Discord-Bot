<template>
  <div
    class="card"
    style="width:100%"
  >
    <header
      class="card-header"
    >
      <p
        class="card-header-title"
      >
        Sound Commands
      </p>
    </header>
    <div class="card-content">
      <div class="content">
        <vue-frappe
          v-if="renderChart"
          id="statsCommandsChart"
          :labels="labels"
          type="bar"
          :height="500"
          :colors="['#0072c9']"
          :data-sets="chartData"
          :line-options="{regionFill: 1}"
          :tooltip-options="{
            formatTooltipX: d => (d + '').toUpperCase(),
            formatTooltipY: d => d + '',
          }"
        />
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: { users: {
    type: Array,
    required: true
  }},
  data () {
    return {
      renderChart: false,
      chartData: [],
      labels: []
    };
  },
  watch: {
    users (newVal) {

    }
  },
  mounted () {
    let soundCommandsUsed = [];
    this.users.forEach((user, i) => {
      user.soundboards.forEach((item, i) => {
        let scItem = soundCommandsUsed.find(element => element.command === item.command);
        if (scItem) {
          let num = scItem.count + 1;
          scItem.count = num;
        } else {
          soundCommandsUsed.push({command: item.command, count: 1});
        }
      });
    });
    soundCommandsUsed.sort(function (a, b) {
      return b.count - a.count;
    });

    const filteredCommands = soundCommandsUsed.filter(function (item) {
      if (this.count < 50) {
        this.count++;
        return true;
      }
      return false;
    }, {count: 0});

    let values = [];
    this.commandsData = [];
    filteredCommands.forEach((item, i) => {
      this.labels.push(item.command);
      values.push(item.count);
    });
    this.chartData.push({name: '', chartType: 'bar', values: values});
    this.renderChart = true;
  },
  methods: {
  }

};

</script>

<style>
.content li + li{
  margin: 0;
}

</style>
