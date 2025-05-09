/**
 * Building 建筑类
 * 提供建筑物的管理能力
 * @class
 * @extends THING.BaseObject
 */
class Building extends THING.BaseObject {
  /**
   * 获取楼层是否已经展开
   * @type {Boolean}
   * @example
   * var boolean = building.expanded;
   */
  expanded;

  /**
   * 获取建筑外立面对象
   * @type {THING.BaseObject}
   * @example
   * var facade = building.facade
   */
  facade;

  /**
   * 获取建筑楼层对象集合
   * @type {THING.Selector}
   * @example
   * var floors = building.floors;
   */
  floors;

  /**
   * 获取建筑下的 Thing 类型物体对象集合
   * @type {THING.Selector}
   * @example
   * var things = building.things;
   */
  things;

  /**
   * 展开楼层
   * @param {Object} params - 参数对象
   * @param {Number} [params.time] - 展开过程的时间（毫秒）
   * @param {Number} [params.distance] - 楼层间展开后的间距，单位米
   * @param {Boolean|String} [params.horzMode] - 水平/垂直方向展开，默认false即竖直方向展开
   * @param {Function} [params.complete] - 展开结束后的回调函数
   * @example
   * // 展开建筑楼层
   * building.expandFloors();
   * // 展开建筑楼层 相关参数设置
   * building.expandFloors({
   *   time: 1000,
   *   distance: 10,
   *   horzMode: 'x',
   *   complete: function () {
   *     THING.Utils.log('展开完成')
   *   }
   * });
   */
  expandFloors(params) {}

  /**
   * 判断该建筑是否有外立面
   * @returns {Boolean} 是否有外立面
   */
  hasFacades() {
    return false; // 示例返回值
  }

  /**
   * 显示/隐藏所有屋顶（房顶）
   * @param {Boolean} show - 显示/隐藏，true 为显示
   */
  showAllRoofs(show) {}

  /**
   * 合并楼层
   * @param {Object} params - 参数对象
   * @param {Number} [params.time] - 合并过程的时间（毫秒）
   * @param {Function} [params.complete] - 合并结束后的回调函数
   * @example
   * // 合并楼层
   * building.unexpandFloors();
   * // 合并楼层 参数设置
   * building.unexpandFloors({
   *   time: 2000,
   *   complete: function () {
   *     THING.Utils.log('合并结束')
   *   }
   * });
   */
  unexpandFloors(params) {}
}

export default Building;