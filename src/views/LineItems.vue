<template>
  <div class="LineItems">
    <v-toolbar>
      <v-toolbar-title>Line Items</v-toolbar-title>
      <v-divider
        class="mx-2"
        inset
        vertical
      ></v-divider>
      <v-spacer></v-spacer>
      <v-btn @click.native="saveServer" color="primary">Save</v-btn>
    </v-toolbar>
    <h2>Pay Items</h2>
    <lineitem-list
      :lineItems="lineItems.periodItems">
    </lineitem-list>
    <h2>Deductions</h2>
    <lineitem-list
      :lineItems="lineItems.deductions">
    </lineitem-list>
    <h2>Taxes</h2>
    <lineitem-list
      :lineItems="lineItems.taxes">
    </lineitem-list>
    <h2>Accounts</h2>
    <lineitem-list
      :lineItems="lineItems.accounts">
    </lineitem-list>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import lineItemList from '@/components/lineItemList.vue';

export default {

  computed: {
    ...mapState([
      'lineItems',
    ]),
  },

  methods: {
    async saveServer() {
      try {
        await this.$store.dispatch('saveLineItems');
        this.$toaster.success('LineItems saved to server.');
      } catch (error) {
        // eslint-disable-next-line
        console.log(error);
        this.$toaster.error(`Server error: ${error.response.status}`);
      }
    },
  },
  components: {
    'lineitem-list': lineItemList,
  },
};
</script>

<style>

</style>
