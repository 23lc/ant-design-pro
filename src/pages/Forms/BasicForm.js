import React, { Component } from 'react';
import { connect } from 'dva';
import { Input, Button, DatePicker, List, Timeline, Icon, Divider } from 'antd';
import classNames from 'classnames';
import G from 'geohey-javascript-sdk';
import QueueAnim from 'rc-queue-anim';
import WholeContent from '@/components/PageHeaderWrapper/WholeContent';
import BaseMap from '@/components/BaseMap';
// import { getTimeDistance } from '@/utils/utils';
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
    playing: false,
    step: 0,
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
    clearInterval(this.interval);
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
    const { trace } = this.props;
    const { graphicLayer, map } = this.basemap.state;
    this.setState({ currentTrace: e });
    graphicLayer.clear();
    if (Array.isArray(trace[e])) {
      // 绘制轨迹线
      const polyline = trace[e].map(item =>
        G.Proj.WebMercator.project(Number(item.LON), Number(item.LAT))
      );
      const traceLine = new G.Graphic.Polyline(
        polyline,
        {},
        {
          lineColor: '#40a9ff',
          lineOpacity: 0.6,
        }
      );
      traceLine.addTo(graphicLayer);

      // 绘制相关基站点
      trace[e].reduce((result, item) => {
        if (result.findIndex(i => item.ADDRESS === i.ADDRESS) < 0) {
          const point = new G.Graphic.Point(
            G.Proj.WebMercator.project(Number(item.LON), Number(item.LAT)),
            {},
            {
              shape: 'image',
              size: [40, 44],
              offset: [-20, -44],
              image: '/marker.png',
              clickable: true,
            }
          );
          point.addTo(graphicLayer);
          return result.concat(item);
        }
        return result;
      }, []);
      // 重新缩放地图范围
      map.zoomExtent(traceLine.bbox);
    }
  };

  handleItemClear = () => {
    const { graphicLayer } = this.basemap.state;
    graphicLayer.clear();
    this.setState({ currentTrace: null });
  };

  play = () => {
    const { trace } = this.props;
    const { graphicLayer, map } = this.basemap.state;
    this.interval = setInterval(() => {
      const { step, currentTrace } = this.state;
      const newStep = (step + 1) % trace[currentTrace].length;
      const item = trace[currentTrace][newStep];
      const coor = G.Proj.WebMercator.project(Number(item.LON), Number(item.LAT));
      map.centerAt(coor);
      if (this.label) {
        this.label.remove();
      }
      this.label = new G.Graphic.Point(
        coor,
        {},
        {
          shape: 'text',
          size: [16],
          offset: [0, -27],
          text: newStep + 1,
          textColor: '#fff',
        }
      );
      this.label.addTo(graphicLayer);
      // 调整滚动条，使当前轨迹信息在视图窗口当中。
      const offset = this.timeline.children[0].children[newStep].offsetTop;
      if (
        offset < this.timeline.scrollTop ||
        offset > this.timeline.scrollTop + this.timeline.clientHeight
      ) {
        this.timeline.scrollTo(this.timeline.scrollLeft, (newStep - 1) * 61.33);
      }
      this.setState({ step: newStep });
    }, 2000);
    this.setState({ playing: true });
  };

  pause = () => {
    clearInterval(this.interval);
    this.setState({ playing: false });
  };

  render() {
    const { info, trace, policeCaseList, layerList } = this.props;
    const { value, currentTrace, playing, list, step } = this.state;
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
              <Button type="primary" style={{ marginLeft: '5px' }}>
                导入
              </Button>
            </div>
            <RangePicker />
            <Button type="primary" onClick={this.search}>
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
            <div className={classNames(styles.result, styles.panel)}>
              <header>
                <span onClick={this.handleItemClear}>
                  <Icon type="close" key="close" />
                </span>
              </header>
              <Divider style={{ marginRight: '20px' }} />
              <div className={styles.title}>
                轨迹
                {playing ? (
                  <span onClick={this.pause}>
                    <Icon type="pause-circle" /> 暂停播放
                  </span>
                ) : (
                  <span onClick={this.play}>
                    <Icon type="play-circle" /> 播放轨迹
                  </span>
                )}
              </div>
              <div
                key="timeline"
                className={styles.timeline}
                ref={timeline => {
                  this.timeline = timeline;
                }}
              >
                {trace[currentTrace] ? (
                  <Timeline>
                    {trace[currentTrace].map(({ ADDRESS, TIMESTR }, index) => (
                      <Timeline.Item
                        key={TIMESTR}
                        color={step === index ? 'blue' : '#dfe3e6'}
                        className={step === index ? styles.active : ''}
                        onClick={() => {
                          this.setState({ step: index });
                        }}
                      >
                        <div>{ADDRESS}</div>
                        <div>{TIMESTR}</div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <div>暂无数据</div>
                )}
              </div>
            </div>
          )}
        </div>
      </WholeContent>
    );
  }
}

export default BasicForm;
