<template>
  <section class="container">
    <div class="columns">
      <div class="column is-3">
        <soundcommandcontroller />
      </div>
    </div>
  </section>
</template>

<script>
import soundcommandcontroller from '~/components/SoundCommandContoller.vue'

export default {
  components: {
    soundcommandcontroller
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
