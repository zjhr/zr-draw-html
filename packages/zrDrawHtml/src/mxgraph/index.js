import {
  mxGraph,
  mxUtils,
  mxClient,
  mxImage,
  mxPoint,
  mxCellState,
  mxDivResizer,
  mxEvent,
  mxConstants,
  mxPerimeter,
  mxEdgeStyle,
  mxRubberband,
  mxKeyHandler,
  mxRectangle
} from "mxgraph-js";
import {
  Message
} from "element-ui";
import utils from '../utils'
export class ERGraph {
  constructor(el, config) {
    this.config = config;
    this.el = el;
    // 在给定的容器内创建图形
    this.graph = null;
    // 单个单元的用户对象(数据)
    this.doc = null;
    // 存储键盘事件方法
    this.keyboardFun();
    // 初始化创建画布容器
    this.init(this.createDiv(), config);
    this.listenersInit(config);
  }

  /**
   * 初始化
   * @memberof ERGraph
   * @returns {null} null
   */
  createDiv() { // 创建画布容器
    const erdiv = document.createElement("div");
    Object.assign(erdiv.style, {
      borderWidth: "1px",
      borderStyle: "dotted",
      borderColor: "#AAAAAA",
      backgroundColor: "white",
      display: "block",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: "auto",
      backgroundImage: 'url("' + require("../img/grid.gif") + '")'
    });
    const span = document.createElement("span");
    span.className = "title_span";
    Object.assign(span.style, {
      color: "#fff",
      backgroundColor: "#4a5f87",
      position: "absolute",
      "z-index": 10,
      display: "none"
    });
    erdiv.appendChild(span);
    this.el.appendChild(erdiv);
    return erdiv;
  }

