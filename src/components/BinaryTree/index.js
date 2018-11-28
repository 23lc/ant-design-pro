/* eslint-disable no-restricted-syntax */
/* eslint-disable camelcase */

import React, { Component } from 'react';
import styles from './index.less';
import Target from './Target';
import { keepOneBit } from './utils';

const blue = '#5c9ff6';
// const red = 'rgba(255, 0, 0, 0.78)';

function should_open_list(nodes, order_num) {
  const should_open = [];
  function push_parent_num(num) {
    if (!nodes[`order_num${num}`]) {
      // 如果当前节点不存在，那么打开父节点
      const parent_num = num % 2 === 0 ? num / 2 : (num - 1) / 2;
      should_open.unshift(parent_num);
      push_parent_num(parent_num);
    }
  }
  push_parent_num(order_num);
  return should_open;
}
export default class Tree extends Component {
  state = {
    nodes: {},
    scale: 1,
    translate: { top: 0, left: 0 },
  };

  componentDidMount() {
    const width = document.getElementById('treeWrap').clientWidth; // 如果有侧边栏，要加侧边栏的宽度
    const height = document.getElementById('treeWrap').clientHeight;
    // eslint-disable-next-line
    this.setState({ width, height }, () => {
      const { nodes } = this.props;
      this.initNodes(nodes);
    });
    window.addEventListener('resize', this.resize_svg);
  }

  componentDidUpdate(preProps) {
    const { nodes, version, onChange } = this.props;
    if (version !== preProps.version) {
      this.initNodes(nodes);
    }
    if (onChange) {
      // eslint-disable-next-line react/destructuring-assignment
      onChange(this.state.nodes, this.ifTotalTreeValid(this.state.nodes));
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize_svg);
  }

  // 根据鼠标位置来缩放
  onWheel = e => {
    const { scale, translate } = this.state;
    if ((e.deltaY < 0 && scale < 1) || (e.deltaY > 0 && scale > 0.3)) {
      const left = e.pageX - e.currentTarget.getBoundingClientRect().left; // 鼠标相对顶层svg的left定位
      const top = e.pageY - e.currentTarget.getBoundingClientRect().top; // 鼠标相对顶层svg的top定位
      const diffX = left - translate.left; // 鼠标相对于顶层g标签的left定位
      const diffY = top - translate.top; // 鼠标相对于顶层g标签的top定位
      const diffScale = e.deltaY / 1000; // 本次缩放的比例差
      const newLeft = (diffX / scale) * diffScale; // 缩放后的实际水平偏移量
      const newTop = (diffY / scale) * diffScale; // 缩放后的实际垂直偏移量
      this.setState({
        scale: keepOneBit(scale - e.deltaY / 1000),
        translate: {
          left: translate.left + newLeft,
          top: translate.top + newTop,
        },
      });
    }
  };

  // 获取数组中所有的order_num的后代节点中，拥有子节点的节点
  getParentList = (nodes, num_list) => {
    const parentList = [];
    const getParent = num => {
      if (nodes[`order_num${num * 2}`]) {
        parentList.push(num);
        getParent(num * 2);
        getParent(num * 2 + 1);
      }
    };
    for (const num of num_list) {
      getParent(num);
    }
    return parentList;
  };

  createNewRoot = () => {
    const { width } = this.state;
    const { rect_size } = this.props;
    return {
      order_num1: {
        transform: { left: width / 2 - rect_size / 2, top: 50 },
        info: {},
        order_num: 1,
        left: { offset: 0, valid: true },
        right: { offset: 0, valid: true },
      },
    };
  };

  resize_svg_wrap = () => {
    const width = document.getElementById('treeWrap').clientWidth;
    const height = document.getElementById('treeWrap').clientHeight;
    this.setState({ width, height });
  };

