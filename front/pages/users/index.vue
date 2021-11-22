<template>
  <section class="container">
    <h1>Users</h1>
    <b-table
      :data="users"
      :bordered="true"
      :striped="true"
      default-sort="userid"
      default-sort-direction="desc"
      style="padding-top: 1rem; padding-bottom: 1rem"
    >
      <b-table-column
        v-slot="props"
        :custom-sort="sortByUserID"
        field="userid"
        label="User ID"
        sortable
      >
        {{ props.row.id }}
      </b-table-column>

      <b-table-column v-slot="props" field="username" label="Username" sortable>
        {{ props.row.username }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        :custom-sort="sortByMessages"
        field="messages"
        label="Messages"
        sortable
        numeric
      >
        {{ props.row.totalMessages }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        :custom-sort="sortBySoundboard"
        field="soundboard"
        label="Soundboard Uses"
        sortable
        numeric
      >
        {{ props.row.totalSoundboards }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        :custom-sort="sortByTime"
        field="connections"
        label="Total Connection Time"
        sortable
      >
        <mstime :time="props.row.totalConnectionLength" />
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="intro"
        label="Intro Message"
        sortable
      >
        {{ props.row.intro }}
      </b-table-column>

      <b-table-column v-slot="props" field="exit" label="Exit Message" sortable>
        {{ props.row.exit }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="admin"
        label="Admin Permissions"
        sortable
      >
        {{ props.row.adminPermission }}
      </b-table-column>

      <b-table-column v-slot="props" field="actions" label="Actions">
        <b-button
          type="is-success"
          size="is-small"
          inverted
          icon-left="pencil"
          @click="edit(props.row)"
        >
          Edit
        </b-button>

        <b-button
          style="margin-left: 20px"
          type="is-link"
          size="is-small"
          inverted
          icon-left="open-in-new"
          @click="openUser(props.row)"
        >
          Open
        </b-button>
      </b-table-column>
    </b-table>
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
  </section>
</template>

<script>
import userModal from "../../components/userModal.vue";
import gql from "graphql-tag";

const USERS_QUERY = gql`
  query users {
    users {
      id
      username
      intro
      exit
      adminPermission
      totalConnectionLength
      totalSoundboards
      totalMessages
    }
  }
`;

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
  components: { userModal },
  data() {
    return {
      selected: {},
      showForm: false,
      formProps: {
        user: undefined,
      },
    };
  },
  watch: {
    selected() {
      this.openUser();
    },
  },
  asyncData({ app }) {
    const client = app.apolloProvider.defaultClient;
    return client
      .query({
        query: USERS_QUERY,
      })
      .then((res) => {
        return { users: res.data.users };
      });
  },
  head() {
    return {
      title: "Discord Bot - Users",
    };
  },
  methods: {
    sortByTime(a, b, isAsc) {
      if (isAsc) {
        return a.totalConnectionLength - b.totalConnectionLength;
      } else {
        return b.totalConnectionLength - a.totalConnectionLength;
      }
    },
    sortBySoundboard(a, b, isAsc) {
      if (isAsc) {
        return a.totalSoundboards - b.totalSoundboards;
      } else {
        return b.totalSoundboards - a.totalSoundboards;
      }
    },
    sortByMessages(a, b, isAsc) {
      if (isAsc) {
        return a.totalMessages - b.totalMessages;
      } else {
        return b.totalMessages - a.totalMessages;
      }
    },
    sortByUserID(a, b, isAsc) {
      if (isAsc) {
        return b.id - a.id;
      } else {
        return a.id - b.id;
      }
    },
    openUser(user) {
      this.$nuxt.$router.push({ path: "/users/" + user.id });
    },
    edit(user) {
      this.formProps.user = user;
      this.showForm = true;
    },
    updateUser(data) {
      this.showForm = false;
      const ctx = this;
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
          ctx.users.forEach((item, i) => {
            if (item.id === data.user.id) {
              item = data.user;
            }
          });
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
.button.is-small {
  font-size: 1rem;
  background: rgba(0, 0, 0, 0);
  width: 1px;
  height: 1px;
}
</style>
