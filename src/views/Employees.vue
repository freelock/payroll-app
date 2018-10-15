<template>
  <div class="employees">
  <v-toolbar flat color="white">
      <v-toolbar-title>Employee List</v-toolbar-title>
      <v-divider
        class="mx-2"
        inset
        vertical
      ></v-divider>
      <v-spacer></v-spacer>
      <v-dialog v-model="dialog" max-width="500px">
        <v-btn slot="activator" color="primary" dark class="mb-2">New Employee</v-btn>
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.id" label="Employee name"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-select v-model="editedItem.class" :items="classes" label="class"></v-select>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model.lazy="editedItem.rates.salary" label="Salary"
                  prefix="$" money="money"
                    ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.rates.hourlyRate"
                  label="Hourly Rate"
                  prefix="$"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.rates.FWH"
                   label="FWH deductions"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-checkbox v-model="editedItem.rates.ssEe"
                   label="Social Security - EE"></v-checkbox>
                  <v-checkbox v-model="editedItem.rates.ssEr"
                   label="Social Security - ER"></v-checkbox>
                  <v-checkbox v-model="editedItem.rates.medEe"
                   label="Medicare - EE"></v-checkbox>
                  <v-checkbox v-model="editedItem.rates.medEr"
                   label="Medicare - ER"></v-checkbox>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-checkbox v-model="editedItem.rates.lni"
                   label="WA Labor & Industries"></v-checkbox>
                  <v-checkbox v-model="editedItem.rates.esd"
                   label="WA Employement Security"></v-checkbox>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.rates.ptoRate"
                   label="PTO accum per hour worked"></v-text-field>
                  <v-text-field v-model="editedItem.rates.health"
                   label="Health Plan deduction"></v-text-field>
                  <v-text-field v-model="editedItem.rates.retirement"
                   label="Retirement Plan deduction"></v-text-field>
                  <v-checkbox v-model="editedItem.status"
                   label="Active?"></v-checkbox>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click.native="close">Cancel</v-btn>
            <v-btn color="blue darken-1" flat @click.native="save">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-btn @click.native="saveServer" color="primary">Save</v-btn>
  </v-toolbar>
    <employee-list
      :employees="employees"
      @edit="editItem"
      >
    </employee-list>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { VMoney } from 'v-money';
import employeeList from '../components/employeeList.vue';

export default {
  data: () => ({
    dialog: false,
    editedIndex: -1,
    editedItem: {
      id: '',
      class: 'temporary',
      rates: {
        hourlyRate: 15.00,
        FWH: 'S1',
        ssEe: 1,
        ssEr: 1,
        medEe: 1,
        medEr: 1,
        lni: 1,
        esd: 1,
        ptoRate: 0.04,
      },
      status: 1,
    },
    defaultItem: {
      id: '',
      class: 'temporary',
      rates: {},
      status: 1,
    },
    defaultRates: {
      hourlyRate: 15.00,
      FWH: 'S1',
      ssEe: 1,
      ssEr: 1,
      medEe: 1,
      medEr: 1,
      lni: 1,
      esd: 1,
      ptoRate: 0.04,
    },
    classes: [
      'temporary',
      'permanent',
      'owner',
    ],
    money: {
      prefix: '',
      masked: false,
    },
  }),
  computed: {
    ...mapState([
      'employees',
    ]),
    formTitle() {
      return this.editedInstance === -1 ? 'New Employee' : 'Edit Employee';
    },
  },

  components: {
    'employee-list': employeeList,
  },

  methods: {
    editItem(item) {
      this.editedIndex = this.employees.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedItem.rates = Object.assign({}, this.defaultRates);
        this.editedIndex = -1;
      }, 300);
    },
    save() {
      if (this.editedIndex > -1) {
        this.$store.commit('updateEmployee', this.editedItem);
      } else {
        this.$store.commit('addEmployee', this.editedItem);
      }
      this.close();
    },
    async saveServer() {
      try {
        await this.$store.dispatch('saveEmployees');
        this.$toaster.success('Employees Saved to server.');
      } catch (error) {
        // eslint-disable-next-line
        console.log(error);
        this.$toaster.error(`Server error: ${error.response.status}`);
      }
    },
  },
  mounted() {
    if (!this.$store.state.employees.length) {
      this.$store.dispatch('loadEmployees')
        .then(() => {
          this.$toaster.success('Loaded employees!');
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.log(error);
          this.$toaster.error(`Got this error. ${error.response.status}`);
        });
    }
  },
  directives: {
    money: VMoney,
  },
};
</script>

<style>

</style>