  /**
   * @param {Object} container DOM节点
   * @param {Object} config 回调处理
   * @memberof ERGraph
   * @returns {null} null
   */
  init(container, config) {
    if (!mxClient.isBrowserSupported()) {
      // 如果不支持浏览器，则显示错误消息
      Message({
        showClose: true,
        message: "当前浏览器版本过低无法使用该功能，请升级!",
        type: "warning"
      });
    } else {
      // 在给定的容器内创建图形
      const graph = this.graph = ERGraph.prototype.graph = new mxGraph(container);
      // 必须禁用，才能计算单元标签的DOM树中的位置。
      graph.view.optimizeVmlReflows = false;
      graph.connectionHandler.movePreviewAway = false;
      // 禁用 foreignObjects
      mxClient.NO_FO = true;
      // 使移动预览在HTML中显示在顶部
      graph.graphHandler.htmlPreview = true;
      // 显示细胞位置标尺
      graph.graphHandler.guidesEnabled = true;
      // 使连接图标出现在HTML的顶部
      graph.connectionHandler.moveIconFront = true;
      // 更改收缩图标
      graph.collapsedImage = new mxImage(require("../img/collapsed.gif"), 9, 9);
      // 更改展开图标
      graph.expandedImage = new mxImage(require("../img/expanded.gif"), 9, 9);
      // 更改链接点图标
      graph.connectionHandler.connectImage = new mxImage(require("../img/connector.gif"), 16, 16);
      // 在quirks模式下支持某些CSS样式
      if (mxClient.IS_QUIRKS) {
        new mxDivResizer(container);
      }
      // 禁用右键上下文菜单
      mxEvent.disableContextMenu(container);
      // 禁用到无效行的连接
      graph.connectionHandler.isValidTarget = function (cell) {
        return this.currentRowNode !== null;
      };
      // 单个单元的用户对象(数据)
      const doc = this.doc = new mxUtils.createXmlDocument();
      // 使橡皮带选择
      new mxRubberband(graph);
      // 启用密钥处理(例如。逃避)
      new mxKeyHandler(graph);
      // 使用实体周长(如下)作为默认值
      let style = graph.stylesheet.getDefaultVertexStyle();
      style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
      style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EntityPerimeter;
      // style[mxConstants.STYLE_SHADOW] = true;
      // style[mxConstants.STYLE_ROUNDED] = true;
      // style[mxConstants.STYLE_TEXT_OPACITY] = 30;
      // style[mxConstants.STYLE_OPACITY] = 30;
      style[mxConstants.STYLE_STROKEWIDTH] = 1;
      style[mxConstants.STYLE_FILLCOLOR] = "#999";
      style[mxConstants.STYLE_GRADIENTCOLOR] = "#A9C4EB";
      // delete graph.stylesheet.getDefaultVertexStyle()[mxConstants.STYLE_STROKECOLOR];
      style[mxConstants.STYLE_OVERFLOW] = "fill";
      // 默认使用实体边缘样式
      style = graph.stylesheet.getDefaultEdgeStyle();
      // style[mxConstants.STYLE_OPACITY] = 30;
      style[mxConstants.STYLE_EDGE] = mxEdgeStyle.EntityRelation;
      style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = "#FFFFFF";
      style[mxConstants.STYLE_ROUNDED] = true;
      style[mxConstants.STYLE_STROKEWIDTH] = 2;
      style[mxConstants.STYLE_STARTSIZE] = "22";

      graph.setCellsDisconnectable(false);
      // 指定是否允许悬空边，即是否允许未定义源和/或目标终端的边。
      graph.setAllowDanglingEdges(false);
      // 设置是否可以编辑实体
      graph.setCellsEditable(false);
      graph.setConnectable(true);
      graph.setPanning(true);
      // 允许连线的目标和源是同一元素
      graph.setAllowLoops(true);
      graph.centerZoom = false;
      // 设置样式可变
      graph.getView().updateStyle = true;
      // graph.isCellEditable = function (cell) {
      //   return this.getModel().isEdge(cell);
      // };
      // 覆盖折叠以支持表格
      graph.isCellFoldable = function (cell, collapse) {
        // console.log("graph.isCellFoldable")
        return this.getModel().isVertex(cell);
      };
      // 覆盖接入状态
      graph.isCellConnectable = function (cell) {
        // console.log("graph.isCellConnectable")
        return !this.isCellCollapsed(cell);
      };
      // 阻止收缩状态改变大小
      graph.isCellResizable = function (cell) {
        return !this.isCellCollapsed(cell);
      };
      // 在所有标签中启用HTML标记
      graph.setHtmlLabels(true);

      // 节块点击事件，使得选中节块关联达到高亮效果
      // graph.fireMouseEvent = function (evtName, me, sender) {
      //   if (evtName === mxEvent.MOUSE_UP) {
      //     // console.log(evtName, me, sender);
      //     const selectEmpty = this.isSelectionEmpty();
      //     setTimeout(() => {
      //       const cellsArr = this.getChildCells();
      //       const cellsSelects = this.getSelectionCells();
      //       const selectionEmpty = this.isSelectionEmpty();
      //       const parent = this.getDefaultParent();
      //       const setStyleFun = (state, s = 20) => {
      //         state.style[mxConstants.STYLE_OPACITY] = s;
      //         if (!state.cell.edge) {
      //           state.style[mxConstants.STYLE_TEXT_OPACITY] = s;
      //         }
      //         state.style = mxUtils.clone(state.style);
      //         state.shape.apply(state);
      //         state.shape.redraw();
      //         if (state.text) {
      //           state.text.apply(state);
      //           state.text.redraw();
      //         }
      //       };
      //       const edgesFun = (cell) => {
      //         const {
      //           source,
      //           target
      //         } = cell;
      //         setStyleFun(this.view.getState(cell), 100);
      //         setStyleFun(this.view.getState(source), 100);
      //         setStyleFun(this.view.getState(target), 100);
      //       };
      //       if (!selectionEmpty) { // 存在选中
      //         cellsArr.forEach(v => {
      //           const tmp = this.view.getState(v);
      //           if (!cellsSelects.includes(v)) { // 不存在选中的Vertices，改变样式
      //             setStyleFun(tmp);
      //           } else { // 存在选中的Vertices，回退之前样式
      //             setStyleFun(tmp, 100);
      //           }
      //         });
      //         // 带有选中的模块存在关系的模块和链接都修正样式
      //         cellsSelects.forEach(v => {
      //           if (v.edge) {
      //             edgesFun(v);
      //           } else {
      //             const edges = this.getEdges(v, parent, true, true); // 获取传入传出关系点
      //             edges.forEach(e => {
      //               edgesFun(e);
      //             });
      //           }
      //         });
      //       } else {
      //         if (!selectEmpty || !me.state) {
      //           cellsArr.forEach(v => {
      //             const tmp = this.view.getState(v);
      //             setStyleFun(tmp, 100);
      //           });
      //         }
      //       }
      //     }, 100);
      //   }
      //   mxGraph.prototype.fireMouseEvent.apply(this, arguments);
      // };
      // 滚动事件不应该开始移动顶点
      graph.cellRenderer.isLabelEvent = function (state, evt) {
        // console.log("graph.cellRenderer.isLabelEvent")
        const source = mxEvent.getSource(evt);
        return state.text && source !== state.text.node &&
          source !== state.text.node.getElementsByClassName("table-content")[0];
      };
      // 向最外层的div添加滚动条，并使div的位置和大小与顶点相同
      const oldRedrawLabel = graph.cellRenderer.redrawLabel;
      let saveTowChange;
      graph.cellRenderer.redrawLabel = function (state) {
        // console.log("graph.cellRenderer.redrawLabel", state);
        const graph = state.view.graph;
        const model = graph.model;
        if (saveTowChange !== state.cell && model.isEdge(state.cell)) {
          saveTowChange = state.cell;
          return;
        }
        oldRedrawLabel.apply(this, arguments); // "supercall"
        if (model.isVertex(state.cell) && state.text) {
          // 滚动条在div上
          const s = graph.view.scale;
          state.text.node.style.overflow = "hidden";
          const div = state.text.node.getElementsByClassName("table-content")[0];

          if (div) {
            // 添加标题表单元格的高度
            let oh = 26;
            div.style.display = "block";
            div.style.top = oh + "px";
            div.style.width = Math.max(1, Math.round(state.width / s)) + "px";
            div.style.height = Math.max(1, Math.round((state.height / s) - oh)) + "px";
            setTimeout(() => {
              div.scrollTop = state.cell.value.saveScrollTop;
            });
            const updateEdges = mxUtils.bind(this, function () {
              const edgeCount = model.getEdgeCount(state.cell);
              // 只更新边缘以避免文本标签按DOM顺序更新，这会重置滚动条
              for (let i = 0; i < edgeCount; i++) {
                const edge = model.getEdgeAt(state.cell, i);
                graph.view.invalidate(edge, true, true);
                graph.view.validate(edge);
              }
              state.cell.value.saveScrollTop = div.scrollTop;
            });
            mxEvent.addListener(div, "scroll", updateEdges);
          }
        }
      };
      // 添加一个新函数，根据给定的事件更新currentRow并返回该行的DOM节点
      graph.connectionHandler.updateRow = function (target) {
        while (target && target.nodeName !== "TR") {
          target = target.parentNode;
        }
        this.currentRow = null;
        // 检查我们是否正在处理正确表中的行
        if (target && target.parentNode.className === "erd") {
          // 将当前行号存储在属性中，以便可以检索它来创建预览和最终边缘
          let rowNumber = 0;
          let current = target.parentNode.firstChild;

          while (target !== current && current) {
            current = current.nextSibling;
            rowNumber++;
          }
          this.currentRow = rowNumber + 1;
        } else if (target && target.parentNode.className === "title") {
          this.currentRow = 0;
        } else {
          target = null;
        }
        return target;
      };
      // 根据鼠标事件目标(行)添加连接图标的位置
      graph.connectionHandler.updateIcons = function (state, icons, me) {
        let target = me.getSource();
        target = this.updateRow(target);
        const judge = () => {
          const type = config.toType;
          const j1 = type.includes("TToT") || type.includes("TToR");
          const j2 = type.includes("RToT") || type.includes("RToR");
          if (j1 && j2) {
            return this.currentRow !== null;
          }
          if (j1) {
            return this.currentRow === 0;
          }
          if (j2) {
            return this.currentRow;
          }
        };
        // console.log("updateIcons:", judge());
        // console.log("this.currentRow:", this.currentRow);
        if (target && judge()) {
          const div = target.parentNode.parentNode;
          const isinner = this.currentRow === 0 ? 0 : -div.scrollTop + div.offsetTop;
          const s = state.view.scale;

          icons[0].node.style.visibility = "visible";
          icons[0].bounds.x = state.x + target.offsetLeft + Math.min(state.width,
            target.offsetWidth * s) - this.icons[0].bounds.width - 2;
          icons[0].bounds.y = state.y - this.icons[0].bounds.height / 2 + (target.offsetTop +
            target.offsetHeight / 2 + isinner) * s;
          icons[0].redraw();

          this.currentRowNode = target;
        } else {
          icons[0].node.style.visibility = "hidden";
        }
      };
      // 在预览边缘状态下更新目标行
      const oldMouseMove = graph.connectionHandler.mouseMove;
      const span = container.getElementsByClassName("title_span")[0];
      graph.connectionHandler.mouseMove = function (sender, me) {
        // console.log("mouseMove");
        if (me.state && me.state.cell.isEdge()) {
          const w = me.state.width;
          const h = me.state.height;
          span.innerText = me.state.cell.value.innerHTML;
          const len = span.innerText.length / 2 * 12;
          // console.log(me.state);
          Object.assign(span.style, {
            display: "block",
            top: me.state.y + h / 2 + "px",
            left: me.state.x + w / 2 - len + "px",
            backgroundColor: me.state.style.strokeColor
          });
        } else {
          span.style.display = "none";
        }
        if (this.edgeState) {
          const type = config.toType;
          const j1 = type.includes("TToT");
          const j2 = type.includes("TToR");
          const j3 = type.includes("RToT");
          const j4 = type.includes("RToR");
          const source = ~~this.edgeState.cell.value.getAttribute("sourceRow");
          let targetRow;
          if ((j1 && source === 0) || (j3 && source !== 0)) {
            targetRow = 0;
          }
          if ((j2 && source === 0) || (j4 && source !== 0)) {
            targetRow = this.currentRow === 0 ? 1 : this.currentRow;
          }
          if ((j1 && j2 && source === 0) || (j3 && j4 && source !== 0)) {
            targetRow = this.currentRow === null ? "-1" : this.currentRow;
          }
          this.currentRowNode = this.updateRow(me.getSource());
          // console.log("this.currentRowNode:",this.currentRowNode)
          this.edgeState.cell.value.setAttribute("targetRow", targetRow);
          // console.log("this.currentRow::", this.currentRow);
          // console.log("targetRow::", targetRow);
          // console.log("source::", source);
          // 销毁图标，以防止事件重定向通过图像在IE
          this.destroyIcons();
        }
        oldMouseMove.apply(this, arguments);
      };
      // 创建可用于预览的边缘状态
      graph.connectionHandler.createEdgeState = function (me) {
        // console.log("createEdgeState");
        let relation = doc.createElement("Relation");
        relation.setAttribute("sourceRow", this.currentRow === null ? "-1" : this.currentRow);
        relation.setAttribute("targetRow", "-1");

        const edge = this.createEdge(relation);
        const style = this.graph.getCellStyle(edge);
        const state = new mxCellState(this.graph.view, edge, style);

        // 将源行存储在处理程序中
        this.sourceRowNode = this.currentRowNode;

        return state;
      };
      // 覆盖getLabel以返回边缘的空标签和折叠单元格的短标记。
      graph.getLabel = function (cell) {
        // console.log(cell);
        if (this.getModel().isVertex(cell)) {
          if (this.isCellCollapsed(cell)) {
            return ERGraph.prototype.createTableDom(cell, config, 1);
          } else {
            return ERGraph.prototype.createDom(cell, config);
          }
        } else {
          return "";
        }
      };
      // 定义全局帮助函数，以获取给定单元格状态和行的y坐标
      const getRowY = function (state, tr, isheader) {
        const s = state.view.scale;
        let offsetTop = 0;
        if (!isheader) { // 不是表头
          const div = tr.parentNode.parentNode;
          offsetTop = -div.scrollTop + parseInt(div.style.top, 10);
        }
        let y = state.y + (tr.offsetTop + tr.offsetHeight / 2 + offsetTop) * s;
        y = Math.min(state.y + state.height, Math.max(state.y + offsetTop * s, y));

        return y;
      };

      // 为表标记中的表行实现一个特殊的周长
      // eslint-disable-next-line complexity
      graph.view.updateFloatingTerminalPoint = function (edge, start, end, source) {
        const next = this.getNextPoint(edge, end, source);
        // console.log("next::",next)
        let offsetTop = start.view.scale;
        let x = start.x;
        let y = start.getCenterY();
        // 检查在候机楼的哪一边离开
        if (next.x > x + start.width / 2) {
          x += start.width;
        }
        // 定位拖动节点
        y = start.getCenterY();

        if (mxUtils.isNode(edge.cell.value) && !this.graph.isCellCollapsed(start.cell)) {
          const attr = (source) ? "sourceRow" : "targetRow";
          let row = ~~edge.cell.value.getAttribute(attr);
          if (row === 0) {
            // console.log("选中了表", attr);
            const table = start.text.node.getElementsByClassName("title")[0];
            const tr = table.getElementsByTagName("tr")[0];
            y = getRowY(start, tr, 1);
          } else if (row !== -1) {
            // console.log("没选中表", attr);
            const div = start.text.node.getElementsByClassName("table-content")[0];
            y = y - div.scrollTop;
            // HTML标签包含一个内置的外部表
            const table = div.getElementsByTagName("table")[0];
            const trs = table.getElementsByTagName("tr");
            const tr = trs[Math.min(trs.length - 1, row - 1)];

            // 获取源或目标行的垂直中心
            if (tr) {
              y = getRowY(start, tr);
            }
            offsetTop = parseInt(div.style.top, 10) * start.view.scale;
          }
        }

        // 在start内部保持垂直坐标
        y = Math.min(start.y + start.height, Math.max(start.y + offsetTop, y));

        // 如果不处理连接预览，则更新最近点的垂直位置，在这种情况下，edgeState或absolutePoints都为空
        if (edge && edge.absolutePoints) {
          next.y = y;
        }

        edge.setAbsoluteTerminalPoint(new mxPoint(x, y), source);

        // 如果边缘有一个公共目标行，则沿公共路径点路由多个传入边缘
        if (source && mxUtils.isNode(edge.cell.value) && start && end) {
          let edges = this.graph.getEdgesBetween(start.cell, end.cell, true);
          const tmp = [];

          // 使用相同的源行过滤边缘
          const row = ~~edge.cell.value.getAttribute("targetRow");

          for (var i = 0; i < edges.length; i++) {
            if (mxUtils.isNode(edges[i].value) &&
              ~~edges[i].value.getAttribute("targetRow") === row) {
              tmp.push(edges[i]);
            }
          }
          edges = tmp;
          if (edges.length > 1 && edge.cell === edges[edges.length - 1]) {
            // 求垂直中心
            const states = [];
            let y = 0;

            for (let i = 0; i < edges.length; i++) {
              states[i] = this.getState(edges[i]);
              y += states[i].absolutePoints[0].y;
            }
            y /= edges.length;
            for (let i = 0; i < states.length; i++) {
              let x = states[i].absolutePoints[1].x;

              if (states[i].absolutePoints.length < 5) {
                states[i].absolutePoints.splice(2, 0, new mxPoint(x, y));
              } else {
                states[i].absolutePoints[2] = new mxPoint(x, y);
              }
              // 必须用改变的点重新绘制前面的边
              if (i < states.length - 1) {
                this.graph.cellRenderer.redraw(states[i]);
              }
            }
          }
        }
      };
    }
  }