  drag = e => {
    const { translate, width, height } = this.state;
    const left = e.pageX;
    const top = e.pageY;
    const preLeft = translate.left;
    const preTop = translate.top;
    const this1 = this;
    const svg = e.currentTarget;
    const svg_left = svg.getBoundingClientRect().left;
    const svg_top = svg.getBoundingClientRect().top;
    let dragging;
    if (e.target !== e.currentTarget || e.button !== 0) {
      return; // 只让鼠标左键拖拽
    }
    function dragEnd() {
      document.body.removeEventListener('mousemove', dragging);
      document.body.removeEventListener('mouseup', dragEnd);
      svg.style.cursor = '-webkit-grab';
    }
    function stopDragging() {
      document.body.removeEventListener('mousemove', dragging);
      document.body.removeEventListener('mouseup', dragEnd);
      svg.style.cursor = 'default';
    }
    dragging = event => {
      svg.style.cursor = '-webkit-grabbing';
      const diffX = left - event.pageX;
      const diffY = top - event.pageY;

      // 1.鼠标超出边界时，g停止移动
      const offsetLeft = event.pageX - svg_left;
      const offsetTop = event.pageY - svg_top;
      if (offsetLeft <= 0 || offsetLeft >= width || offsetTop <= 0 || offsetTop >= height) {
        dragEnd();
      }
      this1.setState({ translate: { left: preLeft - diffX, top: preTop - diffY } });
    };
    document.body.addEventListener('mousemove', dragging);
    svg.addEventListener('mousewheel', stopDragging);
    document.body.addEventListener('mouseup', dragEnd);
  };

  initNodes = response => {
    const { width } = this.state;
    if (Array.isArray(response)) {
      const nodes = this.createNewRoot(width);
      if (response.length > 0) {
        const { open, checkVaild } = this;
        const { parentNodeType } = this.props;
        response.forEach(value => {
          if (!nodes[`order_num${value.order_num}`]) {
            // 如果树里不存在该order_num的节点，那么获取需要open的节点列表
            const should_open = should_open_list(nodes, value.order_num);
            should_open.forEach(num => {
              open(nodes, num);
            });
          }
          nodes[`order_num${value.order_num}`].info = value;
        });
        Object.keys(nodes).forEach(key => {
          const num = nodes[key].order_num;
          if (nodes[key].info.node_type === parentNodeType && !nodes[`order_num${num * 2}`]) {
            open(nodes, num);
          }
        });
        response.forEach(value => {
          checkVaild(nodes, parseInt(value.order_num, 10));
        });
        this.setState({ nodes }, this.align);
      } else {
        this.setState({ nodes }, this.align);
      }
    } else {
      this.setState({ nodes: [] });
    }
  };

  // 判断当前节点跟两个子节点间的合法性，和父节点跟两个子节点之间的合法性
  checkVaild = (nodes1, num) => {
    const nodes = nodes1;
    const { parentNodeType } = this.props;
    const checkSingle = num1 => {
      if (nodes[`order_num${num1 * 2}`]) {
        // 如果存在子节点
        if (nodes[`order_num${num1}`].info.node_type === parentNodeType) {
          // 如果此节点是碰撞关系
          nodes[`order_num${num1}`].left.valid = Boolean(
            nodes[`order_num${num1 * 2}`].info.node_type
          );
          nodes[`order_num${num1}`].right.valid = Boolean(
            nodes[`order_num${num1 * 2 + 1}`].info.node_type
          );
        } else {
          // 如果此节点是碰撞资源
          nodes[`order_num${num1}`].left.valid = !nodes[`order_num${num1 * 2}`].info.node_type;
          nodes[`order_num${num1}`].right.valid = !nodes[`order_num${num1 * 2 + 1}`].info.node_type;
        }
      }
    };
    checkSingle(num);
    if (num !== 1) {
      const parentNum = num % 2 === 0 ? num / 2 : (num - 1) / 2;
      // 判断父节点跟两个子节点间的合法性
      checkSingle(parentNum);
    }
    return nodes;
  };

  // 展开(open)时调用
  resizeBig = (nodes1, num) => {
    const nodes = nodes1;
    const { left } = nodes[`order_num${num}`].transform;
    const { rect_size } = this.props;
    // 打开一个节点，左边的所有节点向左，右边向右
    Object.keys(nodes).forEach(key => {
      const { order_num } = nodes[key];
      if (order_num !== num * 2 && order_num !== num * 2 + 1 && order_num !== num) {
        // 让被打开的三个节点不受影响
        if (nodes[key].transform.left < left) {
          nodes[key].transform.left -= rect_size;
        } else if (nodes[key].transform.left > left) {
          nodes[key].transform.left += rect_size;
        }
      }
    });
    return this.resize(nodes, num);
  };

