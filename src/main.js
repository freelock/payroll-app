import '@babel/polyfill';
import Vue from 'vue';
import Toaster from 'v-toaster';
import Dinero from 'dinero.js';
import 'v-toaster/dist/v-toaster.css';
import './plugins/vuetify';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

Vue.use(Toaster);

Vue.filter('capitalize', (value) => {
  if (!value) return '';
  // eslint-disable-next-line
  value = value.toString();
  return value.charAt(0).toUpperCase() + value.slice(1);
});

Vue.filter('currency', (num) => {
  const myNum = num || 0;
  return Dinero({ amount: myNum }).toFormat();
});

router.beforeEach((to, from, next) => {
  if (to.path !== '/' && !store.getters.loggedIn) {
    next('/');
  } else {
    next();
  }
});

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
