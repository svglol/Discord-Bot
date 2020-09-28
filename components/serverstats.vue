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
          :labels="[
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
          ]"
          type="axis-mixed"
          :height="600"
          :colors="['#0072c9', '#FF3860', '#FFDD57']"
          :data-sets="chartData"
          :line-options="{regionFill: 1}"
          :tooltip-options="{
            formatTooltipX: d => (d + '').toUpperCase(),
            formatTooltipY: d => d + '',
          }"
        />
      </div>
      <b-loading
        :active.sync="loading"
        :is-full-page="false"
      />
    </div>
  </div>
</template>

<script>
import axios from '~/plugins/axios';

const currentYear = new Date().getFullYear();

export default {
  data () {
    return {
      users: [],
      loading: true,
      renderChart: false,
      chartData: []
    };
  },
  watch: {
    users () {
      let monthlyMessages = new Map();
      let monthlyConnectionTime = new Map();
      let monthlySoundboards = new Map();
      for (var i = 0; i < 12; i++) {
        monthlyMessages.set(i, 0);
        monthlyConnectionTime.set(i, 0);
        monthlySoundboards.set(i, 0);
      }

      // get user messages
      this.users.forEach((user, i) => {
        user.messages.forEach((item, i) => {
          let messageDate = new Date(item.date);
          let messageMonth = messageDate.getMonth();
          if (messageDate.getFullYear() === currentYear) {
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

      this.chartData.push({name: 'Messages', chartType: 'line', values: values});

      // get user hours
      this.users.forEach((user, i) => {
        user.connections.forEach((item, i) => {
          let connectionDate = new Date(item.connectTime);
          let connectionMonth = connectionDate.getMonth();
          if (connectionDate.getFullYear() === currentYear) {
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
      this.chartData.push({name: 'Hours', chartType: 'line', values: values});

      // get soundboard usage
      this.users.forEach((user, i) => {
        user.soundboards.forEach((item, i) => {
          let soundboardDate = new Date(item.date);
          let soundboardMonth = soundboardDate.getMonth();
          if (soundboardDate.getFullYear() === currentYear) {
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
      this.chartData.push({name: 'Sound Cmds', chartType: 'line', values: values});
      this.renderChart = true;
    }
  },
  mounted () {
    let ctx = this;
    axios.get('/api/users/').then(result => {
      ctx.users = result.data;
      ctx.loading = false;
    });
  },
  methods: {
  }

};
function msToHours (duration) {
  var hours = Math.floor((duration / (1000 * 60 * 60)));
  return hours;
}
</script>

<style>
.content li + li{
  margin: 0;
}

</style>
