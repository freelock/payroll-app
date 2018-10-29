<template>
<div class="payroll">
  <v-data-table
    :headers="headers"
    :items="employees"
    >
      <template slot="items" slot-scope="props">
        <tr>
          <td>{{ props.item.id }}</td>
          <td class="hours">
            <v-text-field
              slot="input"
              v-model.lazy="props.item.hours"
              single-line
              @change="save('hours', props.item)"
              v-money="hours"
              class="hours"
              suffix=" hours"
            ></v-text-field>
            {{ props.item.hours }}</td>
          <td>
            <v-text-field
              slot="input"
              v-model.lazy="props.item.overtime"
              single-line
              @change="save('overtime', props.item)"
              v-money="hours"
              class="hours"
              suffix=" hours"
            ></v-text-field>
            {{ props.item.overtime }}</td>
          <td>
            <v-text-field
              slot="input"
              v-model.lazy="props.item.ptoUsed"
              single-line
              @change="save('ptoUsed', props.item)"
              v-money="hours"
              class="hours"
              suffix=" hours"
            ></v-text-field>
            {{ props.item.ptoUsed }}</td>
          <td>
            <v-text-field
              slot="input"
              v-model.lazy="props.item.holidayUsed"
              single-line
              @change="save('holidayUsed', props.item)"
              v-money="hours"
              class="hours"
              suffix=" hours"
            ></v-text-field>
            {{ props.item.holidayUsed }}</td>
          <td>
            <v-text-field
              slot="input"
              v-model.lazy="props.item.bonus"
              single-line
              @change="save('bonus', props.item)"
              v-money="money"
              class="money"
              prefix="$"
            ></v-text-field>
            {{ props.item.bonus }}</td>
          <td>{{ format(props.item.income.total) }}</td>
          <td>{{ format(props.item.deductions.total) }}</td>
          <td>{{ format(props.item.taxes.employee.total) }}</td>
          <td>{{ format(props.item.totals.net_income) }}</td>
          <td class="justify-center layout px-0">
          <v-icon
            small
            class="mr-2"
            @click="editItem(props.item)"
          >
            edit
          </v-icon>
          <v-icon
            small
            class="mr-2"
            @click="showPaystub(props.item)">
            attach_money
          </v-icon>
        </td>
        </tr>
      </template>
  </v-data-table>

</div>
</template>

<script>
import { VMoney } from 'v-money';
import Dinero from 'dinero.js';

export default {
  props: [
    'employees',
  ],
  data: () => ({
    headers: [
      { text: 'Employee', value: 'id' },
      { text: 'Hours', value: 'hours' },
      { text: 'Overtime', value: 'overtime' },
      { text: 'PTO Used', value: 'ptoUsed' },
      { text: 'Holiday', value: 'holidayUsed' },
      { text: 'Bonus', value: 'bonus' },
      { text: 'Total pay', value: 'income.total' },
      { text: 'Deductions', value: 'deductions.total' },
      { text: 'Taxes', value: 'taxes.employee.total' },
      { text: 'Net pay', value: 'totals.net_income' },

      { text: 'Actions', value: 'name', sortable: false },
    ],
    hours: {
      suffix: '',
      masked: false,
    },
    money: {
      prefix: '',
      masked: false,
    },
  }),
  methods: {
    save(field, item) {
      const update = {
        field,
        value: item[field],
        id: item.id,
      };
      this.$emit('itemSave', update);
    },
    showPaystub(employee) {
      this.$router.push({
        name: 'paystub',
        params: { payperiod: this.$route.params.payperiod, employee: employee.id },
      });
    },
    format(num) {
      const myNum = num || 0;
      return Dinero({ amount: myNum }).toFormat();
    },
  },
  directives: {
    money: VMoney,
  },
};
</script>

<style lang="scss" scoped>
  .hours {
    max-width: 110px;
  }
  .money {
    max-width: 70px;
  }
</style>
