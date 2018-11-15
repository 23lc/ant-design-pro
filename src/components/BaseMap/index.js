import React, { Component, Fragment } from 'react';
// import { Tabs } from 'antd';
import 'geohey-javascript-sdk/dist/lib/g.css';
import G from 'geohey-javascript-sdk';
import 'geohey-javascript-sdk/dist/lib/g-canvas.min';
import 'geohey-javascript-sdk/dist/lib/g-draw.min';
import Tabs from '@/components/Tabs';
import Toolbar from './Toolbar';

// import { getTimeDistance } from '@/utils/utils';

import styles from './index.less';

// const MapContext = React.createContext('map');

class BaseMap extends Component {
  // constructor(props) {
  //   super(props);
  // }

  state = {
    map: null,
  };

  componentDidMount() {
    const map = new G.Map('mapContainer', {
      minRes: 0.298582, // 地图最小分辨率
      maxRes: 156543.033928, // 地图最大分辨率
      maxExtent: [-20037508.342784, -20037508.342784, 20037508.342784, 20037508.342784],
      zoomAnim: true, // 缩放时是否支持动画效果
      panAnim: true, // 拖拽时是否支持惯性移动
      hideLogo: true, // 是否隐藏Logo
      recordStatus: false, // 是否在浏览器历史中记录每一次更新的状态
      wrap: true, // 是否显示环绕地图
      continuouslyZoom: false, // 是否允许无极缩放
      initStatus: {
        // 地图初始状态
        center: [12673975, 4079823], // 地图中心
        res: 4891.9698105, // 分辨率
        rotate: 0, // 旋转角度
      },
    });

    const tileLayer = new G.Layer.Tile('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      cluster: ['a', 'b', 'c'],
    });
    tileLayer.addTo(map);
    this.setState({ map });
  }

  componentWillUnmount() {}

  render() {
    const { map } = this.state;
    return (
      <Fragment>
        <div id="mapContainer" className={styles.mapContainer} />
        {map !== null && <Toolbar map={map} />}
        <Tabs mode="right">
          <Tabs.TabPane title="警情列表" key="1">
            111
          </Tabs.TabPane>
          <Tabs.TabPane title="图层列表" key="2">
            222
          </Tabs.TabPane>
        </Tabs>
      </Fragment>
    );
  }
}

export default BaseMap;
