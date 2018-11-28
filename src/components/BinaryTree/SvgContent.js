/* eslint-disable camelcase */

import React, { Component } from 'react';
import { DragSource } from 'react-dnd';
import styles from './index.less';

const blue = '#5c9ff6';

const source = {
  beginDrag(props) {
    return props.info;
  },
};
function collect(connect_, monitor) {
  return {
    connectDragSource: connect_.dragSource(),
    isDragging: monitor.isDragging(),
  };
}
function stopPropagation(e) {
  e.stopPropagation();
}

@DragSource('BinaryTree', source, collect)
class SvgContent extends Component {
  // 拖拽的动画效果
  copyDom = e => {
    const { editable, info, onDragNode, scale } = this.props;
    if (!editable || info.disable) {
      e.stopPropagation();
    } else {
      onDragNode(e, info, this.g, scale);
    }
  };

  // 删除当前节点内容
  delete = e => {
    e.stopPropagation();
    let { nodes } = this.props;
    const { order_num, checkVaild, http_delete_node } = this.props;
    const { info } = nodes[`order_num${order_num}`];
    nodes[`order_num${order_num}`].info = {};
    nodes = checkVaild(nodes, order_num);

    http_delete_node(info, () => {
      const { Tree } = this.props;
      Tree.setState({ nodes });
    });
  };

  render() {
    let { connectDragSource } = this.props;
    const { order_num, nodeElement, onSelectNode, clickUpArrow, clickDownArrow } = this.props;
    const num = order_num;
    const { info, editable, parentNodeType, rect_size } = this.props;
    const Node = nodeElement;
    if (!editable || info.disable) {
      connectDragSource = param => param;
    }
    return connectDragSource(
      <g
        style={{ cursor: !editable || info.disable ? 'default' : '-webkit-grab' }}
        className={styles.SvgContent}
        onMouseDown={this.copyDom}
        onClick={e => {
          onSelectNode(info, e);
        }}
        ref={g => {
          this.g = g;
        }}
      >
        <Node info={info} parentNodeType={parentNodeType} />
        {/* 删除按钮 */}
        <image
          className={`${styles.deleteNode} ${!editable || info.disable ? styles.hide : ''}`}
          x={info.node_type === parentNodeType ? 60 : 72}
          y={info.node_type === parentNodeType ? 8 : 2}
          width="15"
          height="15"
          xlinkHref="/sjpzSvg/delete.svg"
          style={{ cursor: 'pointer', display: 'none' }}
          onClick={this.delete}
          onMouseDown={stopPropagation}
        />

        {// 上箭头
        info.node_type === parentNodeType &&
          num !== 1 &&
          Boolean(clickUpArrow) &&
          editable &&
          !info.disable && (
            <circle
              className={styles.up_node}
              style={{ cursor: 'pointer', display: 'none' }}
              onClick={e => {
                e.stopPropagation();
                clickUpArrow(num);
              }}
              onMouseDown={e => {
                e.stopPropagation();
              }}
              r="10"
              cx={rect_size / 2}
              cy="-10"
              fill="url(#up_node)"
            />
          )}

        {// 下箭头，只有根节点会有
        num === 1 && Boolean(clickDownArrow) && editable && !info.disable && (
          <g
            style={{ cursor: 'pointer' }}
            onClick={e => {
              e.stopPropagation();
              clickDownArrow();
            }}
            onMouseDown={e => {
              e.stopPropagation();
            }}
          >
            <circle r="10" cx="98" cy="8" strokeWidth="1" stroke="#ffffff" fill="#ffffff" />
            <path d="M98 0 V 16" strokeWidth="1" stroke={blue} />
            <path d="M98 16 L90 8" strokeWidth="2" stroke={blue} />
            <path d="M98 16 L106 8" strokeWidth="2" stroke={blue} />
          </g>
        )}
      </g>
    );
  }
}

export default SvgContent;
