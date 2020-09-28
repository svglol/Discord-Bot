<template>
  <section class="container">
    <div class="columns">
      <div class="column is-3">
        <userdetails :user="user" />
      </div>
      <div class="column is-3">
        <usermessagedetails :user="user" />
      </div>
      <div class="column is-3">
        <uservoicedetails :user="user" />
      </div>
      <div class="column is-3">
        <usersoundboarddetails :user="user" />
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
