<script>
import { mapGetters } from 'vuex';

export default {
  name: 'FwhReport',
  props: [
    'amounts',
  ],
  computed: {
    ...mapGetters([
      'employerCalc',
    ]),
    medTotal() {
      return this.amounts.medEe + this.amounts.medEr;
    },
    ssTotal() {
      return this.amounts.ssEe + this.amounts.ssEr;
    },
    t941() {
      const { amounts } = this;
      return amounts.FWH + amounts.ssEr + amounts.ssEe + amounts.medEe + amounts.medEr;
    },
  },
};
</script>

<template>
  <div>
    <h3>Federal Withholding</h3>
    <table class="fwh">
      <tr>
        <th class="item">Federal Taxes (941/944)</th>
        <th class="value">Tax Amount</th>
        <th>Basis</th>
        <th class="value">Amount</th>
      </tr>
      <tr>
        <td class="item">Federal Income Tax</td>
        <td class="value">{{ amounts.FWH | currency }} </td>
        <td>Taxable income</td>
        <td class="value">{{ amounts.taxable_income | currency }} </td>
      </tr>
      <tr>
        <td class="item">Social Security - Employee</td>
        <td class="value">{{ amounts.ssEe | currency}} </td>
        <td>Medicare income</td>
        <td class="value">{{ amounts.medicare_income | currency }} </td>
      </tr>
      <tr>
        <td class="item">Social Security - Employer</td>
        <td class="value">{{ amounts.ssEr | currency }} </td>
        <td>Total:</td>
        <td class="value">{{ ssTotal | currency }}</td>
      </tr>
      <tr>
        <td class="item">Medicare - Employee</td>
        <td class="value">{{ amounts.medEe | currency }} </td>
        <td>Medicare income</td>
        <td class="value">{{ amounts.medicare_income | currency }} </td>
      </tr>
      <tr>
        <td class="item">Medicare - Employer</td>
        <td class="value">{{ amounts.medEr | currency }} </td>
        <td>Total:</td>
        <td class="value">{{ medTotal |currency }}</td>
      </tr>
      <tr>
        <th class="item">Totals</th>
        <th class="value">{{ t941 | currency}}</th>
      </tr>
    </table>
  </div>
</template>

<style>
  .fwh td {
    padding: 1px 5px;
  }
</style>
