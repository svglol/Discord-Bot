<template>
  <section class="container">
    <div class="columns">
      <div class="column">
        <userdetails :user="user" />
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <serverstats :users="[user]" />
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <serverstatscommands :users="[user]" />
      </div>
    </div>
  </section>
</template>

<script>
import gql from "graphql-tag";

const USER_QUERY = gql`
  query user( $id: ID!){
    user(id: $id) {
      id
      username
      intro
      exit
      adminPermission
      totalConnectionLength
      totalSoundboards
      totalMessages
      lastConnection
       messages {
        date
      }
      connections {
        date
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
  name: 'Id',
  data () {
    return {
    };
  },
  async asyncData ({ app, params }) {
      const client = app.apolloProvider.defaultClient;
      console.log(params.id)
    return client
      .query({
        query: USER_QUERY,
        variables: {id: params.id }
      })
      .then((res) => {
        return { user: res.data.user };
      });
  },
  methods: {
  }
};
</script>

<style scoped>
</style>
