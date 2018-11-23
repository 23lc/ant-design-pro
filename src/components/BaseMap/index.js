import React, { Component, Fragment } from 'react';
// import { List, Tag } from 'antd';
import 'geohey-javascript-sdk/dist/lib/g.css';
import G from 'geohey-javascript-sdk';
import 'geohey-javascript-sdk/dist/lib/g-canvas.min';
import 'geohey-javascript-sdk/dist/lib/g-draw.min';
import 'geohey-javascript-sdk/dist/lib/g-maps.min';
import Tabs from '@/components/Tabs';
import PoliceCaseList from '@/components/PoliceCaseList';
import Toolbar from './Toolbar';
import LayerPicker from './LayerPicker';

// import { getTimeDistance } from '@/utils/utils';

import styles from './index.less';

// const MapContext = React.createContext('map');

class BaseMap extends Component {
  // constructor(props) {
  //   super(props);
  // }

  state = {
    map: null,
    graphicLayer: null,
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
        center: [11860868, 3446746], // 地图中心
        res: 305.74811 / 16, // 分辨率
        rotate: 0, // 旋转角度
      },
    });

    const tileLayer = new G.Layer.AMap('street');
    // const tileLayer = new G.Layer.Tile('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    //   cluster: ['a', 'b', 'c'],
    // });
    tileLayer.addTo(map);

    const graphicLayer = new G.Layer.Graphic();
    graphicLayer.addTo(map);
    this.setState({ map, graphicLayer });
  }

  componentWillUnmount() {
    const { map } = this.state;
    map.destroy();
    this.setState({ map: null, graphicLayer: null });
  }

  render() {
    const { map, graphicLayer } = this.state;
    const { toolbar, policeCaseList } = this.props;
    return (
      <Fragment>
        <div id="mapContainer" className={styles.mapContainer} />
        {map !== null && toolbar && <Toolbar {...this.state} {...toolbar} />}
        <Tabs mode="right" {...this.state}>
          <Tabs.TabPane
            title="警情列表"
            key="1"
            style={{ padding: '20px 8px', background: '#fff' }}
          >
            <PoliceCaseList
              dataSource={policeCaseList}
              onItemClick={({ a: { XZB, YZB }, index }) => {
                if (map) {
                  const gcjCoor = G.Proj.Gcj.project(Number(XZB), Number(YZB));
                  const coor = G.Proj.WebMercator.project(gcjCoor[0], gcjCoor[1]);
                  map.centerAt(coor);
                  graphicLayer.clear();
                  const point = new G.Graphic.Point(
                    coor,
                    {},
                    {
                      shape: 'image',
                      size: [40, 44],
                      offset: [-20, -44],
                      image: '/marker.png',
                      clickable: true,
                    }
                  );
                  const label = new G.Graphic.Point(
                    coor,
                    {},
                    {
                      shape: 'text',
                      size: [16],
                      offset: [0, -27],
                      text: index + 1,
                      textColor: '#fff',
                    }
                  );
                  point.addTo(graphicLayer);
                  label.addTo(graphicLayer);
                }
              }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane title="图层列表" key="2" style={{ padding: '20px 8px' }}>
            <LayerPicker />
          </Tabs.TabPane>
        </Tabs>
      </Fragment>
    );
  }
}

export default BaseMap;