  /**
   * graph监听事件
   * @param {object} config 配置
   * @memberof ERGraph
   * @returns {null} null
   */
  listenersInit(config) {
    this.graph.addListener(mxEvent.CELLS_ADDED, function (graph, eventObject) {
      const cell = eventObject.properties.cells[0];
      if (cell.isEdge()) {
        // console.log("加入连线：", graph, eventObject);
        config.listeners.cellsAdded(cell);
      }
    });
    this.graph.addListener(mxEvent.CELLS_RESIZED, function (graph, eventObject) {
      const cell = eventObject.properties.cells[0];
      if (cell.isVertex()) {
        // console.log("调整大小：", graph, eventObject);
        config.listeners.cellsResized(cell);
      }
    });
    this.graph.addListener(mxEvent.CELLS_MOVED, function (graph, eventObject) {
      const cell = eventObject.properties.cells[0];
      if (cell.isVertex()) {
        // console.log("移动：", graph, eventObject);
        config.listeners.cellsMoved(cell);
      }
    });
    this.graph.addListener(mxEvent.FOLD_CELLS, function (graph, eventObject) {
      const {
        cells,
        collapse
      } = eventObject.properties;
      const data = cells[0].value.data;
      // 手动切换表展开收起时候触发事件，处理数据同步改变，回调事件
      // console.log("折叠事件：", graph, eventObject);
      if (data.collapsed !== undefined) {
        Object.assign(data, {
          collapsed: collapse
        });
        // 只有手动展开收缩才回调
        config.listeners.collapsedFun(data);
      }
    });
    this.graph.addListener(mxEvent.DOUBLE_CLICK, function (graph, eventObject) {
      const cell = eventObject.properties.cell;
      // console.log("双击：", graph, eventObject);
      config.listeners.doubleClick(cell);
    });
    this.keyboard();
  }

