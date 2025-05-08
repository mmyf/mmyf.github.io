/**
 * CameraController 摄像机类
 * 通过 app.camera，获取摄像机对象
 * @class
 */
class CameraController {
  /**
   * 设置/获取摄像机惯性插值因子，数值越小插值效果越明显
   * @type {Number}
   */
  dampingFactor;

  /**
   * 设置/获取摄像机镜头和观察点的距离
   * @type {Number} 
   */
  distance;

  /**
   * 设置/获取摄像机距离范围 [最小值, 最大值]
   * @type {Array<Number>}
   */
  distanceLimited;

  /**
   * 设置/获取是否开启默认平移操作
   * @type {Boolean}
   * @example
   * // 关闭默认的鼠标右键平移操作
   * app.camera.enablePan = false;
   */
  enablePan;

  /**
   * 设置/获取是否开启默认的旋转操作
   * @type {Boolean}
   * @example
   * // 关闭默认的鼠标左键旋转操作
   * app.camera.enableRotate = false;
   */
  enableRotate;

  /**
   * 设置/获取是否开启默认缩放操作
   * @type {Boolean}
   * @example
   * // 关闭默认的鼠标滚轮缩放操作
   * app.camera.enableZoom = false;
   */
  enableZoom;

  /**
   * 设置/获取摄像机远裁剪面的距离，超过这个距离的物体将不会被看到
   * @type {Number}
   * @example
   * app.camera.far = 100;
   */
  far;

  /**
   * 获取摄像机是否在飞行
   * @type {Boolean}
   */
  flying;

  /**
   * 设置/获取摄像机 FOV 值越大，视野越大。默认值为 60
   * @type {Number}
   * @example
   * app.camera.fov = 90;
   */
  fov;

  /**
   * 设置/获取是否开启默认的摄像机交互操作
   * @type {Boolean}
   * @example
   * // 关闭默认的摄像机交互操作（包括 旋转、平移、缩放）
   * app.camera.inputEnabled = false;
   */
  inputEnabled;

  /**
   * 设置/获取摄像机键盘平移速度，默认值为 0.1
   * @type {Number}
   */
  keyPanSpeed;

  /**
   * 设置/获取摄像机鼠标平移速度，默认值为 0.1
   * @type {Number}
   */
  mousePanSpeed;

  /**
   * 设置/获取摄像机近裁剪面的距离，比这个距离近的物体将不会被看到
   * @type {Number}
   * @example
   * app.camera.near = 1;
   */
  near;

  /**
   * 设置/获取摄像机镜头位置（眼睛位置）
   * @type {Array<Number>}
   * @example
   * app.camera.position = [10,10,10];
   */
  position;

  /**
   * 设置/获取摄像机投影类型，默认为透视投影
   * @type {CameraProjectionType|String}
   * @example
   * // 透视投影
   * app.camera.projectionType = THING.CameraProjectionType.Perspective;
   * // 正射投影
   * app.camera.projectionType = THING.CameraProjectionType.Orthographic;
   */
  projectionType;

  /**
   * 设置/获取摄像机旋转速度
   * @type {Number}
   */
  rotateSpeed;

  /**
   * 设置/获取摄像机目标点位置
   * @type {Array<Number>}
   * @example
   * app.camera.target = [0,0,0];
   */
  target;

  /**
   * 设置/获取摄像机 UP 方向，默认值为 [0,1,0]
   * @type {Array<Number>}
   */
  up;

  /**
   * 设置/获取视图默认（2D/3D视图），默认为 3D 视图
   * @type {CameraView|Number}
   * @example
   * // 设置为 2D 顶视图
   * app.camera.viewMode = THING.CameraView.TopView;
   * // 设置为 3D 视图
   * app.camera.viewMode = THING.CameraView.Normal;
   */
  viewMode;

  /**
   * 设置/获取摄像机垂直角度范围 [最小值, 最大值]，默认值 [-90, 90]
   * @type {Array<Number>}
   * @example
   * // 限制摄像机不看到场景地面以下
   * app.camera.xAngleLimitRange = [0,90];
   */
  xAngleLimitRange;

  /**
   * 设置/获取摄像机水平角度范围 [最小值, 最大值]，范围在 [-180, 180] 之间。此接口功能在地球上暂不生效
   * @type {Array<Number>}
   */
  yAngleLimitRange;

  /**
   * 设置/获取摄像机缩放系数范围[最小值, 最大值]
   * @type {Array<Number>}
   * @note 仅在 2D 视图下有效果
   */
  zoomLimited;

