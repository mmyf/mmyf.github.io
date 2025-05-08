/**
 * Thing 物体
 * @class
 * @extends THING.BaseObject 
 */
class Thing extends THING.BaseObject {
  /**
   * 获取模型动画名称，返回动画名称数组。若模型无动画，则数组为 []
   * @type {Array<String>}
   * @example
   * // 如果模型有动画，返回结果如 ["Auto_Open","Auto_Close"]
   * // 如果模型无动画，返回结果为 []
   * var animNames = obj.animationNames;
   */
  animationNames;

  /**
   * 获取模型资源路径，目前不能获取 CampusBuilder 导入的场景中摆放的物体模型资源路径（返回 '' ）, 
   * 仅能获取通过 app.create 创建出来的物体模型资源路径
   * @type {String}
   * @example
   * var url = obj.url;
   */
  url;

  /**
   * 判断某个动画是否正在播放
   * @param {String} [name] - 动画名字，若不提供则判断是否有任一动画正在播放
   * @returns {Boolean}
   */
  isPlayingAnimation(name) {}

  /**
   * 暂停动画播放
   * @param {String} [name] - 动画名称, 不传递此参数表示暂停所有动画
   */
  pauseAnimation(name) {}

  /**
   * 播放动画
   * @param {Object} params - 参数对象
   * @param {String|Array<String>} params.name - 动画名，如果是数组，则同时播放多个动画
   * @param {Number} [params.speed] - 播放速度（倍数）
   * @param {Number} [params.loopType] - 循环类型 默认为 no 不循环
   * @param {Boolean} [params.autoReset] - 是否复位播放 如果是false,则从当前帧开始播放. 默认为true
   * @param {Boolean} [params.reverse] - 是否倒播
   * @param {Function} [params.complete] - 动画播放完成函数回调，仅单个动画播放完成且不循环时，才有回调
   * @example
   * // 播放模型中动画名称为 open1 的动画
   * obj.playAnimation('open1');
   * 
   * // 同时播放多个动画
   * obj.playAnimation({
   *   name: ['open1', 'open2']
   * });
   * 
   * // 设置单个动画播放完成后的回调
   * obj.playAnimation({
   *   name: 'open1',
   *   complete:function(ev){
   *     THING.Utils.log(ev + '动画播放结束')
   *   }
   * });
   * 
   * // 设置播放速度
   * obj.playAnimation({
   *   name: 'open1',
   *   speed: 0.5
   * });
   * 
   * // 动画播放一次完成后，从头再次播放动画，依此循环播放
   * obj.playAnimation({
   *   name: 'open1',
   *   loopType: THING.LoopType.Repeat,
   * });
   * 
   * // 往复循环播动画
   * obj.playAnimation({
   *   name: 'open1',
   *   loopType: THING.LoopType.PingPong,
   * });
   * 
   * // 倒播动画
   * obj.playAnimation({
   *   name: 'open1',
   *   reverse: true,
   * });
   */
  playAnimation(params) {}

  /**
   * 恢复动画播放
   * @param {String} [name] - 动画名称, 不传递此参数表示恢复所有动画
   */
  resumeAnimation(name) {}

  /**
   * 停止播放动画
   * @param {String} [name] - 动画名称，不传递此参数表示停止所有动画
   */
  stopAnimation(name) {}
}

// 创建Thing
var obj1 = app.create({
  type: 'Thing',
  id: 'myCar01', // 物体 id
  name: 'policeCar', // 物体名称
  url: 'https://model.3dmomoda.com/models/66b7f5979ff043afa4e79f7299853a4b/0/gltf/', // 模型地址
  position: [0, 0, 0], // 在世界坐标系下的位置
  complete: function (ev) {
    //物体加载完成后的回调函数
    THING.Utils.log('thing created: ' + ev.object.id);
  }
});

// 以某物体为父亲，创建Thing
var obj2 = app.create({
  type: 'Thing',
  id: 'myCar02', // 物体 id
  name: 'policeCar', // 物体名称
  url: 'https://model.3dmomoda.com/models/66b7f5979ff043afa4e79f7299853a4b/0/gltf/', // 模型地址
  parent: obj,// 父物体
  localPosition: [0, 0, 0], // 父物体坐标系下的相对坐标
  complete: function (ev) {
    //物体加载完成后的回调函数
    THING.Utils.log('thing created: ' + ev.object.id);
  }
});

export default Thing;