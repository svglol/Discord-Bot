<template>
  <div>
    {{ filename }}
    <b-button
      size="is-small"
      rounded
      icon-left="play"
      @click="playSound"/>
  </div>
</template>

<script>
import axios from '~/plugins/axios';

export default {
  props: {
    soundCommand: {type: Object, required: true}
  },
  data () {
    return {
      filename: ''
    };
  },
  watch: {
    soundCommand: function (newVal, oldVal) {
      this.filename = this.soundCommand.file.replace('./resources/sound/', '');
    }
  },
  mounted () {
    this.filename = this.soundCommand.file.replace('./resources/sound/', '');
  },
  methods: {
    async playSound () {
      let { data } = await axios.get('/api/soundcommands/file/' + this.soundCommand.id);
      var snd = new Audio('data:audio/wav;base64,' + data.sound);
      snd.play();
    }
  }
};
</script>

<style scoped>

</style>
