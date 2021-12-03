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

export default {
  head () {
    return {
      title: 'Discord Bot - Dashboard'
    };
  }
};
</script>

<style scoped>

</style>
