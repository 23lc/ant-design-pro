import React, { Component } from 'react';
import { connect } from 'dva';
import WholeContent from '@/components/PageHeaderWrapper/WholeContent';
import BaseMap from '@/components/BaseMap';

// import { getTimeDistance } from '@/utils/utils';

// import styles from './Analysis.less';

@connect(({ loading }) => ({
  loading: loading.effects['chart/fetch'],
}))
class Analysis extends Component {
  // constructor(props) {
  //   super(props);
  // }

  state = {};

  componentDidMount() {}

  componentWillUnmount() {}

  onDrawEnd = e => {
    console.log(e);
  };

  render() {
    return (
      <WholeContent>
        <BaseMap
          toolbar={{
            onDrawEnd: this.onDrawEnd,
          }}
        />
      </WholeContent>
    );
  }
}

export default Analysis;
