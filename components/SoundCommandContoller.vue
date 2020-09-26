<template>
  <div
    class="card"
    style="width:100%">
    <header
      class="card-header"
      style="background-color:rgba(0,114,201,1)">
      <p
        class="card-header-title"
        style="color:white">
        Sound Command Controller
      </p>
    </header>
    <div class="card-content">
      <div class="content">
        <b-field label="Server">
          <b-select
            v-model="server"
            placeholder="Select a server">
            <option
              v-for="option in servers"
              :value="option.id"
              :key="option.id">
              {{ option.name }}
            </option>
          </b-select>
        </b-field>

        <b-field label="Voice Channel">
          <b-select
            v-model="channel"
            placeholder="Select a voice channel">
            <option
              v-for="option in channels"
              :value="option.id"
              :key="option.id">
              {{ option.name }}
            </option>
          </b-select>
        </b-field>

        <b-field label="Sound Command">
          <b-select
            v-model="sound"
            placeholder="Select a sound command">
            <option
              v-for="option in soundcommands"
              :value="option.command"
              :key="option.command">
              {{ option.command }}
            </option>
          </b-select>
        </b-field>

        <b-button
          icon-left="play"
          type="is-success"
          @click="play">
          Queue
        </b-button>

      </div>
      <b-loading
        :active.sync="soundcommands.length < 1 || servers.length < 1"
        :is-full-page="false"/>
    </div>
    <footer class="card-footer">

      <b-button
        icon-left="stop"
        style="margin:1rem"
        type="is-danger"
        @click="stop">
        Stop
      </b-button>
      <b-button
        icon-left="skip-next"
        style="margin-top:1rem"
        type="is-warning"
        @click="skip">
        Skip
      </b-button>
    </footer>
  </div>
</template>

<script>
import axios from '../plugins/axios';

export default {
  data () {
    return {
      soundcommands: [],
      servers: [],
      channels: [],
      server: '',
      channel: '',
      sound: ''
    };
  },
  watch: {
    server: function (newVal) {
      var ctx = this;
      // get voice channels
      axios.get('/api/discord/servers/' + newVal + '/voicechannels').then(result => {
        ctx.channels = result.data;
        ctx.channel = ctx.channels[0].id;
      });
    }
  },
  mounted () {
    var ctx = this;
    axios.get('/api/discord/servers').then(result => {
      ctx.servers = result.data;
      ctx.server = ctx.servers[0].id;
    });

    axios.get('/api/soundcommands').then(result => {
      ctx.soundcommands = result.data;
      ctx.soundcommands.sort(function (a, b) {
        if (a.command < b.command) { return -1; }
        if (a.command > b.command) { return 1; }
        return 0;
      });
      ctx.sound = {};
    });
  },
  methods: {
    play () {
      if (this.sound) {
        var ctx = this;
        axios.post('/api/bot', {
          play: true,
          server: ctx.server,
          channel: ctx.channel,
          sound: ctx.sound
        }).then(result => {
          ctx.$buefy.toast.open({
            message: 'Added to Queue',
            type: 'is-success'
          });
        });
      }
    },
    skip () {
      var ctx = this;
      axios.post('/api/bot', {
        skip: true
      }).then(result => {
        ctx.$buefy.toast.open({
          message: 'Skipped',
          type: 'is-success'
        });
      });
    },
    stop () {
      var ctx = this;
      axios.post('/api/bot', {
        stop: true
      }).then(result => {
        ctx.$buefy.toast.open({
          message: 'Stopped',
          type: 'is-success'
        });
      });
    }
  }
};

</script>

<style scoped>

</style>
