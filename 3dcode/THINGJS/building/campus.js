/**
 * @class THING.Campus
 * @extends THING.BaseObject
 * @description Campus 园区类,提供园区场景资源加载,管理园区物体的能力
 */
class Campus {
  /**
   * 获取该园区建筑对象集合
   * @type {THING.Selector}
   */
  buildings;

  /**
   * 获取该园区地面
   * @type {THING.BaseObject}
   */ 
  ground;

  /**
   * 获取该园区下的 Thing 类型物体对象集合
   * @type {THING.Selector}
   */
  things;

  /**
   * 获取该园区场景资源路径
   * @type {String}
   */
  url;
}