  // 调整各节点的位置
  resize = (nodes1, num1) => {
    const { width } = this.state;
    const { rect_size } = this.props;
    const nodes = nodes1;
    if (num1 > 1) {
      const parentList = this.getParentList(nodes, [2, 3]);
      parentList.sort((a, b) => a - b);

      for (let i = parentList.length - 1; i >= 0; i -= 1) {
        nodes[`order_num${parentList[i]}`].transform.left =
          (nodes[`order_num${parentList[i] * 2 + 1}`].transform.left +
            nodes[`order_num${parentList[i] * 2}`].transform.left) /
          2;
      }
      nodes.order_num1.transform.left =
        (nodes.order_num2.transform.left + nodes.order_num3.transform.left) / 2;
      // diffX 获取此时根节点相对于中心点的水平偏移量
      const diffX = width / 2 - rect_size - nodes.order_num1.transform.left;
      Object.keys(nodes).forEach(key => {
        nodes[key].transform.left += diffX; // 让根节点居中
      });
    }
    // 根据子节点的位置来连线
    for (const key in nodes) {
      if ({}.hasOwnProperty.call(nodes, key)) {
        const { order_num } = nodes[key];
        if (nodes[`order_num${order_num * 2}`] || nodes[`order_num${order_num * 2 + 1}`]) {
          nodes[key].left.offset = Math.abs(
            nodes[key].transform.left - nodes[`order_num${order_num * 2}`].transform.left
          );
          nodes[key].right.offset = Math.abs(
            nodes[key].transform.left - nodes[`order_num${order_num * 2 + 1}`].transform.left
          );
        }
      }
    }
    return nodes;
  };

  // 收起(pickAll)时调用
  resizeSmall = (nodes1, num) => {
    const nodes = nodes1;
    const { rect_size } = this.props;
    const { left } = nodes[`order_num${num}`].transform;
    for (const key in nodes) {
      if (nodes[key].transform.left < left) {
        nodes[key].transform.left += rect_size;
      } else if (nodes[key].transform.left > left) {
        nodes[key].transform.left -= rect_size;
      }
    }
    return this.resize(nodes, num);
  };

  // 收起所有空节点
  pickAll = (nodes1, num1) => {
    let nodes = nodes1;
    const pickList = this.getParentList(nodes, [num1]);
    pickList.sort((a, b) => a - b);

    for (let i = pickList.length - 1; i >= 0; i -= 1) {
      const order_num = pickList[i];
      delete nodes[`order_num${order_num * 2}`];
      delete nodes[`order_num${order_num * 2 + 1}`];
      nodes[`order_num${order_num}`].left.offset = 0;
      nodes[`order_num${order_num}`].right.offset = 0;
      nodes = this.resizeSmall(nodes, order_num);
    }
    return nodes;
  };

  // 展开两个子节点
  open = (nodes1, order_num) => {
    let nodes = nodes1;
    const { rect_size } = this.props;
    nodes[`order_num${order_num}`].left = { offset: rect_size, valid: true };
    nodes[`order_num${order_num}`].right = { offset: rect_size, valid: true };
    const top = parseInt(Math.log(order_num * 2) / Math.log(2), 10) * rect_size * 1.5 + 50;
    // parseInt(Math.log(order_num) / Math.log(2) + 1) 代表当前是第几行
    const left = +nodes[`order_num${order_num}`].transform.left;
    nodes[`order_num${order_num * 2}`] = {
      transform: { left: left - rect_size, top },
      info: {},
      order_num: order_num * 2,
      left: { offset: 0, valid: true },
      right: { offset: 0, valid: true },
    };
    nodes[`order_num${order_num * 2 + 1}`] = {
      transform: { left: left + rect_size, top },
      info: {},
      order_num: order_num * 2 + 1,
      left: { offset: 0, valid: true },
      right: { offset: 0, valid: true },
    };
    nodes = this.resizeBig(nodes, order_num);
    return nodes;
  };

