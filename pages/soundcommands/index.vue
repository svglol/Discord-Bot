<template>
  <section class="container">
    <h1>Sound Commands</h1>
    <b-table :data="soundcommands" :bordered="true"
    :striped='true' style="padding-top:1rem;padding-bottom:1rem">

    <b-table-column field="command" label="Command" v-slot="props">
      {{ props.row.command }}
    </b-table-column>

    <b-table-column field="file" label="File" v-slot="props">
      {{ props.row.file }}
    </b-table-column>

    <b-table-column field="volume" label="Volume" v-slot="props">
      {{ props.row.volume }}
    </b-table-column>


    <b-table-column field="date" label="Date Added" v-slot="props">
      {{ props.row.date }}
    </b-table-column>

    <b-table-column field="Actions" label="Actions" centered v-slot="props">
      <b-button  type="is-success" size="is-small" inverted
      icon-left="pencil">Edit
    </b-button>
    <b-button type="is-danger" size="is-small" inverted
    icon-left="delete" @click="deleteSound(props.row,soundcommands)">Delete
  </b-button>
</b-table-column>
</b-table>

<b-button type="is-primary" @click='addNew'>Add New</b-button>
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
    let { data } = await axios.get('/api/soundcommands');
    return { soundcommands: data }
  },
  head () {
    return {
      title: 'Discord Bot - Sound Commands'
    }
  },
  methods: {
    addNew(){
      this.$buefy.dialog.prompt({
        message: `Add new sound command`,
        inputAttrs: {
          placeholder: '',
        },
        confirmText: 'Add',
        trapFocus: true,
        onConfirm: (value) => this.$buefy.toast.open(`Your name is: ${value}`)
      });
    },
    deleteSound(sound,props){
      // const ctx = this;
      // this.$buefy.dialog.confirm({
      //   message: 'Delete `'+gif.command+'` command?',
      //   onConfirm: () => {
      //     axios.delete('/api/gifcommands/'+gif.command, {
      //       command: gif.command
      //     })
      //     .then(function (response) {
      //       for(var i = props.length - 1; i >= 0; i--) {
      //         if(props[i].command === gif.command) {
      //           props.splice(i, 1);
      //         }
      //       }
      //       ctx.$buefy.toast.open({
      //         message: 'Command deleted!',
      //         type: 'is-success'
      //       })
      //     })
      //     .catch(function (error) {
      //       console.log(error);
      //     });
      //   }
      // })
    }
  }
}
</script>

<style scoped>
.button.is-small {
  font-size: 1rem;
  /* padding: 1rem; */
  background: rgba(0,0,0,0);
}
</style>
