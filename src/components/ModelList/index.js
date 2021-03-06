import React, { Component } from 'react';
// import { connect } from 'dva';
import { List, Switch, Button, Badge } from 'antd';
import HeaderSearch from '@/components/HeaderSearch';
import moment from 'moment';
import router from 'umi/router';
// import G from 'geohey-javascript-sdk';
// import WholeContent from '@/components/PageHeaderWrapper/WholeContent';
// import BaseMap from '@/components/BaseMap';
import classNames from 'classnames';
import styles from './index.less';

class ModelList extends Component {
  state = {
    keyword: '',
  };

  componentDidMount() {}

  componentDidUpdate() {}

  componentWillUnmount() {}

  render() {
    const { dataSource, type, policeCaseList, onPoliceCaseItemClick } = this.props;
    const { keyword } = this.state;
    return (
      <div className={classNames(styles.list, styles[type])}>
        {type === 'normal' && (
          <header>
            <span style={{ lineHeight: '40px' }}>我的研判模型({dataSource.length})</span>
            <div>
              <span className={styles.close}>{/* <Icon type="close" /> */}</span>
              <HeaderSearch
                value={keyword}
                onChange={e => {
                  this.setState({ keyword: e });
                }}
              />
            </div>
          </header>
        )}
        {
          <List
            dataSource={dataSource.filter(item => item.name.indexOf(keyword) > -1)}
            renderItem={item => (
              <List.Item
                key={item.id}
                className={styles.card}
                onClick={() => {
                  router.push(`/DWPZ?modelId=${item.id}`);
                }}
              >
                <header>
                  <div>{item.name}</div>
                </header>
                <div>
                  <div>模型描述: {item.name}</div>
                  <div>研判结果: {item.result}</div>
                  <div>
                    相关案件:{' '}
                    {policeCaseList &&
                      item.related_case.split(',').map(caseId => {
                        const index = policeCaseList.findIndex(({ c }) => caseId === c.ASJBH);
                        const policeCase = policeCaseList[index];
                        return (
                          <a
                            key={caseId}
                            onClick={e => {
                              e.stopPropagation();
                              onPoliceCaseItemClick({ ...policeCase, index });
                            }}
                          >
                            {policeCase.c.AJMC}
                          </a>
                        );
                      })}
                  </div>
                  <div>研判时间: {moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}</div>
                  <div>研判人员: {item.create_user}</div>
                  <div>
                    是否共享: <Switch checked={item.shared} disabled />
                  </div>
                </div>
                <div className={classNames(styles.status, styles[`status-${item.status}`])}>
                  <Badge status={item.status} style={{ verticalAlign: 'baseline' }} />
                  {item.status === 'default' && '未开始'}
                  {item.status === 'processing' && '执行中'}
                  {item.status === 'success' && '执行成功'}
                  {item.status === 'error' && '执行失败'}
                </div>
                {item.status === 'success' && (
                  <Button
                    type="primary"
                    size="small"
                    className={styles.entry}
                    onClick={e => {
                      e.stopPropagation();
                      router.push(`/DWPZ/${item.id}`);
                    }}
                  >
                    查看结果
                  </Button>
                )}
              </List.Item>
            )}
          />
        }
        {type === 'simple' && (
          <Button
            type="primary"
            size="large"
            style={{ marginTop: '10px' }}
            onClick={() => {
              router.push(`/DWPZ?modelId=`);
              // onCreate();
            }}
            block
          >
            新建研判模型
          </Button>
        )}
      </div>
    );
  }
}

export default ModelList;
