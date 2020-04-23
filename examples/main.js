import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
import 'element-ui/lib/theme-chalk/index.css'
// 导入组件库
// import zrDrawHtml from '../packages/zrDrawHtml'
// import '../packages/zrDrawHtml/src/zrDrawHtml.scss'
import zrDrawHtml from '../lib/zr-draw-html.common.js'
import '../lib/zr-draw-html.css'
console.log(zrDrawHtml)
// 注册组件库
Vue.use(zrDrawHtml)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')