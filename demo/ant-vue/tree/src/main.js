import Vue from 'vue'
import App from './App.vue'
import Antd, { Modal } from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

Vue.config.productionTip = false
Vue.use(Antd)
Vue.prototype.$warn = Modal.warning

new Vue({
  render: h => h(App),
}).$mount('#app')
