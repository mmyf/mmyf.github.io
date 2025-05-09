/**
 * @class THING.TextRegionStyle
 * @extends THING.BaseStyle
 * @description 文本样式类,提供文本样式的设置功能
 */
class TextRegionStyle {
  /**
   * 是否设置字体阴影
   * @type {Boolean}
   */
  dropShadow;

  /**
   * 设置/获取字体阴影透明度
   * @type {Number}
   */
  dropShadowAlpha;

  /**
   * 设置/获取字体阴影角度
   * @type {Number}
   */
  dropShadowAngle;

  /**
   * 设置/获取字体阴影模糊半径
   * @type {Number}
   */
  dropShadowBlur;

  /**
   * 设置/获取字体阴影颜色
   * @type {String|Number}
   */
  dropShadowColor;

  /**
   * 设置/获取字体阴影半径
   * @type {Number}
   */
  dropShadowDistance;

  /**
   * 设置/获取字体对齐方式，例如，'left'，'right'，'center'
   * @type {String}
   */
  fontAlign;

  /* 示例:
  textRegion.style.fontAlign = 'left';
  */

  /**
   * 设置/获取字体颜色
   * @type {String|Number}
   */
  fontColor;

  /**
   * 设置/获取字体大小
   * @type {Number}
   */
  fontSize;

  /**
   * 设置/获取字体类型
   * @type {String}
   */
  fontType;

  /**
   * 文本是否描边,默认 false
   * @type {Boolean}
   */
  strokeMode;

  /**
   * 设置/获取文本行间距
   * @type {Number}
   */
  textLineHeight;

  /**
   * 设置/获取文本行宽度,如果文本宽度大于行宽度,会进行换行
   * @type {Number}
   */
  textLineWidth;
}