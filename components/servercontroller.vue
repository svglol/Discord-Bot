<template>
  <div
    class="card"
    style="width:100%"
  >
    <header
      class="card-header"
      style="background-color:rgba(0,114,201,1)"
    >
      <p
        class="card-header-title"
        style="color:white"
      >
        Server Status
      </p>
    </header>
    <div class="card-content">
      <div class="content">
        <p class="label">
          Uptime
        </p>
        <mstime
          :time="uptimeMS"
          class="data"
        />

        <p class="label">
          Total Users
        </p>
        <p class="data">
          {{ totalUsers }}
        </p>

        <p class="label">
          Online Users
        </p>
        <p class="data">
          {{ onlineUsers }}
        </p>

        <p class="label">
          Connected Users
        </p>
        <p class="data">
          {{ connectedUsers }}
        </p>
      </div>
      <b-loading
        :active.sync="loading"
        :is-full-page="false"
      />
    </div>
    <footer class="card-footer">
      <b-button
        icon-left="cached"
        style="margin:1rem"
        type="is-danger"
        @click="reset"
      >
        Reset
      </b-button>
    </footer>
  </div>
</template>

<script>
import axios from '~/plugins/axios';

export default {
  data () {
    return {
      uptime: 0,
      totalUsers: 0,
      onlineUsers: 0,
      connectedUsers: 0,
      loading: true,
      interval: 0,
      uptimeMS: 0
    };
  },
  watch: {
  },
  mounted () {
    var ctx = this;
    axios.get('/api/bot/').then(result => {
      ctx.totalUsers = result.data.totalUsers;
      ctx.onlineUsers = result.data.onlineUsers;
      ctx.uptime = result.data.uptime;
      ctx.connectedUsers = result.data.connectedUsers;
      ctx.loading = false;
      this.updateUptime();
      ctx.interval = setInterval(this.updateUptime, 1000);
    });
  },
  methods: {
    reset () {
      var ctx = this;
      axios.post('/api/bot', {
        reset: true
      }).then(result => {
        ctx.message = '';
        ctx.$buefy.toast.open({
          message: 'Bot Restarted',
          type: 'is-success'
        });
      });
    },
    updateUptime () {
      let now = new Date().getTime();
      let diffTime = now - this.uptime;
      this.uptimeMS = diffTime;
    }
  }
};

</script>

<style scoped>

.label{
  margin-bottom: 0!important;
}

</style>
