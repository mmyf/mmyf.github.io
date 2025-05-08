/**
 * BaseObject 物体基类
 * 提供物体对象基础功能
 * @class
 */
class BaseObject {
  /**
   * 三轴相对角度，相对于自身坐标
   * @type {Array<Number>}
   */
  angles;

  /**
   * 获取物体的所有兄弟对象（排除自己）
   * @type {THING.Selector}
   */
  brothers;

  /**
   * 获取子物体列表
   * @type {Array<THING.BaseObject>}
   */
  children;

  /**
   * 获取控件列表
   * @type {Array<Object>}
   */
  controls;

  /**
   * 设置/获取物体是否可被拖拽
   * @type {Boolean}
   * @example
   * obj.draggable = true
   */
  draggable;

  /**
   * 获取物体当前拖拽状态
   * @type {DragState}
   */
  dragState;

  /**
   * 设置/获取物体 ID
   * @type {String}
   */
  id;

  /**
   * 设置/获取物体是否跟随父物体旋转，默认true
   * @type {Boolean}
   */
  inheritAngles;

  /**
   * 设置/获取物体拾取是否受父物体影响, 默认 true
   * @type {Boolean}
   */
  inheritPickable;

  /**
   * 设置/获取物体位置是否跟随父物体移动, 默认 true
   * @type {Boolean}
   */
  inheritPosition;

  /**
   * 设置/获取物体是否跟随父物体缩放，默认 true
   * @type {Boolean}
   */
  inheritScale;

  /**
   * 设置/获取物体样式是否受父物体影响，默认 true
   * @type {Boolean}
   */
  inheritStyle;

  /**
   * 设置/获取物体模板是否受父物体影响，默认 true
   * @type {Boolean}
   */
  inheritTheme;

  /**
   * 设置/获取物体可见性是否受父物体影响，默认 true
   * @type {Boolean}
   */
  inheritVisible;

  /**
   * 设置/获取图标是否保持像素大小不变，默认为 false，即图标在 3D 场景中呈现“近大远小”的表现形式
   * @type {Boolean}
   * @example
   * // 设置物体始终保持像素大小（不随场景缩放“近大远小”）
   * object.keepSize = true;
   */
  keepSize;

  /**
   * 设置/获取物体在父物体坐标系下的相对位置
   * @type {Array<Number>}
   */
  localPosition;

  /**
   * 设置/获取物体名称
   * @type {String}
   */
  name;

  /**
   * 获取直接父物体
   * @type {THING.BaseObject}
   */
  parent;

  /**
   * 获取所有父物体(祖先)，返回物体对象集合，集合中的第一个对象为直接父物体，最后一个为世界根对象
   * @type {THING.Selector}
   * @example
   * // 获取某对象的所有父物体
   * var parents=obj.parents;
   * // parents[0] 等同于 obj.parent
   * // 遍历物体集合
   * parents.forEach(function (parent) {
   *   THING.Utils.log(parent.name)
   * })
   */
  parents;

  /**
   * 设置/获取物体是否能被拾取
   * @type {Boolean}
   */
  pickable;

  /**
   * 设置/获取物体在世界坐标系下的绝对位置
   * @type {Array<Number>}
   */
  position;

  /**
   * 设置四元数
   * @type {Array<Number>}
   */
  quaternion;

  /**
   * 物体自身缩放比例
   * @type {Array<Number>}
   * @example
   * // 等比例缩放 2 倍
   * obj.scale = [2,2,2]
   */
  scale;

  /**
   * 获取物体样式
   * @type {THING.BaseStyle}
   */
  style;

  /**
   * 获取子部件（模型的 Mesh 列表）
   * @type {THING.Selector}
   * @example
   * var subNodes = obj.subNodes;
   * subNodes.forEach(function(subnode){
   *   THING.Utils.log(subnode.name)
   * })
   */
  subNodes;

  /**
   * 设置/获取物体类型
   * @type {String}
   */
  type;

  /**
   * 获取/设置用户自定义属性
   * @type {Object}
   */
  userData;

  /**
   * 设置/获取物体显示隐藏状态
   * @type {Boolean}
   */
  visible;

