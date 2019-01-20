import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import Dinero from 'dinero.js';
import { cloneDeep } from 'lodash.clonedeep';
import fwh2019 from './utils/fwh2019';
import fwh2018 from './utils/fwh2018';
import fwh2017 from './utils/fwh2017';
import config from './config';

Vue.use(Vuex);
axios.defaults.baseURL = config.url;

export default new Vuex.Store({
  state: {
    token: localStorage.getItem('access_token') || null,
    username: localStorage.getItem('username') || null,
    refreshSemaphore: false,
    dirty: false,
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
          group: '941',
          chart_id: '2160',
        },
        {
          id: 'ssEe',
          name: 'Social Security - Employee',
          type: 'calculated',
          basis: 'medicare_income',
          rate: 0.062,
          applies: 'employee',
          group: '941',
          chart_id: '2161',
        },
        {
          id: 'medEe',
          name: 'Medicare - Employee',
          type: 'calculated',
          basis: 'medicare_income',
          rate: 0.0145,
          applies: 'employee',
          group: '941',
          chart_id: '2163',
        },
        {
          id: 'lni',
          name: 'Labor and Industries',
          type: 'calculated',
          basis: 'hourlyWorked',
          rate: 5.53,
          applies: 'employee',
          group: 'LNI',
          chart_id: '2165',
        },
        {
          id: 'lni-er',
          name: 'Labor and Industries',
          type: 'calculated',
          basis: 'hourlyWorked',
          rate: 6.85,
          applies: 'employer',
          group: 'LNI',
          chart_id: '6765',
        },
        {
          id: 'ssEr',
          name: 'Social Security - Employer',
          type: 'calculated',
          basis: 'medicare_income',
          rate: 0.062,
          applies: 'employer',
          group: '941',
          chart_id: '6762',
        },
        {
          id: 'medEr',
          name: 'Medicare - Employer',
          type: 'calculated',
          basis: 'medicare_income',
          rate: 0.0145,
          applies: 'employer',
          group: '941',
          chart_id: '6764',
        },
        {
          id: 'FUTA',
          name: 'Federal Unemployment Tax',
          type: 'calculated',
          basis: 'medicare_income',
          rate: 0.062,
          applies: 'employer',
          group: '940',
          chart_id: '6768',
        },
        {
          id: 'esd',
          name: 'WA Unemployment Insurance',
          type: 'calculated',
          basis: 'hourlyTotal',
          rate: 0.6,
          applies: 'employer',
          group: 'esd',
          chart_id: '6767',
        },
        {
          id: 'waFmlEe',
          name: 'Washington Family/Medical Leave deduction',
          type: 'waFml',
          basis: 'medicare_income',
          rate: 0.4,
          applies: 'employee',
          group: 'esd',
          chart_id: '2167',
        },
      ],
      accounts: [
        {
          id: 'ptoBalance',
          name: 'PTO Balance',
          type: 'calculated',
          chart_id: '2533',
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
    activeList: (state, getters) => () => {
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
          const basis = Dinero({ amount: Math.round(payCheck.totals[tax.basis]) });
          let fwh = payCheck.payperiod <= '2018-02' ? fwh2017 : fwh2018;
          if (payCheck.payperiod > '2019-01') {
            fwh = fwh2019;
          }
          const total = Dinero({ amount: taxes.employee.total });
          switch (tax.type) {
            case 'calculated':
              taxes[tax.applies][tax.id] = basis.multiply(tax.rate).getAmount();
              break;
            case 'fwh':
              taxes.employee[tax.id] = Dinero({
                amount: Math.round(fwh(empRates[tax.id], (payCheck.totals[tax.basis] / 100)) * 100),
              }).getAmount();
              break;
            default:
          }
          if (tax.applies === 'employee') {
            taxes.employee.total = total
              .add(Dinero({ amount: taxes[tax.applies][tax.id] })).getAmount();
          }
          taxes.employer.due = Dinero({ amount: taxes.employer.due })
            .add(Dinero({ amount: taxes[tax.applies][tax.id] })).getAmount();
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
        if (!empRates[deduction.id]) {
          return 0;
        }
        const rate = Dinero({ amount: Math.round(empRates[deduction.id] * 100) });
        if (empRates[deduction.id]) {
          switch (deduction.basis) {
            case 'month':
              deductions[deduction.id] = rate
                .divide(2).getAmount();
              break;
            case 'period':
              deductions[deduction.id] = rate.getAmount();
              break;
            case 'year':
              deductions[deduction.id] = rate.divide(24).getAmount();
              break;
            case 'percent':
              deductions[deduction.id] = Dinero({ amount: payCheck.income.total })
                .multiply(empRates[deduction.id]).getAmount();
              break;
            default:
          }
          deductions.total = Dinero({ amount: deductions.total })
            .add(Dinero({ amount: deductions[deduction.id] })).getAmount();
          if (deduction.tax_exempt) {
            deductions.tax_exempt = Dinero({ amount: deductions.tax_exempt })
              .add(Dinero({ amount: deductions[deduction.id] })).getAmount();
          }
        }
        return deductions;
      });
      return deductions;
    },

    employerMonth: (state, getters) => getters.employerCalc('month'),
    employerQuarter: (state, getters) => getters.employerCalc('quarter'),
    employerYear: (state, getters) => getters.employerCalc('year'),

    employerCalc: state => (period) => {
      const result = state.payPeriods.reduce((report, payperiod) => {
        const timeframe = report[payperiod[period]] || {};
        // eslint-disable-next-line
        report[payperiod[period]] = Object.keys(payperiod.employer).reduce((total, item) => {
          const itembalance = total[item] || 0;
          // eslint-disable-next-line
          total[item] = itembalance + payperiod.employer[item];
          return total;
        }, timeframe);
        return report;
      }, {});
      return result;
    },

    employeeCalc: (state) => {
      const result = state.payPeriods.reduce((report, payperiod) => {
        // eslint-disable-next-line
        report = payperiod.employees.reduce((empreport, employee) => {
          const emp = empreport[employee.id] || {};
          if (!empreport[employee.id]) {
            // eslint-disable-next-line
            empreport[employee.id] = {};
          }
          let values = empreport[employee.id].income || {};
          // eslint-disable-next-line
          empreport[employee.id].income = Object.keys(employee.income)
            .reduce((income, item) => {
              const value = income && income[item] ? income[item] : 0;
              // eslint-disable-next-line
              income[item] = value + employee.income[item];
              return income;
            }, values);

          values = empreport[employee.id].taxes || {};
          // eslint-disable-next-line
          empreport[employee.id].taxes = Object.keys(employee.taxes.employee)
            .reduce((current, item) => {
              const value = current[item] || 0;
              // eslint-disable-next-line
              current[item] = value + employee.taxes.employee[item];
              return current;
            }, values);
          values = empreport[employee.id].deductions || {};
          // eslint-disable-next-line
          empreport[employee.id].deductions = Object.keys(employee.deductions)
            .reduce((current, item) => {
              const value = current[item] || 0;
              // eslint-disable-next-line
              current[item] = value + employee.deductions[item];
              return current;
            }, values);
          return empreport;
        }, report);
        return report;
      }, {});
      return result;
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
    clearDirty(state) {
      // eslint-disable-next-line
      state.dirty = false;
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
    addPayPeriod(state, payPeriod) {
      state.payPeriods.unshift(payPeriod);
      // eslint-disable-next-line
      state.dirty = true;
    },
    reloadPayPeriods(state, payPeriods) {
      // eslint-disable-next-line
      state.payPeriods = payPeriods;
    },
    deletePeriod(state, item) {
      // eslint-disable-next-line
      state.dirty = true;
      state.payPeriods.splice(item);
    },
    updatePayPeriod: (state, payload) => {
      const myState = state;
      myState.payPeriods = state.payPeriods.map(p => (p.id === payload.id ? payload : p));
      myState.dirty = true;
    },
    updateHours: (state, payload) => {
      const payperiod = state.payPeriods.find(pp => pp.id === payload.payperiod);
      const employee = payperiod.employees.find(emp => emp.id === payload.id);
      const notexempt = state.employees.find(item => item.id === payload.id).class !== 'owner-exempt';
      employee[payload.field] = payload.value;
      employee.payperiod = payperiod.id;
      employee.totals.total_income = employee.income.total;
      employee.totals.total_income_exempt = employee.income.total * notexempt;
      employee.totals.medicare_income = employee.income.total;
      employee.totals.taxable_income = employee.income.taxable - employee.deductions.tax_exempt;
      employee.totals.taxable_income_exempt = (employee.income.taxable - employee.deductions.tax_exempt) * notexempt;
      employee.totals.net_income = employee.income.taxable
        - employee.deductions.total - employee.taxes.employee.total;
      employee.totals.hourlyWorked = employee.income.hourlyWorked;
      employee.totals.hourlyWorkedExempt = employee.income.hourlyWorked * notexempt;
      employee.totals.hourlyTotal = employee.income.hourlyTotal;
      employee.totals.hourlyTotalExempt = employee.income.hourlyTotal * notexempt;
      // eslint-disable-next-line
      state.dirty = true;
      // now recalculate employer taxes
      const { employees } = payperiod;
      const employer = Object.keys(employees).reduce((er, indx) => {
        const emp = employees[indx];
        Object.keys(emp.taxes.employee).map((tax) => {
          // eslint-disable-next-line
          er[tax] = (er[tax] || 0) + emp.taxes.employee[tax];
          return er;
        });
        Object.keys(emp.taxes.employer).map((tax) => {
          // eslint-disable-next-line
          er[tax] = (er[tax] || 0) + emp.taxes.employer[tax];
          return er;
        });
        Object.keys(emp.totals).map((total) => {
          // eslint-disable-next-line
          er[total] = (er[total] || 0) + emp.totals[total];
          return er;
        });
        return er;
      }, {});
      payperiod.employer = employer;
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
    addNewPayPeriod({ commit, getters }, payload) {
      const month = payload.id.substr(5, 2);
      const year = payload.id.substr(0, 4);
      const quarter = Math.ceil(month / 3);
      const payPeriod = {
        employees: getters.activeList(),
        employer: {},
        year,
        quarter: `${year}-Q${quarter}`,
        month: `${year}-${month}`,
        ...payload,
      };
      commit('addPayPeriod', payPeriod);
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
      let employerTaxes = payPeriod.employer;
      if (!employerTaxes) {
        employerTaxes = {};
      }
      const empRates = context.getters.getEmployeeById(payload.id).rates;
      const income = {
        total: 0,
        taxable: 0,
      };
      const hourly = empRates.salary ? empRates.salary / 2000 : empRates.hourlyRate;
      const ptoUsed = Dinero({ amount: Math.round(payCheck.ptoUsed * hourly * 100) });
      const holidayUsed = Dinero({ amount: Math.round(payCheck.holidayUsed * hourly * 100) });
      let total = ptoUsed.add(holidayUsed);
      if (empRates.salary) {
        let salary = Dinero({ amount: Math.round(empRates.salary / 0.24) });
        salary = salary.subtract(total);
        total = Dinero({ amount: Math.round(empRates.salary / 0.24) });
        income.salary = salary.getAmount();
        income.hourlyWorked = 80 - payCheck.ptoUsed - payCheck.holidayUsed;
        income.hourlyTotal = 80;
      } else {
        const hours = Dinero({ amount: Math.round(payCheck.hours * hourly * 100) });
        const overtime = Dinero({ amount: Math.round(payCheck.overtime * hourly * 150) });
        total = total.add(hours).add(overtime);
        income.hours = hours.getAmount();
        income.overtime = overtime.getAmount();
        income.hourlyWorked = (1 * payCheck.hours) + (1 * payCheck.overtime);
        income.hourlyTotal = income.hourlyWorked + (1 * payCheck.ptoUsed)
          + (1 * payCheck.holidayUsed);
      }
      income.ptoUsed = ptoUsed.getAmount();
      income.holidayUsed = holidayUsed.getAmount();
      income.bonus = payCheck.bonus * 100;
      income.total = total.add(Dinero({ amount: payCheck.bonus * 100 })).getAmount();
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
      // Add taxes to payroll total.
      /* employerTaxes = Object.keys(taxes).reduce((totals, taxType) => {
        if (totals[taxType]) {
          totals[taxType] = Object.keys(taxes[taxType])
            .map(tax => totals[taxType][tax] + taxes[taxType][tax]);
          return totals;
        }
        totals[taxType] = taxes[taxType];
        return totals;
      }, employerTaxes);
      const employerTax = {
        ...payload,
        employer: employerTaxes,
      };
      context.commit('updateEmployer', employerTax); */
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
    async loadPayPeriods(context) {
      axios.defaults.headers.common.Authorization = `Bearer ${context.state.token}`;
      try {
        const response = await axios.get('/payroll/payperiods');
        const payPeriods = response.data;
        context.commit('reloadPayPeriods', payPeriods);
        return payPeriods;
      } catch (error) {
        if (error.response.status === 403 && !context.state.refreshSemaphore) {
          context.commit('refreshSemaphore');
          await context.dispatch('refreshToken');
          context.commit('clearSemaphore');
          return context.dispatch('loadPayPeriods');
        }
        throw (error);
      }
    },
    async savePayPeriods(context) {
      axios.defaults.headers.common.Authorization = `Bearer ${context.state.token}`;
      const { payPeriods } = context.state;
      try {
        const savePromise = await axios.post('/payroll/payperiods', payPeriods);
        context.commit('clearDirty');
        return savePromise;
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
