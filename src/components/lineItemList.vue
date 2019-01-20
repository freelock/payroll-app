<template>
  <v-data-table
    :headers="headers"
    :items="lineItems"
    >
    <template slot="items" slot-scope="props">
      <tr>
        <td>{{ props.item.id }}</td>
        <td>{{ props.item.name }}</td>
        <td>{{ props.item.type }}</td>
        <td>{{ props.item.chart_id }}</td>
        <td>{{ props.item.basis }}</td>
        <td>{{ props.item.rate }}</td>
        <td>{{ props.item.tax_exempt }}</td>
        <td>{{ props.item.applies }}</td>
        <td class="justify-center layout px-0">
          <v-icon @click="editItem(props.item)">edit</v-icon>
        </td>
      </tr>
    </template>
  </v-data-table>
</template>

<script>
export default {
  props: [
    'lineItems',
  ],
  data: () => ({
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Name', value: 'name' },
      { text: 'Type', value: 'type' },
      { text: 'Chart ID', value: 'chart_id' },
      { text: 'Basis', value: 'basis' },
      { text: 'Rate', value: 'rate' },
      { text: 'Tax Exempt?', value: 'tax_exempt' },
      { text: 'Applies to', value: 'applies' },
      { text: 'Actions', value: 'name', sortable: false },
    ],
  }),
  methods: {
    editItem(item) {
      this.$emit('edit', item);
    },
  },
};
</script>

<style>

</style>
