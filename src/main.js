import '@babel/polyfill';
import Vue from 'vue';
import Toaster from 'v-toaster';
import 'v-toaster/dist/v-toaster.css';
import './plugins/vuetify';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

Vue.use(Toaster);

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
