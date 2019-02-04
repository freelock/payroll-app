<template>
  <div>
    <v-btn @click.native="navToPayperiod" class="noprint" color="primary">Go back to
      {{ payperiod }} pay period</v-btn>
    <h1>{{ payperiod }} Paystub for {{ employee | capitalize }}</h1>
    <div class="columns">
      <div>
        <div>Class: {{ employeeData.class | capitalize }}</div>
        <div v-show="employeeData.rates.salary">Salary:
           {{ employeeData.rates.salary * 100| currency }}</div>
        <div v-show="!employeeData.rates.salary">Hourly:
          {{ employeeData.rates.hourlyRate * 100| currency }}</div>
        <div>Witholdings: {{ employeeData.rates.FWH }}</div>
        <div>PTO accrual rate: {{ employeeData.rates.ptoRate }} per hour worked</div>
        <h2>Hours</h2>
        <div>{{ payStubData.hours }} Regular hours</div>
        <div>{{ payStubData.ptoUsed }} PTO used</div>
        <div>{{ payStubData.holidayUsed }} Holiday</div>
        <div>{{ payDataTotals.income.hourlyWorked }} YTD hours worked</div>
        <div>{{ payDataTotals.income.hourlyTotal }} YTD Total hours</div>
        <h2>Balances</h2>
        <div>PTO change: {{ payStubData.accounts.ptoNet }}</div>
        <div>PTO balance: {{ payDataTotals.accounts.ptoNet }} hours</div>
        <div>Total Retirement contribution: {{ payDataTotals.accounts.retirement | currency }}</div>
        <h2>Income</h2>
        <table class="paytable">
          <tr>
            <th class="item">Item</th>
            <th class="value">This paycheck</th>
            <th class="value">YTD</th>
          </tr>
          <tr>
            <td class="item">Salary/Hours</td>
            <td class="value">{{ (payStubData.income.salary ||
              payStubData.income.hours) | currency}}</td>
            <td class="value">{{ gross | currency}}</td>
          </tr>
          <tr v-show="payDataTotals.income.overtime">
            <td class="item">Overtime</td>
            <td class="value">{{ payStubData.income.overtime | currency }}</td>
            <td class="value">{{ payDataTotals.income.overtime | currency }}</td>
          </tr>
          <tr>
            <td class="item">PTO</td>
            <td class="value">{{ payStubData.income.ptoUsed | currency }}</td>
            <td class="value">{{ payDataTotals.income.ptoUsed | currency }}</td>
          </tr>
          <tr>
            <td class="item">Holiday</td>
            <td class="value">{{ payStubData.income.holidayUsed | currency }}</td>
            <td class="value">{{ payDataTotals.income.holidayUsed | currency }}</td>
          </tr>
          <tr v-show="payDataTotals.income.bonus">
            <td class="item">Bonus</td>
            <td class="value">{{ payStubData.income.bonus | currency }}</td>
            <td class="value">{{ payDataTotals.income.bonus | currency }}</td>
          </tr>
          <tr>
            <th class="item">Total</th>
            <th class="value">{{ payStubData.totals.total_income | currency }}</th>
            <th class="value">{{ payDataTotals.income.total | currency }}</th>
          </tr>
        </table>
      </div>
      <div>
        <h2>Deductions</h2>
        <table class="paytable">
          <tr>
            <th class="item">Item</th>
            <th class="value">This paycheck</th>
            <th class="value">YTD</th>
          </tr>
          <tr v-show="payDataTotals.deductions.health">
            <td class="item">Health plan</td>
            <td class="value">{{ payStubData.deductions.health | currency }}</td>
            <td class="value">{{ payDataTotals.deductions.health | currency }}</td>
          </tr>
          <tr v-show="payDataTotals.deductions.retirement">
            <td class="item">Retirement Deduction</td>
            <td class="value">{{ payStubData.deductions.retirement | currency }}</td>
            <td class="value">{{ payDataTotals.deductions.retirement | currency }}</td>
          </tr>
          <tr>
            <th class="item">Taxable income</th>
            <th class="value">{{ payStubData.totals.taxable_income | currency }}</th>
            <th class="value">{{ taxable | currency }}</th>
          </tr>
        </table>
        <h2>Taxes</h2>
        <table class="paytable">
          <tr>
            <th class="item">Item</th>
            <th class="value">This paycheck</th>
            <th class="value">YTD</th>
          </tr>
          <tr>
            <td class="item">FWH</td>
            <td class="value">{{ payStubData.taxes.employee.FWH | currency }}</td>
            <td class="value">{{ payDataTotals.taxes.FWH | currency }}</td>
          </tr>
          <tr>
            <td class="item">Soc. Security</td>
            <td class="value">{{ payStubData.taxes.employee.ssEe | currency }}</td>
            <td class="value">{{ payDataTotals.taxes.ssEe | currency }}</td>
          </tr>
          <tr>
            <td class="item">Medicare</td>
            <td class="value">{{ payStubData.taxes.employee.medEe | currency }}</td>
            <td class="value">{{ payDataTotals.taxes.medEe | currency }}</td>
          </tr>
          <tr>
            <td class="item">Labor & Industries</td>
            <td class="value">{{ payStubData.taxes.employee.lni | currency }}</td>
            <td class="value">{{ payDataTotals.taxes.lni | currency }}</td>
          </tr>
          <tr>
            <td class="item">Washington Family/Medical Leave deduction</td>
            <td class="value">{{ payStubData.taxes.employee.waFmlEe | currency }}</td>
            <td class="value">{{ payDataTotals.taxes.waFmlEe | currency }}</td>
          </tr>
          <tr>
            <th class="item">Total tax</th>
            <th class="value">{{ payStubData.taxes.employee.total | currency }}</th>
            <th class="value">{{ payDataTotals.taxes.total | currency }}</th>
          </tr>
        </table>
        <h2>Totals</h2>
        <table class="paytable">
          <tr>
            <th class="item">Item</th>
            <th class="value">This paycheck</th>
            <th class="value">YTD</th>
          </tr>
          <tr>
            <th class="item">Total income</th>
            <th class="value">{{ payStubData.totals.total_income | currency }}</th>
            <th class="value">{{ payDataTotals.income.total | currency }}</th>
          </tr>
          <tr>
            <th class="item">Total deductions</th>
            <th class="value">{{ - payStubData.deductions.total | currency }}</th>
            <th class="value">{{ - payDataTotals.deductions.total | currency }}</th>
          </tr>
          <tr>
            <th class="item">Taxable income</th>
            <th class="value">{{ payStubData.totals.taxable_income | currency }}</th>
            <th class="value">{{ taxable | currency }}</th>
          </tr>
          <tr>
            <th class="item">Total tax</th>
            <th class="value">{{ - payStubData.taxes.employee.total | currency }}</th>
            <th class="value">{{ - payDataTotals.taxes.total | currency }}</th>
          </tr>
          <tr>
            <th class="item">Net paid</th>
            <th class="value">{{ payStubData.totals.net_income | currency }}</th>
            <th class="value">{{ net | currency }}</th>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  props: [
    'payperiod',
    'employee',
  ],
  data: () => ({

  }),
  computed: {
    ...mapState([
      'employees',
      'payPeriods',
    ]),
    ...mapGetters([
      'employeeCalcYtd',
    ]),
    employeeData() {
      return this.employees.find(item => this.employee === item.id);
    },
    payDataTotals() {
      return this.employeeCalcYtd(this.pp.year, this.payperiod)[this.pp.year][this.employee];
    },
    pp() {
      return this.payPeriods.find(item => this.payperiod === item.id);
    },
    payStubData() {
      return this.pp.employees.find(item => this.employee === item.id);
    },
    gross() {
      let gross = this.payDataTotals.income.salary || 0;
      if (this.payDataTotals.income.hours) {
        gross += this.payDataTotals.income.hours;
      }
      return gross;
    },
    taxable() {
      return this.payDataTotals.income.taxable - this.payDataTotals.deductions.tax_exempt;
    },
    net() {
      return this.payDataTotals.income.total - this.payDataTotals.deductions.total -
        this.payDataTotals.taxes.total;
    },
  },
  methods: {
    navToPayperiod() {
      this.$router.push({
        name: 'payperiod',
        params: { payperiod: this.$route.params.payperiod },
      });
    },
  },
};
</script>

<style>
.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 20px;
}

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
