/**
 * @class THING.PolygonRegion
 * @extends THING.PointsBase
 * @description 区域绘制类,提供区域绘制功能
 */
class PolygonRegion {
  /**
   * 获取区域样式对象
   * @type {THING.PolygonRegionStyle}
   */
  style;
}

/* 代码示例:
// 构成多边形的点（取世界坐标系下的坐标）
var points = [[0, 0, 0], [5, 0, 0], [5, 0, 5], [0, 0, 5]];
// 创建区域
var region = app.create({
  type: 'PolygonRegion',
  points: points, // 传入世界坐标系下点坐标
  style: {
    regionColor: '#ff0000', // 区域颜色
    lineColor: '#00ff00', // 边框颜色
    regionOpacity: 1 // 不透明度 (默认是 0.5 半透明)
  }
})
*/