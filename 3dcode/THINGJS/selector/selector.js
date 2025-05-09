/**
 * Selector 选择器
 * 根据特定条件，进行物体筛选
 * @class
 */
class Selector {
  /**
   * 批量设置集合中的对象是否能被拖拽
   * @type {Boolean}
   */
  draggable;

  /**
   * 批量设置集合中的对象角度继承控制
   * @type {Boolean}
   */
  inheritAngles;

  /** 
   * 批量设置集合中的对象位置继承控制
   * @type {Boolean}
   */
  inheritPosition;

  /**
   * 批量设置集合中的对象风格继承控制
   * @type {Boolean}
   */
  inheritStyle;

  /**
   * 批量设置集合中的对象可见性继承控制
   * @type {Boolean}
   */
  inheritVisible;

  /**
   * 批量设置集合中的对象是否能被拾取
   * @type {Boolean}
   */
  pickable;

  /**
   * 获取效果集合，获取后用于批量设置集合中的物体效果
   * @type {THING.SelectorStyle}
   * @example
   * // 获取所有 Thing 类型物体的对象集合
   * var sel = app.query('.Thing');
   * // 获取效果结合，并设置物体颜色为红色
   * sel.style.color = '#ff0000';
   */
  style;

  /**
   * 批量设置集合中的对象显示/隐藏
   * @type {Boolean}
   */
  visible;

  /**
   * 从当前对象集合中添加其他对象，参数可以是查询条件、物体对象、物体对象数组、或其他 Selector 对象集合
   * @param {Object} param 参数列表
   * @returns {THING.Selector} 处理之后的对象集合
   * @example
   * sel.add('car01').add(obj).add([obj1, obj2]).add(sel1);
   */
  add(param) {
    // implementation
  }

  /**
   * 清空集合，集合中的对象本身并没有删除
   */
  clear() {}

  /**
   * 销毁对象集合中的所有对象，物体会被删除掉
   */
  destroyAll() {}

  /**
   * 淡入效果
   * @param {Object} param 参数列表
   * @example
   * var sel = app.query('.Thing');
   * sel.fadeIn();
   * // 设置 时间 和 回调
   * sel.fadeIn({
   *   time:2000,
   *   complete:function(){
   *     THING.Utils.log('complete')
   *   }
   * })
   */
  fadeIn(param) {
    // implementation
  }

  /**
   * 淡出效果
   * @param {Object} param 参数列表
   * @example
   * var sel = app.query('.Thing');
   * sel.fadeOut();
   * // 设置 时间 和 回调
   * sel.fadeOut({
   *   time:2000,
   *   complete:function(){
   *     THING.Utils.log('complete')
   *   }
   * })
   */
  fadeOut(param) {
    // implementation
  }

  /**
   * 过滤元素
   * @param {Function} callback 回调函数
   * @returns {THING.Selector}
   */
  filter(callback) {
    // implementation
  }

  /**
   * 遍历对象
   * @param {Function} callback 回调函数
   * @example
   * // 得到所有 Thing 类型物体的对象集合
   * var sel = app.query('.Thing');
   * // 遍历对象
   * sel.forEach(function(obj){
   *   THING.Utils.log(obj.name)
   * })
   */
  forEach(callback) {
    // implementation
  }

  /**
   * 判断集合中是否拥有某物体
   * @param {THING.BaseObject} object 物体
   * @returns {Boolean}
   */
  has(object) {
    // implementation
  }

  /**
   * 获取对象集合中某物体的下标索引值，若对象集合中不包含此物体，则返回 -1
   * @param {THING.BaseObject} object 物体
   * @returns {Number} 下标值，-1 表示不存在
   * @example
   * // 获取 Thing 类型物体对象集合
   * var sel = app.query('.Thing');
   * // 根据 name 查询获取物体
   * var obj = app.query('cabinetB1')[0];
   * var index = sel.indexOf(obj);
   */
  indexOf(object) {
    // implementation
  }

  /**
   * 从当前对象集合中排除部分对象，参数可以是查询条件、物体对象、物体对象数组、或其他 Selector 对象集合
   * @param {Object} param 参数列表
   * @returns {THING.Selector} 处理之后的对象集合
   * @example
   * selector.not('car01').not(obj).not([obj1, obj2]).not(sel);
   */
  not(param) {
    // implementation
  }

  /**
   * 移除事件绑定
   * @param {THING.EventType | String} eventType 事件名称
   * @param {String} condition 物体类型选择条件
   * @param {Function | String} callback 事件触发的回调函数 或 事件标签(tag)
   * @example
   * sel.off('click',null,'tag1');
   * sel.off('click','.Marker','tag2')
   */
  off(eventType, condition, callback) {
    // implementation
  }