  /**
   * 键盘监听事件方法
   * @memberof ERGraph
   * @returns {null} null
   */
  keyboardFun() {
    this.keydownFun = (event) => {
      const e = event || window.event;
      e.stopPropagation();
      const keyCode = e.keyCode;
      if (!this.graph.isSelectionEmpty()) {
        let dx = 0;
        let dy = 0;

        if (keyCode === 37) {
          dx = -1;
        } else if (keyCode === 38) {
          dy = -1;
        } else if (keyCode === 39) {
          dx = 1;
        } else if (keyCode === 40) {
          dy = 1;
        }
        this.graph.moveCells(this.graph.getSelectionCells(), dx, dy);
      }
    };
    this.keyupFun = (event) => {
      const e = event || window.event;
      // console.log("keyup", e.keyCode);
      e.stopPropagation();
      switch (e.keyCode) {
        // 删除
        case 46:
          this.config.listeners.delFun();
          break;
        case 107:
          this.graph.zoomIn();
          break;
        case 109:
          this.graph.zoomOut();
          break;
        default:
          break;
      }
    };
  }

  /**
   * 键盘监听事件
   * @param {object} destroyed 是否销毁
   * @memberof ERGraph
   * @returns {null} null
   */
  keyboard(destroyed) {
    if (destroyed) {
      document.removeEventListener("keydown", this.keydownFun, false);
      document.removeEventListener("keyup", this.keyupFun, false);
    } else {
      document.addEventListener("keydown", this.keydownFun, false);
      document.addEventListener("keyup", this.keyupFun, false);
    }
  }

