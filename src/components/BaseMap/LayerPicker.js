import React, { Component } from 'react';
import IconFont from '@/components/IconFont';
// import classNames from 'classnames';
// import G from 'geohey-javascript-sdk';

// import { getTimeDistance } from '@/utils/utils';

import styles from './LayerPicker.less';

class LayerPicker extends Component {
  // constructor(props) {
  //   super(props);
  // }

  static defaultProps = {
    layers: [
      {
        name: '基站',
        alias: 'basestation',
        color: '#1890ff',
      },
      {
        name: '电子围栏',
        alias: 'dzwl1',
        color: '#f5222d',
      },
      {
        name: '网吧',
        alias: 'netbar',
        color: '#fa8c16',
      },
      {
        name: '案件',
        alias: 'legal',
        color: '#a0d911',
      },
    ],
  };

  state = {
    status: {},
  };

  componentDidMount() {
    // todo: 监听所有图层，当地图范围发生变化后重新绘制数据
  }

  componentWillUnmount() {}

  render() {
    const { layers } = this.props;
    const { status } = this.state;
    return (
      <div className={styles.toolbar}>
        {layers.map(item => (
          <div
            className={styles.layer}
            key={item.alias}
            onClick={() => {
              status[item.alias] = !status[item.alias];
              if (status[item.alias]) {
                // todo: 添加图层
              } else {
                // todo: 移除图层
              }
              this.setState({ status });
            }}
          >
            <IconFont
              className={styles.icon}
              type={`icon-${item.alias}`}
              style={status[item.alias] ? { color: item.color, borderColor: item.color } : {}}
            />
            {item.name}
          </div>
        ))}
      </div>
    );
  }
}

export default LayerPicker;
