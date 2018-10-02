<template>
  <v-data-table
    :headers="headers"
    :items="payPeriods"
    >
      <template slot="items" slot-scope="props">
        <tr>
          <td>{{ props.item.id }}</td>
          <td>{{ props.item.employees.length }}</td>
          <td>{{ props.item.quarter }}</td>
          <td>{{ props.item.totalPayroll }}</td>
          <td class="justify-center layout px-0">
          <v-icon
            small
            class="mr-2"
            @click="editItem(props.item)"
          >
            edit
          </v-icon>
        </td>
        </tr>
      </template>
  </v-data-table>
</template>

<script>


export default {
  props: [
    'payPeriods',
  ],
  data: () => ({
    headers: [
      { text: 'Pay Date', value: 'id' },
      { text: '# of employees', value: 'employees.length' },
      { text: 'Quarter', value: 'quarter' },
      { text: 'Total', value: 'total' },
      { text: 'Actions', value: 'name', sortable: false },
    ],
  }),
  methods: {
    editItem(item) {
      this.$router.push({ name: 'payperiod', params: { payperiod: item.id } });
    },
  },

};
</script>

<style>

</style>
