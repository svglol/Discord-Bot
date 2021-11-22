<template>
  <section class="container">
    <h1>Sound Commands</h1>
    <b-table
      :data="soundcommands"
      :bordered="true"
      :striped="true"
      default-sort="command"
      default-sort-direction="asc"
      style="padding-top: 1rem; padding-bottom: 1rem"
    >
      <b-table-column v-slot="props" field="command" label="Command" sortable>
        {{ props.row.command }}
      </b-table-column>

      <b-table-column v-slot="props" field="file" label="File">
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

      <b-table-column v-slot="props" field="date" label="Date Added" sortable>
        <datereadable :date="props.row.date" />
      </b-table-column>

      <b-table-column v-slot="props" field="Actions" label="Actions" centered>
        <b-button
          type="is-success"
          size="is-small"
          inverted
          icon-left="pencil"
          @click="
            update(
              props.row.id,
              props.row.command,
              props.row.file,
              props.row.volume
            )
          "
        >
          Edit
        </b-button>
        <b-button
          type="is-danger"
          size="is-small"
          inverted
          icon-left="delete"
          @click="deleteSound(props.row, soundcommands)"
        >
          Delete
        </b-button>
      </b-table-column>
    </b-table>

    <b-button type="is-primary" @click="addnew"> Add New </b-button>
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
import gql from "graphql-tag";

const SOUND_COMMANDS_QUERY = gql`
  query {
    soundCommands {
      id
      command
      file
      volume
      date
    }
  }
`;

const DELETE_SOUND_COMMAND_MUTATION = gql`
  mutation deleteSoundCommand($id: ID!) {
    deleteSoundCommand(id: $id)
  }
`;

const ADD_SOUND_COMMAND_MUTATION = gql`
  mutation addSoundCommand(
    $command: String!
    $file: Upload!
    $volume: Float!
    $date: Float!
  ) {
    addSoundCommand(
      command: $command
      file: $file
      volume: $volume
      date: $date
    ) {
      id
      command
      file
      date
      volume
    }
  }
`;

const UPDATE_SOUND_COMMAND_MUTATION = gql`
  mutation updateSoundCommand(
    $id: ID!
    $command: String!
    $file: Upload
    $volume: Float!
  ) {
    updateSoundCommand(
      id: $id
      command: $command
      file: $file
      volume: $volume
    ) {
      id
      command
      file
      date
      volume
    }
  }
`;

export default {
  data() {
    return {
      showForm: false,
      formProps: {
        id: "0",
        command: "",
        file: "",
        volume: 1,
        soundCommands: [],
      },
    };
  },
  asyncData({ app }) {
    const client = app.apolloProvider.defaultClient;
    return client
      .query({
        query: SOUND_COMMANDS_QUERY,
      })
      .then((res) => {
        return { soundcommands: res.data.soundCommands };
      });
  },
  head() {
    return {
      title: "Discord Bot - Sound Commands",
    };
  },
  methods: {
    addnew() {
      this.formProps.id = "0";
      this.formProps.command = "";
      this.formProps.file = "";
      this.formProps.volume = 1;
      this.formProps.soundCommands = this.soundcommands;
      this.showForm = true;
    },
    close() {
      this.formProps.id = "0";
      this.formProps.command = "";
      this.formProps.file = "";
      this.formProps.volume = 1;
      this.formProps.soundCommands = this.soundcommands;
      this.showForm = false;
    },
    update(id, command, file, volume) {
      this.formProps.id = id;
      this.formProps.command = command;
      this.formProps.file = file;
      this.formProps.volume = volume;
      this.formProps.soundCommands = this.soundcommands;
      this.showForm = true;
    },
    deleteSound(sound, props) {
      const ctx = this;
      this.$buefy.dialog.confirm({
        message: "Delete `" + sound.command + "` Sound Command?",
        onConfirm: () => {
          this.$apollo
            .mutate({
              mutation: DELETE_SOUND_COMMAND_MUTATION,
              variables: {
                id: sound.id,
              },
            })
            .then((result) => {
              for (var i = props.length - 1; i >= 0; i--) {
                if (props[i].command === sound.command) {
                  props.splice(i, 1);
                }
              }
              ctx.$buefy.toast.open({
                message: "Command deleted!",
                type: "is-success",
              });
            });
        },
      });
    },
    updateSound(soundCommand) {
      this.showForm = false;
      const ctx = this;
      this.$apollo
        .mutate({
          mutation: UPDATE_SOUND_COMMAND_MUTATION,
          variables: {
            id: soundCommand.id,
            command: soundCommand.command,
            volume: soundCommand.volume,
          },
        })
        .then((result) => {
          ctx.soundcommands.forEach((item, i) => {
            if (item.id === soundCommand.id) {
              item.command = soundCommand.command;
              item.file = soundCommand.file;
              item.volume = soundCommand.volume;
            }
          });
          ctx.$buefy.toast.open({
            message: "Command updated!",
            type: "is-success",
          });
        });
    },
    addSound(soundCommand) {
      this.showForm = false;
      const ctx = this;

      this.$apollo
        .mutate({
          mutation: ADD_SOUND_COMMAND_MUTATION,
          variables: {
            command: soundCommand.command,
            file: soundCommand.file,
            volume: soundCommand.volume,
            date: new Date().getTime(),
          },
        })
        .then((result) => {
          ctx.soundcommands.push(result.data.addSoundCommand);
          ctx.$buefy.toast.open({
            message: "Sound Command added!",
            type: "is-success",
          });
        });
    },
  },
};
</script>

<style scoped>
.button.is-small {
  font-size: 1rem;
  /* padding: 1rem; */
  background: rgba(0, 0, 0, 0);
}
</style>
