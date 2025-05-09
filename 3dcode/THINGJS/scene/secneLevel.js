/**
 * SceneLevel 场景层级管理
 * 提供场景层级管理的能力
 * @class
 */
class SceneLevel {
  /** 
   * 获取当前层级
   * @type {THING.BaseObject}
   * @example
   * var currentLevel = app.level.current;
   */
  current;

  /**
   * 获取之前的层级
   * @type {THING.BaseObject}
   */
  previous;

  /**
   * 返回至上一层级（父层级）
   * @example
   * app.level.back()
   */
  back() {}

  /**
   * 切换场景层级
   * @param {THING.BaseObject} object - 将要切换至的场景层级物体对象
   * @param {Object} [params] - 参数对象
   * @param {Function} [params.complete] - (BETA) 完成回调函数
   * @example
   * // 开启场景层级控制
   * app.level.change();
   * // 将层级切换至某楼层
   * var floor = app.query('.Floor')[0];
   * app.level.change(floor);
   */
  change(object, params) {}

  /**
   * 检测当前帧层级是否发生改变
   * @returns {Boolean} 是否改变
   */
  isChanged() {}

  /**
   * 结束层级管理
   * @param {Object} params - 辅助参数 
   */
  quit(params) {}
}

export default SceneLevel;