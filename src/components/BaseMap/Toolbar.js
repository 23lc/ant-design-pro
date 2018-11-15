import React, { Component } from 'react';
import IconFont from '@/components/IconFont';
import classNames from 'classnames';
import G from 'geohey-javascript-sdk';

// import { getTimeDistance } from '@/utils/utils';

import styles from './Toolbar.less';

/**
 * 覆盖物的大小，设计两层控制。
 * 1、 warning: 超过此范围仍然可以录入，但是outline用dash代替，以示该覆盖物面积可能会影响性能
 * 2、 error: 超过此范围的覆盖物，将禁止录入。如果是圆形，将保持为临界线的半径；如果是多边形，将取消该次绘制操作。
 */

class Toolbar extends Component {
  // constructor(props) {
  //   super(props);
  // }

  static defaultProps = {
    maxRedius: 3000,
    maxArea: 300000,
  };

  state = {
    mode: null,
    radius: null,
  };

  componentDidMount() {
    const { map, graphicLayer, onDrawEnd } = this.props;
    this.drawLayer = new G.Layer.Draw();
    this.drawLayer.addTo(map);
    this.drawLayer.addListener('drawEnd', e => {
      const { radius, mode } = this.state;
      // todo: 处理返回的数据，并调用回调函数
      this.drawLayer.endDraw();
      onDrawEnd({
        ...e,
        radius,
        mode,
      });
      this.setState({ mode: null });
    });
    graphicLayer.bringToTop();
  }

  componentWillUnmount() {}

  handleDrawCircle = () => {
    const { maxRedius } = this.props;
    this.drawLayer.unbind('draw', this.handleDrawing);
    this.drawLayer.startDraw('circle', {
      fillColor: '#5c9ff6',
      outlineColor: '#5c9ff6',
      outlineWidth: 4,
    });
    this.setState({ mode: 'circle' });
    this.handleDrawing = e => {
      const { graphicLayer } = this.props;
      graphicLayer.clear();
      let radius = e.graphic.geom[2];

      // 设置警示半径阈值
      if (radius > maxRedius * 0.8 && !e.graphic.attrs.overflow) {
        e.graphic.updateOptions({
          outlineDashArray: [20],
        });
        e.graphic.updateAttrs({
          overflow: true,
        });
      }
      if (radius <= maxRedius * 0.8 && e.graphic.attrs.overflow) {
        e.graphic.updateOptions({
          outlineDashArray: [],
        });
        e.graphic.updateAttrs({
          overflow: false,
        });
      }

      // 设置半径上限
      if (radius > maxRedius && e.graphic.geom[2] !== maxRedius) {
        radius = maxRedius;
        e.graphic.updateGeom([e.graphic.geom[0], e.graphic.geom[1], maxRedius]);
      }
      // 用标签展示圆形区域半径
      const {
        graphic: { bbox },
      } = e;
      const label = new G.Graphic.Point(
        [bbox[2], (bbox[1] + bbox[3]) / 2],
        {},
        {
          shape: 'text',
          size: [14],
          fillColor: '#fff',
          clickable: true,
          fill: true,
          text: `${radius.toFixed(0)}米`,
          outline: true,
          outlineColor: '#5c9ff6',
        }
      );
      label.addTo(graphicLayer);
      this.setState({ radius: radius.toFixed(0) });
    };
    this.drawLayer.bind('draw', this.handleDrawing);
  };

  handleDrawRect = () => {
    this.drawLayer.unbind('draw', this.handleDrawing);
    this.drawLayer.startDraw('normalrect', { fillColor: '#5c9ff6', outlineColor: '#5c9ff6' });
    this.setState({ mode: 'normalrect' });
  };

  handleDrawPolygon = () => {
    this.drawLayer.unbind('draw', this.handleDrawing);
    this.drawLayer.startDraw('polygon', { fillColor: '#5c9ff6', outlineColor: '#5c9ff6' });
    this.setState({ mode: 'polygon' });
    // 计算多边形的面积
  };

  render() {
    const { mode } = this.state;
    return (
      <div className={styles.toolbar}>
        <div
          onClick={this.handleDrawCircle}
          className={classNames(
            styles.icon,
            mode === 'circle' ? styles['icon-selected'] : styles['icon-normal']
          )}
        >
          <IconFont
            type="icon-line"
            data-tool="circle"
            title="绘制圆形"
            style={{ fontSize: '22px' }}
          />
        </div>
        <div
          onClick={this.handleDrawRect}
          className={classNames(
            styles.icon,
            mode === 'normalrect' ? styles['icon-selected'] : styles['icon-normal']
          )}
        >
          <IconFont
            type="icon-rect"
            data-tool="normalrect"
            title="绘制矩形"
            style={{ fontSize: '22px' }}
          />
        </div>
        <div
          onClick={this.handleDrawPolygon}
          className={classNames(
            styles.icon,
            mode === 'polygon' ? styles['icon-selected'] : styles['icon-normal']
          )}
        >
          <IconFont
            type="icon-polygon"
            data-tool="polygon"
            title="绘制多边形"
            style={{ fontSize: '22px' }}
          />
        </div>
      </div>
    );
  }
}

export default Toolbar;
