/* eslint-disable prefer-destructuring */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Input, Button, List, Select } from 'antd';
import classNames from 'classnames';
import G from 'geohey-javascript-sdk';
import QueueAnim from 'rc-queue-anim';
import WholeContent from '@/components/PageHeaderWrapper/WholeContent';
import BaseMap from '@/components/BaseMap';
// import Trace from '@/components/Trace';
// import { getTimeDistance } from '@/utils/utils';
// import Result from './result';
import styles from './style.less';

@connect(({ list: { info, trace, timestamp }, global: { policeCaseList, layerList } }) => ({
  info,
  trace,
  policeCaseList,
  layerList,
  timestamp,
}))
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
    // todo:
    const { traceLayer, map } = this.basemap.state;
    const { trace } = this.props;
    const item = trace[e][0];
    const coor = G.Proj.WebMercator.project(Number(item.LON), Number(item.LAT));
    new G.Graphic.Point(
      coor,
      {},
      {
        shape: 'image',
        size: [80, 80],
        offset: [-40, -40],
        image: '/photo.png',
        clickable: true,
      }
    ).addTo(traceLayer);
    map.centerAt(coor);
    map.showPopup(
      coor,
      `<div style="height: 84px">
        <header style="color: #5c9ff6;font-size: 14px;border-left: 2px solid rgba(0, 111, 255, .08);padding-left: 5px;">实时定位</header>
        <div style="font-size: 12px;padding-left: 7px;margin-top: 5px;">
          <div>查询对象: ${e}</div>
          <div>当前位置: ${item.ADDRESS}</div>
          <div>捕获时间: ${item.TIMESTR}</div>
        </div>
      </div>`,
      0,
      -40
    );
    this.setState({ currentTrace: e });
  };

  render() {
    const { info, trace, policeCaseList, layerList } = this.props;
    const { keyword, currentTrace, list, type } = this.state;
    // let traceLayer = null;
    // let map = null;
    // let clusterLayer = null;
    // if (this.basemap) {
    //   traceLayer = this.basemap.state.traceLayer;
    //   map = this.basemap.state.map;
    //   clusterLayer = this.basemap.state.clusterLayer;
    // }
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
            <Button
              type="primary"
              onClick={this.search}
              style={{ width: '160px', background: '#3ca2ef', borderColor: '#3ca2ef' }}
            >
              实时定位
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
                          {trace && trace[e] === undefined && '正在定位'}
                          {trace && trace[e] === null && '定位失败'}
                          {trace && trace[e] && '定位成功'}
                        </div>
                      </List.Item>
                    );
                  }}
                />
              </div>
            </QueueAnim>
          ) : null}
        </div>
      </WholeContent>
    );
  }
}

export default GJCX;