  /**
   * 获取摄像机到某坐标或者另一物体的绝对距离
   * @param {Array<Number>|THING.BaseObject} position - 世界坐标系下的位置或另一物体
   * @returns {Number} 距离
   * @example
   * // 填写世界坐标系下的位置
   * camera.distanceTo([0,0,0]);
   * // 填写物体对象
   * camera.distanceTo(otherObj);
   */
  distanceTo(position) {}

  /**
   * 观察某物体
   * @param {Object} param - 参数对象
   * @param {THING.BaseObject} param.object - 观察的物体
   * @param {Number} param.xAngle - 绕物体自身 X 轴旋转角度
   * @param {Number} param.yAngle - 绕物体自身 Y 轴旋转角度
   * @param {Number} param.radiusFactor - 离目标物体距离（离物体 n 倍自身包围盒半径距离处）
   * @param {Number} param.radius - 离目标物体距离（与 radiusFactor 选填其一）
   * @example
   * // 观察某物体
   * app.camera.fit(obj);
   * // 距离3倍物体自身包围盒半径处观察物体
   * app.camera.fit({
   *   object:obj,
   *   radiusFactor:3
   * });
   */
  fit(param) {}

  /**
   * 摄像机飞行到某位置或物体
   * @param {Object} param - 参数对象
   * @param {THING.BaseObject} param.object - 观察的物体
   * @param {Array<Number>} param.target - 观察的目标点位置，与 object 参数选填其一
   * @param {Array<Number>} [param.position] - （可选）摄像机镜头位置，与 target 组合使用
   * @param {Array<Number>} [param.up] - （可选）摄像机 up 朝向
   * @param {Number} [param.time] - （可选）飞行过程的时间，单位：毫秒，默认值 2s
   * @param {Number} [param.xAngle] - （可选）绕物体自身 X 轴旋转角度
   * @param {Number} [param.yAngle] - （可选）绕物体自身 Y 轴旋转角度
   * @param {Number} [param.radiusFactor] - （可选）离目标点距离，离目标点 n 倍物体自身包围盒半径距离处
   * @param {Number} [param.radius] - （可选）离目标点距离，与 radiusFactor 选填其一
   * @param {THING.LerpType} [param.lerpType] - （可选）飞行速度插值方式
   * @param {THING.LerpType} [param.positionLerp] - （可选）摄像机镜头坐标插值方式
   * @param {THING.LerpType} [param.targetLerp] - （可选）目标点插值方式
   * @param {THING.LerpType} [param.upLerp] - （可选）up 朝向插值方式
   * @param {Boolean} [param.isEarth] - （可选）是否在地球上，默认 false。在地球上使用需要传 true
   * @param {Function} [param.complete] - （可选）飞行结束时的回调函数
   * @example
   * // 飞行到某位置
   * app.camera.flyTo({
   *   position: [3.6, 4.8, -6.5],
   *   target: [-4.2, -3.2, -20.6],
   *   time: 2000,
   *   complete: function() {
   *     THING.Utils.log('complete');
   *   }
   * });
   * // 飞行到某物体
   * app.camera.flyTo(obj);
   * // 飞行到某物体 设置飞行时间 和 飞行结束后的回调
   * app.camera.flyTo({
   *   object: obj,
   *   time: 1500,
   *   complete: function() {
   *     THING.Utils.log('finish');
   *   }
   * });
   * // 飞行到某物体正前方 2倍物体自身包围半径距离处
   * app.camera.flyTo({
   *   object: obj,
   *   xAngle: 0, // 绕物体自身X轴旋转角度
   *   yAngle: 0, // 绕物体自身Y轴旋转角度
   *   radiusFactor: 2, // 物体包围盒半径的倍数
   *   time: 2 * 1000,
   *   complete: function () {
   *     THING.Utils.log("飞行结束");
   *   }
   * });
   * // 飞行到某物体正前方 5m 处
   * app.camera.flyTo({
   *   object: obj,
   *   xAngle: 0, // 绕物体自身X轴旋转角度
   *   yAngle: 0, // 绕物体自身Y轴旋转角度
   *   radius: 5,
   *   time: 2 * 1000,
   *   complete: function () {
   *     THING.Utils.log("飞行结束");
   *   }
   * });
   * // 飞到物体顶部 3倍物体自身包围盒半径距离处
   * app.camera.flyTo({
   *   object: obj,
   *   xAngle: 90, // 绕物体自身X轴旋转角度
   *   yAngle: 0, // 绕物体自身Y轴旋转角度
   *   radiusFactor: 3, // 物体包围盒半径的倍数
   *   time: 2 * 1000,
   *   complete: function () {
   *     THING.Utils.log("飞行结束");
   *   }
   * });
   */
  flyTo(param) {}

