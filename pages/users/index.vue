<template>
  <section class="container">
    <ul class="users">
      <li v-for="(user, index) in users" :key="index" class="user">
        {{user.user_id}} - {{user.connections.length}}
      </li>
    </ul>
  </section>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  data () {
    return {
    }
  },
  async asyncData () {
    let { data } = await axios.get('/api/users')
    return { users: data }
  },
  head () {
    return {
      title: 'Discord Bot - Dashboard'
    }
  }
}
</script>

<style scoped>

</style>
