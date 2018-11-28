/* eslint-disable camelcase */

import React, { Component } from 'react';
import styles from './index.less';

let success = '#5c9ff6';
let error = 'rgba(255, 0, 0, 0.78)';

export default class Line extends Component {
  exchange = () => {
    const { nodes, order_num, open, pickAll, Tree } = this.props;
    // 用JSON与字符串互相转换的方法实现深复制，前提是该对象里不能有函数
    const newNodes = JSON.parse(JSON.stringify(nodes));
    const left = order_num * 2;
    const right = order_num * 2 + 1;
    // nodes所有属性：info,left,right,transform,order_num
    const exchange_single = (num, mirror_num) => {
      const parent_num = num % 2 === 0 ? num / 2 : (num - 1) / 2;
      if (nodes[`order_num${mirror_num}`]) {
        if (!newNodes[`order_num${num}`]) {
          open(newNodes, parent_num);
        }
        newNodes[`order_num${num}`].info = nodes[`order_num${mirror_num}`].info;
        newNodes[`order_num${num}`].left.valid = nodes[`order_num${mirror_num}`].left.valid;
        newNodes[`order_num${num}`].right.valid = nodes[`order_num${mirror_num}`].right.valid;
        exchange_single(num * 2, mirror_num * 2);
        exchange_single(num * 2 + 1, mirror_num * 2 + 1);
      }
    };
    const left_valid = newNodes[`order_num${order_num}`].left.valid;
    newNodes[`order_num${order_num}`].left.valid = newNodes[`order_num${order_num}`].right.valid;
    newNodes[`order_num${order_num}`].right.valid = left_valid;
    pickAll(newNodes, left);
    pickAll(newNodes, right);
    exchange_single(left, right);
    exchange_single(right, left);
    Tree.setState({ nodes: newNodes });
  };

  render() {
    const { rect_size, left, right, lineStyle } = this.props;
    if (left.offset && right.offset) {
      if (lineStyle) {
        // eslint-disable-next-line
        success = this.props.lineStyle.success;
        // eslint-disable-next-line
        error = this.props.lineStyle.error;
      }
      return (
        <g className={styles.line}>
          {/* 中间的竖线 */}
          <path
            d={`M${rect_size / 2} ${rect_size} V ${rect_size * 1.25}`}
            strokeWidth="1"
            style={{
              stroke: !left.valid || !right.valid ? error : success,
              strokeDasharray: left.valid || right.valid ? 0 : 4,
            }}
          />
          {/* 箭头 */}
          <path
            d={`M${rect_size / 2} ${rect_size} L ${rect_size / 2 - 4} ${rect_size +
              7} L ${rect_size / 2 + 4} ${rect_size + 7}Z`}
            strokeWidth="1"
            style={{
              stroke: !left.valid || !right.valid ? error : success,
              fill: !left.valid || !right.valid ? error : success,
            }}
          />

          {/* 左边的折线 */}
          <path
            d={`M${rect_size / 2} ${rect_size * 1.25} H ${rect_size / 2 - left.offset}`}
            strokeWidth="1"
            style={{
              stroke: left.valid ? success : error,
              strokeDasharray: left.valid ? 0 : 4,
            }}
          />
          <path
            d={`M${rect_size / 2 - left.offset} ${rect_size * 1.25} V ${rect_size * 1.5}`}
            strokeWidth="1"
            style={{
              stroke: left.valid ? success : error,
              strokeDasharray: left.valid ? 0 : 4,
            }}
          />

          {/* 右边的折线 */}
          <path
            d={`M${rect_size / 2} ${rect_size * 1.25} H ${rect_size / 2 + right.offset}`}
            strokeWidth="1"
            style={{
              stroke: right.valid ? success : error,
              strokeDasharray: right.valid ? 0 : 4,
            }}
          />
          <path
            d={`M${rect_size / 2 + right.offset} ${rect_size * 1.25} V ${rect_size * 1.5}`}
            strokeWidth="1"
            style={{
              stroke: right.valid ? success : error,
              strokeDasharray: right.valid ? 0 : 4,
            }}
          />

          {/* 交换按钮 */}
          {/* <ellipse
            cx="44"
            cy="125"
            rx="16"
            ry="8"
            style={{
              fill: 'lightskysuccess',
              cursor: 'pointer',
            }}
            onClick={this.exchange}
          /> */}
        </g>
      );
    }
    return null;
  }
}
