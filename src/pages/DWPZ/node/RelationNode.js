/*
 * @Author: liangchao
 * @Date: 2018-05-24 11:05:35
 * @Last Modified by: liangchao
 * @Last Modified time: 2018-06-06 09:17:40
 */

import React, { PureComponent } from 'react';
import { DragSource } from 'react-dnd';
// import SvgIcon from 'components/SvgIcon';
import IconFont from '@/components/IconFont';
import classNames from 'classnames';
import { onDragNode } from '../util';
import styles from './style.less';

const SvgSource = {
  beginDrag(props) {
    return {
      ...props,
      node_type: 'JD02',
    };
  },
};
function collectSvg(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
  };
}
@DragSource('BinaryTree', SvgSource, collectSvg)
class RelationNode extends PureComponent {
  render() {
    const { connectDragSource, connectDragPreview, isDragging, name, icon } = this.props;
    return connectDragSource(
      <div className={classNames(styles.node)}>
        {connectDragPreview(
          <div
            className={styles.relation_node}
            onMouseDown={onDragNode}
            style={{
              cursor: isDragging ? '-webkit-grabbing' : '-webkit-grab',
            }}
          >
            <IconFont
              type={icon}
              style={{
                color: '#59aaf3',
                height: '43px',
                width: '43px',
                background: '#fff',
                borderRadius: '21px',
              }}
            />
          </div>
        )}
        <span>{name}</span>
      </div>
    );
  }
}
export default RelationNode;
