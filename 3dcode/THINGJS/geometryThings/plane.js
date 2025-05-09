/**
 * @class THING.Plane
 * @extends THING.ThingGeometry
 * @description 平面类
 */
class Plane {
  /**
   * 判断是否 Plane 类型
   * @type {Boolean} 
   */
  isPlane;
}

/* 示例代码:
// 创建一个平面
var plane = app.create({
  type: 'Plane',
  width: 4, // 宽度
  height: 2, // 高度
  position: [0,0,0] // 平面中心在世界坐标下的位置
});
*/