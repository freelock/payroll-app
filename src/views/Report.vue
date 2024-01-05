<template>
  <div class="main">
    <h1>{{ periods | capitalize }} Tax report for {{ period }}</h1>
    <FwhReport :amounts="amounts"></FwhReport>

    <table>
      <tr class="spacer"><td>&nbsp;</td></tr>
      <tr>
        <th>Federal Unemployment (940)</th>
        <th>Tax amount</th>
      </tr>
      <tr>
        <td class="item">FUTA Employer</td>
        <td class="value">{{ amounts.FUTA | currency }} </td>
      </tr>
      <tr class="spacer"><td>&nbsp;</td></tr>
      <tr>
        <th>Washington SUI Employer</th>
        <th>Tax amount</th>
      </tr>
      <tr>
        <td class="item">SUI Employer</td>
        <td class="value">{{ amounts.esd | currency }} </td>
      </tr>
      <tr>
        <td class="item">WA Employment Administrative Fund</td>
        <td class="value">{{ amounts.eaf | currency }} </td>
      </tr>
      <tr>
        <td class="item">Family Leave Employee Withheld</td>
        <td class="value">{{ amounts.waFmlEe | currency }} </td>
      </tr>
      <tr>
        <td class="item">Wa Cares Employee Withheld</td>
        <td class="value">{{ amounts.waCaresEe | currency }} </td>
      </tr>
      <tr class="spacer"><td>&nbsp;</td></tr>
      <tr>
        <th>Washington Workers Compensation</th>
        <th>Tax amount</th>
      </tr>
      <tr>
        <td class="item">WA Workers Comp Tax</td>
        <td class="value">{{ amounts.lni | currency }} </td>
      </tr>
      <tr>
        <td class="item">WA Workers Comp Tax - Employer</td>
        <td class="value">{{ amounts.lniEr | currency }} </td>
      </tr>
    </table>

    <table>
      <tr>
        <th class="item">Item</th>
        <th class="value">Amount</th>
      </tr>
      <tr>
        <td class="item">Total Medicare wages</td>
        <td class="value">{{ amounts.total_income | currency }}</td>
      </tr>
      <tr>
        <td class="item">Taxable wages</td>
        <td class="value">{{ amounts.taxable_income | currency }}</td>
      </tr>
      <tr>
        <td class="item">Total wages without exempt owner</td>
        <td class="value">{{ amounts.total_income_exempt | currency }}</td>
      </tr>
      <tr>
        <td class="item">Taxable wages without exempt owner</td>
        <td class="value">{{ amounts.taxable_income_exempt | currency }}</td>
      </tr>
      <tr>
        <td class="item">Total hours</td>
        <td class="value">{{ amounts.hourlyTotal }}</td>
      </tr>
      <tr>
        <td class="item">Hours worked</td>
        <td class="value">{{ amounts.hourlyWorked }}</td>
      </tr>
      <tr>
        <td class="item">Total hours - without owners</td>
        <td class="value">{{ amounts.hourlyTotalExempt }}</td>
      </tr>
      <tr>
        <td class="item">Hours worked - without owners</td>
        <td class="value">{{ amounts.hourlyWorkedExempt }}</td>
      </tr>
    </table>
    <w2table
      class="fullwidth"
      :period="period"
      :periods="periods"
      ></w2table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import FwhReport from '@/components/FwhReport.vue';
import w2 from '../views/w2.vue';

export default {
  props: [
    'period',
    'periods',
  ],
  computed: {
    ...mapGetters([
      'employerMonth',
      'employerQuarter',
      'employerYear',
    ]),
    amounts() {
      const func = `employer${this.$options.filters.capitalize(this.periods)}`;
      return this[func][this.period];
    },
  },
  components: {
    FwhReport,
    w2table: w2,
  },
};
</script>

<style>
.main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.main h1 {
  grid-column: 1 / -1;
}
.fullwidth {
  grid-column: 1 / -1;
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