  /**
   * 生成图片的DOM内容
   * @param {object} data 数据
   * @memberof ERGraph
   * @returns {Object} DOM
   */
  imgDom(data) {
    const f = document.createDocumentFragment();
    const img = new Image();
    img.width = 14;
    img.height = 14;
    img.align = "center";
    const {
      key,
      fieldType
    } = data;
    if (fieldType) {
      if (fieldType === "M") { // 度量
        img.src = require("../img/mea.png");
        img.title = "度量";
      } else if (fieldType === "C") { // 筛选
        img.src = require("../img/condition.png");
        img.title = "筛选";
      } else if (fieldType === "D") { // 维度
        img.src = require("../img/dim.png");
        img.title = "维度";
      }
      f.appendChild(img);
    }
    if (key) {
      const img = new Image();
      img.width = 14;
      img.height = 14;
      img.align = "center";
      img.src = require("../img/major_key.png");
      img.title = "主键";
      f.appendChild(img);
    }
    return f;
  }

  /**
   * 生成checkbox的DOM内容
   * @param {object} data 数据
   * @param {object} config 配置
   * @memberof ERGraph
   * @returns {Object} DOM
   */
  checkboxDom(data, config) {
    const ckImg = new Image();
    const unckImg = new Image();
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    ckImg.className = "label__ck";
    ckImg.src = require("../img/check_yes.png");
    unckImg.className = "label__unck";
    unckImg.src = require("../img/check_no.png");
    label.className = "zr-draw-html__label s_cpointer";
    if (data.selected) {
      checkbox.setAttribute("checked", "checked");
    }
    if (data.disabled) {
      label.className += " label__disabled";
      checkbox.setAttribute("disabled", "disabled");
    }
    checkbox.onchange = (event) => {
      console.log(data);
      data.selected = checkbox.checked;
      config.listeners.checkChange(data, event);
    };
    label.appendChild(checkbox);
    label.appendChild(ckImg);
    label.appendChild(unckImg);
    return label;
  }

