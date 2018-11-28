/* eslint-disable camelcase */

import React, { Component } from 'react';
import { DropTarget } from 'react-dnd';
import styles from './index.less';
import Line from './Line';
import OpenClose from './OpenClose';
import SvgContent from './SvgContent';

// 判断当前节点的所有子节点是否都为空（为了全部收起)
function checkAllChildren(nodes1, num) {
  const nodes = nodes1;
  let ChildrenIsEmpty = true;
  function checkSelfChildren(num1) {
    if (nodes[`order_num${num1 * 2}`]) {
      if (
        nodes[`order_num${num1 * 2}`].info.node_type ||
        nodes[`order_num${num1 * 2 + 1}`].info.node_type
      ) {
        ChildrenIsEmpty = false;
      } else {
        checkSelfChildren(num1 * 2);
        checkSelfChildren(num1 * 2 + 1);
      }
    }
  }
  checkSelfChildren(num);
  return ChildrenIsEmpty;
}
const SvgTarget = {
  drop(props, monitor) {
    const source_info = { ...monitor.getItem() };
    const oldNum = +source_info.order_num;
    const currentNum = +props.order_num;
    const { node_type } = source_info;

    /*
      注意！！！
      在这里修改props的引用值之后，会直接让组件update。
      原因是当前组件被DropTarget()包住，props跟Tree组件的关系被DropTarget()隔了一层
      并不只是Tree传入新的props时才会更新
      所以需要深复制一下，避免当前组件更新（这种深复制的前提是里面不能有函数，否则会被忽略）
    */
    let nodes = JSON.parse(JSON.stringify(props.nodes));

    if (node_type === props.parentNodeType && !nodes[`order_num${currentNum * 2}`]) {
      nodes = props.open(nodes, currentNum); // if(节点是碰撞关系) 向下打开一次
    }
    if (oldNum) {
      // 在树里拖动节点
      if (oldNum !== currentNum && !nodes[`order_num${currentNum}`].info.node_type) {
        // 拖到空节点
        nodes[`order_num${oldNum}`].info = {};
        nodes[`order_num${currentNum}`].info = source_info;
        nodes[`order_num${currentNum}`].info.order_num = currentNum;
        nodes = props.checkVaild(nodes, currentNum);
        nodes = props.checkVaild(nodes, oldNum);

        props.http_update_node(nodes[`order_num${currentNum}`].info, oldNum, () => {
          props.Tree.setState({ nodes });
        });
      } else if (
        // 覆盖原有节点
        oldNum !== currentNum &&
        nodes[`order_num${currentNum}`].info.node_type &&
        !nodes[`order_num${currentNum}`].info.disable
      ) {
        nodes[`order_num${oldNum}`].info.order_num = currentNum;
        const oldInfo = nodes[`order_num${oldNum}`].info;
        const currentInfo = nodes[`order_num${currentNum}`].info;
        nodes[`order_num${currentNum}`].info = source_info;
        nodes[`order_num${currentNum}`].info.order_num = currentNum;
        nodes[`order_num${oldNum}`].info = {};
        nodes = props.checkVaild(nodes, currentNum);
        nodes = props.checkVaild(nodes, oldNum);

        props.http_delete_node(currentInfo, () => {
          props.http_update_node(oldInfo, oldNum, () => {
            props.Tree.setState({ nodes });
          });
        });
      }
    } else {
      // 往树里新增节点
      const info = source_info;
      const add_node = () => {
        nodes[`order_num${currentNum}`].info = info;
        nodes[`order_num${currentNum}`].info.order_num = currentNum;
        nodes = props.checkVaild(nodes, currentNum);
        props.http_add_node(info, newInfo => {
          nodes[`order_num${currentNum}`].info = newInfo;
          props.Tree.setState({ nodes });
        });
      };
      if (nodes[`order_num${currentNum}`].info.node_type) {
        // 覆盖原有节点
        if (!nodes[`order_num${currentNum}`].info.disable) {
          props.http_delete_node(nodes[`order_num${currentNum}`].info, add_node);
        }
      } else {
        add_node();
      }
    }
  },
};
function collectTarget(connect_, monitor) {
  return {
    connectDropTarget: connect_.dropTarget(),
    isOver: monitor.isOver(),
  };
}

@DropTarget('BinaryTree', SvgTarget, collectTarget)
class Target extends Component {
  render() {
    const {
      connectDropTarget,
      isOver,
      resizeSmall,
      pickAll,
      open,
      checkVaild,
      info,
      nodes,
      parentNodeType,
      targetStyle,
      editable,
      rect_size,
      transform,
      Tree,
      left,
      right,
      order_num,
      lineStyle,
      nodeElement,
      scale,
      clickDownArrow,
      clickUpArrow,
      http_delete_node,
      onSelectNode,
      onDragNode,
    } = this.props;
    const isoverStyle = isOver ? targetStyle.isoverStyle : {};
    return connectDropTarget(
      <g transform={`translate(${transform.left}, ${transform.top})`} className={styles.target}>
        {info.node_type === parentNodeType ? (
          <circle
            cx={rect_size / 2}
            cy={rect_size / 2}
            r={rect_size / 2}
            strokeWidth="1"
            style={{
              stroke: '#999',
              strokeWidth: 1,
              fill: 'rgba(0, 0, 0, 0)',
              cursor: 'default',
              ...targetStyle.normalStyle,
              strokeDasharray: 0,
              ...isoverStyle,
            }}
          />
        ) : (
          <rect
            x="0"
            y="0"
            width={rect_size}
            height={rect_size}
            style={{
              fill: 'rgba(0, 0, 0, 0)',
              stroke: 'rgba(92, 159, 246, 0.43)',
              strokeWidth: 1,
              cursor: 'default',
              ...targetStyle.normalStyle,
              strokeDasharray: info.node_type ? 0 : targetStyle.normalStyle.strokeDasharray || 3,
              ...isoverStyle,
            }}
          />
        )}
        <Line
          Tree={Tree}
          left={left}
          right={right}
          rect_size={rect_size}
          order_num={order_num}
          lineStyle={lineStyle}
          checkVaild={checkVaild}
          pickAll={pickAll}
          open={open}
          nodes={nodes}
          parentNodeType={parentNodeType}
        />

        {info.node_type ? (
          <SvgContent
            Tree={Tree}
            nodes={nodes}
            info={info}
            order_num={order_num}
            rect_size={rect_size}
            nodeElement={nodeElement}
            scale={scale}
            preComponent={this}
            open={open}
            editable={editable}
            parentNodeType={parentNodeType}
            key={order_num}
            checkVaild={checkVaild}
            checkAllChildren={checkAllChildren}
            pickAll={pickAll}
            clickDownArrow={clickDownArrow}
            clickUpArrow={clickUpArrow}
            http_delete_node={http_delete_node}
            onSelectNode={onSelectNode}
            onDragNode={onDragNode}
          />
        ) : null}

        {editable && !info.disable && (
          <OpenClose
            Tree={Tree}
            nodes={nodes}
            order_num={order_num}
            rect_size={rect_size}
            editable={editable}
            parentNodeType={parentNodeType}
            open={open}
            resizeSmall={resizeSmall}
            pickAll={pickAll}
            checkVaild={checkVaild}
            checkAllChildren={checkAllChildren}
            info={info}
          />
        )}
      </g>
    );
  }
}

export default Target;
