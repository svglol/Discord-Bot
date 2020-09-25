<template>
  <section class="container">
    <div class="columns">
      <div class="column is-3">
        <soundcommandcontroller />
      </div>
      <div class="column is-3">
        <textmessagecontroller />
      </div>
    </div>
  </section>
</template>

<script>
import soundcommandcontroller from '~/components/SoundCommandContoller.vue'
import textmessagecontroller from '~/components/TextMessageController.vue'

export default {
  components: {
    soundcommandcontroller,
    textmessagecontroller
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