  // 让某个节点上升为根节点
  childBecomeRoot = num => {
    const newNodes = {};
    const {
      open,
      props: { http_update_node, http_delete_node },
    } = this;
    const { nodes } = this.state;
    // 删除多余的节点
    function deleteNode(order_num) {
      if (order_num === num) {
        return;
      }
      if (nodes[`order_num${order_num}`].info.node_type) {
        http_delete_node(nodes[`order_num${order_num}`].info);
      }
      if (nodes[`order_num${order_num * 2}`]) {
        deleteNode(order_num * 2);
        deleteNode(order_num * 2 + 1);
      }
    }
    deleteNode(1);

    // 依次改变节点位置
    function changeChildren(old_num, new_num) {
      newNodes[`order_num${new_num}`].info = nodes[`order_num${old_num}`].info;
      newNodes[`order_num${new_num}`].left.valid = nodes[`order_num${old_num}`].left.valid;
      newNodes[`order_num${new_num}`].right.valid = nodes[`order_num${old_num}`].right.valid;
      if (nodes[`order_num${old_num}`].info.node_type) {
        nodes[`order_num${old_num}`].info.order_num = new_num;
        http_update_node(nodes[`order_num${old_num}`].info, old_num);
      }

      if (nodes[`order_num${old_num * 2}`]) {
        open(newNodes, new_num);
        changeChildren(old_num * 2, new_num * 2);
        changeChildren(old_num * 2 + 1, new_num * 2 + 1);
      }
    }

    // 手动更改 根节点
    newNodes.order_num1 = { order_num: 1, transform: nodes.order_num1.transform };
    nodes[`order_num${num}`].info.order_num = 1;
    newNodes.order_num1.info = nodes[`order_num${num}`].info;
    newNodes.order_num1.left = { offset: 0, valid: nodes[`order_num${num}`].left.valid };
    newNodes.order_num1.right = { offset: 0, valid: nodes[`order_num${num}`].right.valid };

    http_update_node(nodes[`order_num${num}`].info, num);
    if (nodes[`order_num${num * 2}`]) {
      open(newNodes, 1);
    }
    changeChildren(num * 2, 2);
    changeChildren(num * 2 + 1, 3);

    this.setState({ nodes: newNodes });
  };

  // 让根节点降为order_num2
  rootBecomeChild = () => {
    const {
      open,
      props: { http_update_node },
    } = this;
    const { nodes } = this.state;
    // 此方法只面向于根节点，所有直接初始化一个根节点
    const newNodes = {
      order_num1: {
        transform: nodes.order_num1.transform,
        info: {},
        order_num: 1,
        left: { offset: 0, valid: true },
        right: { offset: 0, valid: true },
      },
    };
    function changeChildren(old_num, new_num) {
      newNodes[`order_num${new_num}`].info = nodes[`order_num${old_num}`].info;
      newNodes[`order_num${new_num}`].info.order_num = new_num;
      newNodes[`order_num${new_num}`].left.valid = nodes[`order_num${old_num}`].left.valid;
      newNodes[`order_num${new_num}`].right.valid = nodes[`order_num${old_num}`].right.valid;
      if (nodes[`order_num${old_num}`].info.node_type) {
        http_update_node(newNodes[`order_num${new_num}`].info, old_num);
      }
      if (nodes[`order_num${old_num * 2}`]) {
        open(newNodes, new_num);
        changeChildren(old_num * 2, new_num * 2);
        changeChildren(old_num * 2 + 1, new_num * 2 + 1);
      }
    }
    open(newNodes, 1);
    // open默认会把valid设为true，这里要重新设一下根节点
    newNodes.order_num1.left.valid = false;
    newNodes.order_num1.right.valid = false;
    changeChildren(1, 2);

    this.setState({ nodes: newNodes });
  };

