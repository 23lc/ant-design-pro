import React, { Component } from 'react';
// import { connect } from 'dva';
import { Timeline, Icon } from 'antd';
import G from 'geohey-javascript-sdk';
import { gcj02tobd09, wgs84togcj02 } from 'coordtransform';
// import WholeContent from '@/components/PageHeaderWrapper/WholeContent';
// import BaseMap from '@/components/BaseMap';
import classNames from 'classnames';
import styles from './index.less';

// import { getTimeDistance } from '@/utils/utils';

// import styles from './Analysis.less';

class Trace extends Component {
  state = {
    playing: false,
    step: -1,
  };

  componentDidMount() {
    const { map, trace, clusterLayer } = this.props;
    // traceLayer.clear();
    clusterLayer.clear();
    if (Array.isArray(trace)) {
      // 绘制轨迹线
      const polyline = trace.map(item =>
        G.Proj.WebMercator.project(Number(item.LON), Number(item.LAT))
      );
      // 该图形用于计算bbox, 并不渲染
      const traceLine = new G.Graphic.Polyline(
        polyline,
        {},
        {
          lineColor: '#40a9ff',
          lineOpacity: 0.6,
        }
      );
      // traceLine.addTo(traceLayer);

      // 绘制相关基站点
      trace.forEach(item => {
        const gcjcoor = wgs84togcj02(Number(item.LON), Number(item.LAT));
        const coor = gcj02tobd09(gcjcoor[0], gcjcoor[1]);
        const point = new G.Graphic.Point(
          G.Proj.WebMercator.project(coor[0], coor[1]),
          {
            ...item,
          },
          {
            shape: 'image',
            size: [40, 44],
            offset: [-20, -44],
            image: '/marker.png',
            clickable: true,
          }
        );
        clusterLayer.addPoint(point);
      }, []);
      // 重新缩放地图范围
      map.zoomExtent(traceLine.bbox);
    }
  }

  componentDidUpdate() {
    const { trace, traceLayer, map } = this.props;
    const { step } = this.state;
    const item = trace[step];
    const preItem = trace[step - 1];
    if (item) {
      const coor = G.Proj.WebMercator.project(Number(item.LON), Number(item.LAT));
      map.centerAt(coor);
      traceLayer.clear();

      if (preItem && preItem.ADDRESS !== item.ADDRESS) {
        // 上一轨迹点所在位置
        new G.Graphic.Point(
          G.Proj.WebMercator.project(Number(preItem.LON), Number(preItem.LAT)),
          {},
          {
            shape: 'image',
            size: [40, 44],
            offset: [-20, -44],
            image: '/marker.png',
            clickable: true,
          }
        ).addTo(traceLayer);
        new G.Graphic.Point(
          G.Proj.WebMercator.project(Number(preItem.LON), Number(preItem.LAT)),
          {},
          {
            shape: 'text',
            size: [16],
            offset: [0, -27],
            text: step,
            textColor: '#fff',
          }
        ).addTo(traceLayer);

        // 最近一次移动的OD线
        const ODLine = new G.Graphic.OD(
          [G.Proj.WebMercator.project(Number(preItem.LON), Number(preItem.LAT)), coor],
          null,
          {
            curvature: 0.4,
            lineWidth: 4,
            // lineDashArray: [20, 20],
            lineColor: '#1890ff',
            symbol: 'arrow',
            symbolSize: 2,
          }
        );
        ODLine.addTo(traceLayer);
      }

      // 当前轨迹点所在位置
      new G.Graphic.Point(
        G.Proj.WebMercator.project(Number(item.LON), Number(item.LAT)),
        {},
        {
          shape: 'image',
          size: [40, 44],
          offset: [-20, -44],
          image: '/marker.png',
          clickable: true,
        }
      ).addTo(traceLayer);
      new G.Graphic.Point(
        coor,
        {},
        {
          shape: 'text',
          size: [16],
          offset: [0, -27],
          text: step + 1,
          textColor: '#fff',
        }
      ).addTo(traceLayer);
      // 调整滚动条，使当前轨迹信息在视图窗口当中。
      const offset = this.timeline.children[0].children[step].offsetTop;
      if (
        offset < this.timeline.scrollTop ||
        offset > this.timeline.scrollTop + this.timeline.clientHeight
      ) {
        this.timeline.scrollTo(this.timeline.scrollLeft, (step - 1) * 61.33);
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    const { traceLayer, clusterLayer } = this.props;
    traceLayer.clear();
    clusterLayer.clear();
  }

  play = () => {
    const { trace } = this.props;
    const next = () => {
      const { step } = this.state;
      const newStep = (step + 1) % trace.length;
      this.setState({ step: newStep });
    };
    next();
    this.interval = setInterval(next, 2000);
    this.setState({ playing: true });
  };

  pause = () => {
    clearInterval(this.interval);
    this.setState({ playing: false });
  };

  render() {
    const { trace, onClose } = this.props;
    const { playing, step } = this.state;
    return (
      <div className={classNames(styles.result, styles.panel)}>
        <header>
          <span onClick={onClose}>
            <Icon type="close" key="close" />
          </span>
        </header>
        {/* <Divider style={{ marginRight: '20px' }} /> */}
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
          {trace ? (
            <Timeline>
              {trace.map(({ ADDRESS, TIMESTR }, index) => (
                <Timeline.Item
                  key={TIMESTR}
                  color={step === index ? 'blue' : '#dfe3e6'}
                  className={step === index ? styles.active : ''}
                  onClick={() => {
                    this.setState({ step: index });
                  }}
                >
                  <div style={{ cursor: 'pointer' }}>{ADDRESS}</div>
                  <div style={{ cursor: 'pointer' }}>{TIMESTR}</div>
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            <div>暂无数据</div>
          )}
        </div>
      </div>
    );
  }
}

export default Trace;
