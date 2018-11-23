import React from 'react';
import { List, Tag } from 'antd';

import styles from './index.less';

const PoliceCaseList = ({ dataSource, onItemClick }) => (
  <List
    dataSource={dataSource}
    renderItem={({ a, c }, index) => (
      <List.Item
        key={c.KID}
        className={styles.card}
        onClick={() => {
          if (onItemClick) {
            onItemClick({ a, c, index });
          }
        }}
      >
        <div className={styles.index}>
          <div className={styles.marker}>{index + 1}</div>
        </div>
        <div className={styles.content}>
          <header>{c.AJMC}</header>
          <div>{a.CJDW}</div>
          <time>{c.ASJFSSJ_ASJFSKSSJ}</time>
          <address>{c.ASJFSDD_DZMC}</address>
        </div>
        <div className={styles.tags}>
          {['刑事案件', '特重大', '指挥'].map(tag => (
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
