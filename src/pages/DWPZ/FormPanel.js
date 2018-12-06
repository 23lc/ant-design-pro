import React, { Component } from 'react';
import { connect } from 'dva';
import { Input, DatePicker, Form, Button, Select, Checkbox } from 'antd';
import { HuePicker } from 'react-color';
import moment from 'moment';
import G from 'geohey-javascript-sdk';

// import { getTimeDistance } from '@/utils/utils';

import styles from './FormPanel.less';

const { RangePicker } = DatePicker;
const InputGroup = Input.Group;

@connect(({ global: { policeCaseList }, sjpz: { formPanel } }) => ({
  formPanel,
  policeCaseList,
}))
class FormPanel extends Component {
  // constructor(props) {
  //   super(props);
  // }

  state = {};

  componentDidMount() {
    const {
      formPanel: { geom, mode, color },
      graphicLayer,
    } = this.props;
    if (mode === 'circle') {
      this.graphic = new G.Graphic.Circle(
        geom,
        {},
        {
          fillColor: color || '#5c9ff6',
          outlineColor: color || '#5c9ff6',
          outlineWidth: 4,
        }
      );
      this.graphic.addTo(graphicLayer);
    } else {
      this.graphic = new G.Graphic.Polygon(
        geom,
        {},
        {
          fillColor: color || '#5c9ff6',
          outlineColor: color || '#5c9ff6',
        }
      );
      this.graphic.addTo(graphicLayer);
    }
  }

  componentWillUnmount() {
    const { graphicLayer } = this.props;
    graphicLayer.clear();
  }

  create = () => {};

  handleSubmit = e => {
    e.preventDefault();
    const {
      form: { validateFields },
      dispatch,
      formPanel,
    } = this.props;
    validateFields((err, values) => {
      if (!err) {
        // todo: 发送请求更新节点
        dispatch({
          type: 'sjpz/updateParams',
          payload: {
            ...formPanel,
            ...values,
          },
        });
        dispatch({
          type: 'sjpz/updateParams',
          payload: {
            formPanel: null,
          },
        });
      }
    });
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'sjpz/updateParams',
      payload: {
        formPanel: null,
      },
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      policeCaseList,
      formPanel,
    } = this.props;
    const formItemLayout = {
      labelCol: {
        xs: { span: 6 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 18 },
        sm: { span: 18 },
      },
    };
    return (
      <div className={styles.wrapper}>
        <Form onSubmit={this.handleSubmit}>
          <Form.Item label="节点名称" required {...formItemLayout}>
            {getFieldDecorator('nodename', {
              rules: [{ required: true, message: '请输入节点名称' }],
              initialValue: formPanel.nodename || '',
            })(<Input placeholder="请输入节点名称" />)}
          </Form.Item>
          <Form.Item label="特定人员" required {...formItemLayout}>
            <InputGroup compact>
              <Input style={{ width: 'calc(100% - 64px)' }} placeholder="请输入节点名称" />
              <Button type="primary">导入</Button>
            </InputGroup>
          </Form.Item>
          <Form.Item label="时间范围" required {...formItemLayout}>
            {getFieldDecorator('timerange', {
              rules: [{ required: true, message: '请输入时间范围' }],
              initialValue: formPanel.timerange || [moment(), moment()],
            })(<RangePicker />)}
          </Form.Item>
          <Form.Item label="关联案件" required {...formItemLayout}>
            {getFieldDecorator('relatedcase', {
              rules: [{ required: true, message: '请选择关联案件' }],
              initialValue: formPanel.relatedcase || [],
            })(
              <Select mode="multiple">
                {policeCaseList.map(({ c }) => (
                  <Select.Option key={c.KID}>{c.AJMC}</Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="偶来此地" required {...formItemLayout}>
            {getFieldDecorator('accident', {
              rules: [{ required: true, message: '' }],
              initialValue: formPanel.accident || false,
            })(<Checkbox />)}
          </Form.Item>
          <Form.Item label="首次进入" required {...formItemLayout}>
            {getFieldDecorator('firstcame', {
              rules: [{ required: true, message: '' }],
              initialValue: formPanel.firstcame || false,
            })(<Checkbox />)}
          </Form.Item>
          <Form.Item label="节点颜色" required {...formItemLayout}>
            {getFieldDecorator('color', {
              // rules: [{ required: true, message: '' }],
              valuePropName: 'color',
              initialValue: formPanel.color || '#5c9ff6',
              getValueFromEvent: ({ hex }) => {
                this.graphic.updateOptions({
                  fillColor: hex,
                  outlineColor: hex,
                });
                return hex;
              },
            })(<HuePicker width="100%" />)}
          </Form.Item>
          <div className={styles.buttonGroup}>
            <Button type="primary" htmlType="submit">
              {formPanel.id ? '更新' : '添加'}到研判模型
            </Button>
            <Button type="primary">复制</Button>
            <Button onClick={this.handleCancel}>取消</Button>
          </div>
        </Form>
      </div>
    );
  }
}

export default Form.create()(FormPanel);
