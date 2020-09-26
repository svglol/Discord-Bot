<template>
  <section class="container">
    <h1>Text Commands</h1>
    <b-table
      :data="gifcommands"
      :bordered="true"
      :striped="true"
      default-sort="command"
      default-sort-direction="asc"
      style="padding-top:1rem;padding-bottom:1rem">

      <b-table-column
        v-slot="props"
        field="command"
        label="Command"
        sortable>
        {{ props.row.command }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="link"
        label="Text"
        sortable>
        {{ props.row.link }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="date"
        label="Date Added"
        sortable>
        <datereadable :date="props.row.date"/>
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="Actions"
        label="Actions"
        centered>
        <b-button
          type="is-success"
          size="is-small"
          inverted
          icon-left="pencil"
          @click="formProps.id = props.row.id;formProps.command = props.row.command; formProps.link = props.row.link;showForm = true">Edit
        </b-button>
        <b-button
          type="is-danger"
          size="is-small"
          inverted
          icon-left="delete"
          @click="deleteGif(props.row,gifcommands)">Delete
        </b-button>
      </b-table-column>
    </b-table>

    <b-button
      type="is-primary"
      @click="formProps.id = 0;formProps.command = &quot;&quot;; formProps.link = &quot;&quot;;showForm = true">Add New</b-button>

    <b-modal
      :active.sync="showForm"
      :destroy-on-hide="false"
      :can-cancel="false"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal>
      <gifcommandmodal
        v-bind="formProps"
        @close="showForm = false"
        @update="updateGif"
        @add="addGif"/>
    </b-modal>
  </section>
</template>

<script>
import axios from '../../plugins/axios';
import gifcommandmodal from './../../components/GifCommandModal.vue';
import datereadable from './../../components/DateReadable.Vue';

export default {
  components: {gifcommandmodal, datereadable},
  data () {
    return {
      showForm: false,
      formProps: {
        id: 0,
        command: '',
        link: ''
      }
    };
  },
  asyncData () {
    return axios.get('/api/gifcommands').then(res => {
      return {gifcommands: res.data};
    });
  },
  head () {
    return {
      title: 'Discord Bot - Gif Commands'
    };
  },
  methods: {
    deleteGif (gif, props) {
      const ctx = this;
      this.$buefy.dialog.confirm({
        message: 'Delete `' + gif.command + '` command?',
        onConfirm: () => {
          axios.delete('/api/gifcommands/' + gif.command, {
            command: gif.command
          })
            .then(function (response) {
              for (var i = props.length - 1; i >= 0; i--) {
                if (props[i].command === gif.command) {
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
    addGif (gifcommand) {
      this.showForm = false;
      const ctx = this;
      axios.put('/api/gifcommands/', {
        command: gifcommand.command,
        link: gifcommand.link
      })
        .then(function (response) {
          ctx.gifcommands.push({id: response.data.id, command: response.data.command, link: response.data.link, date: response.data.date});
          ctx.$buefy.toast.open({
            message: 'Command added!',
            type: 'is-success'
          });
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    updateGif (gifcommand) {
      this.showForm = false;
      const ctx = this;
      axios.post('/api/gifcommands/' + gifcommand.id, {
        id: gifcommand.id,
        command: gifcommand.command,
        link: gifcommand.link
      })
        .then(function (response) {
          ctx.gifcommands.forEach((item, i) => {
            if (item.id === gifcommand.id) {
              item.command = gifcommand.command;
              item.link = gifcommand.link;
            }
          });
          ctx.$buefy.toast.open({
            message: 'Command updated!',
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
