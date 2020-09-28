<template>
  <section class="container">
    <div class="chatArea">
      <ul
        ref="messages"
        class="messages"
      >
        <li
          v-for="(line, index) in log"
          :key="index"
          class="message"
        >
          {{ line }}
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import axios from '~/plugins/axios';

export default {
  data () {
    return {
    };
  },
  head () {
    return {
      title: 'Discord Bot - Log'
    };
  },
  asyncData () {
    return axios.get('/api/bot/log').then(res => {
      return { log: res.data };
    });
  }
};
</script>

<style scoped>

.message{
  margin-bottom: .2rem;
}

</style>
