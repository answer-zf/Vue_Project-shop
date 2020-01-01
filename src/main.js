import Vue from 'vue'
import App from './App.vue'
import router from './router.js'
import './plugins/element.js'

// 导入全局样式表
import './assets/css/global.css'

import TreeTable from 'vue-table-with-tree-grid'

// 导入字体图标
import './assets/fonts/iconfont.css'

// 配置 axios
import axios from 'axios'
// 配合请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 配置请求拦截器（进行预处理）
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

// 自定义全局过滤器

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
