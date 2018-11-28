/*
 * @Author: zhaoyuyang
 * @Date: 2018-03-01 08:59:38
 * @Last Modified by: zhaoyuyang
 * @Last Modified time: 2018-05-25 09:06:35
 */

// 画板缩放比例，保留一位小数（最大值是1，最小值的0.3）
export function keepOneBit(num) {
  const scale = Math.round(num * 10) / 10;
  if (scale >= 1.0) {
    return 1;
  }
  if (scale <= 0.3) {
    return 0.3;
  }
  return scale;
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
