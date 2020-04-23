export default {
  props: {
    legend: {
      // 图例 {state:1 ,name: "新增", color: "blue"}
      type: Array,
      default () {
        return [];
      }
    },
    legendColors: {
      //图例颜色 {key:color}
      type: Object,
      default () {
        return ({});
      }
    },
    toolbars: {
      // 工具按钮 {name:"",icon:"",fun:Function}
      type: Array,
      default () {
        return [];
      }
    },
    account: Boolean // 是否含有查看视图描述
  },
  data() {
    return {
      accountCk: false, // 查看视图描述控制
      legendColors: {
        // 图例颜色，关于表头颜色
        blue: "#409EFF",
        green: "#69db7c",
        yellow: "#ffd43b",
        ...this.legendColors
      },
      state: "0" // 选择(0)和拖动画布(1)状态
    };
  },
  methods: {
    fillColorFun(state) {
      // 设置表状态(颜色)
      let fillColor = this.legendColors.blue;
      const clr = this.legend.find((v) => state === v.state);
      if (clr) {
        fillColor = this.legendColors[clr.color];
      }
      return fillColor;
    },
    ZoomInFun() {
      // 放大
      this.ergraph.graph.zoomIn();
    },
    ZoomOutFun() {
      // 缩小
      this.ergraph.graph.zoomOut();
    },
    delFun() {
      // 删除选中
      const getSelectionCells = this.ergraph.graph.getSelectionCells();
      console.log("选中：", getSelectionCells);
      const delFun = (cells, i = 0) => {
        if (i < cells.length) {
          const cell = cells[i];
          if (cell.edge) {
            this.delLineFun(cell);
          } else {
            this.delTableFun(cell);
          }
          i++;
          delFun(cells, i);
        }
      };
      if (getSelectionCells.length) {
        delFun(getSelectionCells.sort((a) => a.edge ? -1 : 1));
      }
    },
    // 删除tableArr关系线
    delLineFun(cell) {
      this.lineCallBackFun(this.getTableArrRelationFun(cell), "delLine", (obj, toIndex) => {
        obj.splice(toIndex, 1);
        this.lock = false;
      });
    },
    delCellFun(cell) {
      // 删除tableArr列(暂时没有)
      // debugger;
    },
    // 删除tableArr表
    delTableFun(cell) {
      // debugger;
      const {
        value,
        id
      } = cell;
      const index = this.tableArr.findIndex((v) => v.tableId === id);
      new Promise((resolve) => {
        this.$emit("delTable", {
          table: value.data,
          index,
          id
        }, resolve);
      }).then(() => {
        this.tableArr.splice(index, 1);
        this.lock = false;
      });
    }
  },
  watch: {
    state(newVal, oldVal) {
      const graph = this.ergraph.graph;
      const state = newVal !== "0";
      graph.panningHandler.useLeftButtonForPanning = state;
      graph.panningHandler.ignoreCell = state;
      graph.setPanning(state);
    }
  }
};