  /**
   * 绑定事件
   * @param {THING.EventType | String} eventType 事件名称
   * @param {String} [condition] 物体类型选择条件，用于筛选子物体
   * @param {Object} userData 事件绑定自定义数据
   * @param {Function} cb 事件触发的回调函数
   * @param {String} [tag] 事件标签
   * @example
   * // 获取所有 Thing 类型物体
   * var sel = app.query('.Thing');
   * // 绑定 Click 事件
   * sel.on('click',function(ev){
   *   THING.Utils.log(ev.object.name);
   * },'给所有Thing物体绑定点击事件')
   * // 给所有 Thing 类型物体下的 Marker 对象绑定事件
   * sel.on('click','.Marker',function(ev){
   *   THING.Utils.log(ev.object.name);
   * },'给Thing下的Marker绑定事件')
   */
  on(eventType, condition, userData, cb, tag) {
    // implementation
  }

  /**
   * 绑定事件，只触发一次
   * @param {THING.EventType | String} eventType 事件名称
   * @param {String} [condition] 物体类型选择条件，用于筛选子物体
   * @param {Object} userData 事件绑定自定义数据
   * @param {Function} callback 事件触发的回调函数
   * @param {String} [tag] 事件标签
   */
  one(eventType, condition, userData, callback, tag) {
    // implementation
  }

  /**
   * 暂停事件响应
   * @param {THING.EventType | String} eventType 事件名称
   * @param {String} condition 物体类型选择条件
   * @param {String} [tag] 事件标签
   * @example
   * sel.pauseEvent('click',null,'tag1');
   * sel.pauseEvent('click','.Marker','tag2')
   */
  pauseEvent(eventType, condition, tag) {
    // implementation
  }

  /**
   * 在该对象集合中查询物体
   * @param {String} param 查询条件
   * @returns {THING.Selector} 查询结果
   * @example
   * // 在对象集合中查询 id 为 001 的物体
   * sel.query('#001');
   * // 在对象集合中查询名称为 car01 的物体
   * sel.query('car01');
   * // 在对象集合中查询类型为 Thing 的物体
   * sel.query('.Thing');
   * // 在对象集合中查询自定义属性 [prop=value] 的物体
   * sel.query('["userData/power" = 60]');
   * // 在对象集合中查询名字（name）中包含 car 的物体
   * sel.query(/car/);
   * // 在对象集合中查询 满足条件1 或条件2,...
   * sel.query('.Thing|.Building');
   * // 字符串部分参考：http://www.w3school.com.cn/jquery/jquery_ref_selectors.asp
   */
  query(param) {
    // implementation
  }

  /**
   * 恢复事件响应
   * @param {THING.EventType | String} eventType 事件名称
   * @param {String} condition 物体类型选择条件
   * @param {String} [tag] 事件标签
   * @example
   * sel.resumeEvent('click',null,'tag1');
   * sel.resumeEvent('click','.Marker','tag2')
   */
  resumeEvent(eventType, condition, tag) {
    // implementation
  }

  /**
   * 反转集合中的对象顺序
   * @returns {THING.Selector}
   */
  reverse() {
    // implementation
  }

  /**
   * 从集合中移除对象
   * @param {Number} index 起始下标值，从此位置开始移除
   * @param {Number} number 删除多少个对象
   */
  splice(index, number) {
    // implementation
  }

  /**
   * 把对象集合以数组形式返回
   * @returns {Array<String>}
   * @example
   * var sel = app.query('.Thing');
   * var arr = sel.toArray();
   */
  toArray() {
    // implementation
  }

  /**
   * 转换成 JSON 字符串
   * @returns {String}
   * @example
   * var sel = app.query('.Thing');
   * var jsonStr = sel.toJSON();
   */
  toJSON() {
    // implementation
  }

  /**
   * 触发事件
   * @param {THING.EventType | String} eventType 事件名称
   * @param {Object} ev 事件信息
   * @param {String} [tag] 事件标签
   * @example
   * // 获取所有的 Thing 类型物体集合 并触发自定义的 Alarm 事件
   * var sel = app.query('.Thing');
   * sel.trigger('Alarm', { level: 2 })
   * // 监听绑定自定义的 Alarm 事件
   * sel.on('Alarm', function (ev) {
   *   var level = ev.level;
   * })
   */
  trigger(eventType, ev, tag) {
    // implementation
  }
}

export default Selector;