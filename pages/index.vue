<template>
  <section class="container">
    <div>
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
    // let { data } = await axios.get('/api/users')
    return ;
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
