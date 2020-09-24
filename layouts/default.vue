<template>
  <div>
    <nav
    class="navbar header has-shadow is-primary"
    role="navigation"
    aria-label="main navigation"
    >
    <div class="navbar-brand">
      <a
      class="navbar-item"
      href="/"
      >
      Discord Bot Dashboard
    </a>

    <div class="navbar-burger">
      <span />
      <span />
      <span />
    </div>
  </div>
</nav>

<section class="main-content columns">
  <aside class="column is-2 section">
    <ul class="menu-list">
      <li
      v-for="(item, key) of items"
      :key="key"
      >
      <nuxt-link
      :to="item.to"
      exact-active-class="is-active"
      >
      <b-icon :icon="item.icon" /> {{ item.title }}
    </nuxt-link>
  </li>
</ul>
</aside>

<div class="container column" style="height:calc(100vh - 55px);margin:0;max-width: 20000px;
    width: 80vw;">
  <nuxt />
</div>
</section>
</div>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  data () {
    return {
      items: [
        {
          title: 'Dashboard',
          icon: 'home',
          to: { name: 'index' }
        },
        {
          title: 'Users',
          icon: 'account-multiple',
          to: { name: 'users' }
        },
        {
          title: 'Sound Commands',
          icon: 'volume-high',
          to: { name: 'soundcommands' }
        },
        {
          title: 'Gif Commands',
          icon: 'gif',
          to: { name: 'gifcommands' }
        },
        {
          title: 'Log',
          icon: 'text-box',
          to: { name: 'log' }
        }
      ]
    }
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
