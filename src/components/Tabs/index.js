import React, { Component } from 'react';
import classNames from 'classnames';
import TabPane from './TabPane';
import styles from './index.less';

class Tabs extends Component {
  static TabPane = TabPane;
  // constructor(props) {
  //   super(props);
  // }

  static defaultProps = {
    mode: 'left',
  };

  state = {
    selectedKey: null,
  };

  componentDidMount() {}

  componentWillUnmount() {}

  handleClick = ({ key }) => {
    const { selectedKey } = this.state;
    this.setState({ selectedKey: selectedKey === key ? null : key });
  };

  render() {
    let { children } = this.props;
    const { mode } = this.props;
    const { selectedKey } = this.state;
    if (children === undefined) {
      children = [];
    } else {
      children = Array.isArray(children) ? children : [children];
    }
    const style = { flexDirection: 'row-reverse' };
    const offset = selectedKey === null ? '-376px' : '20px';
    if (mode === 'right') {
      style.flexDirection = 'row';
      style.right = offset;
    } else {
      style.left = offset;
    }
    return (
      <div className={styles.tabs} style={style}>
        <div className={styles['tab-bar']}>
          {children.map(item => (
            <div
              key={item.key}
              className={classNames(styles.tab, styles[`tabs-${mode}`])}
              style={{ marginTop: '5px' }}
              onClick={() => {
                this.handleClick(item);
              }}
            >
              {item.props.title}
            </div>
          ))}
        </div>
        {selectedKey !== null ? children.find(item => item.key === selectedKey) : <TabPane />}
      </div>
    );
  }
}

export default Tabs;
