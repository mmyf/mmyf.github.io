/**
 * Circle 圆
 * @class
 * @extends THING.ThingGeometry
 */
class Circle extends THING.ThingGeometry {
  /**
   * 判断是否 Circle 类型
   * @type {Boolean} 
   */
  isCircle;
}

export default Circle;

/* 示例代码:
var circle = app.create({
  type: 'Circle',
  radius: 1,
  segments: 25, 
  thetaStart: 0,
  thetaLength: Math.PI * 2
});
*/