<template>
  <div class="modal-card">
    <header class="modal-card-head" >
      <p
        v-if="id == 0"
        class="modal-card-title">Add New Sound Command</p>
      <p
        v-if="id !== 0"
        class="modal-card-title">Update Sound Command</p>
    </header>
    <section class="modal-card-body">
      <b-field label="Command">
        <b-input
          ref="command"
          v-model="vCommand"
          required
          validation-message="Command required"/>
        <p
          v-if="!validCommand"
          class="help is-danger">Command name is already taken</p>
      </b-field>

      <b-field label="Sound File">
        <b-upload
          v-model="vFile"
          class="file-label"
          accept="audio/wav">
          <span class="file-cta">
            <b-icon
              class="file-icon"
              icon="upload"/>
            <span class="file-label">Click to upload</span>
          </span>
          <span
            v-if="vFile"
            class="file-name">
            {{ vFile.name }}
          </span>
          <span
            v-else-if="oldFile"
            class="file-name">
            {{ oldFile }}
          </span>
        </b-upload>
      </b-field>

      <b-field label="Volume">
        <b-numberinput
          ref="volume"
          v-model="vVolume"
          step="0.1"
          min="0"
          max="1"
          required/>
      </b-field>
    </section>

    <footer
      class="modal-card-foot"
      style="justify-content: flex-end;">
      <button
        class="button"
        type="button"
        @click="$emit('close');$refs.command.setValidity(true);$refs.volume.setValidity(true)">Close</button>
      <button
        v-if="id !== 0"
        class="button is-primary"
        @click="updateCommand" >Update</button>
      <button
        v-if="id == 0"
        class="button is-primary"
        @click="addCommand">Add</button>
    </footer>
  </div>
</template>

<script>
import axios from '~/plugins/axios';

export default {
  props: {
    id: {type: Number, default: 0},
    command: {type: String, default: ''},
    file: {type: String, default: ''},
    volume: {type: Number, default: 0}
  },
  data () {
    return {
      vCommand: this.command,
      vFile: null,
      oldFile: this.file.replace('./resources/sound/', ''),
      vVolume: this.volume,
      validCommand: true
    };
  },
  watch: {
    command: function (newVal, oldVal) {
      this.vCommand = newVal;
    },
    volume: function (newVal, oldVal) {
      this.vVolume = newVal;
    },
    file: function (newVal, oldVal) {
      if (newVal !== null) {
        this.oldFile = newVal.replace('./resources/sound/', '');
      }
      this.vFile = null;
    },
    vCommand: function (newVal) {
      let ctx = this;
      if (newVal !== '' && newVal !== this.command) {
        axios.get('/api/discord/command/' + newVal, {
          command: newVal
        })
          .then(function (response) {
            if (response.data === 'OK') {
              ctx.validCommand = true;
              ctx.$refs.command.setValidity(true);
            } else {
              ctx.validCommand = false;
              ctx.$refs.command.setValidity(false);
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {
        ctx.validCommand = true;
        ctx.$refs.command.setValidity(true);
      }
    }
  },
  mounted () {

  },
  methods: {
    updateCommand () {
      if (this.valid()) {
        if (this.vFile !== null) {
          this.$emit('update', {id: this.id, command: this.vCommand, volume: this.vVolume, file: this.vFile});
        } else {
          this.$emit('update', {id: this.id, command: this.vCommand, volume: this.vVolume});
        }
      }
    },
    addCommand () {
      if (this.valid()) {
        this.$emit('add', {id: this.id, command: this.vCommand, volume: this.vVolume, file: this.vFile});
      }
    },
    valid () {
      this.$refs.command.checkHtml5Validity();
      this.$refs.volume.checkHtml5Validity();
      if (this.vCommand === '') return false;
      if (this.vLink === '') return false;
      if (this.validCommand === false) return false;
      return true;
    }
  }
};

</script>

<style scoped>

</style>
