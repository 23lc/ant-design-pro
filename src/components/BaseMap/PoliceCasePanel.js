import React, { Component } from 'react';
import { Divider, Icon } from 'antd';
import ReactDOM from 'react-dom';
import styles from './PoliceCasePanel.less';

class PoliceCasePanel extends Component {
  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    const {
      el,
      policeCase: { a, c },
      modelList,
      onClose,
    } = this.props;
    return ReactDOM.createPortal(
      <div className={styles.wrapper}>
        <div style={{ height: '20px' }}>
          <span className={styles.close} onClick={onClose}>
            <Icon type="close" />
          </span>
        </div>
        <div>
          <div>
            <b>案件名称: </b>
            {c.AJMC}
          </div>
          <div>
            <b>案发时间: </b>
            {c.ASJFSSJ_ASJFSKSSJ}
          </div>
          <div>
            <b>案件地点: </b>
            {c.ASJFSDD_DZMC}
          </div>
          <div>
            <b>案件类型: </b>
            刑事案件, 特重大
          </div>
          <div>
            <b>组织机构: </b>
            {a.CJDW}
          </div>
          <div>
            <b>简要案情: </b>
            {a.SJXQ}
          </div>
        </div>
        <Divider />
        {modelList}
      </div>,
      el
    );
  }
}

export default PoliceCasePanel;
