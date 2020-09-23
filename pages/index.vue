<template>
  <section class="container">
    <div>
      <div class="links">
        <ul class="users">
          <li v-for="(user, index) in users" :key="index" class="user">
            <nuxt-link :to="{ name: 'user-id', params: { id: index }}">
              {{ user.name }}
            </nuxt-link>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script>
import axios from '~/plugins/axios'
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
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