  // 重排
  align = () => {
    const { nodes, translate, width, height } = this.state;
    const { rect_size } = this.props;
    translate.left = 0;
    translate.top = 0;
    let scale = 1;

    let min_left = width / 2;
    let max_left = width / 2;
    let max_top = 50;
    Object.keys(nodes).forEach(key => {
      if (nodes[key].transform.left < min_left) {
        min_left = nodes[key].transform.left;
      }
      if (nodes[key].transform.left > max_left) {
        max_left = nodes[key].transform.left;
      }
      if (nodes[key].transform.top > max_top) {
        max_top = nodes[key].transform.top;
      }
    });
    for (let i = 0; i < 7; i += 1) {
      // 缩放比例从1.0 到 0.3
      let n = 0;
      // 让最左、最右、最下都显示出来:
      // 判断是否被隐藏，如果是，根据根节点的中上顶点进行缩放
      if (
        min_left * scale < -translate.left ||
        (width - max_left - rect_size) * scale < -translate.left ||
        (max_top + 50) * scale > height - 50
      ) {
        const diffX = width / 2 - translate.left; // 鼠标相对于顶层g标签的left定位
        const diffY = 50 - translate.top; // 鼠标相对于顶层g标签的top定位
        const newLeft = (diffX / scale) * 0.1; // 缩放后的实际水平偏移量
        const newTop = (diffY / scale) * 0.1; // 缩放后的实际垂直偏移量
        scale = keepOneBit(scale - 0.1);
        translate.left += newLeft;
        translate.top += newTop;
        n += 1;
      }
      if (n === 0) {
        break;
      }
    }
    this.setState({ translate, scale });
  };

  // 判断整个树的数据流是否有效
  ifTotalTreeValid = nodes => {
    let valid = true;
    const arr = Object.keys(nodes);
    for (let i = 0; i < arr.length; i += 1) {
      if (!nodes[arr[i]].left.valid || !nodes[arr[i]].right.valid) {
        valid = false;
        break;
      }
    }
    let n = 0;
    for (let i = 0; i < arr.length; i += 1) {
      if (nodes[arr[i]].info.name) {
        n += 1;
      }
    }
    if (valid && n === 0) {
      valid = false;
    }
    return valid;
  };

  clearNodes = () => {
    const { width } = this.state;
    this.setState({
      nodes: this.createNewRoot(width),
      scale: 1,
      translate: { top: 0, left: 0 },
    });
  };

  render() {
    const { nodes, scale, translate } = this.state;
    const {
      rect_size,
      lineStyle,
      targetStyle,
      onSelectNode,
      onDragNode,
      editable,
      parentNodeType,
      nodeElement,
      http_add_node,
      http_update_node,
      http_delete_node,
      clickDownArrow,
      clickUpArrow,
    } = this.props;
    return (
      <svg
        onWheel={this.onWheel}
        onMouseDown={this.drag}
        className={styles.Tree}
        id="treeWrap"
        ref={svg => {
          this.svg = svg;
        }}
      >
        <defs>
          <pattern id="add_node" height="1" width="1">
            <circle r="11" cx="12" cy="12" fill="#fff" />
            <path d="M12 4 V 20" strokeWidth="1" stroke={blue} />
            <path d="M4 12 H 20" strokeWidth="1" stroke={blue} />
          </pattern>

          <pattern id="delete_node" height="1" width="1">
            <circle r="11" cx="12" cy="12" fill="#fff" />
            <path d="M4 12 H 20" strokeWidth="1" stroke={blue} />
          </pattern>

          <pattern id="up_node" height="1" width="1">
            <circle r="11" cx="10" cy="10" fill="#fff" />
            <path d="M10 2 V 18" strokeWidth="1" stroke={blue} />
            <path d="M10 2 L 5 10" strokeWidth="1" stroke={blue} />
            <path d="M10 2 L 15 10" strokeWidth="1" stroke={blue} />
          </pattern>
        </defs>

        <g transform={`matrix(${scale}, 0, 0, ${scale}, ${translate.left}, ${translate.top})`}>
          {Object.keys(nodes).length > 0 &&
            Object.keys(nodes).map(key => (
              <Target
                Tree={this}
                {...nodes[key]}
                nodes={nodes}
                scale={scale}
                rect_size={rect_size}
                key={key}
                lineStyle={lineStyle}
                targetStyle={targetStyle}
                onSelectNode={onSelectNode}
                onDragNode={onDragNode}
                editable={editable}
                parentNodeType={parentNodeType}
                nodeElement={nodeElement}
                resizeSmall={this.resizeSmall}
                pickAll={this.pickAll}
                open={this.open}
                checkVaild={this.checkVaild}
                http_add_node={http_add_node}
                http_update_node={http_update_node}
                http_delete_node={http_delete_node}
                clickDownArrow={clickDownArrow}
                clickUpArrow={clickUpArrow}
              />
            ))}
        </g>
      </svg>
    );
  }
}

Tree.defaultProps = {
  rect_size: 88, // 矩形的长宽
};
