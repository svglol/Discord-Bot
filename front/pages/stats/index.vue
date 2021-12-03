<template>
  <section class="container">
    <div class="columns">
      <div class="column">
        <serverstats :users="users" />
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <serverstatscommands :users="users" />
      </div>
    </div>
  </section>
</template>

<script>
import gql from "graphql-tag";

const USERS_QUERY = gql`
  query users {
    users {
      id
      messages {
        date
      }
      connections {
        connectTime
        disconnectTime
        connectionLength
      }
      soundboards {
        date
        command
      }
    }
  }
`;

export default {
  name: "Id",
  data() {
    return {};
  },
  asyncData({ app }) {
    const client = app.apolloProvider.defaultClient;
    return client
      .query({
        query: USERS_QUERY,
      })
      .then((res) => {
        return { users: res.data.users };
      });
  },
  methods: {},
};
</script>

<style scoped>
</style>
