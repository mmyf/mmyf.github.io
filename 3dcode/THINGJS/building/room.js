/**
 * @class THING.Room
 * @extends THING.BaseObject
 * @description 房间类,提供园区建筑物体的管理能力 
 */
class Room {
  /** 
   * 获取该房间的面积,单位:平方米
   * @type {Number} 
   */
  area;

  /**
   * 获取该房间的天花板
   * @type {THING.BaseObject}
   */
  ceiling;

  /**
   * 获取该房间下的门对象集合
   * @type {THING.Selector}
   */
  doors;

  /**
   * 获取该房间所在的楼层对象
   * @type {THING.Floor}
   */
  floor;

  /**
   * 获取该房间最佳标注位置,返回世界坐标位置,该点位一定在房间内
   * @type {Array<Number>}
   */
  labelPosition;

  /**
   * 获取该房间的周长,单位:米
   * @type {Number}
   */
  perimeter;

  /**
   * 获取该房间的地板
   * @type {THING.BaseObject}
   */
  plan;

  /**
   * 获取该房间顶点的世界坐标,例如,[[-3.5,0.0,-6.8],[-3.5,0.0,-14.5],[9.4,0.0,-14.5],[9.4,0.0,-6.8]]
   * @type {Array<Array<Number>>}
   */
  points;

  /**
   * 获取该房间的房顶
   * @type {THING.BaseObject}
   */
  roof;

  /**
   * 获取该房间下的 Thing 类型物体对象集合
   * @type {THING.Selector}
   */
  things;

  /**
   * 获取在该房间内摆放物体可使用的世界坐标位置
   * @param {Number} number 物体总数 
   * @param {Array<Array<Number>>} sizes 申请的位置大小[[width, height]]
   * @param {Array<Array<Number>>} [holePoints] 洞的位置[[lt, rt, rb, lb]]
   * @returns {Array<Array<Number>>} 世界坐标点数据列表 如 [[0,0,0],[1,0,0],[2,0,0]]
   */
  getAvaliablePositions(number, sizes, holePoints) {}
}