  /**
   * 添加子物体
   * @param {Object} params - 参数对象
   * @param {THING.BaseObject} params.object - 物体
   * @param {Array<Number>} [params.localPosition] - 相对于父物体的坐标位置
   * @param {Array<Number>} [params.angles] - 旋转角度
   * @param {String} [params.basePoint] - 作为位置参考基准的子节点名字
   * @param {Number} [index] - 插入下标，默认插入到最后位置
   * @example
   * // 将物体 box 作为孩子直接添加到 car 上
   * car.add(box);
   * // 添加子物体 box ，并设置其与父物体的相对位置  
   * car.add({
   *   object: box,
   *   localPosition: [0, 2, 0]
   * });
   */
  add(params, index) {}

  /**
   * 添加物体控件
   * @param {Object} type - 系统内置控件类型或用户自定义控件类型
   * @param {String} [name] - 控件自定义名称（用于查找）
   * @returns {Object} 控件对象
   * @example
   * obj.addControl(new THING.AxisTransformControl(obj), 'axisControl');
   */
  addControl(type, name) {}

  /**
   * 销毁自身及其所有子物体，递归删除
   */
  destroy() {}

  /**
   * 获取物体到某坐标或者另一物体的绝对距离
   * @param {Array<Number> | THING.BaseObject} position - 世界坐标系下的位置 或 另一物体
   * @returns {Number} 距离
   * @example
   * // 填写世界坐标系下的位置
   * obj.distanceTo([0,0,0]);
   * // 填写物体对象
   * obj.distanceTo(otherObj);
   */
  distanceTo(position) {}

  /**
   * 淡入效果
   * @param {Object} param - 参数对象
   * @param {Number} [param.time] - 淡入时间（毫秒），默认 1s
   * @param {Function} [param.complete] - 完成时的回调
   * @example
   * obj.fadeIn();
   * // 设置时间和回调
   * obj.fadeIn({
   *   time:2000,
   *   complete:function(ev){
   *     THING.Utils.log('complete')
   *   }
   * })
   */
  fadeIn(param) {}

  /**
   * 淡出效果
   * @param {Object} param - 参数对象
   * @param {Number} [param.time] - 淡入时间（毫秒），默认 1s
   * @param {Function} [param.complete] - 完成时的回调
   * @example
   * obj.fadeOut();
   * // 设置时间和回调
   * obj.fadeOut({
   *   time:2000,
   *   complete:function(ev){
   *     THING.Utils.log('complete')
   *   }
   * })
   */
  fadeOut(param) {}

  /**
   * 获取属性值
   * @param {String} key - 属性名，可以使用 a/b/c 的路径方式
   * @returns {*} 属性值
   * @example
   * obj.getAttribute("userData/power");
   */
  getAttribute(key) {}

  /**
   * 获取控件
   * @param {String} name - 控件自定义名称
   * @returns {Object} 控件对象
   * @example
   * var control = obj.getControl('axisControl');
   */
  getControl(name) {}

  /**
   * 获取绑定的事件列表，返回数组
   * @param {THING.EventType | String} eventType - 事件名称, 如果不传则返回所有已绑定的事件
   * @returns {Array<Object>}
   * @example
   * var events=obj.getEvents();
   * // 返回数组，结构形如：
   * [{"type":"enterlevel","priority":50,"userData":null,'tag':'__level_scene_operations__'},
   * {"type":"leavelevel","priority":50,"userData":null,'tag':'__level_scene_operations__'},
   * {"type":"click","priority":50,"userData":null,'tag':'我的单击事件'}]
   */
  getEvents(eventType) {}

  /**
   * 获取带方向的包围盒信息
   * @param {Boolean} onlyVisible - 是否仅获取可见物体数据，默认 true
   * @param {Boolean} onlySelf - 是否仅获取自身物体数据，默认 false
   * @returns {OrientedBoxResult}
   */
  getOrientedBox(onlyVisible, onlySelf) {}

  /**
   * 判断属性是否存在
   * @param {String} key - 属性名，可以使用 a/b/c 的路径方式
   * @returns {Boolean}
   * @example
   * // 物体属性 obj.userData.power 是否存在
   * obj.hasAttribute("userData/power");
   */
  hasAttribute(key) {}

  /**
   * 检测是否拥有此子物体
   * @param {THING.BaseObject} object - 物体
   * @returns {Boolean}
   */
  hasChild(object) {}

