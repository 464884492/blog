import Vue from 'vue'
import App from './App.vue'
import { DateFmt } from '@/filters/DateFmt.js';

//全局注册 Filter
Vue.filter("DateFmt", DateFmt);

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
