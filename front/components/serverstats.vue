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
        Server Stats
      </p>
    </header>
    <div class="card-content">
      <div class="content">
        <vue-frappe
          v-if="renderChart"
          id="statsChart"
          :labels="labels"
          type="axis-mixed"
          :height="500"
          :colors="['#0072c9', '#FF3860', '#FFDD57']"
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
      labels: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
    };
  },
  watch: {
    users (newVal) {

    }
  },
  mounted () {
    const diff = 12 - new Date().getMonth();
    rearrangeArray(this.labels, diff);

    let monthlyMessages = new Map();
    let monthlyConnectionTime = new Map();
    let monthlySoundboards = new Map();
    for (let i = 0; i < 12; i++) {
      monthlyMessages.set(i, 0);
      monthlyConnectionTime.set(i, 0);
      monthlySoundboards.set(i, 0);
    }

    // get user messages
    this.users.forEach((user, i) => {
      user.messages.forEach((item, i) => {
        let messageDate = new Date(item.date);
        let messageMonth = messageDate.getMonth();
        if (rollingYear(messageDate)) {
          let month = monthlyMessages.get(messageMonth);
          let num = month + 1;
          monthlyMessages.set(messageMonth, num);
        }
      });
    });
    let values = [];
    this.chartData = [];
    monthlyMessages.forEach((item, i) => {
      values.push(item);
    });
    rearrangeArray(values, diff);
    this.chartData.push({name: 'Messages', chartType: 'line', values: values});

    // get user hours
    this.users.forEach((user, i) => {
      user.connections.forEach((item, i) => {
        let connectionDate = new Date(item.connectTime);
        let connectionMonth = connectionDate.getMonth();
        if (rollingYear(connectionDate)) {
          let month = monthlyConnectionTime.get(connectionMonth);
          if (!isNaN(item.connectionLength)) {
            let num = month + item.connectionLength;
            monthlyConnectionTime.set(connectionMonth, num);
          }
        }
      });
    });
    values = [];
    monthlyConnectionTime.forEach((item, i) => {
      values.push(msToHours(item));
    });
    rearrangeArray(values, diff);
    this.chartData.push({name: 'Hours', chartType: 'line', values: values});

    // get soundboard usage
    this.users.forEach((user, i) => {
      user.soundboards.forEach((item, i) => {
        let soundboardDate = new Date(item.date);
        let soundboardMonth = soundboardDate.getMonth();
        if (rollingYear(soundboardDate)) {
          let month = monthlySoundboards.get(soundboardMonth);
          let num = month + 1;
          monthlySoundboards.set(soundboardMonth, num);
        }
      });
    });
    values = [];
    monthlySoundboards.forEach((item, i) => {
      values.push(item);
    });
    rearrangeArray(values, diff);
    this.chartData.push({name: 'Sound Cmds', chartType: 'line', values: values});
    this.renderChart = true;
  },
  methods: {
  }

};
function msToHours (duration) {
  var hours = Math.floor((duration / (1000 * 60 * 60)));
  return hours;
}

function rollingYear (d1) {
  var diff = Math.abs(d1.getTime() - new Date().getTime());
  diff = diff / (1000 * 60 * 60 * 24);
  if (diff < 365) {
    return true;
  }
  return false;
};

function rearrangeArray (arr, amount) {
  for (let i = 1; i < amount; i++) {
    arr.unshift(arr.pop());
  }
}

</script>

<style>
.content li + li{
  margin: 0;
}

</style>
