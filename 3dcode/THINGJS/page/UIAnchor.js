/**
 * UIAnchor 界面锚点
 * 将界面元素的 dom 节点挂接在 3D 场景中某个位置或物体上
 * @class
 */
class UIAnchor {
  /**
   * 设置/获取锚点位置
   * @type {Array<Number>} 
   */
  pivot;

  /**
   * 设置/获取锚点像素位置
   * @type {Array<Number>}
   */
  pivotPixel;

  /**
   * 设置/获取可见性
   * @type {Boolean}
   * @example
   * uiAnchor.visible = false;
   */
  visible;

  /**
   * 锁定 DOM 的 zIndex 数值
   * @type {Number}
   */
  zIndex;

  /**
   * 销毁 UIAnchor
   * @example
   * uiAnchor.destroy();
   */
  destroy() {}
}

export default UIAnchor;

// 创建示例代码
var uiAnchor = app.create({
  type: 'UIAnchor',
  element: domElement, // 界面元素的 dom 节点
  parent: obj, // 绑定的父物体
  localPosition: [0, 2, 0],// 在父物体坐标系下锚点放置的相对位置
  pivot: [0.5, 1] // 界面的轴心，以百分比表示界面轴心位置。[0,0] 代表界面左上；[1,1] 代表界面右下
});