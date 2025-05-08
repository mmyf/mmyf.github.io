/**
 * @class THING.SpotLight
 * @extends THING.LightBase
 * @description 聚光灯类,提供聚光灯物体能力
 */
class SpotLight {
  /**
   * 获取/设置灯光有效距离
   * @type {Number}
   */
  distance;

  /**
   * 显示/隐藏辅助线
   * @type {Boolean}  
   */
  helper;

  /**
   * 设置灯光角度
   * @type {Number}
   */
  lightAngle;

  /**
   * 设置/获取半影数据 [0~1] 范围
   * @type {Number}
   */
  penumbra;
}