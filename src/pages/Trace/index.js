/* eslint-disable prefer-destructuring */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Input, Button, DatePicker, List, Select } from 'antd';
import classNames from 'classnames';
// import G from 'geohey-javascript-sdk';
import QueueAnim from 'rc-queue-anim';
import WholeContent from '@/components/PageHeaderWrapper/WholeContent';
import BaseMap from '@/components/BaseMap';
import Trace from '@/components/Trace';
import ModelList from '@/components/ModelList';
// import { getTimeDistance } from '@/utils/utils';
// import Result from './result';
import styles from './style.less';

const { RangePicker } = DatePicker;

@connect(
  ({
    list: { info, trace, timestamp },
    global: { policeCaseList, layerList },
    sjpz: { modelList },
  }) => ({
    info,
    trace,
    policeCaseList,
    layerList,
    timestamp,
    modelList,
  })
)
class GJCX extends Component {
  // constructor(props) {
  //   super(props);
  // }

  state = {
    keyword: '',
    type: '001',
    currentTrace: null,
  };

  componentDidMount() {
    const {
      dispatch,
      history: {
        location: {
          query: { keyword, type },
        },
      },
    } = this.props;
    dispatch({
      type: 'global/fetchPoliceCase',
    });
    dispatch({
      type: 'sjpz/fetchModelList',
    });
    if (keyword) {
      this.setState({ keyword, type });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'list/clear',
    });
  }

  handleInputChange = ({ target: { value } }) => {
    this.setState({ keyword: value });
  };

  search = () => {
    const { dispatch } = this.props;
    const { keyword } = this.state;
    this.setState({ list: keyword.split(',').filter(e => e) });
    if (!keyword) return;
    const people = keyword.split(',');
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
    const { info, trace, policeCaseList, layerList, modelList } = this.props;
    const { keyword, currentTrace, list, type } = this.state;
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
          modelList={
            <ModelList
              type="simple"
              dataSource={modelList}
              policeCaseList={policeCaseList}
              onCreate={this.create}
              onPoliceCaseItemClick={this.basemap && this.basemap.lookUpPoliceCase}
            />
          }
        />
        <div className={styles.wrapper}>
          <div className={classNames(styles.panel, styles.main)}>
            <div style={{ display: 'flex' }}>
              <Input
                value={keyword}
                onChange={this.handleInputChange}
                placeholder="请输入QQ/微信/手机号码"
                addonBefore={
                  <Select
                    style={{ width: '96px' }}
                    value={type}
                    onChange={e => {
                      this.setState({ type: e });
                    }}
                  >
                    <Select.Option value="001" key="001">
                      手机号
                    </Select.Option>
                    <Select.Option value="002" key="002">
                      QQ号码
                    </Select.Option>
                    <Select.Option value="006" key="006">
                      IMSI
                    </Select.Option>
                  </Select>
                }
              />
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
                          {trace && trace[e] === undefined && '正在查询'}
                          {trace && trace[e] === null && '查询失败'}
                          {trace && trace[e] && '查询成功'}
                        </div>
                      </List.Item>
                    );
                  }}
                />
              </div>
            </QueueAnim>
          ) : null}
          {currentTrace && (
            <Trace
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

export default GJCX;
