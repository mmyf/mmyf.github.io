/**
 * @class THING.Cylinder
 * @extends THING.ThingGeometry
 * @description 圆柱体类
 */
class Cylinder {
  /**
   * 判断是否 Cylinder 类型
   * @type {Boolean}
   */
  isCylinder;
}

/* 示例代码:
var cylinder = app.create({
  type: 'Cylinder',
  radius: 0.5, // 半径
  height: 2, // 高度  
  radiusSegments: 8, // 半径切面密度，数值越高圆柱体越圆滑
  position: [0,0,0] // 圆柱体中心在世界坐标系下的位置
}); 
*/