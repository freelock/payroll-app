<template>
  <v-data-table
    :headers="headers"
    :items="payPeriods"
    :pagination="pagination"
    >
      <template slot="items" slot-scope="props">
        <tr>
          <td>{{ props.item.id }}</td>
          <td>{{ props.item.employees.length }}</td>
          <td>{{ props.item.quarter }}</td>
          <td>{{ format(props.item.employer.total_income) }}</td>
          <td class="justify-center layout px-0">
          <v-icon
            class="mr-2"
            @click="editItem(props.item)"
          >
            edit
          </v-icon>
          <v-btn icon class="mx-0" @click="deleteItem(props.item)">
            <v-icon color="pink">delete</v-icon>
        </v-btn>
        </td>
        </tr>
      </template>
  </v-data-table>
</template>

<script>
import { mapGetters } from 'vuex';
import Dinero from 'dinero.js';

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
    pagination: {
      descending: true,
      page: 1,
      rowsPerPage: 25,
      sortBy: 'id',
      totalItems: 0,
    },
  }),
  computed: {
    ...mapGetters([
      'employerCalc',
    ]),
  },
  methods: {
    format(num) {
      const myNum = num || 0;
      return Dinero({ amount: myNum }).toFormat();
    },
    editItem(item) {
      this.$router.push({ name: 'payperiod', params: { payperiod: item.id } });
    },
    deleteItem(item) {
      const index = this.payPeriods.indexOf(item);
      // eslint-disable-next-line
      confirm('Are you sure you want to delete this item?') && this.$store.commit('deletePeriod', index);
    },
  },

};
</script>

<style>

</style>
