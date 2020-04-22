export default {
  data() {
    return {
      config: {
        toType: this.toType,
        isCheckable: this.isCheckable,
        isShowImg: this.isShowImg,
        listeners: {
          delFun: this.delFun,
          collapsedFun: this.collapsedFun,
          scrollFixed: this.scrollFixedFun,
          cellsResized: this.cellsResizedFun,
          cellsMoved: this.cellsMovedFun,
          cellsAdded: this.cellsAddedFun,
          doubleClick: this.doubleClickFun,
          checkChange: this.checkChangeFun
        }
      }
    };
  },
  methods: {
    getTableArrRelationFun(cell) { // 获取当前TableArr的信息
      const {
        source,
        target,
        value
      } = cell;
      const sTableRowIndex = ~~value.getAttribute("sourceRow") - 1;
      const tTableRowIndex = ~~value.getAttribute("targetRow") - 1;
      const sTable = this.tableArr.find((v) => v.tableId === source.id); // 源table
      const tTable = this.tableArr.find((v) => v.tableId === target.id); // 目标table
      const sTableRow = sTable ? sTable.children[sTableRowIndex] : sTable;
      const tTableRow = tTable ? tTable.children[tTableRowIndex] : tTable;
      return {
        sTableRowIndex,
        tTableRowIndex,
        sTable,
        tTable,
        sTableRow,
        tTableRow
      };
    },
    getTableGatherRelationFun(cell) { // 获取TableGather缓存的信息
      const {
        source,
        target,
        value
      } = cell;
      const sTableRowIndex = ~~value.getAttribute("sourceRow") - 1;
      const tTableRowIndex = ~~value.getAttribute("targetRow") - 1;
      const sTable = this.tableGather[source.id]; // 源table
      const tTable = this.tableGather[target.id]; // 目标table
      const sTableRowId = sTableRowIndex !== -1 ? source.value.data.children[sTableRowIndex].fieldId : undefined;
      const tTableRowId = tTableRowIndex !== -1 ? target.value.data.children[tTableRowIndex].fieldId : undefined;
      const sTableRow = sTableRowIndex !== -1 ? sTable.children[sTableRowId] : undefined;
      const tTableRow = sTableRowIndex !== -1 ? tTable.children[tTableRowId] : undefined;
      return {
        sTableRowIndex,
        tTableRowIndex,
        sTable,
        tTable,
        sTableRow,
        tTableRow
      };
    },
    // 处理连线/删除连线的方法
    lineCallBackFun({
      sTable,
      tTable,
      sTableRowIndex,
      tTableRowIndex,
      sTableRow,
      tTableRow
    }, name, callback) {
      const handleFun = (obj, type) => {
        // tTableRowIndex === -1 说明连的是表否则说明连的是字段
        const fieldId = tTableRowIndex === -1 ? 0 : tTableRow.fieldId;
        const toIndex = obj.findIndex((v) => v.tableId === tTable.tableId && v.fieldId === fieldId);
        const newObj = {
          type,
          sTableRowIndex,
          tTableRowIndex,
          sTable,
          tTable,
          sTableRow,
          tTableRow,
          toIndex
        };
        new Promise((resolve) => {
          this.$emit(name, newObj, resolve);
        }).then(() => {
          callback && callback(obj, toIndex);
        });
        return newObj;
      };
      // 来源为表
      if (sTableRowIndex === -1) {
        if (sTable.to && sTable.to.length) {
          // tTableRowIndex === -1 说明表连表否则 说明表连字段
          return handleFun(sTable.to, tTableRowIndex === -1 ? "TToT" : "TToR");
        }
        return null;
      } else { // 来源为字段
        if (sTableRow && sTableRow.to && sTableRow.to.length) {
          return handleFun(sTableRow.to, tTableRowIndex === -1 ? "RToT" : "RToR");
        }
        return null;
      }
    },
    getSelectionCellsFun() { // 获取选中
      const selectCells = this.ergraph.graph.getSelectionCells();
      const selectArr = [];
      selectCells.forEach((val) => {
        if (val.edge) { // 线
          selectArr.push(this.getTableArrRelationFun(val));
        } else { // 表
          selectArr.push(this.tableArr.find((v) => v.tableId === val.id));
        }
      });
      return selectArr;
    },
    // table展开，收起回调
    collapsedFun(tableData) {
      this.lock = true;
      this.$emit("collapsed", tableData);
    },
    doubleClickFun(cell) { // 双击回调
      console.log("双击回调：", cell);
      if (cell) {
        if (cell.edge) { // 是线
          this.lineCallBackFun(this.getTableArrRelationFun(cell), "dblEdge");
        } else { // 非线
          const tableIndex = this.tableArr.findIndex((v) => v.tableId === cell.id);
          this.$emit("dblTable", this.tableArr[tableIndex], tableIndex);
        }
      }
    },
    checkChangeFun(data, event) { // 勾选回调
      console.log("勾选框回调：", data, event);
      this.$emit("checkChange", data, event);
    },
    cellsMovedFun(cell) { // 移动表回调方法
      const {
        id,
        geometry
      } = cell;
      let y = geometry.y;
      let x = geometry.x;
      const table = this.tableArr.find((v) => v.tableId === id);
      if (table) {
        if (y < 0) {
          y = geometry.y = 0;
        }
        if (x < 0) {
          x = geometry.x = 0;
        }
        Object.assign(table, {
          x,
          y
        });
        this.lock = true;
      }
    },
    cellsResizedFun(cell) { // 调整大小回调
      // debugger;
      const {
        id,
        geometry,
        value
      } = cell;
      let height = geometry.height;
      let width = geometry.width;
      const table = this.tableArr.find((v) => v.tableId === id);
      if (table) {
        const maxHeight = this.ergraph.countHeight(value.data.children);
        const minWidth = 160;
        if (height > maxHeight) {
          height = geometry.height = maxHeight;
        }
        if (width < minWidth) {
          width = geometry.width = minWidth;
        }
        Object.assign(table, {
          width,
          height
        });
        this.lock = true;
      }
    },
    cellsAddedFun(lineObj) { // 添加连线回调
      if (!~lineObj.id.indexOf("~")) { // 判断是否触发式的连线事件
        console.log("连线回调：", lineObj);
        // 处理tableArr数据加入连线数据
        const {
          sTable,
          tTable,
          sTableRowIndex,
          tTableRowIndex,
          sTableRow,
          tTableRow
        } = this.getTableArrRelationFun(lineObj);
        const to = {
          tableId: tTable.tableId,
          fieldId: tTableRowIndex === -1 ? 0 : tTableRow.fieldId,
          lineName: "",
          color: ""
        };
        const verifyFun = (obj, callback) => {
          if (obj.to.some((v) => v.tableId === to.tableId && v.fieldId === to.fieldId)) {
            this.ergraph.graph.getModel().beginUpdate();
            try {
              this.ergraph.graph.removeCells([lineObj]);
            } finally {
              // 更新显示
              this.ergraph.graph.getModel().endUpdate();
            }
            this.$message({
              showClose: true,
              message: "当前连线已经存在关系。",
              type: "warning"
            });
            return;
          }
          obj.to.push({
            ...to
          });
          callback();
        };
        // 连线源头是表
        if (sTableRowIndex === -1) {
          verifyFun(sTable, () => {
            // 处理tableGather数据加入连线数据
            const gather = this.getTableGatherRelationFun(lineObj);
            gather.sTable.to.push(to);
          });
        } else {
          verifyFun(sTableRow, () => {
            // 处理tableGather数据加入连线数据
            const gather = this.getTableGatherRelationFun(lineObj);
            gather.sTableRow.to.push(to);
          });
        }
        this.lock = true;
        setTimeout(() => {
          this.lineCallBackFun({
            sTable,
            tTable,
            sTableRowIndex,
            tTableRowIndex,
            sTableRow,
            tTableRow
          }, "afterLineAdd");
        });
      }
    },
    autoWidthFun(tableName, children) { // 适应宽度方法
      let width = 160;
      const byteFun = (str) => {
        let bytesCount = 0;
        for (let i = 0; i < str.length; i++) {
          const c = str.charAt(i);
          // eslint-disable-next-line no-control-regex
          if (/^[\u0000-\u00ff]$/.test(c)) { // 匹配双字节
            bytesCount += 1;
          } else {
            bytesCount += 2;
          }
        }
        return bytesCount;
      };
      const judgeFun = (name) => {
        let w = 160 * byteFun(name) / 18 + 50;
        if (w > width) {
          width = w;
        }
      };
      judgeFun(tableName);
      if (children.length) {
        children.map((v) => {
          judgeFun(v.name);
        });
      }
      return width;
    },
    // 添加表方法
    addTable(data) {
      const {
        tableId,
        tableName,
        children: child,
        state,
        width
      } = data;
      const obj = Object.assign(data, {
        width: width || this.autoWidthFun(tableName, child)
      });
      const children = {};
      child.forEach((v) => {
        children[v.fieldId] = {
          to: []
        };
      });
      this.tableGather[tableId] = {
        ergraph: this.ergraph.addTable({
          data: obj,
          children,
          saveScrollTop: 0, // 记录滚动条，处理滚动条定位
          fillColor: this.fillColorFun(state)
        }),
        children,
        to: []
      };
      this.lock = false;
    }
  }
};