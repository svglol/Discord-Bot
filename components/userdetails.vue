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
        <div class="columns">
          <div class="column is-3">
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
          <div class="column is-3">
            <p class="label">
              Total Messages
            </p>
            <p class="data">
              {{ user.messages.length }}
            </p>
            <p class="label">
              Last Message Sent
            </p>
            <datereadable :date="lastMessageSent()" />
          </div>
          <div class="column is-3">
            <p class="label">
              Total Connection Time
            </p>
            <mstime :time="calculateConnectedTime(user.connections)" />
            <p class="label">
              Total Connections
            </p>
            <p class="data">
              {{ user.connections.length }}
            </p>
            <p class="label">
              Last Connection
            </p>
            <datereadable :date="lastConnection()" />
          </div>
          <div class="column is-3">
            <p class="label">
              Total Soundboard Usage
            </p>
            <p class="data">
              {{ user.soundboards.length }}
            </p>
            <p class="label">
              Last Soundboard Used
            </p>
            <datereadable :date="lastUsed()" />
          </div>
        </div>
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
    },
    lastMessageSent () {
      if (this.user.messages.length > 0) {
        return this.user.messages[this.user.messages.length - 1].date;
      } else {
        return 0;
      }
    },
    calculateConnectedTime (connections) {
      var totalMs = 0;
      connections.forEach((item, i) => {
        if (!isNaN(item.connectionLength)) {
          totalMs += item.connectionLength;
        }
      });

      return totalMs;
    },
    lastConnection () {
      if (this.user.connections.length > 0) {
        return Math.max(this.user.connections[this.user.connections.length - 1].connectTime, this.user.lastConnection);
      } else {
        return 0;
      }
    },
    lastUsed () {
      if (this.user.soundboards.length > 0) {
        return this.user.soundboards[this.user.soundboards.length - 1].date;
      } else {
        return 0;
      }
    }
  }
};
</script>

<style scoped>
.label{
  margin-bottom: 0!important;
}
</style>
