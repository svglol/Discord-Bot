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
        User
      </p>
    </header>
    <div class="card-content">
      <div class="content">
        <p class="label">
          User ID
        </p>
        <p class="data">
          {{ user.user_id }}
        </p>
        <p class="label">
          Username
        </p>
        <p class="data">
          {{ user.username }}
        </p>
        <p class="label">
          Intro Message
        </p>
        <p class="data">
          {{ user.intro }}
          <b-button
            type="is-success"
            size="is-small"
            inverted
            icon-left="pencil"
            @click="editIntro(user)"
          />
        </p>
        <p class="label">
          Exit Message
        </p>
        <p class="data">
          {{ user.exit }}
          <b-button
            type="is-success"
            size="is-small"
            inverted
            icon-left="pencil"
            @click="editExit(user)"
          />
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '~/plugins/axios';

export default {
  props: { user: {
    type: Object,
    required: true
  }},
  data () {
    return {
    };
  },
  methods: {
    editIntro (user) {
      var ctx = this;
      this.$buefy.dialog.prompt({
        message: `Edit ` + user.username + ' Intro Message',
        inputAttrs: {
          placeholder: '',
          value: user.intro,
          required: false
        },
        confirmText: 'Update',
        trapFocus: true,
        onConfirm: (value) => {
          if (JSON.stringify(value) !== JSON.stringify(user.intro) || (value !== '' && user.intro === null)) {
            axios.post('/api/users/' + user.user_id, {
              intro: value
            })
              .then(function (response) {
                user.intro = value;
                ctx.$buefy.toast.open({
                  message: 'Intro Message updated',
                  type: 'is-success'
                });
              })
              .catch(function (error) {
                console.log(error);
              });
          }
        }
      });
    },
    editExit (user) {
      var ctx = this;
      this.$buefy.dialog.prompt({
        message: `Edit ` + user.username + ' Exit Message',
        inputAttrs: {
          placeholder: '',
          value: user.exit,
          required: false
        },
        confirmText: 'Update',
        trapFocus: true,
        onConfirm: (value) => {
          if (JSON.stringify(value) !== JSON.stringify(user.exit) || (value !== '' && user.exit === null)) {
            axios.post('/api/users/' + user.user_id, {
              exit: value
            })
              .then(function (response) {
                user.exit = value;
                ctx.$buefy.toast.open({
                  message: 'Exit Message updated',
                  type: 'is-success'
                });
              })
              .catch(function (error) {
                console.log(error);
              });
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.label{
  margin-bottom: 0!important;
}
</style>
