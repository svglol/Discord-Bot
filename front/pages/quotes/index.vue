<template>
  <section class="container">
    <h1>Quotes</h1>
    <b-table
      :data="quotes"
      :bordered="true"
      :striped="true"
      default-sort="command"
      default-sort-direction="asc"
      style="padding-top: 1rem; padding-bottom: 1rem"
    >
      <b-table-column v-slot="props" field="id" label="ID" sortable>
        {{ props.row.id }}
      </b-table-column>

      <b-table-column v-slot="props" field="quote" label="Quote" sortable>
        {{ props.row.quote }}
      </b-table-column>

      <b-table-column v-slot="props" field="date" label="Date" sortable>
        <datereadable :date="props.row.date" />
      </b-table-column>

      <b-table-column v-slot="props" field="message" label="MessageId" sortable>
        {{ props.row.messageId }}
      </b-table-column>

      <b-table-column v-slot="props" field="Actions" label="Actions" centered>
      </b-table-column>
    </b-table>
  </section>
</template>

<script>
import gql from "graphql-tag";

const QUOTE_QUERY = gql`
  query {
    quotes {
      id
      date
      quote
      messageId
    }
  }
`;

export default {
  data() {
    return {};
  },
  asyncData({ app }) {
    const client = app.apolloProvider.defaultClient;
    return client
      .query({
        query: QUOTE_QUERY,
      })
      .then((res) => {
        return { quotes: res.data.quotes };
      });
  },
  head() {
    return {
      title: "Discord Bot - Text Commands",
    };
  },
  methods: {},
};
</script>

<style scoped>
.button.is-small {
  font-size: 1rem;
  /* padding: 1rem; */
  background: rgba(0, 0, 0, 0);
}
</style>
