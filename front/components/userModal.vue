<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Edit {{ user.username }}</p>
    </header>
    <section class="modal-card-body">
      <b-field label="Intro Message">
        <b-input ref="intro" v-model="vIntro" />
      </b-field>
      <b-field label="Exit Message">
        <b-input ref="exit" v-model="vExit" />
      </b-field>
      <b-checkbox v-model="vAdminPermission">Admin Permission</b-checkbox>
    </section>

    <footer class="modal-card-foot" style="justify-content: flex-end">
      <button class="button" type="button" @click="$emit('close')">
        Close
      </button>
      <button class="button is-primary" @click="update">Update</button>
    </footer>
  </div>
</template>

<script>
export default {
  props: {
    user: { type: Object, default: {} },
  },
  data() {
    return {
      vIntro: this.user.intro,
      vExit: this.user.exit,
      vAdminPermission: this.user.adminPermission,
    };
  },
  watch: {
    user: function (newVal, oldVal) {
      this.vIntro = newVal.intro;
      this.vExit = newVal.exit;
      this.vAdminPermission = newVal.adminPermission;
    },
  },
  methods: {
    update() {
      this.user.intro = this.vIntro;
      this.user.exit = this.vExit;
      this.user.adminPermission = this.vAdminPermission;
      this.$emit("update", {
        user: this.user,
      });
    },
  },
};
</script>

<style scoped>
</style>
