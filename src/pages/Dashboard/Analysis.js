import React, { Component } from 'react';
import { connect } from 'dva';
import 'geohey-javascript-sdk/dist/lib/g.css'; // 样式
import WholeContent from '@/components/PageHeaderWrapper/WholeContent';
import BaseMap from '@/components/BaseMap';

// import { getTimeDistance } from '@/utils/utils';

// import styles from './Analysis.less';

@connect(({ chart, loading }) => ({
  chart,
  loading: loading.effects['chart/fetch'],
}))
class Analysis extends Component {
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
      </WholeContent>
    );
  }
}

export default Analysis;
