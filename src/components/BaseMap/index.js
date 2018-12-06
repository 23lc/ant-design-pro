/* eslint-disable no-underscore-dangle */
import React, { Component, Fragment } from 'react';
// import { List, Tag } from 'antd';
import 'geohey-javascript-sdk/dist/lib/g.css';
import G from 'geohey-javascript-sdk';
import 'geohey-javascript-sdk/dist/lib/g-canvas.min';
import 'geohey-javascript-sdk/dist/lib/g-draw.min';
import 'geohey-javascript-sdk/dist/lib/g-maps.min';
import 'geohey-javascript-sdk/dist/lib/g-cluster.min';
import Tabs from '@/components/Tabs';
import PoliceCaseList from '@/components/PoliceCaseList';
import Toolbar from './Toolbar';
import LayerPicker from './LayerPicker';
import PoliceCasePanel from './PoliceCasePanel';

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
    traceLayer: null,
    clusterLayer: null,
    htmlLayer: null,
    htmlId: null,
    policeCase: null,
    policeCaseMarkerLayer: null,
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

    // 用于显示基站轨迹聚类图的图层
    const clusterLayer = new G.Layer.Cluster({
      breakValues: [30, 50, 100],
      clusterClickable: true,
      pointClickable: true,
    });
    // clusterLayer.bind('graphicOver', (e) => {
    //   console.log(e);
    // });
    clusterLayer.addTo(map);

    // 用于临时显示单个标记物的图层
    const graphicLayer = new G.Layer.Graphic();
    graphicLayer.addTo(map);

    // 用于临时显示单个标记物的图层
    const policeCaseMarkerLayer = new G.Layer.Graphic();
    policeCaseMarkerLayer.addTo(map);
    policeCaseMarkerLayer.bind('graphicClicked', this.policeCaseMarkerClick);

    // 用于显示轨迹的图层
    const traceLayer = new G.Layer.Graphic();
    traceLayer.addTo(map);

    const htmlLayer = new G.Layer.Html();
    htmlLayer.addTo(map);

    this.setState({
      map,
      graphicLayer,
      traceLayer,
      clusterLayer,
      htmlLayer,
      policeCaseMarkerLayer,
    });
  }

  componentWillUnmount() {
    const { map } = this.state;
    map.destroy();
    this.setState({
      map: null,
      graphicLayer: null,
      traceLayer: null,
      clusterLayer: null,
      htmlLayer: null,
      policeCaseMarkerLayer: null,
    });
  }

  lookUpPoliceCase = e => {
    this.tabs.setState({ selectedKey: '1' });
    this.onPoliceCaseItemClick(e);
  };

  onPoliceCaseItemClick = ({ a, c, index }) => {
    const { map, policeCaseMarkerLayer } = this.state;
    const { XZB, YZB } = a;
    if (map) {
      const gcjCoor = G.Proj.Gcj.project(Number(XZB), Number(YZB));
      const coor = G.Proj.WebMercator.project(gcjCoor[0], gcjCoor[1]);
      map.centerAt(coor);
      policeCaseMarkerLayer.clear();
      const point = new G.Graphic.Point(
        coor,
        { a, c },
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
          clickable: false,
        }
      );
      point.addTo(policeCaseMarkerLayer);
      label.addTo(policeCaseMarkerLayer);

      // if (this.handleGraphicClick) {
      //   policeCaseMarkerLayer.unbind('graphicClicked', this.handleGraphicClick);
      // }

      // this.handleGraphicClick = e => {
      // };
    }
    this.setState({ htmlId: null, policeCase: null });
  };

  policeCaseMarkerClick = e => {
    const { htmlLayer } = this.state;
    const coor = e.graphic.geom;
    const id = htmlLayer.addHtml(
      `<div id="htmllayer_${new Date().getTime()}"></div>`,
      coor[0],
      coor[1]
    );
    this.setState({ htmlId: id, policeCase: e.graphic.attrs });
  };

  render() {
    const { map, htmlLayer, htmlId, policeCase } = this.state;
    const { toolbar, policeCaseList, modelList } = this.props;
    return (
      <Fragment>
        <div id="mapContainer" className={styles.mapContainer} />
        {map !== null && toolbar && <Toolbar {...this.state} {...toolbar} />}
        <Tabs
          ref={tabs => {
            this.tabs = tabs;
          }}
          mode="right"
          {...this.state}
        >
          <Tabs.TabPane
            title="警情列表"
            key="1"
            style={{ padding: '20px 8px', background: '#fff' }}
          >
            <PoliceCaseList dataSource={policeCaseList} onItemClick={this.onPoliceCaseItemClick} />
          </Tabs.TabPane>
          <Tabs.TabPane title="图层列表" key="2" style={{ padding: '20px 8px' }}>
            <LayerPicker />
          </Tabs.TabPane>
        </Tabs>
        {htmlId !== null && (
          <PoliceCasePanel
            el={htmlLayer.getHtml(htmlId)}
            policeCase={policeCase}
            modelList={modelList}
            onClose={() => {
              this.setState({ htmlId: null, policeCase: null });
            }}
          />
        )}
      </Fragment>
    );
  }
}

export default BaseMap;
