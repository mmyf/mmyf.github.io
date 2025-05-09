/**
 * LightBase 光线基类
 * 提供灯光效果设置功能
 * @class
 * @extends THING.BaseObject
 */
class LightBase extends THING.BaseObject {
  /**
   * 获取/设置灯光是否能产生阴影
   * @type {Boolean}
   */
  castShadow;

  /**
   * 获取/设置灯光强度
   * @type {Number}
   */
  intensity;

  /**
   * 设置灯光颜色，颜色范围是 [0~1, 0~1, 0~1]
   * @type {String|Array<Number>}
   */
  lightColor;

  /**
   * 设置阴影偏移量
   * @type {Number}
   */
  shadowBias;
}

export default LightBase;