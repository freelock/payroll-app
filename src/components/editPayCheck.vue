<template>
  <div>
    <v-btn @click.native="navToPayperiod"
      color="primary">Go back to {{ payperiod }} pay period</v-btn>
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
        <div>{{ payStubData.ptoUsed }} PTO</div>
        <div>{{ payStubData.holidayUsed }} Holiday</div>
        <div>{{ payDataTotals.income.hourlyWorked }} YTD hours worked</div>
        <div>{{ payDataTotals.income.hourlyTotal }} YTD Total hours</div>
        <h2>Balances</h2>
        <div>PTO balance: {{ payDataTotals.accounts.ptoNet }} hours</div>
        <div>Total Retirement contribution: {{ payDataTotals.accounts.retirement | currency }}</div>
      </div>
      <div>
        <h2>Income</h2>
        <table class="paytable">
          <tr>
            <th class="item">Item</th>
            <th class="value">This paycheck</th>
            <th class="value">YTD</th>
          </tr>
          <tr>
            <td class="item">Salary/Hours</td>
            <td class="value"
              >{{ (payStubData.income.salary || payStubData.income.hours) | currency}}</td>
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
        <h2>Deductions</h2>
        <table class="paytable">
          <tr>
            <th class="item">Item</th>
            <th class="value">This paycheck</th>
            <th class="value">YTD</th>
          </tr>
          <tr v-show="payDataTotals.deductions.health">
            <td class="item">Health plan</td>
            <td class="value">
            <money
              :value="health"
              @input="updateHealth"
              v-bind="money"
              width="10"
              class="dollars"
              prefix="$"
              suffix=" USD"
            ></money>
              </td>
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
        <h2>Taxes<span 
          class="override"
          v-show="payStubData.override"
          >Overridden</span>
        </h2>
        <table class="paytable">
          <tr>
            <th class="item">Item</th>
            <th class="value">This paycheck</th>
            <th class="value">YTD</th>
          </tr>
          <tr>
            <td class="item">FWH</td>
            <td class="value">
            <money
              :value="fwh"
              @input="updateFwh"
              v-bind="money"
              width="12"
              class="dollars"
              prefix="$"
              suffix=" USD"
            ></money>
              </td>
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
            <td class="value">
            <money
              :value="lni"
              @input="updateLni"
              v-bind="money"
              width="10"
              class="dollars"
              prefix="$"
              suffix=" USD"
            ></money>
              </td>
            <td class="value">{{ payDataTotals.taxes.lni | currency }}</td>
          </tr>
          <tr>
            <td class="item">Washington Family/Medical Leave</td>
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
import { Money } from 'v-money';
import { mapState, mapGetters, mapActions } from 'vuex';
import { setTimeout } from 'core-js';

export default {
  props: [
    'payperiod',
    'employee',
  ],
  data() {
    return {
      money: {
        prefix: '',
        masked: false,
      },
      debounceTimeout: null,
    }
  },
  computed: {
    ...mapState([
      'employees',
      'payPeriods',
    ]),
    ...mapGetters([
      'employeeCalc',
    ]),
    employeeData() {
      return this.employees.find(item => this.employee === item.id);
    },
    fwh() {
      return this.payStubData.taxes.employee.FWH / 100;
    },
    lni() {
      return this.payStubData.taxes.employee.lni / 100;
    },
    health() {
      return this.payStubData.deductions.health / 100;
    },
    payDataTotals() {
      return this.employeeCalc[this.employee];
    },
    payStubData() {
      const pp = this.payPeriods.find(item => this.payperiod === item.id);
      return pp.employees.find(item => this.employee === item.id);
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
      return this.payDataTotals.income.total
        - this.payDataTotals.deductions.total - this.payDataTotals.taxes.total;
    },
    
  },
  methods: {
    ...mapActions([
      'updatePayStub',
    ]),
    updateFwh(value) {
      const origValue = this.payStubData.taxes.employee.FWH;
      this.update('fwh', origValue, value);
    },
    updateLni(value) {
      const origValue = this.payStubData.taxes.employee.lni;
      this.update('lni', origValue, value);
    },
    updateHealth(value) {
      const origValue = this.payStubData.deductions.health;
      this.update('health', origValue, value);
    },
    update(field, origValue, value) {
      if (origValue && (Math.round(value * 100) !== origValue)) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
      const self = this;
      this.debounceTimeout = setTimeout(function () {
        console.log(value, origValue);
        const data = {
          paystub: self.payStubData,
          field,
          value,
        }
        self.updatePayStub(data);
      }, 1000);
      }
    },
    navToPayperiod() {
      this.$router.push({
        name: 'payperiod',
        params: { payperiod: this.$route.params.payperiod },
      });
    },
  },
  components: {
    money: Money,
  },
};
</script>

<style>
.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.override {
  text-align: right;
  font-weight: normal;
  color: red;
  font-size: 0.5em;
}
.paytable {
  width: 100%;
  border: 1px solid #cccccc;
}
.item {
  text-align: left;
}
.dollars, .value {
  text-align: right;
}
</style>
