/* eslint-disable prefer-destructuring */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Input, Button, DatePicker, List } from 'antd';
import classNames from 'classnames';
// import G from 'geohey-javascript-sdk';
import QueueAnim from 'rc-queue-anim';
import WholeContent from '@/components/PageHeaderWrapper/WholeContent';
import BaseMap from '@/components/BaseMap';
// import { getTimeDistance } from '@/utils/utils';
import Result from './result';
import styles from './style.less';

const { RangePicker } = DatePicker;

@connect(
  ({ loading, list: { info, trace, timestamp }, global: { policeCaseList, layerList } }) => ({
    loading: loading.effects['chart/fetch'],
    info,
    trace,
    policeCaseList,
    layerList,
    timestamp,
  })
)
class BasicForm extends Component {
  // constructor(props) {
  //   super(props);
  // }

  state = {
    value: '13167026163,13114396163',
    currentTrace: null,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/fetchPoliceCase',
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'list/clear',
    });
  }

  handleInputChange = ({ target: { value } }) => {
    this.setState({ value });
  };

  search = () => {
    const { dispatch } = this.props;
    const { value } = this.state;
    this.setState({ list: value.split(',').filter(e => e) });
    if (!value) return;
    const people = value.split(',');
    dispatch({
      type: 'list/clear',
    });
    people.forEach(person => {
      // 获取查询列表中的实名信息
      dispatch({
        type: 'list/fetchInfo',
        payload: {
          value: person,
        },
      });
      // 获取查询列表中的轨迹信息
      dispatch({
        type: 'list/fetchTrace',
        payload: {
          value: person,
        },
      });
    });
  };

  handleSelectItem = e => {
    this.setState({ currentTrace: e });
  };

  render() {
    const { info, trace, policeCaseList, layerList } = this.props;
    const { value, currentTrace, list } = this.state;
    let traceLayer = null;
    let map = null;
    let clusterLayer = null;
    if (this.basemap) {
      traceLayer = this.basemap.state.traceLayer;
      map = this.basemap.state.map;
      clusterLayer = this.basemap.state.clusterLayer;
    }
    return (
      <WholeContent>
        <BaseMap
          ref={basemap => {
            this.basemap = basemap;
          }}
          policeCaseList={policeCaseList}
          layerList={layerList}
        />
        <div className={styles.wrapper}>
          <div className={classNames(styles.panel, styles.main)}>
            <div style={{ display: 'flex' }}>
              <Input value={value} onChange={this.handleInputChange} />
              <Button
                type="primary"
                style={{ marginLeft: '5px', background: '#40b5cd', borderColor: '#40b5cd' }}
              >
                导入
              </Button>
            </div>
            <RangePicker />
            <Button
              type="primary"
              onClick={this.search}
              style={{ width: '160px', background: '#3ca2ef', borderColor: '#3ca2ef' }}
            >
              轨迹查询
            </Button>
          </div>
          {info ? (
            <QueueAnim type="top" className={classNames(styles.panel, styles.list)}>
              <header key="header">
                轨迹查询列表 <Button type="primary">导出</Button>
              </header>
              <div key="content">
                <List
                  dataSource={list}
                  renderItem={e => {
                    const detail = info[e] || {};
                    const { image, qqhms, wxhms, sjhms, cphms } = detail;
                    return (
                      <List.Item
                        className={classNames(
                          styles.listItem,
                          e === currentTrace ? styles.active : ''
                        )}
                        onClick={() => {
                          this.handleSelectItem(e);
                        }}
                      >
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
            </QueueAnim>
          ) : null}
          {currentTrace && (
            <Result
              map={map}
              traceLayer={traceLayer}
              clusterLayer={clusterLayer}
              trace={trace[currentTrace]}
              onClose={() => {
                this.setState({ currentTrace: null });
              }}
            />
          )}
        </div>
      </WholeContent>
    );
  }
}

export default BasicForm;
