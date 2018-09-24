<template>
  <div class="payperiod">
    <h1>{{ payperiod }}</h1>
    <payroll-list
      :employees="employees"
      @itemSave="save"
      >
    </payroll-list>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import payrollList from '../components/payrollList.vue';

export default {
  props: [
    'payperiod',
  ],
  data: () => ({
  }),
  computed: {
    ...mapState([
      'payPeriods',
    ]),
    selected() {
      return this.payPeriods.find(item => item.id === this.payperiod);
    },
    employees() {
      return this.selected.employees;
    },
  },
  components: {
    'payroll-list': payrollList,
  },
  methods: {
    save(item) {
      const data = {
        ...item,
        payperiod: this.payperiod,
      };
      this.$store.dispatch('calculate', data);
    },
  },
};
</script>

<style>

</style>
