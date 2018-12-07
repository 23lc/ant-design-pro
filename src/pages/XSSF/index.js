/* eslint-disable prefer-destructuring */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Input, Button, Select, Table, Divider } from 'antd';
import Link from 'umi/link';
// import classNames from 'classnames';
// import G from 'geohey-javascript-sdk';
import WholeContent from '@/components/PageHeaderWrapper/WholeContent';
// import { getTimeDistance } from '@/utils/utils';
// import Result from './result';
import styles from './style.less';

const InputGroup = Input.Group;

@connect(({ xssf: { info, timestamp }, global: { policeCaseList, layerList } }) => ({
  info,
  policeCaseList,
  layerList,
  timestamp,
}))
class XSSF extends Component {
  // constructor(props) {
  //   super(props);
  // }

  state = {};

  componentDidMount() {
    const { dispatch } = this.props;
    for (let i = 0; i < 10; i += 1) {
      // 获取查询列表中的实名信息
      dispatch({
        type: 'xssf/fetchInfo',
        payload: {
          value: i,
        },
      });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'xssf/clear',
    });
  }

  render() {
    const { info } = this.props;
    const columns = [
      {
        title: '手机号',
        dataIndex: 'sjhms',
        key: 'sjhms',
        render: text => <a>{text && text.map(({ objValue }) => objValue).join(', ')}</a>,
      },
      {
        title: 'IMSI',
        dataIndex: 'imsi',
        key: 'imsi',
        render: text => <a>{text && text.map(({ objValue }) => objValue).join(', ')}</a>,
      },
      {
        title: '身份证号',
        dataIndex: 'sfzh',
        key: 'sfzh',
        render: text => <a>{text && text.map(({ objValue }) => objValue).join(', ')}</a>,
      },
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        render: text => <a>{text && text.map(({ objValue }) => objValue).join(', ')}</a>,
      },
      {
        title: 'QQ号',
        dataIndex: 'qqhms',
        key: 'qqhms',
        render: text => <a>{text && text.map(({ objValue }) => objValue).join(', ')}</a>,
      },
      {
        title: '微信ID',
        dataIndex: 'wxhms',
        key: 'wxhms',
        render: text => <a>{text && text.map(({ objValue }) => objValue).join(',')}</a>,
      },
      {
        title: 'IMEI',
        dataIndex: 'imei',
        key: 'imei',
        render: text => <a>{text && text.map(({ objValue }) => objValue).join(', ')}</a>,
      },
      {
        title: '车牌号码',
        dataIndex: 'cphms',
        key: 'cphms',
        render: text => <a>{text && text.map(({ objValue }) => objValue).join(', ')}</a>,
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <span>
            <Link to={`/SSDW?keyword=${record.qqhms[0].objValue}&type=002`}>实时定位</Link>
            <Divider type="vertical" />
            <Link to={`/Trace?keyword=${record.qqhms[0].objValue}&type=002`}>轨迹分析</Link>
          </span>
        ),
      },
    ];
    return (
      <WholeContent>
        <div className={styles.header}>
          <div>
            <InputGroup compact style={{ width: '500px' }}>
              <Input
                style={{ width: '400px' }}
                addonBefore={
                  <Select defaultValue="001" style={{ width: '100px' }}>
                    <Select.Option value="001">手机号</Select.Option>
                    <Select.Option value="002">QQ号码</Select.Option>
                    <Select.Option value="006">IMSI</Select.Option>
                  </Select>
                }
                placeholder="请输入QQ/微信/手机号码"
              />
              <Button type="primary">导入</Button>
            </InputGroup>
            <Button type="primary">开始查询</Button>
          </div>
          <Button type="primary">导出</Button>
        </div>
        <Table columns={columns} dataSource={info} rowKey="key" />
      </WholeContent>
    );
  }
}

export default XSSF;
