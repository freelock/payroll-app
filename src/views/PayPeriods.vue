// Shows a report of a single pay period, across all employees
<template>
<div class="payPeriods">
  <v-toolbar flat color="white">
      <v-toolbar-title>Pay Periods</v-toolbar-title>
      <v-divider
        class="mx-2"
        inset
        vertical
      ></v-divider>
      <v-spacer></v-spacer>
      <v-menu
        ref="menu2"
        :close-on-content-click="false"
        v-model="menu2"
        :nudge-right="40"
        :return-value.sync="createId"
        lazy
        transition="scale-transition"
        offset-y
        full-width
        min-width="190px"
      >
        <v-text-field
          slot="activator"
          v-model="createId"
          prepend-icon="event"
          readonly
        ></v-text-field>
        <v-date-picker v-model="createId" @input="$refs.menu2.save(createId)"></v-date-picker>
      </v-menu>
      <v-btn color="primary" dark class="mb-2"
        @click.native="newPayPeriod">
        New pay period
      </v-btn>
      <v-btn @click.native="loadServer" color="primary">Load</v-btn>
      <v-btn @click.native="saveServer" color="primary">Save</v-btn>
  </v-toolbar>
    <pay-period-list
      :payPeriods="payPeriods"
      @edit="editItem"
      >
    </pay-period-list>
</div>
</template>

<script>
import { mapState } from 'vuex';
import payPeriodList from '../components/payPeriodList.vue';

export default {
  data: () => ({
    dialog: false,
    menu2: false,
    editedIndex: -1,
    createId: new Date().toJSON().substring(0, 10),
    editedItem: {

    },
    defaultItem: {

    },
  }),
  computed: {
    ...mapState([
      'payPeriods',
    ]),
    formTitle() {
      return this.editedInstance === -1 ? 'New Pay Period' : 'Edit Pay Period';
    },
  },
  components: {
    'pay-period-list': payPeriodList,
  },
  methods: {
    editItem(item) {
      this.editedIndex = this.payPeriods.indexOf(item);
      this.editedItem = item;
    },
    newPayPeriod() {
      this.$store.commit('addPayPeriod', { id: this.createId });
      this.$router.push({ name: 'payperiod', params: { payperiod: this.createId } });
    },
    async saveServer() {
      try {
        await this.$store.dispatch('savePayPeriods');
        this.$toaster.success('Payroll saved to server.');
      } catch (error) {
        // eslint-disable-next-line
        console.log(error);
        this.$toaster.error(`Server error: ${error.response.status}`);
      }
    },
    async loadServer() {
      try {
        await this.$store.dispatch('loadPayPeriods');
        this.$toaster.success('Payroll loaded from server.');
      } catch (error) {
        // eslint-disable-next-line
        console.log(error);
        this.$toaster.error(`Server error: ${error.response.status}`);
      }
    },
  },
};
</script>

<style>

</style>