  /**
   * 查询是否拥有控件
   * @param {Object | String} control - 控件或者控件自定义名字
   * @returns {Boolean}
   * @example
   * obj.hasControl('axisControl');
   */
  hasControl(control) {}

  /**
   * 判断该物体是否为某物体的兄弟
   * @param {THING.BaseObject} object - 物体
   * @returns {Boolean}
   */
  isBrotherOf(object) {}

  /**
   * 判断该物体是否为某物体的孩子
   * @param {THING.BaseObject} parent - 物体
   * @returns {Boolean}
   */
  isChildOf(parent) {}

  /**
   * 设置物体观察朝向
   * @param {Array<Number> | THING.BaseObject | THING.CameraController} target - 世界坐标下某坐标、某物体或者摄像机，设为 null 时表示取消观察
   * @param {Object} params - 参数对象
   * @param {Array<Number>} [params.angles] - 叠加的修正值
   * @param {Boolean} [params.lockYAxis] - 是否锁定 Y 轴
   * @param {Boolean} [params.always] - 是否一直朝向观察物体
   * @example
   * //让物体面向[0,1,0]，该坐标是在世界坐标下位置
   * obj.lookAt([0,1,0])
   * //让物体一直面向摄影机
   * obj.lookAt(app.camera)
   * //让物体一直面向一个物体
   * obj.lookAt(obj2)
   * //让物体一直面向一个物体,同时物体沿自身Y轴向再旋转90度
   * obj.lookAt(obj2，[0,90,0])
   * //取消lookAt功能
   * obj.lookAt(null)
   */
  lookAt(target, params) {}

  /**
   * 沿指定路径移动
   * @param {Object} params - 参数对象
   * @param {Array<Number>} params.path - 路径，由世界坐标系下的坐标点组成
   * @param {Boolean} params.orientToPath - 物体方向是否沿路径方向
   * @param {Number} params.orientToPathDegree - 相对于路径方向的角度旋转值
   * @param {Number} params.time - 沿路径移动的时间，单位：毫秒
   * @param {Boolean} params.local - 输入的坐标是否相对于父物体的位置(默认false), 否则路径为世界坐标
   * @param {Number} params.delayTime - 延时执行时间，单位：毫秒
   * @param {THING.LerpType} params.lerpType - 插值类型
   * @param {String} params.loopType - 循环类型，默认为 no
   * @param {Function} params.update - 移动中的回调
   * @param {Function} params.complete - 移动完成时的回调
   * @example
   * // 世界坐标系下坐标点构成的数组 关于坐标的获取 可利用「工具」——>「拾取场景坐标」
   * var path = [[0, 0, 0], [20, 0, 0], [20, 0, 10], [0, 0, 10], [0, 0, 0]];
   * obj.movePath({
   *   orientToPath: true, // 物体移动时沿向路径方向
   *   path: path, // 路径坐标点数组
   *   time: 5 * 1000, // 路径总时间 毫秒
   *   delayTime: 1000, // 延时 1s 执行
   *   lerpType: null, // 插值类型（默认为线性插值）此处设置为不插值
   *   complete: function (ev) {
   *     THING.Utils.log(ev.object.name + "移动结束")
   *   }
   * });
   */
  movePath(params) {}

  /**
   * 移动到某位置或某物体对象
   * @param {Object} params - 参数对象
   * @param {Array<Number> | THING.BaseObject} params.position - 目标位置（世界坐标系下绝对位置） 或 物体对象
   * @param {Boolean} [params.orientToPath] - 是否朝向目标方向
   * @param {String} [params.loopType] - 循环类型，默认为 no
   * @param {Number} [params.time] - 完成移动的时间（毫秒）
   * @param {Array<Number>} [params.offsetPosition] - 相对于当前位置的移动偏移量（与 position 选填其一）
   * @param {Function} [params.complete] - 移动完成时的回调，仅当 loopType 为 no 时才有回调
   * @example
   * // 移动到世界坐标系下 [0,0,10] 处位置
   * obj.moveTo([0, 0, 10]);
   * // 3s 移动到世界坐标系下原点位置 [0,0,0]
   * obj.moveTo({
   *   position: [0,0,0],
   *   time: 3000,
   *   orientToPath: true,// 朝向目标方向
   *   complete:function(ev) {
   *     THING.Utils.log(ev.object.name + '移动完成');
   *   }
   * });
   * // 2s 向前移动 10m
   * obj.moveTo({
   *   offsetPosition: [0, 0, 10], // 相对自身 向前移动 10m
   *   time: 2 * 1000,
   *   orientToPath: true,
   *   complete: function (ev) {
   *     THING.Utils.log(ev.object.name + '移动完成');
   *   }
   * });
   */
  moveTo(params) {}

