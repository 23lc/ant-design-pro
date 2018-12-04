/* eslint-disable camelcase */
import React, { Component } from 'react';
import { connect } from 'dva';
import BinaryTree from '@/components/BinaryTree';
import { DragDropContext } from 'react-dnd';
import TouchBackend from 'react-dnd-touch-backend';
import classNames from 'classnames';
import RealationNode from './node/RelationNode';
import ResourceNode from './node/ResourceNode';
import { onDragNode } from './util';

// import { getTimeDistance } from '@/utils/utils';

import styles from './SJPZModel.less';

const Node = props => {
  const { info, parentNodeType = 'JD02' } = props;
  const ifCircle = parentNodeType === info.node_type;
  const { COLOR } = info;
  let { name } = info;
  let shape = '';

  switch (info.JD_TYPE) {
    case 'JJ':
      name = '交集';
      break;
    case 'BJ':
      name = '并集';
      break;
    case 'PC':
      name = '排除';
      break;
    case 'POINT':
      shape = 'pointer';
      break;
    case 'POLYLINE':
      shape = 'line';
      break;
    case 'RECT':
      shape = 'rect';
      break;
    case 'POLYGON':
      shape = 'polygon';
      break;
    default:
  }
  return (
    <g className={styles.node}>
      {/* 碰撞关系为圆形，碰撞资源为矩形 */}
      {ifCircle ? (
        <circle cx="44" cy="44" r="43" stroke="rgba(0, 0, 0, 0)" strokeWidth="1" fill="#fff" />
      ) : (
        // d="M0 0 L 88 0 88 88 0 88Z" 因为target是88，所有content要少一位
        <path
          d="M1 1 L 87 0 87 87 1 87Z"
          strokeWidth="1"
          fill={COLOR || '#5b9ff5'}
          stroke="rgba(0, 0, 0, 0)"
        />
      )}
      <use
        x={ifCircle ? 24 : 20}
        y={ifCircle ? 12 : 8}
        width={ifCircle ? 40 : 48}
        height={ifCircle ? 40 : 48}
        fill={ifCircle ? '#5b9ff5' : '#fff'}
        xlinkHref={ifCircle ? `#icon-${info.JD_TYPE}` : `#icon-${shape}`}
      />
      <text
        x="44"
        y={ifCircle ? 68 : 72}
        style={{
          fill: ifCircle ? '#5b9ff5' : '#fff',
          userSelect: 'none',
          textAnchor: 'middle',
          fontSize: '14px',
        }}
        className={styles.node_name}
      >
        {name}
      </text>
    </g>
  );
};

@connect(({ sjpz: { treeNodes, resource } }) => ({
  treeNodes,
  resource,
}))
@DragDropContext(TouchBackend({ enableMouseEvents: true }))
class SJPZModel extends Component {
  // constructor(props) {
  //   super(props);
  // }

  state = {};

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/fetchPoliceCase',
    });
    dispatch({
      type: 'sjpz/fetchModelList',
    });
    // todo: 获取当前模型下所有的tree_node和resource
  }

  componentWillUnmount() {}

  handleChange = () => {
    // this.setState({ timestamp: new Date().getTime() });
  };

  getTreeNode = () => {};

  addTreeNode = ({ order_num, node_id, info }, callback) => {
    this.setState({ timestamp: new Date().getTime() });
    callback({
      ...info,
      order_num,
      name: info.JDMC,
      JD_TYPE: info.JD_TYPE,
      JDID: info.NODE_ID,
      node_id,
      node_type: ['JJ', 'BJ', 'PC'].indexOf(info.JD_TYPE) > -1 ? 'JD02' : info.JD_TYPE,
    });
  };

  updateTreeNode = (info, pre_order_num, callback) => {
    this.setState({ timestamp: new Date().getTime() });
    callback();
  };

  deleteTreeNode = (info, callback) => {
    this.setState({ timestamp: new Date().getTime() });
    callback();
  };

  render() {
    const { treeNodes, resource } = this.props;
    const { timestamp } = this.state;
    return (
      <div className={styles.wrapper}>
        <div className={styles['nodes-panel']}>
          <div className={styles.panel} style={{ flexBasis: '300px' }}>
            <header>碰撞关系</header>
            <div>
              <RealationNode
                icon="icon-JJ"
                name="交集"
                type="JJ"
                info={{ JDMC: '交集', JD_TYPE: 'JJ' }}
              />
              <RealationNode
                icon="icon-BJ"
                name="并集"
                type="BJ"
                info={{ JDMC: '并集', JD_TYPE: 'BJ' }}
              />
              <RealationNode
                icon="icon-PC"
                name="排除"
                type="PC"
                info={{ JDMC: '排除', JD_TYPE: 'PC' }}
              />
            </div>
          </div>
          <div className={styles.panel} style={{ flex: 1 }}>
            <header>碰撞资源</header>
            <div className={styles.node_container}>
              {resource &&
                resource.map(item => {
                  let shape = '';
                  switch (item.JD_TYPE) {
                    case 'POINT':
                      shape = 'pointer';
                      break;
                    case 'POLYLINE':
                      shape = 'line';
                      break;
                    case 'RECT':
                      shape = 'rect';
                      break;
                    case 'POLYGON':
                      shape = 'polygon';
                      break;
                    default:
                  }
                  return (
                    <ResourceNode
                      key={item.NODE_ID}
                      icon={`icon-${shape}`}
                      name={item.JDMC}
                      info={{ ...item }}
                    />
                  );
                })}
            </div>
          </div>
          <div className={styles.panel} style={{ flex: 1 }}>
            <header>我的模型</header>
          </div>
        </div>
        <div className={classNames(styles.panel, styles['tree-panel'])}>
          <BinaryTree
            nodes={treeNodes.map(item => ({
              ...item,
              order_num: parseInt(item.ORDER_ID, 10),
              name: item.JDMC,
              node_type: ['JJ', 'BJ', 'PC'].indexOf(item.JD_TYPE) > -1 ? 'JD02' : item.JD_TYPE,
              disable: item.FLAG === 'ONCE',
              // category,
            }))}
            version={timestamp}
            ref={tree => {
              this.Tree = tree;
            }}
            parentNodeType="JD02"
            nodeElement={Node}
            onSelectNode={this.getTreeNode}
            onDragNode={onDragNode}
            onChange={this.handleChange}
            http_add_node={this.addTreeNode}
            http_update_node={this.updateTreeNode}
            http_delete_node={this.deleteTreeNode}
            editable
            lineStyle={{ success: '#5c9ff6', error: 'rgba(255, 0, 0, 0.78)' }}
            targetStyle={{
              normalStyle: {
                stroke: 'rgba(92, 159, 246, 0.43)',
                strokeWidth: 1,
                strokeDasharray: 3,
                fill: 'rgba(0, 0, 0, 0)',
              },
              isoverStyle: {
                stroke: 'yellow',
                strokeDasharray: 0,
              },
            }}
          />
        </div>
      </div>
    );
  }
}

export default SJPZModel;
