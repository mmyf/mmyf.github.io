/**
 * @class THING.LineBase 
 * @extends THING.PointsBase
 * @description 线段基类,提供线段的绘制能力
 */
class LineBase {
  /**
   * 设置/获取线段拐角处圆角半径,如果是 0，则表示直角。默认值为 0.3
   * @type {Number}
   */
  cornerRadius;

  /**
   * 设置/获取线段拐角处细分片段数，数值越大线段的细分片段越多，越平滑。默认值为 10
   * @type {Number} 
   */
  cornerSegments;

  /**
   * 设置贴图重复，默认为 [1, 1]
   * @type {Array<Number>}
   */
  imageRepeat;

  /**
   * 启用/禁止 UV 动画
   * @type {Boolean}
   */
  imageScroll;

  /**
   * 设置/获取 UV 动画播放速度, 数值设置成负数可以改变动画方向，默认值为 1
   * @type {Number}
   */
  imageScrollSpeed;

  /**
   * 获取线段长度
   * @type {Number}
   */
  length;

  /**
   * 启用/禁用纹理
   * @type {Boolean}
   */
  useTexture;

  /**
   * 开始播放路线动画
   * @param {Object} params - 参数
   * @param {Number} params.time - 播放时间(毫秒)
   * @param {Number} params.startProgress - 起始进度(百分比, 默认从0开始播放)
   * @param {Number} params.endProgress - 结束进度(百分比, 默认从1开始播放)
   * @param {THING.LerpType} params.lerpType - 插值类型
   * @param {Function} params.complete - 完成回调函数
   */
  play(params) {}

  /**
   * 停止播放路线动画
   */
  stop() {}
}