import React, { Component } from 'react';
import { Icon } from 'antd';
import 'geohey-javascript-sdk/dist/lib/g.css'; // 样式
import G from 'geohey-javascript-sdk';

// import { getTimeDistance } from '@/utils/utils';

import styles from './Toolbar.less';

class Toolbar extends Component {
  // constructor(props) {
  //   super(props);
  // }

  state = {};

  componentDidMount() {
    const { map } = this.props;
    this.drawLayer = new G.Layer.Draw();
    this.drawLayer.addTo(map);
    this.drawLayer.addListener('drawEnd', () => {
      // todo: 处理返回的数据，并调用回调函数
      this.drawLayer.endDraw();
    });
  }

  componentWillUnmount() {}

  render() {
    return (
      <div className={styles.toolbar}>
        <div className={styles.icon}>
          <Icon
            type="info-circle"
            data-tool="circle"
            title="绘制圆形"
            onClick={() => {
              this.drawLayer.startDraw('circle', { fillColor: '#f00' });
            }}
            style={{ fontSize: '22px' }}
          />
        </div>
        <div className={styles.icon}>
          <Icon
            type="stop"
            data-tool="normalrect"
            title="绘制矩形"
            onClick={() => {
              this.drawLayer.startDraw('normalrect', { fillColor: '#f00' });
            }}
            style={{ fontSize: '22px' }}
          />
        </div>
        <div className={styles.icon}>
          <Icon
            type="plus-square"
            data-tool="polygon"
            title="绘制多边形"
            onClick={() => {
              this.drawLayer.startDraw('polygon', { fillColor: '#f00' });
            }}
            style={{ fontSize: '22px' }}
          />
        </div>
      </div>
    );
  }
}

export default Toolbar;
