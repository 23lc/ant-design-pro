import React, { Component } from 'react';
import { connect } from 'dva';
import WholeContent from '@/components/PageHeaderWrapper/WholeContent';
import BaseMap from '@/components/BaseMap';
import SJPZModel from './SJPZModel';
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

  create = () => {};

  render() {
    const {
      policeCaseList,
      layerList,
      modelList,
      history: {
        location: {
          query: { model },
        },
      },
    } = this.props;
    return (
      <WholeContent>
        <BaseMap
          policeCaseList={policeCaseList}
          modelList={<List type="simple" dataSource={modelList} onCreate={this.create} />}
          layerList={layerList}
          toolbar={{
            onDrawEnd: this.onDrawEnd,
          }}
        />
        {model ? (
          <SJPZModel />
        ) : (
          <div className={styles.wrapper}>
            <List type="normal" dataSource={modelList} />
          </div>
        )}
      </WholeContent>
    );
  }
}

export default DWPZ;
