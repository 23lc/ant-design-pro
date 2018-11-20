import React from 'react';
import { List, Tag } from 'antd';

import styles from './index.less';

const PoliceCaseList = ({ dataSource }) => (
  <List
    dataSource={dataSource}
    renderItem={(item, index) => (
      <List.Item key={item.key} className={styles.card}>
        <div className={styles.index}>
          <div className={styles.marker}>{index + 1}</div>
        </div>
        <div className={styles.content}>
          <header>{item.title}</header>
          <div>{item.org}</div>
          <time>{item.time}</time>
          <address>{item.address}</address>
        </div>
        <div className={styles.tags}>
          {item.tags.map(tag => (
            <Tag key={tag} style={{ textAlign: 'center', margin: '5px' }}>
              {tag}
            </Tag>
          ))}
        </div>
      </List.Item>
    )}
  />
);

export default PoliceCaseList;
