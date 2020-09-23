<template>
  <section class="container">
    <ul class="gifcommands">
      <li v-for="(gifCommand, index) in gifcommands" :key="index" class="gifcommand">
        {{gifCommand}}
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
    let { data } = await axios.get('/api/gifcommands')
    return { gifcommands: data }
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
