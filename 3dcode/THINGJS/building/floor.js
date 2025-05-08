/**
 * @class THING.Floor
 * @extends THING.BaseObject
 * @description 楼层类,提供园区楼层的管理能力
 */
class Floor {
  /**
   * 获取楼层所在的建筑对象
   * @type {THING.Building}
   */
  building;

  /**
   * 获取天花板,不包含该楼层下独立管理的房间的天花板
   * @type {THING.BaseObject} 
   */
  ceiling;

  /**
   * 获取该楼层下的门对象集合
   * @type {THING.Selector}
   */
  doors;

  /**
   * 获取该楼层相对于建筑的索引下标，从0开始
   * @type {Number}
   */
  indexOfBuilding;

  /**
   * 获取该楼层是第几层，从1开始
   * @type {Number}
   */
  levelNumber;

  /**
   * 获取该楼层下的杂物，未单独管理的物体会被合并成为杂物
   * @type {THING.BaseObject}
   */
  misc;

  /**
   * 获取该楼层的地板，不包含该楼层下独立管理的房间的地板
   * @type {THING.BaseObject}
   */
  plan;

  /**
   * 获取该楼层的屋顶，不包含该楼层下独立管理的房间的屋顶
   * @type {THING.BaseObject}
   */
  roof;

  /**
   * 获取该楼层下的房间对象集合
   * @type {THING.Selector}
   */
  rooms;

  /**
   * 获取该楼层下的 Thing 类型物体对象集合
   * @type {THING.Selector}
   */
  things;

  /**
   * 获取该楼层下的墙
   * @type {THING.BaseObject}
   */
  wall;

  /**
   * 以相对楼层的坐标位置获取对应的房间对象
   * @param {Array<Number>} localPosition 楼层下的相对坐标
   * @returns {THING.Room} 房间对象
   */
  getRoomFromLocalPosition(localPosition) {}

  /**
   * 以世界坐标位置获取对应的房间对象
   * @param {Array<Number>} position 世界坐标
   * @returns {THING.Room} 房间对象
   */
  getRoomFromWorldPosition(position) {}

  /**
   * 显示/隐藏所有天花板，包括了楼层和该楼层下房间的天花板
   * @param {Boolean} visible 显示/隐藏，true 为显示
   */
  showAllCeilings(visible) {}

  /**
   * 显示/隐藏所有屋顶，包括了楼层和该楼层下房间的屋顶
   * @param {Boolean} visible 显示/隐藏，true 为显示
   */
  showAllRoofs(visible) {}
}