  /**
   * 暂停移动处理
   * @example
   * object.pauseMoving();
   */
  pauseMoving() {}

  /**
   * 恢复移动处理
   * @example
   * object.resumeMoving();
   */
  resumeMoving() {}

  /**
   * 移除事件绑定
   * @param {String} eventType - 事件类型名称
   * @param {String} condition - 物体类型选择条件
   * @param {Function | String} callback - 事件触发的回调函数 或 事件标签（tag）
   * @example
   * // 移除所有 Click 事件的绑定
   * obj.off('click');
   * // 移除对物体下 Marker 子物体的 Click 事件绑定
   * obj.off('click','.Marker');
   * // 移除标记为某个事件标签的事件绑定,如果绑定（on）时没写条件，则第二个参数需填写 null
   * obj.off('click','.Marker','我的点击事件01')
   * obj.off('click',null,'我的点击事件02')
   */
  off(eventType, condition, callback) {}

  /**
   * 绑定事件
   * @param {String} eventType - 事件类型名称
   * @param {String} [condition] - 物体类型选择条件，用于筛选子物体
   * @param {Object} [userData] - 事件传递自定义数据
   * @param {Function} callback - 事件触发的回调函数
   * @param {String} [tag] - 事件标签
   * @param {Number} [priority] - 优先级，默认值 50，数值越大优先级越高，越先响应
   * @example
   * // 绑定 Click 事件
   * obj.on('click',function(ev){
   *   THING.Utils.log(ev.object.name);
   * })
   * // 给物体下的所有 Marker 类型孩子，绑定 Click 事件
   * obj.on('click','.Marker',function(ev){
   *    THING.Utils.log(ev.object.name);
   * })
   * // 设置事件标签 tag
   * obj.on('click','.Marker',function(ev){
   *   THING.Utils.log(ev.object.name);
   * },'我的点击事件01');
   * // 设置事件优先级
   * obj.on('click',function(ev){
   *   THING.Utils.log(ev.object.name);
   * },'我的点击事件02',51)
   * // 填写 userData 传递参数
   * obj.on('click', { color: '#ff0000' }, function (ev) {
   *   var color = ev.data.color;
   *   THING.Utils.log(color)
   * });
   */
  on(eventType, condition, userData, callback, tag, priority) {}

  /**
   * 绑定事件，只触发一次
   * @param {String} eventType - 事件类型名称
   * @param {String} [condition] - 物体类型选择信息
   * @param {Object} [userData] - 事件传递自定义数据
   * @param {Function} callback - 事件触发的回调函数
   * @param {String} [tag] - 事件标签
   * @param {Number} [priority] - 优先级，数值越大优先级越高
   */
  one(eventType, condition, userData, callback, tag, priority) {}

  /**
   * 暂停事件响应
   * @param {THING.EventType | String} eventType - 事件名称
   * @param {String} [condition] - 物体类型选择条件
   * @param {String} [tag] - 事件标签
   */
  pauseEvent(eventType, condition, tag) {}

  /**
   * 在子物体中查询(不包括自己)
   * @param {String} param - 查询条件
   * @param {Boolean} [recursive] - 是否递归查询所有子物体，默认 true
   * @returns {THING.Selector} 查询结果
   * @example
   * // 查询名称为 car01 的子物体
   * obj.query('car01');
   * // 查询类型为 Marker 的子物体
   * obj.query('.Marker');
   * // 查询id为 001 的子物体
   * obj.query('#001');
   * // 根据自定义属性值筛选子物体
   * obj.query('[userData/power=40]');
   * // 根据正则表达式匹配 name 中包含 'car' 的子物体
   * obj.query(/car/);
   * // 上行代码等同于
   * // var reg = new RegExp('car');
   * // var cars=app.query(reg);
   */
  query(param, recursive) {}

  /**
   * 移除子物体
   * @param {THING.BaseObject} object - 物体
   */
  remove(object) {}