  /**
   * 生成表头的DOM内容
   * @param {object} cell table的cell
   * @param {object} config 配置
   * @param {Boolean} onlyHead 使用函数时候，只有head
   * @memberof ERGraph
   * @returns {Object} table
   */
  createTableDom(cell, config, onlyHead) {
    const {
      data,
      fillColor
    } = cell.value;
    const table = document.createElement("table");
    table.width = "100%";
    table.border = "0";
    table.cellPadding = "4";
    table.className = "title";
    if (onlyHead) {
      table.style.height = "100%";
    }
    table.style.background = fillColor;
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.innerText = data.tableName || "";
    tr.appendChild(th);
    table.appendChild(tr);
    return table;
  }

  /**
   * 生成表的DOM内容
   * @param {object} cell table的cell
   * @param {object} config 配置
   * @memberof ERGraph
   * @returns {Object} DOM
   */
  createDom(cell, config) {
    const data = cell.value.data;
    const allf = document.createDocumentFragment();
    const f = document.createDocumentFragment();
    utils.forEach(data.children, (item) => {
      const tr = document.createElement("tr");
      const td1 = document.createElement("td");
      const td2 = document.createElement("td");
      td2.innerText = item.name;
      if (config.isCheckable || config.isShowImg) {
        if (config.isCheckable) {
          td1.appendChild(this.checkboxDom(item, config));
        }
        if (config.isShowImg) {
          td1.appendChild(this.imgDom(item));
        }
        td1.setAttribute("width", 20);
        tr.appendChild(td1);
      }
      tr.appendChild(td2);
      f.appendChild(tr);
    });
    const table = document.createElement("table");
    table.width = "100%";
    table.height = "100%";
    table.border = "1";
    table.cellPadding = "4";
    table.className = "erd";
    table.appendChild(f);
    const div = document.createElement("div");
    div.className = "table-content";
    div.appendChild(table);
    allf.appendChild(this.createTableDom(cell));
    allf.appendChild(div);
    cell.value.div = div;
    return allf;
  }

