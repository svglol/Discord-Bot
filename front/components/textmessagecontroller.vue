<template>
  <div class="card" style="width: 100%">
    <header class="card-header" style="background-color: rgba(0, 114, 201, 1)">
      <p class="card-header-title" style="color: white">
        Text Message Controller
      </p>
    </header>
    <div class="card-content">
      <div class="content">
        <b-field label="Server">
          <b-select v-model="server" placeholder="Select a server">
            <option
              v-for="option in servers"
              :value="option.id"
              :key="option.id"
            >
              {{ option.name }}
            </option>
          </b-select>
        </b-field>

        <b-field label="Text Channel">
          <b-select v-model="channel" placeholder="Select a voice channel">
            <option
              v-for="option in channels"
              :value="option.id"
              :key="option.id"
            >
              {{ option.name }}
            </option>
          </b-select>
        </b-field>

        <b-field label="Message">
          <b-input v-model="message" type="textarea" />
        </b-field>

        <b-button icon-left="message" type="is-success" @click="sendMessage">
          Send Message
        </b-button>
      </div>
      <b-loading :active.sync="servers.length < 1" :is-full-page="false" />
    </div>
    <footer class="card-footer">
      <b-button
        icon-left="cached"
        style="margin: 1rem"
        type="is-danger"
        @click="clear"
      >
        Clear Chat
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

const TEXT_CHANNELS_QUERY = gql`
  query getTextChannels($id: ID!) {
    textChannels(id: $id) {
      id
      name
    }
  }
`;

const SEND_MESSAGE_MUTATION = gql`
  mutation sendMessage($channel: String!, $message: String!) {
    message(channel: $channel, message: $message)
  }
`;

const CLEAR_CHAT_MUTATION = gql`
  mutation clear($channel: String!) {
    clear(channel: $channel)
  }
`;

export default {
  data() {
    return {
      servers: [],
      channels: [],
      server: "",
      channel: "",
      message: "",
    };
  },
  watch: {
    server: function (newVal) {
      var ctx = this;
      // get text channels
      this.$apollo
        .query({
          query: TEXT_CHANNELS_QUERY,
          variables: { id: newVal },
        })
        .then((result) => {
          ctx.channels = result.data.textChannels;
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
  },
  methods: {
    sendMessage() {
      if (this.message && this.message !== "") {
        var ctx = this;
        this.$apollo
          .mutate({
            mutation: SEND_MESSAGE_MUTATION,
            variables: { channel: ctx.channel, message: ctx.message },
          })
          .then((result) => {
            ctx.$buefy.toast.open({
              message: "Message Sent",
              type: "is-success",
            });
          });
      }
    },
    clear() {
      var ctx = this;
      this.$apollo
        .mutate({
          mutation: CLEAR_CHAT_MUTATION,
          variables: { channel: ctx.channel },
        })
        .then((result) => {
          ctx.$buefy.toast.open({
            message: "Chat Cleared",
            type: "is-success",
          });
        });
    },
  },
};
</script>

<style scoped>
</style>
