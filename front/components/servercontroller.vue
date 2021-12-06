<template>
  <div class="card" style="width: 100%">
    <header class="card-header" style="background-color: rgba(0, 114, 201, 1)">
      <p class="card-header-title" style="color: white">Server Status</p>
    </header>
    <div class="card-content">
      <div class="content">
        <p class="label">Uptime</p>
        <mstime :time="uptimeMS" class="data" />

        <p class="label">Total Users</p>
        <p class="data">
          {{ bot.totalUsers }}
        </p>

        <p class="label">Online Users</p>
        <p class="data">
          {{ bot.onlineUsers }}
        </p>

        <p class="label">Connected Users</p>
        <p class="data">
          {{ bot.connectedUsers }}
        </p>
      </div>
      <b-loading :active.sync="$fetchState.pending" :is-full-page="false" />
    </div>
    <footer class="card-footer">
      <b-button
        icon-left="cached"
        style="margin: 1rem"
        type="is-danger"
        @click="reset"
      >
        Reset
      </b-button>
    </footer>
  </div>
</template>

<script>
import gql from "graphql-tag";

const BOT_QUERY = gql`
  query bot {
    bot {
      totalUsers
      onlineUsers
      connectedUsers
      uptime
    }
  }
`;

const BOT_RESET_MUTATION = gql`
  mutation {
    reset
  }
`;

export default {
  data() {
    return {
      bot: {
        uptime: new Date().getTime(),
        totalUsers: 0,
        onlineUsers: 0,
        connectedUsers: 0,
      },
      interval: 0,
      uptimeMS: 0,
    };
  },
  watch: {},
  async fetch() {
    try {
      let res = await this.$apollo.query({
        query: BOT_QUERY,
      });
      this.bot = res.data.bot;
    } catch (err) {
      console.log(err);
    }
  },
  mounted() {
    this.updateUptime();
    this.interval = setInterval(this.updateUptime, 1000);
  },
  methods: {
    reset() {
      this.$apollo
        .mutate({
          mutation: BOT_RESET_MUTATION,
        })
        .then(() => {
          this.message = "";
          this.$buefy.toast.open({
            message: "Bot Restarted",
            type: "is-success",
          });
        });
    },
    updateUptime() {
      let now = new Date().getTime();
      let diffTime = now - this.bot.uptime;
      this.uptimeMS = diffTime;
    },
  },
};
</script>

<style scoped>
.label {
  margin-bottom: 0 !important;
}
</style>
