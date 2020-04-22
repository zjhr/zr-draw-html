<template>
	<div class="zr-draw-html z-h-100">
		<el-container class="z-h-100">
			<el-header class="zr-draw-html__tool">
				<el-tooltip effect="light" content="选择" placement="bottom">
					<label class="zr-draw-html__toolbtn">
						<input type="radio" class="z-none" v-model="state" value="0" name="zr-draw-html" />
						<div>
							<i class="el-icon-position"></i>
							<!-- <my-icon use="icon-shubiaodianji" scale=".8"></my-icon> -->
						</div>
					</label>
				</el-tooltip>
				<el-tooltip effect="light" content="拖动画布" placement="bottom">
					<label class="zr-draw-html__toolbtn">
						<input type="radio" class="z-none" v-model="state" value="1" name="zr-draw-html" />
						<div>
							<i class="el-icon-thumb"></i>
							<!-- <my-icon use="icon-shubiaoshou" scale=".8"></my-icon> -->
						</div>
					</label>
				</el-tooltip>
				<el-tooltip effect="light" content="放大" placement="bottom">
					<div class="zr-draw-html__toolbtn">
						<div @click="ZoomInFun">
							<i class="el-icon-zoom-in"></i>
							<!-- <my-icon use="icon-fangda" scale=".8"></my-icon> -->
						</div>
					</div>
				</el-tooltip>
				<el-tooltip effect="light" content="缩小" placement="bottom">
					<div class="zr-draw-html__toolbtn">
						<div @click="ZoomOutFun">
							<i class="el-icon-zoom-out"></i>
							<!-- <my-icon use="icon-suoxiao" scale=".8"></my-icon> -->
						</div>
					</div>
				</el-tooltip>
				<el-tooltip effect="light" content="删除" placement="bottom">
					<div class="zr-draw-html__toolbtn zr-draw-html__toolend">
						<div @click="delFun">
							<i class="el-icon-delete"></i>
							<!-- <my-icon use="icon-shanchu1" scale=".8"></my-icon> -->
						</div>
					</div>
				</el-tooltip>
				<template v-for="(item, index) in toolbars">
					<el-tooltip effect="light" :content="item.name" placement="bottom" :key="index">
						<label v-if="item.radio" class="zr-draw-html__toolbtn">
							<input
								type="radio"
								class="z-none"
								:checked="item.radio.checked"
								@change="item.fun(item)"
								:name="item.radio.name"
							/>
							<div>
								<i :class="item.icon"></i>
								<!-- <my-icon :use="item.icon" scale=".8"></my-icon> -->
							</div>
						</label>
						<div
							v-else
							class="zr-draw-html__toolbtn"
							:class="{'zr-draw-html__toolend':index+1===toolbars.length}"
						>
							<div @click="item.fun">
								<i :class="item.icon"></i>
								<!-- <my-icon :use="item.icon" scale=".8"></my-icon> -->
							</div>
						</div>
					</el-tooltip>
				</template>
				<el-checkbox v-if="account" class="z-mgl-5px zr-draw-html__toolend" v-model="accountCk">查看视图描述</el-checkbox>
				<slot name="tool"></slot>
			</el-header>
			<el-main class="z-pd-not g-pr z-h-100">
				<div ref="zrCanvas" class="m-pa-max z-h-100 z-hidden zr-canvas"></div>
				<div v-if="legend.length" class="m-pa-lb z-pd-10px z-bdr z-bg-fff zr-draw-html__legend">
					<template v-for="(item, index) in legend">
						<i class="s_inlineb z-pd-5px" :style="{background:legendColors[item.color]}" :key="index"></i>
						<span class="z-mgr-5px" :key="index">{{item.name}}</span>
					</template>
				</div>
				<div v-show="accountCk" class="m-pa-rt zr-draw-html__account">
					<el-input
						v-if="account"
						type="textarea"
						:rows="8"
						placeholder="请输入描述内容"
						:value="value"
						@input="$emit('input', $event)"
					></el-input>
				</div>
			</el-main>
		</el-container>
	</div>
</template>

<script>
import { ERGraph } from "./mxgraph";
import tools from "./mixins/tools";
import methods from "./mixins/methods";
import "./zrDrawHtml.scss";
import "./common.css";
import "./explorer.css";

