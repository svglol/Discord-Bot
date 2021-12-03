module.exports = {
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'Discord Bot Dashboard',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    { src: '~/plugins/vuefrappe', mode: 'client' }
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
  ],
  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
  },

  axios: {
    credentials: true,
    proxy: true
  },

  proxy: {
    '/api': {
      target: 'http://localhost:3001/api',
      pathRewrite: { '^/api': '/' }
    }
  },

  // Apollo configuration
  apollo: {
    clientConfigs: {
      default: {
        httpEndpoint: 'http://localhost:4000/graphql',
      },
    },
  },

  css: ['~/assets/css/main.scss'],
  modules: ['nuxt-buefy', '@nuxtjs/axios', '@nuxtjs/apollo',],
  env: {
    WS_URL: process.env.WS_URL || 'http://localhost:3000'
  },
  telemetry: false
};
