<template>
  <div class="card" style="width: 100%">
    <header class="card-header">
      <p class="card-header-title">User</p>
      <b-button
        type="is-success"
        inverted
        icon-left="pencil"
        style="margin-top: auto; margin-bottom: auto; margin-right: 1em"
        @click="edit(user)"
      >
        Edit
      </b-button>
    </header>
    <div class="card-content">
      <div class="content">
        <div class="columns">
          <div class="column is-3">
            <p class="label">User ID</p>
            <p class="data">
              {{ user.id }}
            </p>
            <p class="label">Username</p>
            <p class="data">
              {{ user.username }}
            </p>
            <p class="label">Intro Message</p>
            <p class="data">
              {{ user.intro }}
            </p>
            <p class="label">Exit Message</p>
            <p class="data">
              {{ user.exit }}
            </p>
            <p class="label">Admin Permission</p>
            <p class="data">
              {{ user.adminPermission }}
            </p>
          </div>
          <div class="column is-3">
            <p class="label">Total Messages</p>
            <p class="data">
              {{ user.messages.length }}
            </p>
            <p class="label">Last Message Sent</p>
            <datereadable :date="lastMessageSent()" />
          </div>
          <div class="column is-3">
            <p class="label">Total Connection Time</p>
            <mstime :time="calculateConnectedTime(user.connections)" />
            <p class="label">Total Connections</p>
            <p class="data">
              {{ user.connections.length }}
            </p>
            <p class="label">Last Connection</p>
            <datereadable :date="lastConnection()" />
          </div>
          <div class="column is-3">
            <p class="label">Total Soundboard Usage</p>
            <p class="data">
              {{ user.soundboards.length }}
            </p>
            <p class="label">Last Soundboard Used</p>
            <datereadable :date="lastUsed()" />
          </div>
        </div>
      </div>
    </div>
     <b-modal
      :active.sync="showForm"
      :destroy-on-hide="false"
      :can-cancel="false"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <user-modal
        v-bind="formProps"
        @close="showForm = false"
        @update="updateUser"
      />
    </b-modal>
  </div>
</template>

<script>
import gql from "graphql-tag";

const UPDATE_USER_MUTATION = gql`
  mutation updateUser(
    $id: ID!
    $intro: String
    $exit: String
    $adminPermission: Boolean
  ) {
    updateUser(
      id: $id
      intro: $intro
      exit: $exit
      adminPermission: $adminPermission
    ) {
      id
      intro
      exit
      adminPermission
    }
  }
`;

export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showForm: false,
      formProps: {
        user: undefined,
      },
    };
  },
  methods: {
    lastMessageSent() {
      if (this.user.messages.length > 0) {
        return this.user.messages[this.user.messages.length - 1].date;
      } else {
        return 0;
      }
    },
    calculateConnectedTime(connections) {
      var totalMs = 0;
      connections.forEach((item, i) => {
        if (!isNaN(item.connectionLength)) {
          totalMs += item.connectionLength;
        }
      });

      return totalMs;
    },
    lastConnection() {
      if (this.user.connections.length > 0) {
        return Math.max(
          this.user.connections[this.user.connections.length - 1].connectTime,
          this.user.lastConnection
        );
      } else {
        return 0;
      }
    },
    lastUsed() {
      if (this.user.soundboards.length > 0) {
        return this.user.soundboards[this.user.soundboards.length - 1].date;
      } else {
        return 0;
      }
    },
    edit(user) {
      this.formProps.user = this.user;
      this.showForm = true;
    },
    updateUser(data) {
      var ctx = this;
      this.showForm = false;
      this.$apollo
        .mutate({
          mutation: UPDATE_USER_MUTATION,
          variables: {
            id: data.user.id,
            intro: data.user.intro,
            exit: data.user.exit,
            adminPermission: data.user.adminPermission,
          },
        })
        .then((result) => {
          ctx.$buefy.toast.open({
            message: "User updated!",
            type: "is-success",
          });
        });
    },
  },
};
</script>

<style scoped>
.label {
  margin-bottom: 0 !important;
}
.button.is-small {
  font-size: 1rem;
  background: rgba(0, 0, 0, 0);
  width: 1px;
  height: 1px;
}
</style>
