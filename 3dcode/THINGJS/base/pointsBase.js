/**
 * @class THING.PointsBase
 * @extends THING.BaseObject
 * @description 点基础类,主要封装了对顶点（编辑点）的操作行为,包括添加、删除，获取等
 */
class PointsBase {
  /**
   * 获取节点数据列表
   * @type {Array<Number>} 
   */
  points;

  /**
   * 添加单个节点
   * @param {Array<Number>} pos 节点坐标,如 [0,0,0]
   * @returns {Number} 节点索引下标
   */
  addPoint(pos) {}

  /**
   * 添加多个节点
   * @param {Array<Array<Number>>} pos 节点坐标数组,如 [[0,0,0],[1,0,0],[2,0,0]]
   */
  addPoints(pos) {}

  /**
   * 清除所有节点
   */
  clearPoints() {}

  /**
   * 获取节点
   * @param {Number} index 节点索引下标
   * @returns {Array<Number>} 节点坐标
   */
  getPoint(index) {}

  /**
   * 插入单个节点
   * @param {Number} index 节点索引下标
   * @param {Array<Number>} pos 节点坐标,如 [0,0,0]
   */
  insertPoint(index, pos) {}

  /**
   * 删除多个节点
   * @param {Number} index 从 index 索引处开始删除
   * @param {Number} length 要删除的节点数目
   */
  removePoints(index, length) {}

  /**
   * 更新某个节点坐标
   * @param {Number} index 要更新的节点索引下标
   * @param {Array<Number>} pos 新的坐标值 
   * @returns {Boolean} 是否更新成功
   */
  setPoint(index, pos) {}
}