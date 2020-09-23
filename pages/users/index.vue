<template>
  <section class="container">
    <h1>Users</h1>
    <b-table :data="users" :bordered="true"  default-sort="userid" default-sort-direction="desc"
    :striped='true' style="padding-top:1rem;padding-bottom:1rem">

    <b-table-column field="userid" label="User ID" v-slot="props" sortable :custom-sort="sortByUserID">
      {{ props.row.user_id }}
    </b-table-column>

    <b-table-column field="username" label="Username" v-slot="props" sortable>
      {{props.row.username}}
    </b-table-column>

    <b-table-column field="messages" label="Messages" v-slot="props" sortable numeric>
      {{ props.row.messages.length }}
    </b-table-column>

    <b-table-column field="soundboard" label="Soundboard Uses" v-slot="props" sortable numeric :custom-sort="sortBySoundboard">
      {{props.row.soundboards.length}}
    </b-table-column>

    <b-table-column field="connections" label="Total Connection Time" v-slot="props" sortable :custom-sort="sortByTime">
      <mstime :time="calculateConnectedTime(props.row.connections)"/>
    </b-table-column>

    <b-table-column field="intro" label="Intro Gif" v-slot="props" sortable>
      {{ props.row.intro }}
      <b-button  type="is-success" size="is-small" inverted
      icon-left="pencil" @click="editIntro(props.row)">
    </b-button>
  </b-table-column>

  <b-table-column field="exit" label="Exit Gif" v-slot="props" sortable>
    {{ props.row.exit }}
    <b-button  type="is-success" size="is-small" inverted
    icon-left="pencil" @click="editExit(props.row)">
  </b-button>
</b-table-column>

</b-table>
</section>
</template>

<script>
import axios from '~/plugins/axios'
import mstime from '~/components/MSTime.Vue'

export default {
  components: {mstime},
  data () {
    return {
    }
  },
  async asyncData () {
    let { data } = await axios.get('/api/users');
    return { users: data }
  },
  head () {
    return {
      title: 'Discord Bot - Dashboard'
    }
  },
  methods: {
    calculateConnectedTime(connections){
      var totalMs = 0;
      connections.forEach((item, i) => {
        totalMs += item.connectionLength;
      });

      return totalMs;
    },
    sortByTime(a, b, isAsc) {
      if (isAsc) {
        return this.calculateConnectedTime(a.connections) - this.calculateConnectedTime(b.connections);
      } else {
        return this.calculateConnectedTime(b.connections) - this.calculateConnectedTime(a.connections);
      }
    },
    sortBySoundboard(a, b, isAsc) {
      if (isAsc) {
        return a.soundboards.length - b.soundboards.length;
      } else {
        return b.soundboards.length - a.soundboards.length;
      }
    },
    sortByUserID(a, b, isAsc) {
      if (isAsc) {
        return b.user_id - a.user_id;
      } else {
        return a.user_id - b.user_id;
      }
    },
    editIntro(user){
      this.$buefy.dialog.prompt({
        message: `Edit `+user.username+' Intro Gif',
        inputAttrs: {
          placeholder: '',
          value: user.intro,
          required: false
        },
        confirmText: 'Update',
        trapFocus: true,
        onConfirm: (value) => {

        }
      });
    },
    editExit(user){
      this.$buefy.dialog.prompt({
        message: `Edit `+user.username+' Exit Gif',
        inputAttrs: {
          placeholder: '',
          value: user.exit,
          required: false
        },
        confirmText: 'Update',
        trapFocus: true,
        onConfirm: (value) => {

        }
      });
    }
  }
}
</script>

<style scoped>
.button.is-small {
  font-size: 1rem;
  background: rgba(0,0,0,0);
}
</style>
