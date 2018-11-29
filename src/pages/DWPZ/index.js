import React, { Component } from 'react';
import { connect } from 'dva';
import WholeContent from '@/components/PageHeaderWrapper/WholeContent';
import BaseMap from '@/components/BaseMap';
import List from './list';

// import { getTimeDistance } from '@/utils/utils';

import styles from './style.less';

@connect(({ loading, global: { policeCaseList, layerList }, sjpz: { modelList } }) => ({
  loading: loading.effects['chart/fetch'],
  policeCaseList,
  layerList,
  modelList,
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
    dispatch({
      type: 'sjpz/fetchModelList',
    });
  }

  componentWillUnmount() {}

  onDrawEnd = () => {
    // todo: 新建一个节点对象
    // console.log(e);
  };

  render() {
    const { policeCaseList, layerList, modelList } = this.props;

    return (
      <WholeContent>
        <BaseMap
          policeCaseList={policeCaseList}
          layerList={layerList}
          toolbar={{
            onDrawEnd: this.onDrawEnd,
          }}
        />
        <div className={styles.wrapper}>{<List dataSource={modelList} />}</div>
      </WholeContent>
    );
  }
}

export default DWPZ;
