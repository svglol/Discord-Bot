<template>
  <div>
    <b-sidebar
      :expand-on-hover="false"
      :reduce="false"
      type="is-dark"
      open
      fullheight
    >
      <h2 class="app-title">Discord Bot Dashboard</h2>
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
    </b-sidebar>
    <section
      class="main-content columns">

      <div
        class="container column">
        <nuxt />
      </div>
    </section>
  </div>
</template>

<script>
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
          title: 'Text Commands',
          icon: 'message-outline',
          to: { name: 'textcommands' }
        },
        {
          title: 'Log',
          icon: 'text-box',
          to: { name: 'log' }
        }
      ]
    };
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
