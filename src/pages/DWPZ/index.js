import React, { Component } from 'react';
import { connect } from 'dva';
import WholeContent from '@/components/PageHeaderWrapper/WholeContent';
import BaseMap from '@/components/BaseMap';

// import { getTimeDistance } from '@/utils/utils';

// import styles from './Analysis.less';

@connect(({ loading, global: { policeCaseList, layerList } }) => ({
  loading: loading.effects['chart/fetch'],
  policeCaseList,
  layerList,
}))
class DWPZ extends Component {
  // constructor(props) {
  //   super(props);
  // }

  state = {};

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/fetchPoliceCase',
    });
  }

  componentWillUnmount() {}

  onDrawEnd = () => {
    // todo: 新建一个节点对象
    // console.log(e);
  };

  render() {
    const { policeCaseList, layerList } = this.props;
    return (
      <WholeContent>
        <BaseMap
          policeCaseList={policeCaseList}
          layerList={layerList}
          toolbar={{
            onDrawEnd: this.onDrawEnd,
          }}
        />
      </WholeContent>
    );
  }
}

export default DWPZ;
