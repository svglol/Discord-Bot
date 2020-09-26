<template>
  <div class="modal-card">
    <header class="modal-card-head" >
      <p
        v-if="id == 0"
        class="modal-card-title">Add New Text Command</p>
      <p
        v-if="id !== 0"
        class="modal-card-title">Update Text Command</p>
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
      <b-field label="Text">
        <b-input
          ref="link"
          v-model="vLink"
          required
          validation-message="Text required"/>
      </b-field>
    </section>

    <footer
      class="modal-card-foot"
      style="justify-content: flex-end;">
      <button
        class="button"
        type="button"
        @click="$emit('close');$refs.command.setValidity(true);$refs.link.setValidity(true)">Close</button>
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
    link: {type: String, default: ''}
  },
  data () {
    return {
      vCommand: this.command,
      vLink: this.link,
      validCommand: true
    };
  },
  watch: {
    command: function (newVal, oldVal) { // watch it
      this.vCommand = newVal;
    },
    link: function (newVal, oldVal) {
      this.vLink = newVal;
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
        this.$emit('update', {id: this.id, command: this.vCommand, link: this.vLink});
      }
    },
    addCommand () {
      if (this.valid()) {
        this.$emit('add', {id: this.id, command: this.vCommand, link: this.vLink});
      }
    },
    valid () {
      this.$refs.command.checkHtml5Validity();
      this.$refs.link.checkHtml5Validity();
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
