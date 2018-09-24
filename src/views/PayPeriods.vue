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
      this.editedItem = Object.assign({}, item);
    },
    save() {
      if (this.editedIndex > -1) {
        this.$store.commit('updatePayPeriod', this.editedItem);
      } else {
        this.$store.commit('addPayPeriod', this.editedItem);
      }
      this.close();
    },
    newPayPeriod() {
      this.$store.commit('addPayPeriod', { id: this.createId });
      this.$router.push({ name: 'payperiod', params: { payperiod: this.createId } });
    },
  },
};
</script>

<style>

</style>