  /**
   * 根据物体包围盒检测是某物体否在摄相机视锥范围内
   * @param {THING.BaseObject} object - 物体
   * @returns {Boolean}
   * @example
   * app.camera.isInView(obj);
   */
  isInView(object) {}

  /**
   * 看向某个物体或位置，设置后鼠标无法旋转和平移
   * @param {Array<Number>|THING.BaseObject} target - 物体或者坐标，取消设置填 null
   * @example
   * // 看向某物体
   * app.camera.lookAt(app.query('car01')[0]);
   * // 看向某点
   * app.camera.lookAt([20, 5.6, -6.6]);
   * // 取消设置
   * app.camera.lookAt(null);
   */
  lookAt(target) {}

  /**
   * 移动摄像机
   * @param {Number} deltaX - 水平移动距离
   * @param {Number} deltaY - 垂直移动距离
   * @example
   * // 水平移动 10 m
   * app.camera.move(10,0);
   * // 垂直移动 10 m
   * app.camera.move(0,10);
   */
  move(deltaX, deltaY) {}

  /**
   * 环绕旋转
   * @param {Object} param - 参数对象
   * @param {THING.BaseObject} [param.object] - （可选）环绕的物体
   * @param {Array<Number>} [param.target] - （可选）环绕的某点世界坐标系下的坐标，与 object 选填其一
   * @param {Number} [param.yRotateAngle] - （可选）环绕 Y 轴旋转角度，俯仰面（竖直面）内的角度，范围 0~180 度
   * @param {Number} [param.xRotateAngle] - （可选）环绕 X 轴旋转角度，方位面（水平面）内的角度，范围 0~360 度。地球上无法使用此参数
   * @param {Number} [param.time] - （可选）处理时间，单位：毫秒
   * @param {String} [param.loopType] - （可选）循环类型，默认为 no
   * @param {Function} [param.complete] - （可选）环绕旋转完成后的回调函数，仅当 loopType 为 no 时有回调
   * @param {Boolean} [param.isEarth] - （可选）是否在地球上，默认 false。在地球上使用需要传 true
   * @example
   * // 环绕某物体旋转 360 度，10s 转完
   * app.camera.rotateAround({
   *   object: obj,// 环绕的物体 (object 与 target 的设置互斥 详见教程)
   *   time: 10 * 1000, // 环绕飞行的时间
   *   yRotateAngle: 360, // 环绕y轴飞行的旋转角度
   *   complete:function(){
   *     THING.Utils.log('finish');
   *   }
   * });
   * // 环绕 [0,0,0] 点一直旋转
   * app.camera.rotateAround({
   *   target: [0,0,0],
   *   time: 60 * 1000, // 环绕飞行的时间
   *   yRotateAngle: 360, // 环绕y轴飞行的旋转角度
   *   loopType: THING.LoopType.Repeat // 设置循环类型 重复循环
   * });
   */
  rotateAround(params) {}

  /**
   * 屏幕坐标转世界坐标
   * @param {Number} x - 屏幕x坐标
   * @param {Number} y - 屏幕y坐标
   * @returns {Array<Number>} 三维世界坐标
   */
  screenToWorld(x, y) {}

  /**
   * 停止飞行
   * @param {Object} [param] - 参数对象
   * @param {Boolean} [param.isEarth] - （可选）是否在地球上，默认 false。在地球上使用需要传 true
   */
  stopFlying(param) {}

  /**
   * 停止环绕旋转，针对 rotateAround
   * @param {Object} [param] - 参数对象
   * @param {Boolean} [param.isEarth] - （可选）是否在地球上，默认 false。在地球上使用需要传 true
   */
  stopRotateAround(param) {}

  /**
   * 世界坐标转换成屏幕坐标
   * @param {Array<Number>} position - 三维世界坐标
   * @returns {Array<Number>} 二维屏幕坐标
   */
  worldToScreen(position) {}

  /**
   * 向前/向后移动摄像机
   * @param {Number} distance - 移动距离(+: 向前, -: 向后)
   * @param {Number} [time=500] - 移动时间（毫秒）默认值为 0.5s
   */
  zoom(distance, time) {}
}

export default CameraController;
