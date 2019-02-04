import Vue from 'vue';
import Router from 'vue-router';
import Login from '@/components/Login.vue';
import About from '@/views/About.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/employees',
      name: 'employees',
      component: () => import(/* webpackChunkName: "employee" */ './views/Employees.vue'),
    },
    {
      path: '/lineitems',
      name: 'lineitems',
      component: () => import(/* webpackChunkName: "about" */ './views/LineItems.vue'),
    },
    {
      path: '/payperiods',
      name: 'payperiods',
      component: () => import(/* webpackChunkName: "about" */ './views/PayPeriods.vue'),
    },
    {
      path: '/',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: About,
    },
    {
      path: '/payperiods/:payperiod',
      name: 'payperiod',
      component: () => import(/* webpackChunkName: "payperiod" */ './views/PayPeriod.vue'),
      props: true,
    },
    {
      path: '/accounts/:payperiod',
      name: 'accountbalance',
      component: () => import(/* webpackChunkName: "employee" */ './views/Accounts.vue'),
      props: true,
    },
    {
      path: '/payperiods/:payperiod/:employee',
      name: 'paystub',
      component: () => import(/* webpackChunkName: "payperiod" */ './views/PayCheck.vue'),
      props: true,
    },
    {
      path: '/payperiods/:payperiod/:employee/edit',
      name: 'paystub-edit',
      component: () => import(/* webpackChunkName: "payperiod" */ './components/editPayCheck.vue'),
      props: true,
    },
    {
      path: '/payreport',
      name: 'payreport',
      component: () => import(/* webpackChunkName: "about" */ './views/PayReport.vue'),
    },
    {
      path: '/payreport/:periods/:period',
      name: 'report',
      component: () => import(/* webpackChunkName: "about" */ './views/Report.vue'),
      props: true,
    },
    {
      path: '/w2/:periods/:period',
      name: 'w2',
      component: () => import(/* webpackChunkName: "about" */ './views/w2.vue'),
      props: true,
    },
  ],
});
