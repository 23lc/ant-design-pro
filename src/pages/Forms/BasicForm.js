import React, { Component } from 'react';
import { connect } from 'dva';
import { Input, Button } from 'antd';
import WholeContent from '@/components/PageHeaderWrapper/WholeContent';
import BaseMap from '@/components/BaseMap';

// import { getTimeDistance } from '@/utils/utils';

import styles from './style.less';

@connect(({ loading }) => ({
  loading: loading.effects['chart/fetch'],
}))
class BasicForm extends Component {
  // constructor(props) {
  //   super(props);
  // }

  state = {};

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    return (
      <WholeContent>
        <BaseMap />
        <div className={styles.wrapper}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex' }}>
              <Input />
              <Button>导入</Button>
            </div>
            <Input />
            <Button>轨迹查询</Button>
          </div>
        </div>
      </WholeContent>
    );
  }
}

export default BasicForm;