  /**
   * 删除该物体的所有控件
   */
  removeAllControls() {}

  /**
   * 删除控件
   * @param {Object | String} control - 控件或控件自定义名称
   * @example
   * var control = obj.removeControl('axisControl');
   */
  removeControl(control) {}

  /**
   * 恢复事件响应
   * @param {THING.EventType | String} eventType - 事件名称
   * @param {String} [condition] - 物体类型选择信息
   * @param {String} [tag] - 事件标签
   */
  resumeEvent(eventType, condition, tag) {}

  /**
   * 让物体以本地坐标系下指定坐标轴旋转，默认 Y 轴
   * @param {Number} angle - 旋转角度值
   * @param {Array<Number>} axis - 方向轴，默认为物体 Y 轴方向
   * @example
   * // 绕自身 Y 轴旋转45度，等同于 obj.rotateY(45)
   * obj.rotate(45);
   * // 绕自身 X 轴旋转30度，等同于 obj.rotateX(30)
   * obj.rotate( 30, [1,0,0])
   * // 绕自身 Z 轴向旋转-45度，等同于 obj.rotateZ(-45)
   * obj.rotate( -45, [0,0,1])
   */
  rotate(angle, axis) {}

  /**
   * 绕某点或某物体旋转
   * @param {Object} params - 参数对象
   * @param {THING.BaseObject} [params.object] - 围绕某物体
   * @param {Array<Number>} [params.target] - 围绕世界坐标系下某位置点
   * @param {Number} [params.angle] - 水平旋转角度
   * @param {Number} [params.time] - 旋转时间（毫秒）
   * @param {Number} [params.speed] - 速度 （与 time 选填其一）
   * @param {String} [params.loopType] - 旋转结束时的回调函数，仅当 loopType 为 no 时才有回调
   * @param {Function} [params.complete] - 旋转结束时的回调函数，仅当 loopType 为 no 时才有回调
   * @example
   * // obj2 绕着 obj1 旋转360度，2s转完
   * obj2.rotateAround({
   *   object: obj1,
   *   angle:360,
   *   time:2000,
   *   loopType:THING.LoopType.No,
   *   complete:function(){
   *     THING.Utils.log('finish')
   *   }
   * })
   * // obj 绕着 世界坐标系下的原点旋转360度，2s转完
   * obj.rotateAround({
   *   target: [0,0,0],
   *   angle:360,
   *   time:2000,
   *   loopType:THING.LoopType.No,
   *   complete:function(){
   *     THING.Utils.log('finish')
   *   }
   * })
   */
  rotateAround(params) {}

  /**
   * 在一段时间内物体旋转一定角度
   * @param {Object} params - 参数对象
   * @param {Array<Number>} params.angles - 旋转角度
   * @param {Number} [params.time] - 完成旋转的时间（毫秒）
   * @param {Number} [params.speed] - 旋转速度（与 time 选填其一）
   * @param {String} [params.loopType] - 循环类型，默认为 no
   * @param {String} [params.lerpType] - 旋转速度插值类型
   * @param {Function} [params.complete] - 旋转完成时的回调函数，仅当 loopType 为 no 时有回调
   * @example
   * // 物体绕 Y 轴旋转 90 度，5s 转完
   * obj.rotateTo({
   *   angles: [0, 90, 0], // 旋转角度
   *   time: 5000, // 总时间
   *   complete: function () {
   *     THING.Utils.log('rotate complete');  // 旋转结束回调
   *   }
   * })
   * // 物体绕 Y 轴旋转 90 度，5s 变加速转完
   * obj.rotateTo({
   *   angles: [0, 90, 0],
   *   time: 5000,
   *   lerpType: THING.LerpType.Quadratic.In, // 速度插值
   *   complete: function () {
   *     THING.Utils.log('finish')
   *   }
   * })
   */
  rotateTo(params) {}

  /**
   * 绕自身 X 轴旋转
   * @param {Number} value - 旋转角度值
   */
  rotateX(value) {}

  /**
   * 绕自身 Y 轴旋转
   * @param {Number} value - 旋转角度值
   */
  rotateY(value) {}

  /**
   * 绕自身 Z 轴旋转
   * @param {Number} value - 旋转角度值
   */
  rotateZ(value) {}

