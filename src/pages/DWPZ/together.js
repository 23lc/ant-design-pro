/* eslint-disable prefer-destructuring */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Icon, List } from 'antd';
import Link from 'umi/link';
// import router from 'umi/router';
// import HeaderSearch from '@/components/HeaderSearch';
// import moment from 'moment';
// import G from 'geohey-javascript-sdk';
import WholeContent from '@/components/PageHeaderWrapper/WholeContent';
import BaseMap from '@/components/BaseMap';
import Trace from '@/components/Trace';
import classNames from 'classnames';
import styles from './style.less';

@connect(({ sjpz: { info, trace, timestamp } }) => ({
  info,
  trace,
  timestamp,
}))
class TogetherResult extends Component {
  state = {
    currentTrace: null,
  };

  componentDidMount() {
    // todo: 根据modelId获取模型碰撞结果
    const {
      match: {
        params: { modelId },
      },
      dispatch,
    } = this.props;
    // dispatch({
    //   type: 'sjpz/fetchResult',
    //   payload: {
    //     modelId,
    //   },
    // });
    for (let i = 0; i < 10 * Number(modelId); i += Number(modelId)) {
      // 获取查询列表中的实名信息
      dispatch({
        type: 'sjpz/fetchInfo',
        payload: {
          value: i,
        },
      });
      // 获取查询列表中的轨迹信息
      dispatch({
        type: 'sjpz/fetchTrace',
        payload: {
          value: i,
        },
      });
    }
  }

  componentDidUpdate() {}

  componentWillUnmount() {}

  handleSelectItem = e => {
    this.setState({ currentTrace: e });
  };

  render() {
    const {
      match: {
        params: { modelId },
      },
      info,
      trace,
      policeCaseList,
      layerList,
    } = this.props;
    const { currentTrace } = this.state;
    const list = info ? Object.keys(info) : null;
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
          <div className={classNames(styles.result, styles.panel)}>
            <header>
              <span style={{ lineHeight: '40px' }}>伴随查询结果</span>
              <Link to={`/DWPZ/${modelId}`}>
                <Icon type="rollback" />
              </Link>
            </header>
            {/* todo: 显示当前伴随主体信息 */}
            {info && (
              <List
                style={{ overflowY: 'auto', flex: 1 }}
                dataSource={list}
                renderItem={key => {
                  const detail = info[key] || {};
                  const { image, qqhms, wxhms, sjhms, cphms } = detail;
                  return (
                    <List.Item
                      className={classNames(
                        styles.listItem,
                        key === currentTrace ? styles.active : ''
                      )}
                      onClick={() => {
                        this.handleSelectItem(key);
                      }}
                    >
                      <img alt="" src={`${image}`} />
                      <div className={styles.content}>
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
                    </List.Item>
                  );
                }}
              />
            )}
          </div>
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

export default TogetherResult;
