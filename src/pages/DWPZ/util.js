// 因为用html5的拖拽API（dragstart, drag, dragend系列）不支持svg元素，所以用mousedown和mousemove做拖拽，
// 这个插件的缺点是用这种方式会没有动画

// 拖拽动画
export function onDragNode(e, info, wrap, scale = 1) {
  let { width, height } = e.currentTarget.children[0].children[0].getBBox();
  if (e.currentTarget.children[0].tagName !== 'g') {
    width = e.currentTarget.children[0].clientWidth;
    height = e.currentTarget.children[0].clientHeight;
  }
  const diffX = (1 - scale) * (width / 2);
  const diffY = (1 - scale) * (height / 2);
  const halfWidth = (width * scale) / 2;
  const halfHeight = (height * scale) / 2;
  // const box = document.createElement('div');
  const box = e.currentTarget.cloneNode(true);
  box.setAttribute(
    'style',
    `
    height: ${height}px;
    width: ${width}px;
    text-align: center;
    border: 0px solid #ccc;
    border-radius: ${info && info.node_type === 'JD02' ? '50%' : 0};
    line-height: 24px;
    font-size: 12px;
    list-style: none;
    position: absolute;
    left: 0;
    top: 0;
    pointer-events: none;
    transform: scale(${scale});
    color: #8899ad;
    z-index: 99;
  `
  );

  // svg元素要用document.createElementNS。而且html字符串比document.create的性能要好
  // box.innerHTML = e.currentTarget.children[0].tagName === 'g' ? `
  //   <svg xmlns="http://www.w3.org/2000/svg" width="88" height="88">
  //     ${e.currentTarget.children[0].innerHTML}
  //   </svg>
  // ` : e.currentTarget.children[0].outerHTML;

  document.body.appendChild(box);
  box.style.opacity = 0;

  function moveDom(event) {
    box.style.opacity = 0.7;
    box.style.left = `${parseInt(event.pageX - diffX - halfWidth, 10)}px`;
    box.style.top = `${parseInt(event.pageY - diffY - halfHeight, 10)}px`;
  }
  function mouseUp() {
    document.body.removeEventListener('mousemove', moveDom);
    document.body.removeEventListener('mouseup', mouseUp);
    if (box.parentNode) {
      box.parentNode.removeChild(box);
    }
  }
  document.body.addEventListener('mousemove', moveDom);
  document.body.addEventListener('mouseup', mouseUp);
}

// 将案事件列表的一维数组转化成树状结构
export function formatEventList(response) {
  const obj = {};
  if (!Array.isArray(response) || response.length === 0) {
    return [];
  }
  response.forEach(value => {
    const value1 = value;
    // 删除空属性
    if (value.EVENT_ID) {
      Object.keys(value).forEach(key => {
        if (key.indexOf('MODEL') === 0) {
          delete value1[key];
        }
      });
      obj[value.EVENT_ID] = value;
      obj[value.EVENT_ID].children = [];
    } else {
      Object.keys(value).forEach(key => {
        if (key.indexOf('EVENT') === 0) {
          delete value1[key];
        }
      });
    }
  });
  response.forEach(value => {
    if (value.MODEL_EVENT_ID) {
      obj[value.MODEL_EVENT_ID].children.push(value);
    }
  });
  return Object.keys(obj).map(key => obj[key]);
}

export function mouseOverContainer(x, y, dom, callback) {
  if (!Number.isNaN(x) && !Number.isNaN(y) && dom && dom.getBoundingClientRect && callback) {
    const position = dom.getBoundingClientRect();
    if (
      Number(x) <= position.left ||
      Number(x) >= position.right ||
      Number(y) <= position.top ||
      Number(y) >= position.bottom
    ) {
      callback();
    }
  }
}
