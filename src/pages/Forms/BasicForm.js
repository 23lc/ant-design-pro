import React, { Component } from 'react';
import { connect } from 'dva';
import { Input, Button, DatePicker, List } from 'antd';
import classNames from 'classnames';
import WholeContent from '@/components/PageHeaderWrapper/WholeContent';
import BaseMap from '@/components/BaseMap';
// import { getTimeDistance } from '@/utils/utils';
import styles from './style.less';

const { RangePicker } = DatePicker;

@connect(({ loading, list: { info, trace }, global: { policeCaseList, layerList } }) => ({
  loading: loading.effects['chart/fetch'],
  info,
  trace,
  policeCaseList,
  layerList,
}))
class BasicForm extends Component {
  // constructor(props) {
  //   super(props);
  // }

  state = {
    value: '',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/fetchPoliceCase',
    });
  }

  componentWillUnmount() {}

  handleInputChange = ({ target: { value } }) => {
    this.setState({ value });
  };

  search = () => {
    const { dispatch } = this.props;
    const { value } = this.state;
    if (!value) return;
    const people = value.split(',');
    people.forEach(person => {
      dispatch({
        type: 'list/fetchInfo',
        payload: {
          value: person,
        },
      });

      dispatch({
        type: 'list/fetchTrace',
        payload: {
          value: person,
        },
      });
    });
  };

  render() {
    const { info, trace, policeCaseList, layerList } = this.props;
    const { value } = this.state;
    return (
      <WholeContent>
        <BaseMap policeCaseList={policeCaseList} layerList={layerList} />
        <div className={styles.wrapper}>
          <div className={classNames(styles.panel, styles.main)}>
            <div style={{ display: 'flex' }}>
              <Input value={value} onChange={this.handleInputChange} />
              <Button type="primary" style={{ marginLeft: '5px' }}>
                导入
              </Button>
            </div>
            <RangePicker />
            <Button type="primary" onClick={this.search}>
              轨迹查询
            </Button>
          </div>
          {info && (
            <div className={classNames(styles.panel, styles.list)}>
              <header>
                轨迹查询列表 <Button type="primary">导出</Button>
              </header>
              <div>
                <List
                  dataSource={value.split(',').filter(e => e)}
                  renderItem={e => {
                    const detail = info[e] || {};
                    const { image, qqhms, wxhms, sjhms, cphms } = detail;
                    return (
                      <List.Item className={styles.listItem}>
                        <img alt="" src={`${image}`} />
                        <div>
                          {qqhms && (
                            <div>QQ号码: {qqhms.map(({ objValue }) => objValue).join(',')}</div>
                          )}
                          {wxhms && (
                            <div>微信号码: {wxhms.map(({ objValue }) => objValue).join(',')}</div>
                          )}
                          {sjhms && (
                            <div>手机号码: {sjhms.map(({ objValue }) => objValue).join(',')}</div>
                          )}
                          {cphms && (
                            <div>车牌号码: {cphms.map(({ objValue }) => objValue).join(',')}</div>
                          )}
                        </div>
                        <div
                          className={classNames(
                            styles.status,
                            trace && trace[e] ? styles['status-success'] : styles['status-querying']
                          )}
                        >
                          {trace && trace[e] ? '查询成功' : '正在查询'}
                        </div>
                      </List.Item>
                    );
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </WholeContent>
    );
  }
}

export default BasicForm;
