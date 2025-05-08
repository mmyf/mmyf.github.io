/**
 * @class THING.PolygonRegionStyle
 * @extends THING.BaseStyle
 * @description 区域样式类,提供区域样式效果功能
 */
class PolygonRegionStyle {
  /**
   * 设置/获取区域勾边颜色
   * @type {Number|String} 
   */
  lineColor;

  /**
   * 设置/获取区域边框不透明度 0 全透明，1 为不透明
   * @type {Number}
   */
  lineOpacity;

  /**
   * 设置/获取区域颜色
   * @type {Number|String} 
   */
  regionColor;

  /**
   * 设置/获取区域不透明度 0 全透明，1 为不透明
   * @type {Number}
   */
  regionOpacity;
}