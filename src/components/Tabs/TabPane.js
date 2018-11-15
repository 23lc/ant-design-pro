import React, { Component } from 'react';
import styles from './TabPane.less';

class TabPane extends Component {
  // constructor(props) {
  //   super(props);
  // }

  state = {};

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    const { children, style } = this.props;
    return (
      <div className={styles['tab-pane']} style={style || {}}>
        {children}
      </div>
    );
  }
}

export default TabPane;
