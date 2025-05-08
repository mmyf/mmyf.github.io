/**
 * @class THING.Tetrahedron
 * @extends THING.ThingGeometry
 * @description 四面体类
 */
class Tetrahedron {
  /**
   * 判断是否 Tetrahedron 类型
   * @type {Boolean}
   */
  isTetrahedron;
}

/* 示例代码:
var tetrahedron = app.create({
  type: 'Tetrahedron',
  radius: 2,
  position:[0,1,0] // 四面体中心在世界坐标系下的位置
});
*/