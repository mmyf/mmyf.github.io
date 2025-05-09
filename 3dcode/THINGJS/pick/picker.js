/**
 * THING.Picker
 * Picker 拾取
 * 提供拾取相关功能，主要为支持 GPU picker，同时兼容支持 Threejs 的 raycast。 
 */

/**
 * 设置框选候选集合
 * 因为框选速度较慢，所以这里需要先提供一个框选的候选列表
 * @type {THING.Selector}  
 */
areaCandidates;

/**
 * 查询是否开启了区域选择功能
 * @type {Boolean}
 */
areaPicking;

/**
 * 开启/禁用拾取功能
 * @type {Boolean}
 */
enable;

/**
 * 获取当前帧系统默认拾取物体集合,执行物体过滤处理后
 * @type {THING.Selector}
 */
objects;

/* 示例:
var sel = app.picker.objects;
*/

/**
 * 设置拾取结果回调函数,返回的对象即为拾取对象
 * @type {Function}
 */
pickedResultFunc;

/* 示例: 
app.picker.pickedResultFunc = function(object) {
  return object; 
}
*/

/**
 * 获取上一帧拾取物体集合，执行物体过滤处理后
 * @type {THING.Selector}
 */
previousObjects;

/* 示例:
var sel = app.picker.previousObjects;
*/

/**
 * 获取当前帧原生拾取物体集合，忽略物体过滤处理
 * @type {THING.Selector}
 */
results;

/* 示例:
var sel = app.picker.results;
*/

/**
 * 结束框选
 */
function endAreaPicking() {}

/**
 * 检测当前帧拾取的物体是否发生了变化
 * @returns {Boolean}
 */
function isChanged() {
  return Boolean;
}

/* 示例:
app.picker.isChanged()
*/

/**
 * 开启框选
 * @param {Object} params - 参数
 * @param {Number} params.x - 屏幕 x 坐标
 * @param {Number} params.y - 屏幕 y 坐标
 * @param {Boolean} [params.realTimePicking] - （可选）是否实时框选(速度较慢)
 * @param {Boolean} [params.drawRegion] - （可选）是否绘制框选区域
 */
function startAreaPicking(params) {}