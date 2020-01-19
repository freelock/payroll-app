# Creates a report across multiple pay periods
<template>
  <div>
    <h1>Pay Report</h1>

    <h2>Monthly</h2>
    <table class="paytable">
      <tr>
        <th class="item">Period</th>
        <th class="value">Total payroll</th>
      </tr>
      <tr v-for="(month, index) in months" :key="index">
        <td class="item"><router-link
          :to="{ name: 'report', params: { periods: 'month', period: month } }"
        >{{ month }}</router-link></td>
        <td class="value">{{ employerMonth[month].total_income | currency }}</td>
      </tr>
    </table>

    <h2>Quarterly</h2>
    <table class="paytable">
      <tr>
        <th class="item">Period</th>
        <th class="value">Total payroll</th>
      </tr>
      <tr v-for="(quarter, index) in quarters" :key="index">
        <td class="item"><router-link
          :to="{ name: 'report', params: { periods: 'quarter', period: quarter } }"
        >{{ quarter }}</router-link></td>
        <td class="value">{{ employerQuarter[quarter].total_income | currency }}</td>
      </tr>
    </table>


    <h2>Annual</h2>
    <table class="paytable">
      <tr>
        <th class="item">Period</th>
        <th class="item">Wages</th>
        <th class="value">Total payroll</th>
      </tr>
      <tr v-for="(year, index) in years" :key="index">
        <td class="item"><router-link
          :to="{ name: 'report', params: { periods: 'year', period: year } }"
        >{{ year }}</router-link></td>
        <td class="item"><router-link
          :to="{ name: 'w2', params: { periods: 'year', period: year } }"
        >{{ year }}</router-link></td>
        <td class="value">{{ employerYear[year].total_income | currency }}</td>
      </tr>
    </table>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {

  computed: {
    ...mapGetters([
      'employerMonth',
      'employerQuarter',
      'employerYear',
    ]),
    months() {
      return Object.keys(this.employerMonth);
    },
    quarters() {
      return Object.keys(this.employerQuarter);
    },
    years() {
      return Object.keys(this.employerYear);
    },
  },

};
</script>

<style>
.paytable {
  width: 100%;
  border: 1px solid #cccccc;
}
.item {
  text-align: left;
}
.value {
  text-align: right;
}

</style>
