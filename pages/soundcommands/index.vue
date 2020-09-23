<template>
  <section class="container">
    <ul class="soundcommands">
      <li v-for="(soundCommand, index) in soundcommands" :key="index" class="soundCommand">
        {{soundCommand}}
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
    let { data } = await axios.get('/api/soundcommands')
    return { soundcommands: data }
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
