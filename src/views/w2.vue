<template>
  <div class="fullwidth">
    <h1>{{ periods | capitalize }} W2/W3 Tax report for {{ period }}</h1>
    <v-data-table
      :headers="headers"
      :items="employees"
      :pagination="pagination"
      class="w2table"
      @update:pagination="pagerUpdate"
      >
      <template slot="items" slot-scope="props">
        <tr>
          <td class="item">{{ props.item.id }}</td>
          <td class="value">{{ props.item.totals.total_income | currency }}</td>
          <td class="value">{{ props.item.totals.taxable_income | currency }}</td>
          <td class="value">{{ props.item.taxes.FWH | currency }}</td>
          <td class="value">{{ props.item.taxes.ssEe | currency }}</td>
          <td class="value">{{ props.item.taxes.medEe | currency }}</td>
          <td class="value">{{ props.item.taxes.waFmlEe | currency }}</td>
          <td class="value">{{ props.item.deductions.health | currency }}</td>
          <td class="value">{{ props.item.deductions.health_value | currency }}</td>
          <td class="value">{{ props.item.totals.hourlyTotal }}</td>
          <td class="value">{{ props.item.totals.hourlyWorked }}</td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: [
    'period',
    'periods',
  ],
  data: () => ({
    headers: [
      { text: 'Employee', value: 'id' },
      { text: 'Total (Medicare, SS) income', value: 'totals.total_income' },
      { text: 'Taxable income', value: 'totals.taxable_income' },
      { text: 'Federal Witholding', value: 'taxes.FWH' },
      { text: 'Soc. Sec. Withheld', value: 'taxes.ssEe' },
      { text: 'Medicare Withheld', value: 'taxes.medEe' },
      { text: 'WA Family Withheld', value: 'taxes.waFmlEe' },
      { text: 'Health plan deduction', value: 'deductions.health' },
      { text: 'Health plan premiums - total', value: 'deductions.health' },
      { text: 'Total hours', value: 'totals.hourlyTotal' },
      { text: 'Worked hours', value: 'totals.hourlyWorked' },
    ],
    pagination: {
      descending: false,
      page: 1,
      rowsPerPage: 25,
      sortBy: 'id',
      totalItems: 0,
    },
  }),
  computed: {
    ...mapGetters([
      'employeeCalcTax',
      'employeeYear',
      'employeeCalcPeriod',
    ]),
    employees() {
      const data = this.employeeCalcPeriod(this.periods)[this.period];
      return Object.keys(data).map((item) => {
        const employee = {
          id: item,
          ...data[item],
        };
        employee.deductions.health_value = employee.deductions.health * 4;
        return employee;
      });
    },
  },
  methods: {
    pagerUpdate(payload) {
      this.pagination = payload;
    },
  },
};
</script>

<style>
.fullwidth {
  display: grid;
  grid-template-columns: 1fr;
}
.fullwidth h1 {
  grid-column: 1 / -1;
}
.w2table {
  overflow: auto;
}
.item {
  text-align: left;
}
.value {
  text-align: right;
}
.spacer {
  margin-top: 50px;
}
</style>
