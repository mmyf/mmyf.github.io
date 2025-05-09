/**
 * BaseStyle 物体样式基类
 * 提供基础物体对象样式效果的设置能力
 * @class
 */
class BaseStyle {
  /**
   * 设置物体是否始终在最前端渲染显示
   * @type {Boolean}
   * @note 当alwaysOnTop设置为true，此时如果使用带有发光的效果模板，或者在地球级别上开启了发光效果，那么发光效果不会被遮挡
   */
  alwaysOnTop;

  /**
   * 显示/隐藏物体包围盒
   * @type {Boolean}
   */
  boundingBox;

  /**
   * 设置包围盒颜色
   * @type {Number|String}
   */
  boundingBoxColor;

  /**
   * 设置/获取物体颜色，可填写十六进制颜色值或 RGB 字符串，设置为 null，可取消颜色
   * @type {Number|String}
   * @example
   * // 使用十六进制颜色
   * obj.style.color = '#ff0000';
   * // 使用 RGB 颜色
   * obj.style.color = 'rgb(255,0,0)';
   * // 取消颜色
   * obj.style.color = null;
   */
  color;

  /**
   * 设置双面渲染
   * @type {Boolean}
   */
  doubleSide;

  /**
   * 设置/获取材质自发光颜色
   * @type {Number|String}
   * @example
   * obj.style.emissive = '#ffff00';
   */
  emissive;

  /**
   * 设置/获取材质自发光滚动贴图。 最终的发光结果会乘以 emissive 的颜色。如果想让发光贴图生效，需要确认 emissive 不是黑色
   * @type {String}
   * @example
   * obj.style.emissiveScrollImage = 'https://www.thingjs.com/static/images/avatar.png';
   */
  emissiveScrollImage;

  /**
   * 设置/获取反射贴图
   * @type {String|Array<String>}
   * @example
   * obj.style.environmentImage = 'BlueSky';
   */
  environmentImage;

  /**
   * 设置/获取高亮颜色，默认值为 null
   * @type {String|Number}
   * @example
   * obj.style.highlight = '#ffff00';
   */
  highlight;

  /**
   * 设置/获取高亮强度，默认为 0.5。设置为 null，则等效于恢复到 0.5。 如果高亮颜色为 null，则该属性没有实际效果
   * @type {Number}
   * @example
   * obj.style.highlightIntensity = 0.8;
   */
  highlightIntensity;

  /**
   * 设置贴图，填写图片资源路径或 image 对象
   * @type {String|Object}
   * @example
   * // 使用图片路径
   * obj.style.image = 'https://www.thingjs.com/static/images/avatar.png';
   */
  image;

  /**
   * 材质金属度系数
   * @type {Number}
   */
  metalness;

  /**
   * 设置/获取物体不透明度，0 为全透明，1 为不透明
   * @type {Number}
   * @example
   * obj.style.opacity = 0.8;
   */
  opacity;

  /**
   * 设置/获取物体勾边颜色，颜色可填写十六进制颜色值或 RGB 字符串。设置为 null，可取消勾边颜色
   * @type {Number|String}
   * @example
   * // 使用十六进制颜色
   * obj.style.outlineColor = '#ff0000';
   * // 使用 rgb 颜色
   * obj.style.outlineColor = 'rgb(255,0,0)';
   * // 取消勾边颜色
   * obj.style.outlineColor = null;
   */
  outlineColor;

  /**
   * 设置/获取渲染排序值, 数值越小越先渲染，默认值为 0
   * @type {Number}
   */
  renderOrder;

  /**
   * 设置材质粗糙度系数
   * @type {Number}
   */
  roughness;

  /**
   * 开启/禁用勾边
   * @type {Boolean}
   */
  skipOutline;

  /**
   * 开启/关闭线框模式
   * @type {Boolean}
   */
  wireframe;
}

export default BaseStyle;