  /**
   * 计算一个表的高度
   * @param {object} children 数据
   * @param {number} defaultHeight 默认高
   * @memberof ERGraph
   * @returns {Object} cell
   */
  countHeight(children, defaultHeight) {
    let h = defaultHeight || 0;
    if (!h) {
      if (children.length) {
        utils.forEach(children, (v, i) => {
          h += 31;
          if (i === 0) {
            h += 26;
          }
        });
      } else {
        h = 26;
      }
    }
    return h;
  }

  /**
   * 添加一个表
   * @param {object} attributes 属性
   * @memberof ERGraph
   * @returns {Object} cell
   */
  addTable(attributes) {
    const {
      data
    } = attributes;
    const {
      x = 20, y = 20, width = data.width, height, tableId
    } = data;
    // 获取插入新单元格的默认父单元格。这通常是根结点的第一个子结点。层0)。
    const parent = this.graph.getDefaultParent();
    this.graph.getModel().beginUpdate();
    let cell;
    let h = this.countHeight(data.children, height);
    try {
      cell = this.graph.insertVertex(parent, tableId, attributes, x, y, width, h, "");
      this.graph.updateCellSize(cell);
      // 更新单元格的高度(将表宽的覆盖宽度设置为100%)
      Object.assign(cell.geometry, {
        width,
        ...h ? {
          height: h
        } : {},
        alternateBounds: new mxRectangle(0, 0, 160, 27)
      });
      this.config.listeners.cellsResized(cell);
    } finally {
      // 更新显示
      this.graph.getModel().endUpdate();
    }
    // console.log(this.graph.getModel());
    return cell;
  }

  /**
   * 删除一个表
   * @param {object} tableIdArr table的id数组
   * @memberof ERGraph
   * @returns {null} null
   */
  removeTables(tableIdArr) {
    const cells = [];
    utils.forEach(tableIdArr, (v) => {
      cells.push(this.findTable(v));
    });
    this.graph.getModel().beginUpdate();
    try {
      this.graph.removeCells(cells);
    } finally {
      // 更新显示
      this.graph.getModel().endUpdate();
    }
  }

