/**
 * @class THING.Sphere
 * @extends THING.ThingGeometry
 * @description 球体类
 */
class Sphere {
  /**
   * 判断是否 Sphere 类型
   * @type {Boolean}
   */
  isSphere;
}

/* 示例代码:
// 创建一个球体
var sphere = app.create({
  type: 'Sphere',
  radius: 1,// 半径
  widthSegments: 16,
  heightSegments: 16,
  position: [0,0,0] // 球心所在的世界坐标
});

// 创建一个半球体
var sphere = app.create({
  type: 'Sphere',
  radius: 1,// 半径
  widthSegments: 16,
  heightSegments: 16,
  phiStart: 0,
  phiLength: Math.PI * 2,
  thetaStart: 0,
  thetaLength: Math.PI/2,
  position: [0, 2, 0]// 球心所在的世界坐标
});
*/