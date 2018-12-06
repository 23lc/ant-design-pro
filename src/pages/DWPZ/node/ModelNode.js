import React, { PureComponent } from 'react';

import classNames from 'classnames';
import styles from './style.less';

class ModelNode extends PureComponent {
  render() {
    const { name, onClick } = this.props;
    return (
      <div className={classNames(styles.node, styles.model_node)} onClick={onClick}>
        {name}
      </div>
    );
  }
}
export default ModelNode;
