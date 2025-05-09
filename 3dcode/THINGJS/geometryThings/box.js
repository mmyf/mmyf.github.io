/**
 * Box 立方体
 * @class
 * @extends THING.ThingGeometry
 */
class Box extends THING.ThingGeometry {
  /**
   * 判断是否 Box 类型
   * @type {Boolean}
   */
  isBox;
}

export default Box;

/* 示例代码:
// 默认创建一个长宽高为 1m ,轴心点在中心的正方体
var box = app.create({
  type:'Box',
  position: [0, 0, 0]
});
*/