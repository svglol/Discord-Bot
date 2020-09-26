<template>
  <section class="container">
    <div class="columns">
      <div class="column is-3">
        <servercontroller />
      </div>
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
import soundcommandcontroller from '~/components/SoundCommandContoller.vue';
import textmessagecontroller from '~/components/TextMessageController.vue';
import servercontroller from '~/components/ServerController.vue';

export default {
  components: {
    soundcommandcontroller,
    textmessagecontroller,
    servercontroller
  },
  head () {
    return {
      title: 'Discord Bot - Dashboard'
    };
  }
};
</script>

<style scoped>

</style>
