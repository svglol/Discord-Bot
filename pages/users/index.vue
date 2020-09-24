<template>
  <section class="container">
    <h1>Users</h1>
    <b-table :data="users" :bordered="true"  default-sort="userid" default-sort-direction="desc" @dblclick="openUser"  :selected.sync="selected"
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
      selected: {}
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
        if(!isNaN(item.connectionLength)){
          totalMs += item.connectionLength;
        }
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
      var ctx = this;
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
          if(JSON.stringify(value) !== JSON.stringify(user.intro) || (value !== '' && user.intro === null)){
            axios.post('/api/users/'+user.user_id, {
              intro: value
            })
            .then(function (response) {
              user.intro = value;
              ctx.$buefy.toast.open({
                message: 'Intro updated',
                type: 'is-success'
              })
            })
            .catch(function (error) {
              console.log(error);
            });
          }
        }
      });
    },
    editExit(user){
      var ctx = this;
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
          if(JSON.stringify(value) !== JSON.stringify(user.exit) || (value !== '' && user.exit === null)){
            axios.post('/api/users/'+user.user_id, {
              exit: value
            })
            .then(function (response) {
              user.exit = value;
              ctx.$buefy.toast.open({
                message: 'Exit updated',
                type: 'is-success'
              })
            })
            .catch(function (error) {
              console.log(error);
            });
          }
        }
      });
    },
    openUser(){
      this.$nuxt.$router.push({ path: '/users/'+this.selected.user_id })
    }
  }
}
</script>

<style scoped>
.button.is-small {
  font-size: 1rem;
  background: rgba(0,0,0,0);
  width: 1px;
  height: 1px;
}
</style>
