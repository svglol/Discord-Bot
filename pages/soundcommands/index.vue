<template>
  <section class="container">
    <h1>Sound Commands</h1>
    <b-table
      :data="soundcommands"
      :bordered="true"
      :striped="true"
      default-sort="command"
      default-sort-direction="asc"
      style="padding-top:1rem;padding-bottom:1rem"
    >
      <b-table-column
        v-slot="props"
        field="command"
        label="Command"
        sortable
      >
        {{ props.row.command }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="file"
        label="File"
      >
        <soundfile :sound-command="props.row" />
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="volume"
        label="Volume"
        sortable
        numeric
      >
        {{ props.row.volume }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="date"
        label="Date Added"
        sortable
      >
        <datereadable :date="props.row.date" />
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="Actions"
        label="Actions"
        centered
      >
        <b-button
          type="is-success"
          size="is-small"
          inverted
          icon-left="pencil"
          @click="update(props.row.id,props.row.command,props.row.file,props.row.volume)"
        >
          Edit
        </b-button>
        <b-button
          type="is-danger"
          size="is-small"
          inverted
          icon-left="delete"
          @click="deleteSound(props.row,soundcommands)"
        >
          Delete
        </b-button>
      </b-table-column>
    </b-table>

    <b-button
      type="is-primary"
      @click="addnew"
    >
      Add New
    </b-button>
    <b-modal
      :active.sync="showForm"
      :destroy-on-hide="false"
      :can-cancel="false"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <soundcommandmodal
        v-bind="formProps"
        @close="close"
        @update="updateSound"
        @add="addSound"
      />
    </b-modal>
  </section>
</template>

<script>
import axios from '~/plugins/axios';
export default {
  data () {
    return {
      showForm: false,
      formProps: {
        id: 0,
        command: '',
        file: '',
        volume: 1
      }
    };
  },
  asyncData () {
    return axios.get('/api/soundcommands').then(res => {
      return {soundcommands: res.data};
    });
  },
  head () {
    return {
      title: 'Discord Bot - Sound Commands'
    };
  },
  methods: {
    addnew () {
      this.formProps.id = 0;
      this.formProps.command = '';
      this.formProps.file = '';
      this.formProps.volume = 1;
      this.showForm = true;
    },
    close () {
      this.formProps.id = 0;
      this.formProps.command = '';
      this.formProps.file = '';
      this.formProps.volume = 1;
      this.showForm = false;
    },
    update (id, command, file, volume) {
      this.formProps.id = id;
      this.formProps.command = command;
      this.formProps.file = file;
      this.formProps.volume = volume;
      this.showForm = true;
    },
    deleteSound (sound, props) {
      const ctx = this;
      this.$buefy.dialog.confirm({
        message: 'Delete `' + sound.command + '` Sound Command?',
        onConfirm: () => {
          axios.delete('/api/soundcommands/' + sound.command, {
            command: sound.command
          })
            .then(function (response) {
              for (var i = props.length - 1; i >= 0; i--) {
                if (props[i].command === sound.command) {
                  props.splice(i, 1);
                }
              }
              ctx.$buefy.toast.open({
                message: 'Command deleted!',
                type: 'is-success'
              });
            })
            .catch(function (error) {
              console.log(error);
            });
        }
      });
    },
    updateSound (soundCommand) {
      this.showForm = false;
      const ctx = this;
      let formData = new FormData();
      formData.append('file', soundCommand.file);
      formData.append('id', soundCommand.id);
      formData.append('command', soundCommand.command);
      formData.append('volume', soundCommand.volume);

      axios.post('/api/soundcommands/' + soundCommand.id,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      ).then(function (response) {
        ctx.soundcommands.forEach((item, i) => {
          if (item.id === soundCommand.id) {
            if (item.command !== soundCommand.command) {
              console.log(soundCommand.command);
              item.file = './resources/sound/' + soundCommand.command + '.wav';
              console.log(item.file);
            }
            item.command = soundCommand.command;
            item.volume = soundCommand.volume;
          }
        });
        ctx.$buefy.toast.open({
          message: 'Sound Command added!',
          type: 'is-success'
        });
      })
        .catch(function (error) {
          console.log(error);
        });
    },
    addSound (soundCommand) {
      this.showForm = false;
      const ctx = this;
      let formData = new FormData();
      formData.append('file', soundCommand.file);
      formData.append('command', soundCommand.command);
      formData.append('volume', soundCommand.volume);

      axios.put('/api/soundcommands/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      ).then(function (response) {
        ctx.soundcommands.push({id: response.data.id, command: response.data.command, volume: response.data.volume, date: response.data.date, file: response.data.file});
        ctx.$buefy.toast.open({
          message: 'Sound Command added!',
          type: 'is-success'
        });
      })
        .catch(function (error) {
          console.log(error);
        });
    }
  }
};
</script>

<style scoped>
.button.is-small {
  font-size: 1rem;
  /* padding: 1rem; */
  background: rgba(0,0,0,0);
}
</style>
