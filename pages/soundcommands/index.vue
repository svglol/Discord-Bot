<template>
  <section class="container">
    <h1>Sound Commands</h1>
    <b-table :data="soundcommands" :bordered="true" default-sort="command" default-sort-direction="desc"
    :striped='true' style="padding-top:1rem;padding-bottom:1rem">

    <b-table-column field="command" label="Command" v-slot="props" sortable>
      {{ props.row.command }}
    </b-table-column>

    <b-table-column field="file" label="File" v-slot="props" >
      <soundfile :soundCommand="props.row"/>
    </b-table-column>

    <b-table-column field="volume" label="Volume" v-slot="props" sortable numeric>
      {{ props.row.volume }}
    </b-table-column>

    <b-table-column field="date" label="Date Added" v-slot="props" sortable>
      <datereadable :date="props.row.date"/>
    </b-table-column>

    <b-table-column field="Actions" label="Actions" centered v-slot="props">
      <b-button  type="is-success" size="is-small" inverted
      icon-left="pencil"
      @click='formProps.id = props.row.id;formProps.command = props.row.command; formProps.file = props.row.file; formProps.volume = props.row.volume;showForm = true'
      >Edit
    </b-button>
    <b-button type="is-danger" size="is-small" inverted
    icon-left="delete" @click="deleteSound(props.row,soundcommands)">Delete
  </b-button>
</b-table-column>
</b-table>

<b-button type="is-primary" @click='formProps.id = 0;formProps.command = ""; formProps.file = "";formProps.volume = 1;showForm = true'>Add New</b-button>
<b-modal :active.sync="showForm"
has-modal-card
trap-focus
:destroy-on-hide="false"
:can-cancel="false"
aria-role="dialog"
aria-modal>
<soundcommandmodal v-bind="formProps" @close="showForm = false" @update="updateSound" @add="addSound"/>
</b-modal>
</section>
</template>

<script>
import axios from '~/plugins/axios'
import datereadable from '~/components/DateReadable.Vue'
import soundfile from '~/components/SoundFile.Vue'
import soundcommandmodal from '~/components/SoundCommandModal.vue'

export default {
  components: {datereadable,soundfile,soundcommandmodal},
  data () {
    return {
      showForm:false,
      formProps: {
        id: 0,
        command: '',
        file:'',
        volume: 1
      }
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
    deleteSound(sound,props){
      const ctx = this;
      this.$buefy.dialog.confirm({
        message: 'Delete `'+sound.command+'` Sound Command?',
        onConfirm: () => {
          axios.delete('/api/soundcommands/'+sound.command, {
            command: sound.command
          })
          .then(function (response) {
            for(var i = props.length - 1; i >= 0; i--) {
              if(props[i].command === sound.command) {
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
    },
    updateSound(soundCommand){

    },
    addSound(soundCommand){
      this.showForm = false;
      const ctx = this;
      console.log(soundCommand)
      // axios.put('/api/soundcommands/', {
      //   command: soundcommand.command,
      //   volume: soundcommand.volume
      // })
      // .then(function (response) {
      //   ctx.gifcommands.push({id:response.data.id,command:response.data.command,link:response.data.link,date:response.data.date})
      //   ctx.$buefy.toast.open({
      //     message: 'Command added!',
      //     type: 'is-success'
      //   })
      // })
      // .catch(function (error) {
      //   console.log(error);
      // });
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
