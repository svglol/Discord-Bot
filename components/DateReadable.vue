<template>
  <div>
    {{dateFormatted}}
  </div>
</template>

<script>
export default {
  props: ['date'],
  data () {
    return {
      dateFormatted:''
    }
  },
  mounted(){
    this.dateFormatted = parseReadable(this.date);
  },
  watch: {
    date: function(newVal, oldVal) {
      this.dateFormatted = parseReadable(newVal);
    }
  }
};

function parseReadable(millisec) {
  if(millisec === 0){
    return '';
  }
  var date = new Date(millisec);
  return date.toLocaleString();
}
</script>

<style scoped>

</style>
