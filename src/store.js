import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import fwh from './utils/fwh';
import config from './config';

Vue.use(Vuex);
axios.defaults.baseURL = config.url;

export default new Vuex.Store({
  state: {
    token: localStorage.getItem('access_token') || null,
    username: localStorage.getItem('username') || null,
    refreshSemaphore: false,
    lineItems: {
      periodItems: [
        {
          id: 'hours',
          name: 'Regular Hours',
          type: 'payPeriod',
          chart_id: '6510',
        },
        {
          id: 'overtime',
          name: 'Overtime Hours',
          type: 'payPeriod',
          chart_id: '6520',
        },
        {
          id: 'ptoUsed',
          name: 'PTO used',
          type: 'payPeriod',
          chart_id: '6510',
        },
        {
          id: 'holidayUsed',
          name: 'Holiday Pay',
          type: 'payPeriod',
          chart_id: '6510',
        },
        {
          id: 'bonus',
          name: 'Bonus',
          type: 'payPeriod',
          chart_id: '6530',
        },
      ],
      deductions: [
        {
          id: 'health',
          name: 'Health plan deduction',
          basis: 'month',
          chart_id: '6570',
          tax_exempt: true,
        },
        {
          id: 'retirement',
          name: 'Retirement deduction',
          basis: 'month',
          chart_id: '6580',
          tax_exempt: true,
        },
      ],
      taxes: [
        {
          id: 'FWH',
          name: 'Federal Witholding',
          type: 'fwh',
          basis: 'taxable_income',
          applies: 'employee',
          chart_id: '2160',
        },
        {
          id: 'ssEe',
          name: 'Social Security - Employee',
          type: 'calculated',
          basis: 'medicare_income',
          rate: 0.062,
          applies: 'employee',
          chart_id: '2161',
        },
        {
          id: 'medEe',
          name: 'Medicare - Employee',
          type: 'calculated',
          basis: 'medicare_income',
          rate: 0.0145,
          applies: 'employee',
          chart_id: '2163',
        },
        {
          id: 'lni',
          name: 'Labor and Industries',
          type: 'calculated',
          basis: 'worked',
          rate: 0.0553,
          applies: 'employee',
          chart_id: '2165',
        },
        {
          id: 'ssEr',
          name: 'Social Security - Employer',
          type: 'calculated',
          basis: 'medicare_income',
          rate: 0.062,
          applies: 'employer',
          chart_id: '6762',
        },
        {
          id: 'medEr',
          name: 'Medicare - Employer',
          type: 'calculated',
          basis: 'medicare_income',
          rate: 0.0145,
          applies: 'employer',
          chart_id: '6764',
        },
        {
          id: 'esd',
          name: 'WA Unemployment Insurance',
          type: 'calculated',
          basis: 'medicare_income',
          rate: 0.0110,
          applies: 'employer',
          chart_id: '6767',
        },
      ],
      accounts: [
        {
          id: 'ptoBalance',
          name: 'PTO Balance',
          type: 'calculated',
          chart_id: '2533',
        },
        {
          id: 'retirementBalance',
          name: 'Retirement contribution',
          type: 'calculated',
          chart_id: '2422',
        },
      ],
    },
    employees: [],
    payPeriods: [],
  },
  getters: {
    loggedIn(state) {
      return state.token !== null;
    },
    activeEmployees: state => state.employees.filter(employee => employee.status),
    activeList: (state, getters) => {
      const employees = getters.activeEmployees.map((employee) => {
        const template = {
          id: employee.id,
          ...state.lineItems.periodItems.reduce((acc, item) => {
            acc[item.id] = 0;
            return acc;
          }, {}),
          income: {},
          deductions: {
            total: 0,
            tax_exempt: 0,
          },
          taxes: {
            employee: {
              total: 0,
            },
            employer: {
              due: 0,
            },
          },
          totals: {
            total_income: 0,
            medicare_income: 0,
            taxable_income: 0,
            net_income: 0,
          },
        };
        return template;
      });
      return employees;
    },
    getEmployeeById: state => id => state.employees.find(e => e.id === id),
    getPayperiod: state => payload =>
      state.payPeriods.find(pp => pp.id === payload.payperiod),
    /**
     * Calculate taxes.
     */
    calculateTaxes: (state, getters) => (payCheck) => {
      const taxes = {
        employee: {
          total: 0,
        },
        employer: {
          due: 0,
        },
      };
      const empRates = getters.getEmployeeById(payCheck.id).rates;
      state.lineItems.taxes.map((tax) => {
        if (empRates[tax.id]) {
          switch (tax.type) {
            case 'calculated':
              taxes[tax.applies][tax.id] = payCheck.totals[tax.basis] * tax.rate;
              break;
            case 'fwh':
              taxes.employee[tax.id] = fwh(empRates[tax.id], payCheck.totals[tax.basis]);
              break;
            default:
          }
          if (tax.applies === 'employee') {
            taxes.employee.total += taxes[tax.applies][tax.id];
          }
          taxes.employer.due += taxes[tax.applies][tax.id];
        }
        return taxes;
      });

      return taxes;
    },
    /**
     * Look up a deduction amount on the employee.
     */
    calculateDeductions: (state, getters) => (payCheck) => {
      const empRates = getters.getEmployeeById(payCheck.id).rates;
      const deductions = {
        total: 0,
        tax_exempt: 0,
      };
      state.lineItems.deductions.map((deduction) => {
        if (empRates[deduction.id]) {
          switch (deduction.basis) {
            case 'month':
              deductions[deduction.id] = empRates[deduction.id] / 2;
              break;
            case 'period':
              deductions[deduction.id] = empRates[deduction.id];
              break;
            case 'year':
              deductions[deduction.id] = empRates[deduction.id] / 24;
              break;
            case 'percent':
              deductions[deduction.id] = empRates[deduction.id] * payCheck.income.total;
              break;
            default:
          }
          deductions.total += deductions[deduction.id];
          if (deduction.tax_exempt) {
            deductions.tax_exempt += deductions[deduction.id];
          }
        }
        return deductions;
      });
      return deductions;
    },

  },
  mutations: {
    retrieveToken(state, { token, username }) {
      // eslint-disable-next-line
      state.token = token;
      // eslint-disable-next-line
      state.username = username;
    },
    destroyToken(state) {
      // eslint-disable-next-line
      state.token = null;
      // eslint-disable-next-line
      state.username = null;
    },
    refreshSemaphore(state) {
      // eslint-disable-next-line
      state.refreshSemaphore = true;
    },
    clearSemaphore(state) {
      // eslint-disable-next-line
      state.refreshSemaphore = false;
    },
    addEmployee: (state, payload) => {
      state.employees.unshift(payload);
    },
    updateEmployee: (state, employee) => {
      const myState = state;
      myState.employees = state.employees.map(e => (e.id === employee.id ? employee : e));
    },
    reloadEmployees: (state, employees) => {
      // eslint-disable-next-line
      state.employees = employees;
    },
    addPayPeriod(state, payload) {
      const month = payload.id.substr(5, 2);
      const year = payload.id.substr(0, 4);
      const quarter = Math.ceil(month / 3);
      const payPeriod = {
        employees: this.getters.activeList,
        employer: {},
        quarter: `${year}-Q${quarter}`,
        month: `${year}-${month}`,
        ...payload,
      };
      state.payPeriods.unshift(payPeriod);
    },
    updatePayPeriod: (state, payload) => {
      const myState = state;
      myState.payPeriods = state.payPeriods.map(p => (p.id === payload.id ? payload : p));
    },
    updateHours: (state, payload) => {
      const payperiod = state.payPeriods.find(pp => pp.id === payload.payperiod);
      const employee = payperiod.employees.find(emp => emp.id === payload.id);
      employee[payload.field] = payload.value;
      employee.totals.total_income = employee.income.total;
      employee.totals.medicare_income = employee.income.total;
      employee.totals.taxable_income = employee.income.taxable - employee.deductions.tax_exempt;
      employee.totals.net_income = employee.income.taxable
        - employee.deductions.total - employee.taxes.employee.total;
      employee.totals.worked = employee.income.worked;
    },
  },
  actions: {
    retrieveToken(context, credentials) {
      return new Promise((resolve, reject) => {
        const data = new FormData();
        data.append('grant_type', 'password');
        data.append('client_id', config.uuid);
        data.append('client_secret', config.secret);
        data.append('username', credentials.username);
        data.append('password', credentials.password);

        axios.post('/oauth/token', data)
          .then((response) => {
            const token = response.data;
            localStorage.setItem('access_token', token.access_token);
            localStorage.setItem('refresh_token', token.refresh_token);
            localStorage.setItem('username', credentials.username);
            context.commit('retrieveToken', { token: token.access_token, username: credentials.username });
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    refreshToken(context) {
      return new Promise((resolve, reject) => {
        const data = new FormData();
        data.append('grant_type', 'refresh_token');
        data.append('client_id', config.uuid);
        data.append('client_secret', config.secret);
        data.append('refresh_token', localStorage.getItem('refresh_token'));
        axios.post('/oauth/token', data)
          .then((response) => {
            const token = response.data;
            localStorage.setItem('access_token', token.access_token);
            localStorage.setItem('refresh_token', token.refresh_token);
            context.commit('retrieveToken', { token: token.access_token, username: localStorage.getItem('username') });
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    destroyToken(context) {
      axios.defaults.headers.common.Authorization = `Bearer ${context.state.token.access_token}`;

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('username');
      context.commit('destroyToken');
    },
    /**
     * Update the calculated payroll values
     * @param {*} context
     * @param {*} payload - contains payperiod, id, field, value
     */
    calculate(context, payload) {
      context.commit('updateHours', payload);
      const payPeriod = context.getters.getPayperiod(payload);
      const payCheck = payPeriod.employees.find(e => e.id === payload.id);
      const empRates = context.getters.getEmployeeById(payload.id).rates;
      const income = {
        total: 0,
        taxable: 0,
      };
      const hourly = empRates.salary ? empRates.salary / 2000 : empRates.hourlyRate;
      income.ptoUsed = payCheck.ptoUsed * hourly;
      income.holidayUsed = payCheck.holidayUsed * hourly;
      income.total += income.ptoUsed + income.holidayUsed;
      if (empRates.salary) {
        let salary = empRates.salary / 24;
        salary -= income.total;
        income.total = empRates.salary / 24;
        income.salary = salary;
        income.worked = 40 - payCheck.ptoUsed - payCheck.holidayUsed;
      } else {
        income.hours = payCheck.hours * hourly;
        income.overtime = payCheck.overtime * hourly * 1.5;
        income.total += (1 * income.hours) + (1 * income.overtime);
        income.worked = (1 * payCheck.hours) + (1 * payCheck.overtime);
      }
      income.total += payCheck.bonus * 1;
      income.taxable = income.total;

      const updateField = {
        ...payload,
        field: 'income',
        value: income,
      };
      context.commit('updateHours', updateField);

      // Now calculate deductions.
      const deductions = context.getters.calculateDeductions(payCheck);
      updateField.field = 'deductions';
      updateField.value = deductions;
      context.commit('updateHours', updateField);

      // On to taxes.
      const taxes = context.getters.calculateTaxes(payCheck);
      updateField.field = 'taxes';
      updateField.value = taxes;
      context.commit('updateHours', updateField);
    },
    async loadEmployees(context) {
      axios.defaults.headers.common.Authorization = `Bearer ${context.state.token}`;
      try {
        const response = await axios.get('/payroll/employees');
        const employees = response.data;
        context.commit('reloadEmployees', employees);
        return employees;
      } catch (error) {
        if (error.response.status === 403 && !context.state.refreshSemaphore) {
          context.commit('refreshSemaphore');
          await context.dispatch('refreshToken');
          context.commit('clearSemaphore');
          return context.dispatch('loadEmployees');
        }
        throw (error);
      }
    },
    async saveEmployees(context) {
      axios.defaults.headers.common.Authorization = `Bearer ${context.state.token}`;
      const { employees } = context.state;
      try {
        return await axios.post('/payroll/employees', employees);
      } catch (error) {
        if (error.response.status === 403 && !context.state.refreshSemaphore) {
          context.commit('refreshSemaphore');
          await context.dispatch('refreshToken');
          context.commit('clearSemaphore');
          return context.dispatch('saveEmployees');
        }
        throw error;
      }
    },
    async saveLineItems(context) {
      axios.defaults.headers.common.Authorization = `Bearer ${context.state.token}`;
      const { lineItems } = context.state;
      try {
        return await axios.post('/payroll/lineitems', lineItems);
      } catch (error) {
        if (error.response.status === 403 && !context.state.refreshSemaphore) {
          context.commit('refreshSemaphore');
          await context.dispatch('refreshToken');
          context.commit('clearSemaphore');
          return context.dispatch('saveLineItems');
        }
        throw error;
      }
    },
    async savePayPeriods(context) {
      axios.defaults.headers.common.Authorization = `Bearer ${context.state.token}`;
      const { payPeriods } = context.state;
      try {
        return await axios.post('/payroll/payperiods', payPeriods);
      } catch (error) {
        if (error.response.status === 403 && !context.state.refreshSemaphore) {
          context.commit('refreshSemaphore');
          await context.dispatch('refreshToken');
          context.commit('clearSemaphore');
          return context.dispatch('savePayPeriods');
        }
        throw error;
      }
    },
  },
});
