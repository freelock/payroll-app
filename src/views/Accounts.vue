<template>
  <div class="payperiod">
  <v-toolbar flat color="white">
      <v-toolbar-title>{{ payperiod }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn @click.native="confirmPayperiod"
        color="primary"
        v-show="!selected.confirmed">Confirm Accounts</v-btn>
      <v-btn @click.native="unconfirmPayperiod"
        color="primary"
        v-show="selected.unconfirmed">UnConfirm Accounts</v-btn>
  </v-toolbar>
    <account-list
      :employees="employees"
      @itemSave="save"
      :confirmed="selected.confirmed"
      >
    </account-list>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import accountList from '../components/accountList.vue';

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
    'account-list': accountList,
  },
  methods: {
    save(item) {
      const data = {
        ...item,
        payperiod: this.payperiod,
      };
      this.$store.dispatch('calculate', data);
    },
    confirmPayperiod() {
      const period = {
        ...this.selected,
        confirmed: true,
      };
      this.$store.commit('updatePayPeriod', period);
    },
    unconfirmPayperiod() {
      const period = {
        ...this.selected,
        confirmed: false,
      };
      this.$store.commit('updatePayPeriod', period);
    },
  },
};
</script>

<style>

</style>
