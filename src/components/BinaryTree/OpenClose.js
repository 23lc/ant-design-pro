/* eslint-disable camelcase */

import React, { Component } from 'react';
import styles from './index.less';

const blue = '#5c9ff6';
// const red = 'rgba(255, 0, 0, 0.78)';

export default class OpenClose extends Component {
  constructor(props) {
    super(props);
    this.open = this.open.bind(this);
    this.pickAll = this.pickAll.bind(this);
  }

  pickAll(nodes, num) {
    const { Tree, pickAll } = this.props;
    Tree.setState({ nodes: pickAll(nodes, num) });
  }

  open() {
    const { Tree, open, checkVaild, order_num, nodes } = this.props;
    let newNodes = open(nodes, order_num);
    newNodes = checkVaild(newNodes, order_num);
    Tree.setState({ nodes: newNodes });
  }

  render() {
    const {
      nodes,
      order_num,
      editable,
      checkAllChildren,
      info,
      parentNodeType,
      rect_size,
    } = this.props;
    if (!nodes[`order_num${order_num * 2}`] && editable) {
      return (
        <circle
          onClick={this.open}
          r="12"
          fill="url(#add_node)"
          stroke={blue}
          cx={rect_size / 2}
          cy={rect_size + 12 + 3} // 3是圆和矩形之间的空隙
          style={{ cursor: 'default', display: 'none' }}
          className={styles.open_close}
        />
      );
    }
    if (checkAllChildren(nodes, order_num) && info.node_type !== parentNodeType && editable) {
      return (
        <circle
          onClick={() => {
            this.pickAll(nodes, order_num);
          }}
          r="12"
          fill="url(#delete_node)"
          stroke={blue}
          cx={rect_size / 2}
          cy={rect_size * 1.25}
          style={{ cursor: 'default', display: 'none' }}
          className={styles.open_close}
        />
      );
    }
    return null;
  }
}