  /**
   * 查找table
   * @param {String} tableId table的id
   * @memberof ERGraph
   * @returns {Object} table的实体模块
   */
  findTable(tableId) {
    return this.graph.getModel().getCell(tableId);
  }

  /**
   * 查找table里的字段
   * @param {Object} tableCell tableCell
   * @param {String} columnId 字段Id
   * @memberof ERGraph
   * @returns {String} 字段的index + 1
   */
  findTableColumn(tableCell, columnId) {
    if (columnId === 0) {
      return columnId;
    }
    const index = tableCell.value.data.children.findIndex((v) => v.fieldId === columnId);
    return index === -1 ? index : index + 1;
  }

  /**
   * 刷新
   * @param {String} tableId 要刷新的table的id
   * @memberof ERGraph
   * @returns {null} null
   */
  tableRefresh(tableId) {
    const tableCell = this.findTable(tableId);
    // 刷新模块时候判断是否展开收起，处理展开收起动作
    const collapsed = tableCell.value.data.collapsed;
    if (collapsed !== undefined) {
      this.graph.cellsFolded([tableCell], collapsed);
    }
    // debugger;
    this.graph.refresh(tableCell);
  }

  /**
   * 生成两表的字段/表间的连线
   * @param {String} sTableId 源表Id
   * @param {String} tTableId 目标表Id
   * @param {String} sId 源表字段Id
   * @param {String} tId 目标表字段Id
   * @param {String} linkName 连线名称
   * @param {String} color 线颜色
   * @returns {Boolean} 是否添加成功
   */
  setLinkLine(sTableId, tTableId, sId, tId, linkName = "", color = "#6482B9") {
    const parent = this.graph.getDefaultParent();
    const relation = this.doc.createElement("Relation");
    const sTable = this.findTable(sTableId);
    const tTable = this.findTable(tTableId);
    if (tTable) {
      let sIndex = this.findTableColumn(sTable, sId);
      let tIndex = this.findTableColumn(tTable, tId);
      if (tIndex !== -1) {
        let lId = sId + "~" + tId;
        if (sIndex === 0) { // 来源为表
          lId += "|" + sTableId;
        }
        if (tIndex === 0) { // 目标为表
          lId += "|" + tTableId;
        }
        relation.setAttribute("sourceRow", sIndex);
        relation.setAttribute("targetRow", tIndex);
        relation.innerHTML = linkName;
        this.graph.getModel().beginUpdate();
        try {
          this.graph.insertEdge(parent, lId, relation, sTable, tTable, "strokeColor=" + color + ";");
        } finally {
          // 更新显示
          this.graph.getModel().endUpdate();
        }
        // console.log(this.graph.getModel());
        return true;
      }
    }
    return false;
  }

  /**
   * 删除两表的字段/表间的连线
   * @param {String} sTableId 源表Id
   * @param {String} tTableId 目标表Id
   * @param {String} sId 源表字段Id
   * @param {String} tId 目标表字段Id
   * @returns {Boolean} 是否删除成功
   */
  delLinkLine(sTableId, tTableId, sId, tId) {
    const parent = this.graph.getDefaultParent();
    const sTable = this.findTable(sTableId);
    const tTable = this.findTable(tTableId);
    const sIndex = this.findTableColumn(sTable, sId);
    const tIndex = this.findTableColumn(tTable, tId);
    const edges = this.graph.getEdges(sTable, parent, false, true); // 获取传出关系点
    const newEdges = [];
    utils.forEach(edges, (v) => {
      const {
        source,
        target,
        value
      } = v;
      const si = ~~value.getAttribute("sourceRow");
      const ti = ~~value.getAttribute("targetRow");
      if (source.id === sTableId && target.id === tTableId && ((si === sIndex && ti === tIndex) || sIndex === -1 || tIndex === -1)) {
        newEdges.push(v);
      }
    });
    console.log("删除的链接：", newEdges);
    this.graph.getModel().beginUpdate();
    try {
      this.graph.removeCells(newEdges);
    } finally {
      // 更新显示
      this.graph.getModel().endUpdate();
    }
    return true;
  }
}