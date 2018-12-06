/* eslint-disable camelcase */
import React, { Component } from 'react';
import { connect } from 'dva';
import BinaryTree from '@/components/BinaryTree';
import Link from 'umi/link';
import { Icon, Button, Modal, Form, Input, Select, Radio } from 'antd';
import { DragDropContext } from 'react-dnd';
import TouchBackend from 'react-dnd-touch-backend';
import classNames from 'classnames';
import router from 'umi/router';
import RealationNode from './node/RelationNode';
import ResourceNode from './node/ResourceNode';
import ModelNode from './node/ModelNode';
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

@connect(({ global: { policeCaseList }, sjpz: { treeNodes, resource, modelList } }) => ({
  treeNodes,
  resource,
  modelList,
  policeCaseList,
}))
@DragDropContext(TouchBackend({ enableMouseEvents: true }))
class SJPZModel extends Component {
  // constructor(props) {
  //   super(props);
  // }

  state = {
    visible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/fetchPoliceCase',
    });
    dispatch({
      type: 'sjpz/fetchModelList',
    });
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

  saveModel = () => {
    // todo: 保存表单项

    this.setState({ visible: false });
  };

  render() {
    const {
      form: { getFieldDecorator },
      treeNodes,
      resource,
      modelList,
      modelId,
      policeCaseList,
    } = this.props;
    const { timestamp, visible } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 4 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 20 },
        sm: { span: 20 },
      },
    };
    // todo: 处理id的数据类型
    const model = modelList.find(item => item.id === Number(modelId));
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
            <div className={styles.node_container}>
              {modelList.map(item => (
                <ModelNode
                  key={item.id}
                  name={item.name}
                  onClick={() => {
                    router.push(`/DWPZ?modelId=${item.id}`);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className={classNames(styles.panel, styles['tree-panel'])}>
          <div>
            <Link to="/DWPZ" style={{ float: 'right', width: '60px' }}>
              <Icon type="rollback" style={{ fontSize: '20px', padding: '10px', margin: '10px' }} />
            </Link>
          </div>
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
          <div className={styles['button-group']}>
            {/* todo: 开始碰撞的disable值, 一方面取决于模型树结构是否合法，另外一方面取决于模型本身是否是只读的。 */}
            <Button
              type="primary"
              style={{ flexBasis: '180px' }}
              disabled={model && model.status === 'processing'}
            >
              开始碰撞
            </Button>
            {model && model.status === 'success' && (
              <Button
                onClick={() => {
                  router.push(`/DWPZ/${modelId}`);
                }}
              >
                查看结果
              </Button>
            )}
            {/* todo: 保存模型的disable值, 取决于该模型的create_user_id是否与当前登录用户相同 */}
            <Button
              onClick={() => {
                this.setState({ visible: true });
              }}
            >
              保存模型
            </Button>
          </div>
        </div>
        <Modal
          title={null}
          visible={visible}
          onCancel={() => {
            // todo: 重置Modal中的表单项

            this.setState({ visible: false });
          }}
          onOk={this.saveModel}
        >
          <Form>
            <Form.Item label="模型名称" required {...formItemLayout}>
              {getFieldDecorator('name', {
                initialValue: model ? model.name : '',
              })(<Input placeholder="请输入模型名称" />)}
            </Form.Item>
            <Form.Item label="模型描述" {...formItemLayout}>
              {getFieldDecorator('description', {
                initialValue: model ? model.description : '',
              })(<Input.TextArea rows={4} placeholder="请输入模型描述、研判思路" />)}
            </Form.Item>
            <Form.Item label="关联案件" required {...formItemLayout}>
              {getFieldDecorator('related_case', {
                initialValue: model ? model.related_case.split(',') : [],
              })(
                <Select mode="multiple">
                  {policeCaseList.map(({ c }) => (
                    <Select.Option key={c.KID} value={c.ASJBH}>
                      {c.AJMC}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="共享模型" required {...formItemLayout}>
              {getFieldDecorator('shared', {
                initialValue: model ? model.shared : '',
              })(
                <Radio.Group>
                  <Radio value>共享(所有用户可见)</Radio>
                  <Radio value={false}>私用(仅本人可见)</Radio>
                </Radio.Group>
              )}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default Form.create()(SJPZModel);