  /**
   * 在一段时间内将物体缩放至某比例
   * @param {Object} params - 参数对象
   * @param {Array<Number>} params.scale - 缩放值
   * @param {Number} [params.time] - 完成缩放的时间（毫秒）
   * @param {Number} [params.speed] - 缩放速度（与 time 选填其一）
   * @param {THING.LerpType} [params.lerpType] - 缩放速度插值类型
   * @param {String} [params.loopType] - 循环类型，默认为 no
   * @param {Function} [params.complete] - 缩放完成时的回调
   * @example
   * // 5s 物体缩放至两倍
   * obj.scaleTo({
   *   scale: [2,2,2], // 等比例缩放两倍
   *   time: 5000,
   *   complete: function () {
   *     THING.Utils.log('scale completed');  // 缩放结束回调
   *   }
   * });
   * // 缩放循环往复进行
   * obj.scaleTo({
   *   scale:[2,2,2],
   *   time: 2000,
   *   loopType: THING.LoopType.PingPong // 循环类型：来回往复
   * })
   */
  scaleTo(params) {}

  /**
   * 将本地坐标系下的相对位置转换成世界坐标系下的绝对位置
   * @param {Array<Number>} localPos - 本地坐标系下的相对位置
   * @returns {Array<Number>} 世界坐标系下的绝对位置
   * @example
   * // 例如某书柜在三楼的原点（相对位置）
   * // floor 为三楼楼层对象，返回结果为书柜在世界坐标系下的绝对位置，比如 [5,6,-15]
   * floor.selfToWorld([0,0,0]);
   */
  selfToWorld(localPos) {}

  /**
   * 设置属性值
   * @param {String} key - 属性名，可以使用 a/b/c 的路径方式
   * @param {*} value - 属性值
   * @example
   * obj.setAttribute("userData/price",50);
   */
  setAttribute(key, value) {}

  /**
   * 批量设置属性值
   * @param {Object} attributes - 属性列表
   * @param {Boolean} [overwrite=true] - 是否覆盖原有属性（默认覆盖），如果为 false 表示如果原属性存在，则不会更新属性值
   * @example
   * obj.setAttributes({
   *   "userData/power": 50,
   *   "userData/pirce": 60
   * })
   */
  setAttributes(attributes, overwrite) {}

  /**
   * 停止移动，停止 moveTo 、 movePath
   */
  stopMoving() {}

  /**
   * 停止旋转动画，停止 rotateTo 、rotateAround
   */
  stopRotating() {}

  /**
   * 停止缩放动画（scaleTo）
   */
  stopScaling() {}

  /**
   * 相对于本地坐标系进行移动
   * @param {Array<Number>} offset - 相对于本地坐标系的偏移量
   * @example
   * // 沿 X 轴移动 1m (即 左移 1m)
   * obj.translate([1,0,0]);
   * // 沿 Y 轴移动 1m (即 上移 1m)
   * obj.translate([0,1,0]);
   * // 沿 Z 轴移动 1m (即 向前移动 1m)
   * obj.translate([0,0,1]);
   */
  translate(offset) {}

  /**
   * 触发事件
   * @param {String} eventType - 事件名称
   * @param {Object} [ev] - 事件信息，传递回调参数 
   * @param {String} [tag] - 事件标签
   * @example
   * // 触发自定义的告警事件
   * obj.trigger('Alarm');
   * obj.on('Alarm',function(ev){
   *   THING.Utils.log(ev.object.name);
   * });
   * // 传递参数
   * obj.trigger('Alarm',{level:2});
   * obj.on('Alarm',function(ev){
   *   THING.Utils.log(ev.level)
   * })
   */
  trigger(eventType, ev, tag) {}

  /**
   * 将世界坐标系下的绝对位置转换成物体自身的坐标系下的相对位置
   * @param {Array<Number>} worldPos - 世界坐标系下的绝对位置
   * @returns {Array<Number>} 相对坐标
   * @example
   * // 例如三楼某书柜在世界坐标系下的绝对坐标是 [5,6,-15]
   * // floor 为三楼楼层对象，返回结果为书柜相对于该楼层的坐标，比如 [0,0,0]
   * floor.worldToSelf([5,6,-15]);
   */
  worldToSelf(worldPos) {}
}

export default BaseObject;