import Vue from 'vue';
import Router from 'vue-router';
import About from './views/About.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/employees',
      name: 'employees',
      component: () => import(/* webpackChunkName: "about" */ './views/Employees.vue'),
    },
    {
      path: '/payperiods',
      name: 'payperiods',
      component: () => import(/* webpackChunkName: "about" */ './views/PayPeriods.vue'),
    },
    {
      path: '/payreport',
      name: 'payreport',
      component: () => import(/* webpackChunkName: "about" */ './views/PayReport.vue'),
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
  ],
});
