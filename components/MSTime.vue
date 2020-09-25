<template>
  <div>
    {{ fullTime }}
  </div>
</template>

<script>
export default {
  props: { time: {
    type: Number,
    default: 0,
    required: true
  }},
  data () {
    return {
      fullTime: ''
    };
  },
  watch: {
    time: function (newVal, oldVal) {
      this.fullTime = parseMillisecondsIntoReadableTime(newVal);
    }
  },
  mounted () {
    this.fullTime = parseMillisecondsIntoReadableTime(this.time);
  }
};

function parseMillisecondsIntoReadableTime (millisec) {
  var seconds = (millisec / 1000).toFixed(0);
  var minutes = Math.floor(seconds / 60);
  var hours = '';
  if (minutes > 59) {
    hours = Math.floor(minutes / 60);
    hours = hours >= 10 ? hours : '0' + hours;
    minutes = minutes - hours * 60;
    minutes = minutes >= 10 ? minutes : '0' + minutes;
  }

  seconds = Math.floor(seconds % 60);
  seconds = seconds >= 10 ? seconds : '0' + seconds;
  if (hours !== '') {
    return hours + ':' + minutes + ':' + seconds;
  }
  return minutes + ':' + seconds;
}
</script>

<style scoped>

</style>
