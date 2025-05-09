/**
 * SelectorStyle 物体效果处理集合
 * 提供物体效果处理的能力
 * @class
 */
class SelectorStyle {
  /**
   * 设置是否始终在最前端渲染显示
   * @type {Boolean}
   */
  alwaysOnTop;

  /**
   * 显示/隐藏包围盒
   * @type {Boolean}
   */
  boundingBox;

  /**
   * 设置包围盒颜色
   * @type {Number|String}
   */
  boundingBoxColor;

  /**
   * 设置颜色，可填写十六进制颜色值或 RGB 字符串，设置为 null，可取消颜色
   * @type {Number|String}
   * @example
   * var sel = app.query('.Thing');
   * // 使用十六进制颜色
   * sel.style.color = '#ff0000';
   * // 使用 RGB 颜色
   * sel.style.color = 'rgb(255,0,0)';
   */
  color;

  /**
   * 设置不透明度 0 为全透明，1 为不透明
   * @type {Number}
   * @example
   * var sel = app.query('.Thing');
   * sel.style.opacity = 0.8;
   */
  opacity;

  /**
   * 设置勾边颜色，颜色可填写十六进制颜色值或 RGB 字符串，设置为 null，可取消勾边颜色
   * @type {Number|String}
   * @example
   * var sel = app.query('.Thing');
   * // 使用十六进制颜色
   * sel.style.outlineColor = '#ff0000';
   * // 使用 RGB 颜色
   * sel.style.outlineColor = 'rgb(255,0,0)';
   */
  outlineColor;

  /**
   * 设置渲染排序值，数值越小越优先渲染
   * @type {Number}
   */
  renderOrder;

  /**
   * 忽略包围盒计算
   * @type {Boolean}
   */
  skipBoundingBox;

  /**
   * 忽略/禁用勾边
   * @type {Boolean}
   */
  skipOutline;

  /**
   * 开启/关闭线框模式
   * @type {Boolean}
   */
  wireframe;
}

export default SelectorStyle;