import React, { Component } from 'react';
import { connect } from 'dva';
import WholeContent from '@/components/PageHeaderWrapper/WholeContent';
import BaseMap from '@/components/BaseMap';
import ModelList from '@/components/ModelList';
import SJPZModel from './SJPZModel';
import FormPanel from './FormPanel';

// import { getTimeDistance } from '@/utils/utils';

import styles from './style.less';

@connect(({ global: { policeCaseList, layerList }, sjpz: { modelList, formPanel } }) => ({
  policeCaseList,
  layerList,
  modelList,
  formPanel,
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

  onDrawEnd = ({ graphic: { geom }, mode }) => {
    const { dispatch } = this.props;
    // const { graphicLayer } = this.basemap.state;
    // todo: 新建一个节点对象
    // e.graphic.addTo(graphicLayer);
    dispatch({
      type: 'sjpz/updateParams',
      payload: {
        formPanel: {
          geom,
          mode,
        },
      },
    });
  };

  create = () => {};

  render() {
    const {
      policeCaseList,
      layerList,
      modelList,
      formPanel,
      history: {
        location: {
          query: { modelId },
        },
      },
    } = this.props;
    return (
      <WholeContent>
        <BaseMap
          ref={basemap => {
            this.basemap = basemap;
          }}
          policeCaseList={policeCaseList}
          modelList={
            <ModelList
              type="simple"
              dataSource={modelList}
              policeCaseList={policeCaseList}
              onCreate={this.create}
              onPoliceCaseItemClick={this.basemap && this.basemap.lookUpPoliceCase}
            />
          }
          layerList={layerList}
          toolbar={modelId !== undefined && { onDrawEnd: this.onDrawEnd }}
        />
        {modelId !== undefined ? (
          <SJPZModel modelId={modelId} />
        ) : (
          <div className={styles.wrapper}>
            <ModelList
              type="normal"
              dataSource={modelList}
              policeCaseList={policeCaseList}
              onPoliceCaseItemClick={this.basemap && this.basemap.lookUpPoliceCase}
            />
          </div>
        )}
        {this.basemap && formPanel && <FormPanel graphicLayer={this.basemap.state.graphicLayer} />}
      </WholeContent>
    );
  }
}

export default DWPZ;
