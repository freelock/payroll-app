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
              v-show="!confirmed"
              v-model.lazy="props.item.ptoBalance"
              single-line
              @change="save('ptoBalance', props.item)"
              v-money="hours"
              class="hours"
              suffix=" hours"
            ></v-text-field>
            {{ props.item.ptoBalance }}</td>
          <td>
            <v-text-field
              slot="input"
              v-show="!confirmed"
              v-model.lazy="props.item.retirementBalance"
              single-line
              @change="save('retirementBalance', props.item)"
              v-money="money"
              class="money"
              suffix=" USD"
            ></v-text-field>
            {{ props.item.retirementBalance }}</td>
          <td class="justify-center layout px-0">
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
    'confirmed', // Read-only flag
  ],
  data: () => ({
    headers: [
      { text: 'Employee', value: 'id' },
      { text: 'PTO Balance', value: 'ptoBalance' },
      { text: 'Retirement', value: 'retirementBalance' },

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

<style scoped>
  .hours {
    max-width: 110px;
  }
  .money {
    max-width: 70px;
  }
</style>
