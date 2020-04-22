# zr-draw-html

## 说明

er 图组件，基于 vue, element-ui, mxgroup.js 开发，完全数据驱动模式使用。

## 快速上手

> 先 npm 下载插件

```
`npm install mxgraph-js --save`
`npm install element-ui --save`
`import 'element-ui/lib/theme-chalk/index.css'`
`npm install zr-draw-html --save`
或
`npm i zr-draw-html -S`

import zrDrawHtml from 'zr-draw-html'
import 'zr-draw-html/lib/zr-draw-html.css'
Vue.use(zrDrawHtml)
```

![Image text](https://github.com/zjhr/zjhr-zr-draw-html-/blob/master/images/show.png)

## 使用指南

```js
;<template>
	<zr-draw-html></zr-draw-html>
</template>
```

## 参数

```js
//单前数据为tableArr数组的对象数据格式
{
  x: 600,//x坐标
  y: 100,//y坐标
  height: 100,//高度，为0时候自适应
  tableName: "表2",//表名
  tableId: "02",//表id
  state: 2,//图例类型
  collapsed: false,//打开/收起
  to: [{ tableId: "01", fieldId: 0, lineName: "连线" }],//表连线数据，fieldId为0则连表，否则链接是字段
  children: [{//字段数据
    name: "用户编码",//字段名称
    fieldId: "22",//字段id
    fieldType: "M",//维度或者度量图标
    key: true,//组件图标
    selected: true,//checkbox是否选中
    disabled: true,//是否屏蔽checkbox
    to: [{ tableId: "03", fieldId: "33", lineName: "连线", color: "#000" }]//连线数据
  }]
}
```

<table>
  <tr>
    <th>参数</th>
    <th>说明</th>
    <th>类型</th>
    <th>可选值</th>
    <th>默认值</th>
  </tr>
  <tr>
    <td>tableArr</td>
    <td>er图表的集合</td>
    <td>Array</td>
    <td>表格上面说明</td>
    <td>[]</td>
  </tr>
  <tr>
    <td>legend</td>
    <td>图例数据</td>
    <td>Array</td>
    <td>{state:Number ,name: String, color: "blue/green/yellow"}</td>
    <td>[]</td>
  </tr>
  <tr>
    <td>toolbars</td>
    <td>工具栏按钮,当存在radio属性时候，按钮渲染为radio，fun为radio改变时候的回调事件</td>
    <td>Array</td>
    <td>{name:String,icon:String,fun:Function,radio:{ name: "radioxx", checked: true }}</td>
    <td>[]</td>
  </tr>
  <tr>
    <td>account</td>
    <td>是否含有查看视图描述</td>
    <td>Boolean</td>
    <td>true|false</td>
    <td>false</td>
  </tr>
  <tr>
    <td>v-module</td>
    <td>视图描述</td>
    <td>String</td>
    <td>-</td>
    <td>-</td>
  </tr>
  <tr>
    <td>isCheckable</td>
    <td>是否显示table列的复选框</td>
    <td>Boolean</td>
    <td>true|false</td>
    <td>false</td>
  </tr>
  <tr>
    <td>isShowImg</td>
    <td>是否显示table列的图片</td>
    <td>Boolean</td>
    <td>true|false</td>
    <td>false</td>
  </tr>
  <tr>
    <td>toType</td>
    <td>连线类型</td>
    <td>Array</td>
    <td>"TToT"表可以连接表, "TToR"表可以连接列, "RToT"列可以连接表, "RToR"列可以连接列。</td>
    <td>["TToT", "TToR", "RToT", "RToR"]</td>
  </tr>
  <tr>
    <td>$emit("collapsed", tableData)</td>
    <td>当table收起展开时候回调触发，返回该table的对象</td>
    <td>-</td>
    <td>-</td>
    <td></td>
  </tr>
  <tr>
    <td>$emit("dblTable", tableData, tableIndex)</td>
    <td>双击table时候回调触发，返回该table的对象和该table对象的下标</td>
    <td>-</td>
    <td>-</td>
    <td></td>
  </tr>
  <tr>
    <td>$emit("dblEdge", <br/>
    {type,<br/>
    sTableRowIndex,<br/>
    tTableRowIndex,<br/>
    sTable,<br/>
    tTable,<br/>
    sTableRow,<br/>
    tTableRow,<br/>
    toIndex<br/>
    })</td>
    <td>
      type:["TToT", "TToR", "RToT", "RToR"]。<br/>
      sTableRowIndex:原表对象下标。<br/>
      tTableRowIndex：目标表对象下标。<br/>
      sTable：原表对象。tTable:目标表对象。<br/>
      sTableRow：源表列对象。<br/>
      tTableRow:目标表列对象。<br/>
      toIndex：如果连线源于表，侧toIndex为表对象的to对象的连线对象的下标；如果是连线源于表的列对象，侧toIndex为列对象的to对象的连线对象的下标。
    </td>
    <td>-</td>
    <td>-</td>
    <td></td>
  </tr>
  <tr>
    <td>$emit("afterLineAdd", <br/>
    {type,<br/>
    sTableRowIndex,<br/>
    tTableRowIndex,<br/>
    sTable,<br/>
    tTable,<br/>
    sTableRow,<br/>
    tTableRow,<br/>
    toIndex<br/>
    })</td>
    <td>连线后的回调，参数说明同上</td>
    <td>-</td>
    <td>-</td>
    <td></td>
  </tr>
  <tr>
    <td>$emit("checkChange", data, event)</td>
    <td>选择框选中后回调：data:勾选回调该列的对象。event:event对象</td>
    <td>-</td>
    <td>-</td>
    <td></td>
  </tr>
</table>
