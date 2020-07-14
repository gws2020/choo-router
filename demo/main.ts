import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ChooRouter from '../src'

Vue.use(ChooRouter, {
  router
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
