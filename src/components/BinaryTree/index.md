---
title:
  en-US: BinaryTree
  zh-CN: 二叉树
subtitle: 通过svg构建的可扩展的二叉树组件，实现二叉树形式数据流的可视化
---

## 示例
```js
// *** 首先要在父组件或祖辈组件引入react-dnd包里的DragDropContext，并用该装饰器去包含
import { DragDropContext } from 'react-dnd';
@DragDropContext(TouchBackend({ enableMouseEvents: true }))
export default class Root extends Component {
  render() {
    return (
      <div className="root">
        <div className="left" />
        <App />
        <div className="right" />
      </div>
    );
  }
}

// *** 在需要的地方引入该组件
import Tree from 'components/BinaryTree';
import { Component } from 'react';

class App extends Component {
  render() {
    return (
      <Tree
        nodes={nodes}
        version={version}
        ref={(tree) => { this.Tree = tree; }}
        parentNodeType="JD02"
        onSelectNode={this.onSelectNode}
        onDragNode={onDragNode}
        clickDownArrow={this.clickDownArrow}
        clickUpArrow={this.clickUpArrow}
        http_add_node={this.http_add_node}
        http_update_node={this.http_update_node}
        http_delete_node={this.http_delete_node}
        editable
        nodeElement={Node}
        lineStyle={{ success: '#5c9ff6', error: 'rgba(255, 0, 0, 0.78)' }}
        targetStyle={{
          stroke: 'rgba(92, 159, 246, 0.43)',
          strokeWidth: 1,
          strokeDasharray: 3,
          fill: 'rgba(0, 0, 0, 0)',
          isoverStyle: {
            stroke: 'yellow',
            strokeDasharray: 0,
          },
        }}
      />
    );
  }
}

// *** 如果想从外部往树里增加节点，也要引入react-dnd去封装外部节点
import React, { Component } from 'react';
import { DragSource } from 'react-dnd';

const SvgSource = {
  beginDrag(props) {
    return props.info;
    // 这里return的值的数据结构，要和组件参数nodes的数据结构相等(必须有order_num, name, node_type)
  },
};
function collectSvg(connect_, monitor) {
  return {
    connectDragSource: connect_.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

@DragSource('BinaryTree', SvgSource, collectSvg) // 'BinaryTree'不可更改，否则拖拽无效
export default class SvgContent extends Component {
  render() {
    const { connectDragSource } = this.props;
    return connectDragSource(
      <div>

      </div>
    );
  }
}
```
## API
``` js
params = {
  /*  
    如果nodes为空数组，则会显示一个空的根节点，
    如果不是数组，则不显示任何节点
  */
  nodes: [
    {
      order_num: 1,
      node_type: 'JD02',
      // modes数组里每个元素必须有这两个字段，其余字段自定义
    },
  ],

  /*  
    如果想执行某些操作时自动更新nodes，需要在更新时改变传入的version。
    version可以为任意值，建议以Number形式递增
  */
  version: 0,

  // 为了区分“关系节点”和“资源节点”，parentNodeType代表“关系节点”的标识符
  parentNodeType: 'JD02',

  // 节点的onClick事件，会调用传入的函数，并将节点的info作为函数的参数
  onSelectNode: (info) => {
    console.log(info);
  },

  // 节点的onMouseDown事件，会调用传入的函数，参数为(事件对象、节点info，节点的dom元素，画板的缩放比例)
  onDragNode: (e, info, dom, scale = 1) => {
    自定义拖拽动效
  },

  // 根节点“下箭头”的onClick事件
  clickDownArrow: () => {
    // 可以在此调用Tree示例里的rootBecomeChild方法
    this.Tree.rootBecomeChild();
  },

  // 关系节点“上箭头”的onClick事件
  clickDownArrow: () => {
    // 可以在此调用Tree示例里的childBecomeRoot方法
    this.Tree.childBecomeRoot();
  },

  // 把外部节点添加到树里
  http_add_node: (info, callback) => {
    request(params).then((response) => {
      if (response正确) {
        // 根据response修改info，callback里传入新的info（若不需要修改就直接传入原info）
        callback(newInfo); // callback必须要调用！为了在更新服务端数据成功后，更新页面UI的数据
      }
    });
  },

  // 更改节点的属性
  http_update_node: (info, pre_order_num, callback) => {
    request(params).then((response) => {
      if (response正确 && callback) {
        callback(); // 如果有callback, 则必须要调用！为了在更新服务端数据成功后，更新页面UI的数据
      }
    });
  },

  // 删除节点
  http_delete_node: (info, callback) => {
    request(params).then((response) => {
      if (response正确 && callback) {
        callback(); // 如果有callback, 则必须要调用！为了在更新服务端数据成功后，更新页面UI的数据
      }
    });
  },

  // 控制树是否能被操作，默认为true。如果为false，则只能拖动、缩放、以及触发节点的onClick事件
  editable: true,

  /*
    节点组件，会接收到两个参数，info和parentNodeType。
    可以是function类型的组件，也可以是class类型的组件
  */
  nodeElement: (props) => {
    const { info, parentNodeType } = props;
    return <svg></svg>;
  },

  // 节点连线的颜色
  lineStyle: {
    success: '有效的颜色',
    error: '无效的颜色',
  },

  // 空节点的样式，可以写任何svg支持的样式属性
  targetStyle: {
    normalStyle: {}, // 正常情况下的样式
    isOverStyle: {}, // isOver时的样式(isOver：鼠标拖拽节点到target范围内时)
  },
};
```
关于react-dnd的API请参考react-dnd.github.io/react-dnd/docs-overview.html

参数 | 说明 | 类型 | 默认值
----|------|-----|------
children | 工具栏内容，向右对齐 | ReactNode | -
extra | 额外信息，向左对齐 | ReactNode | -