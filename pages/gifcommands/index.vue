<template>
  <section class="container">
    <b-table :data="gifcommands">

      <b-table-column field="id" label="ID" width="40" numeric v-slot="props">
        {{ props.row.id }}
      </b-table-column>

      <b-table-column field="command" label="Command" v-slot="props">
        {{ props.row.command }}
      </b-table-column>

      <b-table-column field="link" label="Link" v-slot="props">
        {{ props.row.link }}
      </b-table-column>

      <b-table-column field="Actions" label="Actions" centered v-slot="props">
        <b-button size="is-small is-success"
        icon-left="pencil">
      </b-button>
      <b-button size="is-small is-danger"
      icon-left="delete" @click="deleteGif(props.row,gifcommands)">
    </b-button>
  </b-table-column>
</b-table>
<b-button type="is-primary" style="float:right" @click='addNew'>Add New</b-button>
</section>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  data () {
    return {
    }
  },
  async asyncData () {
    let { data } = await axios.get('/api/gifcommands');
    return { gifcommands: data }
  },
  head () {
    return {
      title: 'Discord Bot - Dashboard'
    }
  },
  methods: {
    addNew(){
      this.$buefy.dialog.prompt({
        message: `Add new gif command`,
        inputAttrs: {
          placeholder: '',
        },
        confirmText: 'Add',
        trapFocus: true,
        onConfirm: (value) => this.$buefy.toast.open(`Your name is: ${value}`)
      });
    },
    deleteGif(gif,props){
      const ctx = this;
      this.$buefy.dialog.confirm({
        message: 'Delete `'+gif.command+'` command?',
        onConfirm: () => {
          axios.delete('/api/gifcommands/'+gif.command, {
            command: gif.command
          })
          .then(function (response) {
            for(var i = props.length - 1; i >= 0; i--) {
              if(props[i].command === gif.command) {
                props.splice(i, 1);
              }
            }
            ctx.$buefy.toast.open({
              message: 'Command deleted!',
              type: 'is-success'
            })
          })
          .catch(function (error) {
            console.log(error);
          });
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
