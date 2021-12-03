<template>
  <section class="container">
    <h1>Text Commands</h1>
    <b-table
      :data="textcommands"
      :bordered="true"
      :striped="true"
      default-sort="command"
      default-sort-direction="asc"
      style="padding-top: 1rem; padding-bottom: 1rem"
    >
      <b-table-column v-slot="props" field="command" label="Command" sortable>
        {{ props.row.command }}
      </b-table-column>

      <b-table-column v-slot="props" field="link" label="Text" sortable>
        {{ props.row.link }}
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
            formProps.id = props.row.id;
            formProps.command = props.row.command;
            formProps.link = props.row.link;
            formProps.textCommands = textcommands;
            showForm = true;
          "
        >
          Edit
        </b-button>
        <b-button
          type="is-danger"
          size="is-small"
          inverted
          icon-left="delete"
          @click="deleteText(props.row, textcommands)"
        >
          Delete
        </b-button>
      </b-table-column>
    </b-table>

    <b-button type="is-primary" @click="addNew"> Add New </b-button>

    <b-modal
      :active.sync="showForm"
      :destroy-on-hide="false"
      :can-cancel="false"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <gifcommandmodal
        v-bind="formProps"
        @close="showForm = false"
        @update="updateText"
        @add="addText"
      />
    </b-modal>
  </section>
</template>

<script>
import gql from "graphql-tag";

const TEXT_COMMANDS_QUERY = gql`
  query {
    textCommands {
      id
      command
      link
      date
    }
  }
`;

const DELETE_TEXT_COMMAND_MUTATION = gql`
  mutation deleteTextCommand($id: ID!) {
    deleteTextCommand(id: $id)
  }
`;

const UPDATE_TEXT_COMMAND_MUTATION = gql`
  mutation updateTextCommand($id: ID!, $command: String!, $link: String!) {
    updateTextCommand(id: $id, command: $command, link: $link) {
      id
      command
      link
      date
    }
  }
`;

const ADD_TEXT_COMMAND_MUTATION = gql`
  mutation addTextCommand($command: String!, $link: String!, $date: Float!) {
    addTextCommand(command: $command, link: $link, date: $date) {
      id
      command
      link
      date
    }
  }
`;

export default {
  data() {
    return {
      showForm: false,
      formProps: {
        id: 0,
        command: "",
        link: "",
        textCommands: [],
      },
    };
  },
  asyncData({ app }) {
    const client = app.apolloProvider.defaultClient;
    return client
      .query({
        query: TEXT_COMMANDS_QUERY,
      })
      .then((res) => {
        return { textcommands: res.data.textCommands };
      });
  },
  head() {
    return {
      title: "Discord Bot - Text Commands",
    };
  },
  methods: {
    addNew() {
      this.formProps.id = "0";
      this.formProps.command = "";
      this.formProps.link = "";
      this.formProps.textCommands = this.textcommands;
      this.showForm = true;
    },
    deleteText(text, props) {
      const ctx = this;
      this.$buefy.dialog.confirm({
        message: "Delete `" + text.command + "` command?",
        onConfirm: () => {
          this.$apollo
            .mutate({
              mutation: DELETE_TEXT_COMMAND_MUTATION,
              variables: {
                id: text.id,
              },
            })
            .then((result) => {
              for (var i = props.length - 1; i >= 0; i--) {
                if (props[i].command === text.command) {
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
    addText(textCommand) {
      this.showForm = false;
      const ctx = this;

      this.$apollo
        .mutate({
          mutation: ADD_TEXT_COMMAND_MUTATION,
          variables: {
            command: textCommand.command,
            link: textCommand.link,
            date: new Date().getTime(),
          },
        })
        .then((response) => {
          console.log(response);
          ctx.textcommands.push({
            id: response.data.addTextCommand.id,
            command: response.data.addTextCommand.command,
            link: response.data.addTextCommand.link,
            date: response.data.addTextCommand.date,
          });
          ctx.$buefy.toast.open({
            message: "Command added!",
            type: "is-success",
          });
        });
    },
    updateText(textCommand) {
      this.showForm = false;
      const ctx = this;
      this.$apollo
        .mutate({
          mutation: UPDATE_TEXT_COMMAND_MUTATION,
          variables: {
            id: textCommand.id,
            command: textCommand.command,
            link: textCommand.link,
          },
        })
        .then((result) => {
          ctx.textcommands.forEach((item, i) => {
            if (item.id === textCommand.id) {
              item.command = textCommand.command;
              item.link = textCommand.link;
            }
          });
          ctx.$buefy.toast.open({
            message: "Command updated!",
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