export default {
	name: "zr-draw-html",
	mixins: [tools, methods],
	props: {
		tableArr: {// 表集合
			type: Array,
			default () {
				return [];
			}
		},
		value: String, // 描述
		isCheckable: { // 是否显示复选框
			type: Boolean,
			default: false
		},
		isShowImg: { // 是否显示图片--纯文字前留白减少
			type: Boolean,
			default: false
		},
		toType: {// 连线类型
			type: Array,
			default: ["TToT", "TToR", "RToT", "RToR"]
		}
	},
	data () {
		return {
			lock: false, // 阻止数据监测
			tableGather: {}, // 添加table的集合
			ergraph: {} // mxgraph实例
		};
	},
	destroyed () {
		// 组件销毁后，处理键盘事件销毁
		this.ergraph.keyboard(true);
	},
	mounted () {
		this.ergraph = new ERGraph(this.$refs.zrCanvas, this.config);
	},
	watch: {
		tableArr: {
			handler (val, oldVal) {
				if (this.lock) {
					this.lock = false;
					return;
				}
				// eslint-disable-next-line complexity
				this.$nextTick(() => {
					console.log("变化");
					// debugger;
					const tableChildrenObj = {};
					const tableObj = {};
					for (let v of val) {
						const sTableId = v.tableId;
						tableChildrenObj[sTableId] = {
							children: v.children || [],
							to: {}
						};
						tableObj[sTableId] = {
							to: v.to || []
						};
						v.children && v.children.map((b) => {
							tableChildrenObj[sTableId].to[b.fieldId] = b.to || [];
						});
						if (!this.tableGather[sTableId]) {// 缓存的数据不存在当前数据时候，执行增加
							this.addTable(v);
						}
					}

					// debugger;
					for (let [gk, gv] of Object.entries(this.tableGather)) {
						// 判断关系方法，简化以下重复代码
						const lineJudgeFun = (e, v) => e.tableId + e.fieldId + (e.lineName || "") + (e.color || "") !== v.tableId + v.fieldId + (v.lineName || "") + (v.color || "");
						let isPass = true;// 判断添加/删除关系是否成功
						// 连表操作
						const tGather = gv.to;// 缓存的table的to
						const tNow = tableObj[gk] ? tableObj[gk].to : [];// 当前table的to
						// 缓存过滤当前的不存在的数据，为删
						const tDel = tGather.filter((v) => tNow.every((e) => e && lineJudgeFun(e, v)));
						if (tDel && tDel.length) {
							this.$utils.forEach(tDel, (d) => {
								const tTableId = d.tableId;
								const tId = d.fieldId;
								isPass = this.ergraph.delLinkLine(gk, tTableId, 0, tId);
							});
							// debugger;
							// this.ergraph.tableRefresh(gk);
						}
						// 当前过滤缓存的不存在的数据，为增
						const tAdd = tNow.filter((v) => tGather.every((e) => e && lineJudgeFun(e, v)));
						if (tAdd && tAdd.length) {
							this.$utils.forEach(tAdd, (d) => {
								const tTableId = d.tableId;
								const tId = d.fieldId;
								const lineName = d.lineName;
								const color = d.color || "#6482B9";
								isPass = this.ergraph.setLinkLine(gk, tTableId, 0, tId, lineName, color);
							});
							// debugger;
							// this.ergraph.tableRefresh(gk);
						}
						if (isPass) {
							gv.to = this.$utils.deepClone(tNow);
						}
						// 列操作
						// 添加表后，处理链接关系
						const cGather = gv.children;// 缓存的children
						const cNow = tableChildrenObj[gk] ? tableChildrenObj[gk].children : [];// 当前的children
						// const eq = cNow.filter((t) => Object.values(cGather).some(v=>v.fieldId===t.fieldId));// 过滤旧数据和当前的数据共同数据，定为相等
						const add = cNow.filter((t) => Object.values(cGather).every((v) => v.fieldId !== t.fieldId));// 过滤当前的数据不存在旧数据，定为增加
						if (add && add.length) {// 缓存增加字段
							this.$utils.forEach(add, (t) => {
								const { fieldId: sId } = t;
								cGather[sId] = Object.assign(cGather[sId] || { to: [] }, this.$utils.deepClone(t, ["to"]));
							});
							// debugger;
							// this.ergraph.tableRefresh(gk);
						}
						// 过滤旧数据不存在当前的数据，定为删除
						const del = Object.values(cGather).filter((t) => cNow.every((e) => e.fieldId !== t.fieldId));
						if (del && del.length) {// 缓存删除的字段
							this.$utils.forEach(del, (t) => {
								this.$utils.forEach(t.to, (d) => {
									const tTableId = d.tableId;
									const tId = d.fieldId;
									this.ergraph.delLinkLine(gk, tTableId, t.fieldId, tId);
								});
								// 处理当前删除的字段的传入关系，执行删除处理
								let i = 0;
								while (i < val.length) {
									this.$utils.forEach(val[i].children, (v) => {
										if (v.to && v.to.length) {
											v.to = v.to.filter((item) => item.fieldId !== t.fieldId);
										}
									});
									i++;
								}
								delete cGather[t.fieldId];
							});
							// debugger;
							// this.ergraph.tableRefresh(gk);
						}
						// 缓存关系，处理重新连接
						const relationArr = [];
						// 处理新增字段/删除字段时候,删除连接后，重新连接
						if ((add && add.length || del && del.length) && !this.lock) {
							// 删除传入该table的关系线
							const parent = this.ergraph.graph.getDefaultParent();
							const cell = gv.ergraph;
							const edges = this.ergraph.graph.getEdges(cell, parent, true, true);// 获取传入和传出的关系
							this.$utils.forEach(edges, (v) => {
								const { source, value } = v;
								const sTableRowIndex = ~~value.getAttribute("sourceRow");
								if (!relationArr.includes(source.id)) {
									relationArr.push(source.id);
								}
								if (sTableRowIndex) {// 不是表才进行重新连接
									this.$utils.forEach(this.tableGather[source.id].children, (c) => {
										// 判断不等于当前table，说明是传入的线，处理删除线缓存
										if (source.id !== gk) {
											c.to = c.to.filter((f) => f.tableId !== gk);
										} else {
											c.to.splice(0, c.to.length);
										}
									});
								}
							});
							this.ergraph.graph.getModel().beginUpdate();
							try {
								this.ergraph.graph.removeCells(edges);
							} finally {
								// 更新显示
								this.ergraph.graph.getModel().endUpdate();
							}
						}
						if (!relationArr.length) {
							relationArr.push(gk);
						}
						// debugger;
						this.ergraph.tableRefresh(gk);
						this.$utils.forEach(relationArr, (sourceId) => {
							if (tableChildrenObj[sourceId] && tableChildrenObj[sourceId].to) {
								for (let [tk, tv] of Object.entries(tableChildrenObj[sourceId].to)) {
									let isPass = true;// 判断添加/删除关系是否成功
									const cGatherTo = this.tableGather[sourceId].children[tk].to;
									// 缓存过滤当前的不存在的数据，为删
									const del = cGatherTo.filter((v) => tv.every((e) => e && lineJudgeFun(e, v)));
									if (del && del.length) {// 删
										this.$utils.forEach(del, (d) => {
											const tTableId = d.tableId;
											const tId = d.fieldId;
											isPass = this.ergraph.delLinkLine(sourceId, tTableId, tk, tId);
										});
										// debugger;
										this.ergraph.tableRefresh(sourceId);
									}
									// 当前过滤缓存的不存在的数据，为增
									const add = tv.filter((v) => cGatherTo.every((e) => e && lineJudgeFun(e, v)));
									if (add && add.length) {
										this.$utils.forEach(add, (d) => {
											const tTableId = d.tableId;
											const tId = d.fieldId;
											const lineName = d.lineName;
											const color = d.color || "#6482B9";
											isPass = this.ergraph.setLinkLine(sourceId, tTableId, tk, tId, lineName, color);
										});
										// debugger;
										this.ergraph.tableRefresh(sourceId);
									}
									if (isPass) {
										this.tableGather[sourceId].children[tk].to = this.$utils.deepClone(tv);
									}
								}
							}
						});
					}
					// 删除表操作
					// 当前数据不存在缓存的数据时候，执行删除
					const delIdArr = Object.keys(this.tableGather).filter((v) => !val.some((item) => item.tableId === v));
					// debugger;
					if (delIdArr.length) {
						console.log(delIdArr);
						// debugger;
						const parent = this.ergraph.graph.getDefaultParent();
						this.$utils.forEach(delIdArr, (key) => {// 删除缓存数据与删除传入该table的关系线
							// 删除传入该table的关系线
							const cell = this.ergraph.findTable(key);
							const edges = this.ergraph.graph.getEdges(cell, parent, true, false);// 获取传入的关系
							console.log(edges);
							this.$utils.forEach(edges, (v) => {
								const { sTable, sTableRow: nsTableRow, sTableRowIndex } = this.getTableArrRelationFun(v);
								const { sTableRow: gsTableRow } = this.getTableGatherRelationFun(v);
								// 当存在删除的表的关系的表是表连过去的话，处理
								if (sTableRowIndex === -1) {
									sTable.to = sTable.to.filter((t) => t.tableId !== key);
									this.tableGather[sTable.tableId].to = this.$utils.deepClone(sTable.to);
								} else {
									nsTableRow.to = nsTableRow.to.filter((t) => t.tableId !== key);
									gsTableRow.to = this.$utils.deepClone(nsTableRow.to);
								}
							});
							// debugger;
							this.$delete(this.tableGather, key);
						});
						this.ergraph.removeTables(delIdArr);
					}
				});
			},
			deep: true,
			immediate: true
		}
	}
};
</script>
<style lang="scss" scoped>
.z-none {
	display: none;
}
.z-pd-not {
	padding: 0;
}
.z-h-100 {
	height: 100%;
}
.g-pr {
	position: relative;
}
.m-pa-rt {
	position: absolute;
	top: 0;
	right: 0;
}
.z-mgl-5px {
	margin-left: 5px;
}
.m-pa-max {
	width: 100%;
}
.z-hidden {
	overflow: hidden;
}
.m-pa-lb {
	position: absolute;
	left: 0;
	bottom: 0;
}
.z-pd-10px {
	padding: 10px;
}
.z-bdr {
	border: 1px solid #c8c7cc;
}
.z-bg-fff {
	background-color: #fff;
}
.z-pd-5px {
	padding: 5px;
}
.s_inlineb {
	display: inline-block;
}
.z-mgr-5px {
	margin-right: 5px;
}
.m-pa-rt {
	position: absolute;
	top: 0;
	right: 0;
}
</style>
