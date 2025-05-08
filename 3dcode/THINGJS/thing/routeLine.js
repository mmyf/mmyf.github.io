/**
 * @class THING.RouteLine
 * @extends THING.LineBase
 * @description 线路类,提供线路绘制功能
 */
class RouteLine {
  /**
   * 显示/隐藏箭头
   * @type {Boolean}
   */
  arrowCap;

  /**
   * 设置进度,范围在 [0, 1] 之间
   * @type {Number} 
   */
  progress;
}