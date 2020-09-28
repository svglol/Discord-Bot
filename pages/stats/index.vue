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
import axios from '~/plugins/axios';

export default {
  name: 'Id',
  data () {
    return {
    };
  },
  asyncData () {
    return axios.get('/api/users').then(res => {
      return { users: res.data };
    });
  },
  methods: {
  }
};
</script>

<style scoped>
</style>
