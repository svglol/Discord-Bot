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
        Messages
      </p>
    </header>
    <div class="card-content">
      <div class="content">
        <p class="label">
          Total Messages
        </p>
        <p class="data">
          {{ user.messages.length }}
        </p>
        <p class="label">
          Last Message Sent
        </p>
        <DateReadable :date="user.messages[user.messages.length-1].date" />

        <vue-frappe
          v-if="renderChart"
          id="messageChart"
          :labels="[
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
          ]"
          title="Monthly Messages"
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
      let monthlyMessages = new Map();
      for (var i = 0; i < 12; i++) {
        monthlyMessages.set(i, 0);
      }
      this.user.messages.forEach((item, i) => {
        let messageDate = new Date(item.date);
        let messageMonth = messageDate.getMonth();
        if (messageDate.getFullYear() === this.yearFilter) {
          let month = monthlyMessages.get(messageMonth);
          let num = month + 1;
          monthlyMessages.set(messageMonth, num);
        }
      });
      let values = [];
      this.chartData = [];
      monthlyMessages.forEach((item, i) => {
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
