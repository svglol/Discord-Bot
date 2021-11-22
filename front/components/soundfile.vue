<template>
  <div>
    <div v-if="fileExists">
      {{ filename }}
      <b-button size="is-small" rounded icon-left="play" @click="playSound" />
    </div>
    <b-tag v-else type="is-danger"> File not found </b-tag>
  </div>
</template>

<script>
import gql from "graphql-tag";

const SOUND_COMMAND_FILE_EXISTS_QUERY = gql`
  query soundCommandFileExists($id: ID!) {
    soundCommandFileExists(id: $id)
  }
`;

const SOUND_COMMAND_FILE_QUERY = gql`
  query soundCommandFile($id: ID!) {
    soundCommandFile(id: $id)
  }
`;

export default {
  props: {
    soundCommand: { type: Object, required: true },
  },
  data() {
    return {
      filename: "",
      fileExists: false
    };
  },
  watch: {
    soundCommand: function (newVal, oldVal) {
      this.filename = this.soundCommand.file.replace("./resources/sound/", "");
    },
  },
  async mounted() {
    this.filename = this.soundCommand.file.replace("./resources/sound/", "");

    let res = await this.$apollo.query({
      query: SOUND_COMMAND_FILE_EXISTS_QUERY,
      variables: { id: this.soundCommand.id },
    });

    this.fileExists = res.data.soundCommandFileExists;
  },
  methods: {
    async playSound() {
      let res = await this.$apollo.query({
        query: SOUND_COMMAND_FILE_QUERY,
        variables: { id: this.soundCommand.id },
      });
      var snd = new Audio("data:audio/wav;base64," + res.data.soundCommandFile);
      snd.play();
    },
  },
};
</script>

<style scoped>
</style>
