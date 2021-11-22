<template>
  <div class="card" style="width: 100%">
    <header class="card-header" style="background-color: rgba(0, 114, 201, 1)">
      <p class="card-header-title" style="color: white">
        Sound Command Controller
      </p>
    </header>
    <div class="card-content">
      <div class="content">
        <b-field label="Server">
          <b-select v-model="server" placeholder="Select a server">
            <option
              v-for="option in servers"
              :key="option.id"
              :value="option.id"
            >
              {{ option.name }}
            </option>
          </b-select>
        </b-field>

        <b-field label="Voice Channel">
          <b-select v-model="channel" placeholder="Select a voice channel">
            <option
              v-for="option in channels"
              :key="option.id"
              :value="option.id"
            >
              {{ option.name }}
            </option>
          </b-select>
        </b-field>

        <b-field label="Sound Command">
          <b-select v-model="sound" placeholder="Select a sound command">
            <option
              v-for="option in soundcommands"
              :key="option.command"
              :value="option.command"
            >
              {{ option.command }}
            </option>
          </b-select>
        </b-field>

        <b-button icon-left="play" type="is-success" @click="play">
          Queue
        </b-button>
      </div>
      <b-loading
        :active.sync="soundcommands.length < 1 || servers.length < 1"
        :is-full-page="false"
      />
    </div>
    <footer class="card-footer">
      <b-button
        icon-left="stop"
        style="margin: 1rem"
        type="is-danger"
        @click="stop"
      >
        Stop
      </b-button>
      <b-button
        icon-left="skip-next"
        style="margin-top: 1rem"
        type="is-warning"
        @click="skip"
      >
        Skip
      </b-button>
    </footer>
  </div>
</template>

<script>
import gql from "graphql-tag";

const SERVER_QUERY = gql`
  query {
    servers {
      id
      name
    }
  }
`;

const SOUND_COMMANDS_QUERY = gql`
  query {
    soundCommands {
      id
      command
    }
  }
`;

const VOICE_CHANNELS_QUERY = gql`
  query getVoiceChannels($id: ID!) {
    voiceChannels(id: $id) {
      id
      name
    }
  }
`;

const PLAY_MUTATION = gql`
  mutation play($server: String!, $channel: String!, $command: String!) {
    play(server: $server, channel: $channel, command: $command)
  }
`;

const SKIP_MUTATION = gql`
  mutation {
    skipSound
  }
`;

const STOP_MUTATION = gql`
  mutation {
    stopSound
  }
`;

export default {
  data() {
    return {
      soundcommands: [],
      servers: [],
      channels: [],
      server: "",
      channel: "",
      sound: "",
    };
  },
  watch: {
    server: function (newVal) {
      var ctx = this;
      // get voice channels
      this.$apollo
        .query({
          query: VOICE_CHANNELS_QUERY,
          variables: { id: newVal },
        })
        .then((result) => {
          ctx.channels = result.data.voiceChannels;
          ctx.channels = ctx.channels.reverse();
          ctx.channel = ctx.channels[0].id;
        });
    },
  },
  mounted() {
    var ctx = this;

    this.$apollo
      .query({
        query: SERVER_QUERY,
      })
      .then((result) => {
        ctx.servers = result.data.servers;
        ctx.server = ctx.servers[0].id;
      });

    this.$apollo
      .query({
        query: SOUND_COMMANDS_QUERY,
      })
      .then((result) => {
        ctx.soundcommands = result.data.soundCommands;
        ctx.soundcommands.sort(function (a, b) {
          if (a.command < b.command) {
            return -1;
          }
          if (a.command > b.command) {
            return 1;
          }
          return 0;
        });
        ctx.sound = {};
      });
  },
  methods: {
    play() {
      if (this.sound) {
        var ctx = this;
        this.$apollo
          .mutate({
            mutation: PLAY_MUTATION,
            variables: {
              server: ctx.server,
              channel: ctx.channel,
              command: JSON.stringify(ctx.sound),
            },
          })
          .then((result) => {
            ctx.$buefy.toast.open({
              message: "Added to Queue",
              type: "is-success",
            });
          });
      }
    },
    skip() {
      var ctx = this;
      this.$apollo
        .mutate({
          mutation: SKIP_MUTATION,
        })
        .then((result) => {
           ctx.$buefy.toast.open({
              message: "Skipped",
              type: "is-success",
            });
        });
    },
    stop() {
      var ctx = this;
      this.$apollo
        .mutate({
          mutation: STOP_MUTATION,
        })
        .then((result) => {
           ctx.$buefy.toast.open({
              message: "Stopped",
              type: "is-success",
            });
        });
    },
  },
};
</script>

<style scoped>
</style>
