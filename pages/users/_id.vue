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
import axios from '~/plugins/axios';

export default {
  name: 'Id',
  data () {
    return {
    };
  },
  async asyncData ({ params, error }) {
    return axios.get('/api/users/' + params.id).then(res => {
      return { user: res.data };
    });
  },
  methods: {
  }
};
</script>

<style scoped>
</style>
