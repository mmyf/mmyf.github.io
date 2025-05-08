/**
 * SceneRoot 场景根节点
 * 提供场景根节点物体对象管理能力
 * @class
 * @extends THING.BaseObject
 */
class SceneRoot extends THING.BaseObject {
  /**
   * 获取园区列表，返回对象集合（Selector）
   * @type {THING.Selector}
   * @example
   * var campuses = app.sceneRoot.campuses;
   */
  campuses;

  /**
   * 获取根节点下的 Thing 类型物体，返回对象集合（Selector）
   * @type {THING.Selector}
   * @example
   * var things = app.sceneRoot.things;
   * things.forEach(function (obj) {
   *   THING.Utils.log(obj.name)
   * });
   */
  things;

  /**
   * 显示/隐藏场景
   * @type {Boolean}
   * @example
   * app.sceneRoot.visible = false;
   */
  visible;
}

export default SceneRoot;