import zrDrawHtml from './src'

// 为组件提供 install 安装方法，供按需引入
zrDrawHtml.install = function (Vue) {
  Vue.component(zrDrawHtml.name, zrDrawHtml)
}

// 默认导出组件
export default zrDrawHtml