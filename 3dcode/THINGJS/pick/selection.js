/**
 * Selection 物体选择集合
 * 提供物体选择集合的能力
 * @class
 */
class Selection {
  /**
   * 获取当前帧选择集中的物体集合
   * @type {THING.Selector}
   * @example
   * var sel = app.selection.objects;
   */
  objects;

  /**
   * 获取上一帧选择集中的物体集合
   * @type {THING.Selector}
   * @example
   * var sel = app.selection.previousObjects;
   */
  previousObjects;

  /**
   * 清空选择集
   * @example
   * app.selection.clear();
   */
  clear() {}

  /**
   * 将物体从选择集中取消
   * @param {THING.BaseObject} object - 物体
   * @example
   * app.selection.deselect(obj);
   */
  deselect(object) {}

  /**
   * 查询某物体是否在选择集中
   * @param {THING.BaseObject} object - 物体
   * @returns {Boolean}
   * @example
   * app.selection.has(obj);
   */
  has(object) {}

  /**
   * 检测当前帧选择集是否发生改变
   * @returns {Boolean}
   * @example
   * app.selection.isChanged();
   */
  isChanged() {}

  /**
   * 将物体加入到选择集中
   * @param {THING.BaseObject} object - 物体 
   * @example
   * app.selection.select(obj);
   */
  select(object) {}
}

export default Selection;