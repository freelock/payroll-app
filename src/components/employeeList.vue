<template>
  <v-data-table
    :headers="headers"
    :items="employees"
    :pagination="pagination"
    @update:pagination="pagerUpdate"
    >
      <template slot="items" slot-scope="props">
        <tr>
          <td>{{ props.item.id }}</td>
          <td>{{ props.item.status }}</td>
          <td>{{ props.item.class }}</td>
          <td>{{ props.item.rates.salary }}</td>
          <td>{{ props.item.rates.hourlyRate }}</td>
          <td>{{ props.item.ptoBalance }}</td>
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
    'employees',
  ],
  data: () => ({
    headers: [
      { text: 'Employee', value: 'id' },
      { text: 'Active?', value: 'status' },
      { text: 'Class', value: 'class' },
      { text: 'Salary', value: 'rates.salary' },
      { text: 'Hourly', value: 'rates.hourlyRate' },
      { text: 'PTO Balance', value: 'ptoBalance' },
      { text: 'Actions', value: 'name', sortable: false },
    ],
    pagination: {
      descending: false,
      page: 1,
      rowsPerPage: 25,
      sortBy: 'id',
      totalItems: 0,
    },
  }),
  methods: {
    editItem(item) {
      this.$emit('edit', item);
    },
    pagerUpdate(payload) {
      this.pagination = payload;
    },
  },

};
</script>

<style>

</style>
