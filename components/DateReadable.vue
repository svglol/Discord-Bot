<template>
  <div>
    {{ dateFormatted }}
  </div>
</template>

<script>
export default {
  props: {
    date: {type: Number, default: 0, required: true}
  },
  data () {
    return {
      dateFormatted: ''
    };
  },
  watch: {
    date: function (newVal, oldVal) {
      this.dateFormatted = parseReadable(newVal);
    }
  },
  mounted () {
    this.dateFormatted = parseReadable(this.date);
  }
};

function parseReadable (millisec) {
  if (millisec === 0) {
    return '';
  }
  var date = new Date(millisec);
  return date.toLocaleString();
}
</script>

<style scoped>

</style>
