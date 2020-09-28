<template>
  <section class="container">
    <h1>Users</h1>
    <b-table
      :data="users"
      :bordered="true"
      :selected.sync="selected"
      :striped="true"
      default-sort="userid"
      default-sort-direction="desc"
      style="padding-top:1rem;padding-bottom:1rem"
      @dblclick="openUser"
    >
      <b-table-column
        v-slot="props"
        :custom-sort="sortByUserID"
        field="userid"
        label="User ID"
        sortable
      >
        {{ props.row.user_id }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="username"
        label="Username"
        sortable
      >
        {{ props.row.username }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="messages"
        label="Messages"
        sortable
        numeric
      >
        {{ props.row.messages.length }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        :custom-sort="sortBySoundboard"
        field="soundboard"
        label="Soundboard Uses"
        sortable
        numeric
      >
        {{ props.row.soundboards.length }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        :custom-sort="sortByTime"
        field="connections"
        label="Total Connection Time"
        sortable
      >
        <mstime :time="calculateConnectedTime(props.row.connections)" />
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="intro"
        label="Intro Message"
        sortable
      >
        {{ props.row.intro }}
        <b-button
          type="is-success"
          size="is-small"
          inverted
          icon-left="pencil"
          @click="editIntro(props.row)"
        />
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="exit"
        label="Exit Message"
        sortable
      >
        {{ props.row.exit }}
        <b-button
          type="is-success"
          size="is-small"
          inverted
          icon-left="pencil"
          @click="editExit(props.row)"
        />
      </b-table-column>
    </b-table>
  </section>
</template>

<script>
import axios from '~/plugins/axios';

export default {
  data () {
    return {
      selected: {}
    };
  },
  asyncData () {
    return axios.get('/api/users').then(res => {
      return { users: res.data };
    });
  },
  head () {
    return {
      title: 'Discord Bot - Users'
    };
  },
  methods: {
    calculateConnectedTime (connections) {
      var totalMs = 0;
      connections.forEach((item, i) => {
        if (!isNaN(item.connectionLength)) {
          totalMs += item.connectionLength;
        }
      });

      return totalMs;
    },
    sortByTime (a, b, isAsc) {
      if (isAsc) {
        return this.calculateConnectedTime(a.connections) - this.calculateConnectedTime(b.connections);
      } else {
        return this.calculateConnectedTime(b.connections) - this.calculateConnectedTime(a.connections);
      }
    },
    sortBySoundboard (a, b, isAsc) {
      if (isAsc) {
        return a.soundboards.length - b.soundboards.length;
      } else {
        return b.soundboards.length - a.soundboards.length;
      }
    },
    sortByUserID (a, b, isAsc) {
      if (isAsc) {
        return b.user_id - a.user_id;
      } else {
        return a.user_id - b.user_id;
      }
    },
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
    openUser () {
      this.$nuxt.$router.push({ path: '/users/' + this.selected.user_id });
    }
  }
};
</script>

<style scoped>
.button.is-small {
  font-size: 1rem;
  background: rgba(0,0,0,0);
  width: 1px;
  height: 1px;
}
</style>
