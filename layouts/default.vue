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
    <p class="menu-label is-hidden-touch">
      General
    </p>
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

<div class="container column is-10" style="height:calc(100vh - 55px)">
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
          title: 'Home',
          icon: 'home',
          to: { name: 'index' }
        },
        {
          title: 'Bot Control',
          icon: 'laptop',
          to: { name: 'botcontrol' }
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
