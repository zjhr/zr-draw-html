<template>
	<div style="width:100%;height:500px;">
		<zr-draw-html
			ref="draw"
			isShowImg
			isCheckable
			:tableArr.sync="tableArr"
			:toolbars="toolbars"
			@checkChange="checkChangeFun"
			@afterLineAdd="afterLineAddFun"
			@delTable="delTableFun"
			@delLine="delLineFun"
		></zr-draw-html>
	</div>
</template>

<script>
export default {
	name: "drawhtml",
	data () {
		return {
			toolbars: [
				{ name: "radio1", icon: "el-icon-circle-plus", fun: (item) => { console.log(item); }, radio: { name: "radioxx", checked: true } },
				{ name: "radio2", icon: "el-icon-circle-plus", fun: (item) => { console.log(item); }, radio: { name: "radioxx" } },
				{ name: "新增表", icon: "el-icon-circle-plus", fun: this.addTableFun },
				{ name: "删除表1", icon: "el-icon-circle-plus", fun: this.delTable1Fun },
				{ name: "删除表2", icon: "el-icon-circle-plus", fun: this.delTable2Fun },
				{ name: "切换合闭表1", icon: "el-icon-circle-plus", fun: this.collapse1Fun },
				{ name: "增加表1的1列", icon: "el-icon-circle-plus", fun: this.addTableOneRowFun },
				{ name: "删除表1的1列", icon: "el-icon-circle-plus", fun: this.delTableOneRowFun },
				{ name: "删除表1的1列1线", icon: "el-icon-circle-plus", fun: this.delTableOneRowOneToFun },
				{ name: "获取选中", icon: "el-icon-circle-plus", fun: this.getSelectionCellsFun },
				{ name: "切换图标", icon: "el-icon-circle-plus", fun: this.toggleIconFun }],
			// tableArr: []
			tableArr: [{
				x: 100, y: 100,
				// width: 310,
				height: 100,
				tableName: "表1",
				tableId: "01",
				state: 1,
				collapsed: false,
				to: [],
				children: [{
					name: "用户编码",
					fieldId: "11",
					fieldType: "M",
					key: true,
					selected: true,
					disabled: true,
					to: [
						{ tableId: "02", fieldId: "22", lineName: "连线" }
						// { tableId: "2", fieldId: "222" }
					]
				}, {
					name: "用户编码1",
					fieldId: "111",
					fieldType: "M",
					to: []
				}, {
					name: "用户编码2",
					fieldId: "1111",
					fieldType: "D",
					to: []
				}, {
					name: "用户编码3",
					fieldId: "11111",
					fieldType: "C",
					to: []
				}, {
					name: "用户编码4",
					fieldId: "111111",
					to: []
				}
				]
			}, {
				x: 400, y: 200,
				tableName: "表2",
				tableId: "02",
				state: 2,
				to: [
					// { tableId: "01", fieldId: 0, lineName: "连线" }
				],
				children: [{
					name: "用户编码",
					fieldId: "22",
					to: [
						{ tableId: "03", fieldId: "33", lineName: "连线", color: "#000" }
						// { tableId: "01", fieldId: 0, lineName: "连线" }
					]
				}, {
					name: "用户编码2",
					fieldId: "222",
					to: []
				}]
			}, {
				x: 600, y: 100,
				height: 100,
				tableName: "表3",
				tableId: "03",
				state: 2,
				to: [],
				children: [{
					name: "用户编码",
					fieldId: "33",
					to: []
				}, {
					name: "用户编码2",
					fieldId: "333",
					to: []
				}, {
					name: "用户编码3",
					fieldId: "3333",
					to: []
				}, {
					name: "用户编码4",
					fieldId: "33333",
					to: []
				}]
			}]
		};
	},
	mounted () {
		// const len = 10;
		// const clen = 100;
		// for (let i = 0; i < len; i++) {
		//   const children = [];
		//   for (let t = 0; t < clen; t++) {
		//     children.push({
		//       name: "用户编码" + i + t,
		//       fieldId: "" + i + t,
		//       to: []
		//     });
		//   }
		//   this.tableArr.push({
		//     x: i * 200, y: 100,
		//     height: 300,
		//     tableName: "表" + i,
		//     tableId: "0" + i,
		//     state: 2,
		//     to: [],
		//     children
		//   });
		// }
	},
	methods: {
		toggleIconFun () {
			const type = this.tableArr[0].children[0].fieldType;
			this.tableArr[0].children[0].fieldType = type === "M" ? "D" : "M";
		},
		//连线之后回调
		afterLineAddFun ({ sTableRowIndex,
			tTableRowIndex,
			sTable,
			tTable,
			sTableRow,
			tTableRow,
			toIndex }) {
			sTableRow.to[toIndex].color = "#000";
			tTableRow.to.push({ tableId: sTable.tableId, fieldId: sTableRow.fieldId, color: "#000" });
		},
		collapse1Fun () {
			this.$set(this.tableArr[0], "collapsed", !this.tableArr[0].collapsed);
		},
		getSelectionCellsFun () {
			console.log(this.$refs.draw.getSelectionCellsFun());
		},
		delTableFun (obj, reslove) {
			console.log(obj);
			alert();
			reslove();
		},
		delLineFun (obj, reslove) {
			console.log(obj);
			alert();
			reslove();
		},
		addTableFun () {
			this.tableArr.push({
				x: 300, y: 300,
				tableName: "表4",
				tableId: "04",
				state: 2,
				to: [
					// { tableId: "01", fieldId: 0, lineName: "连线" }
				],
				children: [{
					name: "用户编码",
					fieldId: "44",
					to: [
						// { tableId: "01", fieldId: "11", lineName: "连线" }
						// { tableId: "01", fieldId: 0, lineName: "连线" }
					]
				}, {
					name: "用户编码2",
					fieldId: "444",
					to: []
				}]
			});
		},
		delTable1Fun () {
			this.tableArr.splice(0, 1);
		},
		delTable2Fun () {
			this.tableArr.splice(1, 1);
		},
		delTableOneRowFun () {
			this.tableArr[0].children.splice(0, 1);
		},
		addTableOneRowFun () {
			this.tableArr[0].children.push({
				name: "用户编码10",
				fieldId: "1111111111111",
				to: [
					// { tableId: "02", fieldId: "22" }
					// { tableId: "02", fieldId: "22", lineName: "连线连线连线连线连线1" },
					// { tableId: "03", fieldId: "33", lineName: "连线连线连线连线连线2" }
				]
			});
		},
		delTableOneRowOneToFun () {
			this.tableArr[0].children[0].to.splice(0, 1);
		},
		checkChangeFun (data) {
			console.log(data);
			this.tableArr[0].children.find((t) => t.fieldId === data.fieldId).selected = false;

		}
	}
};
</script>