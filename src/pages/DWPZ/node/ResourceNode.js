/*
 * @Author: liangchao
 * @Date: 2018-05-24 11:05:35
 * @Last Modified by: liangchao
 * @Last Modified time: 2018-08-09 15:00:35
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { DragSource } from 'react-dnd';
import IconFont from '@/components/IconFont';
import classNames from 'classnames';
import { onDragNode } from '../util';
import styles from './style.less';

const SvgSource = {
  beginDrag(props) {
    return {
      ...props,
      node_id: props.info.NODE_ID,
      node_type: props.info.JD_TYPE,
    };
  },
};
function collectSvg(_connect, monitor) {
  return {
    connectDragSource: _connect.dragSource(),
    connectDragPreview: _connect.dragPreview(),
    isDragging: monitor.isDragging(),
  };
}

@connect(() => ({}))
@DragSource('BinaryTree', SvgSource, collectSvg)
class ResourceNode extends PureComponent {
  handleClick = e => {
    const {
      info: { category, NODE_ID },
      dispatch,
    } = this.props;
    const { clientX, clientY } = e;
    dispatch({
      type: 'lbs/update_params',
      payload: {
        form_panel: null,
      },
    });
    dispatch({
      type: 'lbs/fetch_object',
      payload: {
        cmd: 'get_node',
        user_id: JSON.parse(localStorage.getItem('user')).id,
        node_id: NODE_ID,
        category,
      },
    }).then(data => {
      if (data) {
        dispatch({
          type: 'lbs/update_params',
          payload: {
            form_panel: {
              node_id: data.NODE_ID,
              node_name: data.NODE_NAME,
              type: data.TYPE,
              geom: JSON.parse(data.GEOM),
              date_range: data.TIME_LIST,
              province: data.PROVINCE,
              city: data.CITY,
              times: data.TIMES,
              color: data.COLOR,
              sn_list: data.SN_LIST,
              category: data.category,
              hpys: data.HPYS,
              direction: data.DIRECTION,
              kklx: data.KKLX,
            },
            tool: null,
            clientX,
            clientY,
            form_source: 'resource',
          },
        });
      }
    });
  };

  handleDelete = e => {
    e.stopPropagation();
    const {
      info: { category, NODE_ID },
      dispatch,
    } = this.props;
    dispatch({
      type: 'lbs/send_and_update_nodes',
      payload: {
        cmd: 'delete_node',
        user_id: JSON.parse(localStorage.getItem('user')).id,
        node_id: NODE_ID,
        category,
      },
    });
  };

  render() {
    const {
      connectDragPreview,
      connectDragSource,
      isDragging,
      name,
      icon,
      info: { COLOR },
    } = this.props;
    return connectDragSource(
      <div className={classNames(styles.node)}>
        {connectDragPreview(
          <div
            className={styles.resource_node}
            style={{
              cursor: isDragging ? '-webkit-grabbing' : '-webkit-grab',
            }}
            onMouseDown={onDragNode}
            onClick={this.handleClick}
          >
            <IconFont
              className={styles.icon}
              type={icon}
              size={20}
              style={{
                background: COLOR || '#59aaf3',
                borderRadius: '2px',
                fill: '#fff',
                padding: '10px',
                height: '43px',
                width: '43px',
              }}
            />
            <IconFont
              type="icon-trash"
              size={8}
              color="#fff"
              className={styles.trash}
              onClick={this.handleDelete}
            />
          </div>
        )}
        <span>{name}</span>
      </div>
    );
  }
}
export default ResourceNode;
