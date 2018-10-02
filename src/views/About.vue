<template>
  <div class="about">
    <h1>Payroll Proof-of-concept App</h1>
    <p>This is a proof-of-concept UI for generating payroll, calculating deductions,
      managing PTO, and more. The goal is to build something fast and easy to use,
      and eventually post the resulting transactions into
     <a href="https://ledgersmb.org">LedgerSMB.</a>
    </p>
    <h2>To use</h2>
    <p>First, go to the Employees tab and add employees, with either a Salary or an
      hourly rate. If both are added, salary is used and hourly is ignored.
    </p>
    <p>Next, go to the "Periods" screen and add a pay period.</p>
    <p>You should see a screen to add hours worked for each employee, and the resulting
      deductions.
    </p>
    <p>At the moment, the app does not save data (anywhere other than Vuex, that is)
      -- if you refresh your browser, you will lose all of your data.
    </p>
    <p>
      Tax calculations should be correct for Washington State, using 2018 IRS tax tables.
      We do still need to apply rounding rules, and you currently need to use the
      Vue inspector to see the breakdown of taxes and deductions.
    </p>
    <login v-show="!loggedIn"></login>
  </div>
</template>

<script>
import Login from '@/components/Login.vue';

export default {
  computed: {
    loggedIn() {
      return this.$store.getters.loggedIn;
    },
  },
  components: {
    login: Login,
  },
};
</script>

<style>
.v-content__wrap {
  margin: 20px 50px;
  font-size: 18px;
}

</style>
