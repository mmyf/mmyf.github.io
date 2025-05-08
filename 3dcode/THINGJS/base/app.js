/**
 * @class THING.App
 * @description App 主程序,是 ThingJS 库入口,提供加载场景、搜索、事件绑定、摄像机控制等功能
 */
class App {
  /**
   * @constructor
   * @param {Object} options 配置项
   * @param {String} options.url 初始场景资源地址
   * @param {String|Number} options.background 背景颜色或贴图资源地址  
   * @param {String} options.skyBox 天空盒资源名称
   * @param {Function} options.complete 初始化完成的回调函数
   */
  constructor(options) {}

  /**
   * 背景颜色或者图片
   * @type {String|Number}
   */
  background;

  /**
   * 摄像机对象
   * @type {THING.CameraController}
   */
  camera;

  /**
   * 获取从 3D 启动以来一共渲染了多少帧
   * @type {Number}
   */
  currentFrameCount;

  /**
   * 获取距上一帧流逝的时间（毫秒）
   * @type {Number}
   */
  deltaTime;

  /**
   * 获取从 3D 启动到现在流逝的时间（毫秒）
   * @type {Number}
   */
  elapsedTime;

  /**
   * 设置雾参数
   * @type {Object}
   * @param {String} options.color 雾颜色数值
   * @param {Number} options.far 设置远距离的雾效浓度
   * @param {Number} options.near 设置近距离的雾效浓度
   */
  fog;

  /**
   * 判断是否为移动端设备
   * @type {Boolean}
   */
  isMobileDevice;

  /**
   * 是否保持背景图片的长宽比，默认值：true
   * @type {Boolean}
   */
  keepBackgroundAspect;

  /**
   * 获取场景层次管理器
   * @type {THING.SceneLevel}
   */
  level;

  /**
   * 设置灯光参数
   * @type {Object}
   * @param {Boolean} options.showHelper 是否显示辅助线
   * @param {Object} options.ambientLight 环境光
   * @param {Number} options.ambientLight.intensity 环境光强度
   * @param {Number} options.ambientLight.color 环境光颜色
   * @param {Object} options.hemisphereLight 半球光
   * @param {Number} options.hemisphereLight.intensity 半球光强度
   * @param {Number} options.hemisphereLight.color 天空发出的光线颜色
   * @param {Number} options.hemisphereLight.groundColor 地面发出的光线颜色
   * @param {Object} options.mainLight 主灯光
   * @param {Boolean} options.mainLight.shadow 是否产生阴影
   * @param {String} options.mainLight.shadowQuality 获取/设置阴影效果品质
   * @param {Number} options.mainLight.intensity 主灯光强度
   * @param {Number} options.mainLight.color 主灯光颜色
   * @param {Number} options.mainLight.alpha 主灯光角度
   * @param {Number} options.mainLight.beta 主灯光角度
   * @param {Object} options.secondaryLight 第二光源
   * @param {Boolean} options.secondaryLight.shadow 是否产生阴影
   * @param {String} options.secondaryLight.shadowQuality 获取/设置阴影效果品质
   * @param {Number} options.secondaryLight.intensity 第二光源强度
   * @param {Number} options.secondaryLight.color 第二光源颜色
   * @param {Number} options.secondaryLight.alpha 第二光源角度
   * @param {Number} options.secondaryLight.beta 第二光源角度
   * @param {Object} options.tertiaryLight 第三光源
   * @param {Boolean} options.tertiaryLight.shadow 是否产生阴影
   * @param {String} options.tertiaryLight.shadowQuality 获取/设置阴影效果品质
   * @param {Number} options.tertiaryLight.intensity 第三光源强度
   * @param {Number} options.tertiaryLight.color 第三光源颜色
   * @param {Number} options.tertiaryLight.alpha 第三光源角度
   * @param {Number} options.tertiaryLight.beta 第三光源角度
   */
  lighting;

  /**
   * 设置/获取像素比，默认为1
   * @type {Number}
   */
  pixelRatio;

  /**
   * 设置后期处理参数
   * @type {Object}
   * @param {Object} options.temporalSuperSampling 超采样(场景静止时起作用)
   * @param {Boolean} options.temporalSuperSampling.enable 启用/禁用超采样
   * @param {Number} options.temporalSuperSampling.size 采样的帧数
   * @param {Object} options.postEffect 后期处理
   * @param {Boolean} options.postEffect.enable 启用/禁用后期处理
   * @param {Object} options.postEffect.bloom 泛光（会影响天空盒）
   * @param {Boolean} options.postEffect.bloom.enable 启用/禁用泛光
   * @param {Number} options.postEffect.bloom.strength 泛光强度
   * @param {Number} options.postEffect.bloom.radius 泛光半径
   * @param {Number} options.postEffect.bloom.threshold 泛光阈值
   * @param {Object} options.postEffect.screenSpaceAmbientOcclusion 屏幕空间环境光遮蔽
   * @param {Boolean} options.postEffect.screenSpaceAmbientOcclusion.enable 启用/禁用环境光遮蔽
   * @param {Number} options.postEffect.screenSpaceAmbientOcclusion.radius 采样半径
   * @param {Number} options.postEffect.screenSpaceAmbientOcclusion.quality 采样等级
   * @param {Number} options.postEffect.screenSpaceAmbientOcclusion.intensity 环境光遮蔽强度
   * @param {Number} options.postEffect.screenSpaceAmbientOcclusion.temporalFilter 使用temporal超采样时起作用
   * @param {Boolean} options.postEffect.screenSpaceAmbientOcclusion.ignoreTransparent 忽略透明物体
   * @param {Object} options.postEffect.colorCorrection 颜色校正
   * @param {Boolean} options.postEffect.colorCorrection.enable 启用/禁用颜色校正
   * @param {Number} options.postEffect.colorCorrection.exposure 曝光
   * @param {Number} options.postEffect.colorCorrection.brightness 亮度
   * @param {Number} options.postEffect.colorCorrection.contrast 对比度
   * @param {Number} options.postEffect.colorCorrection.saturation 饱和度
   * @param {Object} options.postEffect.vignette 光晕效果
   * @param {Boolean} options.postEffect.vignette.enable 启用/禁用光晕效果
   * @param {String} options.postEffect.vignette.type 光晕类型
   * @param {Number} options.postEffect.vignette.color 光晕颜色
   * @param {Number} options.postEffect.vignette.offset 光晕从边缘到中心的渐变偏移值
   * @param {Object} options.postEffect.FXAA 快速近似抗锯齿
   * @param {Boolean} options.postEffect.FXAA.enable 启用/禁用快速近似抗锯齿
   * @param {Object} options.postEffect.MSAA 多重采样抗锯齿
   * @param {Boolean} options.postEffect.MSAA.enable 启用/禁用多重采样抗锯齿
   * @param {Object} options.postEffect.film 电影特效
   * @param {Boolean} options.postEffect.film.enable 启用/禁用电影特效
   * @param {Boolean} options.postEffect.film.grayscale 黑白开关
   * @param {Number} options.postEffect.film.noiseIntensity 噪声强度
   * @param {Number} options.postEffect.film.scanlinesIntensity 扫描线强度
   * @param {Number} options.postEffect.film.scanlinesCount 扫描线数量
   * @param {Object} options.postEffect.chromaticAberration 色偏效果
   * @param {Boolean} options.postEffect.chromaticAberration.enable 启用/禁用色偏效果
   * @param {Number} options.postEffect.chromaticAberration.chromaFactor 色偏强度
   * @param {Object} options.postEffect.dof 景深
   * @param {Boolean} options.postEffect.dof.enable 启用/禁用景深
   * @param {Number} options.postEffect.dof.focalDepth 聚焦距离
   * @param {Number} options.postEffect.dof.focalLength 聚焦范围
   * @param {Number} options.postEffect.dof.maxblur 最大模糊度
   * @param {Object} options.postEffect.screenSpaceReflection 屏幕空间反射
   * @param {Boolean} options.postEffect.screenSpaceReflection.enable 启用/禁用屏幕空间反射
   * @param {Number} options.postEffect.screenSpaceReflection.maxRayDistance 最大射线距离
   * @param {Number} options.postEffect.screenSpaceReflection.pixelStride 采样跨度
   * @param {Number} options.postEffect.screenSpaceReflection.pixelStrideZCutoff 采样跨度缩放临界值
   * @param {Number} options.postEffect.screenSpaceReflection.screenEdgeFadeStart 屏幕边缘淡出
   * @param {Number} options.postEffect.screenSpaceReflection.eyeFadeStart 视界范围淡出开始值
   * @param {Number} options.postEffect.screenSpaceReflection.eyeFadeEnd 视界范围淡出结束值
   * @param {Number} options.postEffect.screenSpaceReflection.minGlossiness SSR生效所要求的材质最小光泽度
   * @param {Boolean} options.postEffect.resetOther 是否重置其它未设置的后期处理配置
   */
  postEffect;

  /**
   * 获取场景根节点
   * @type {THING.SceneRoot}
   */
  root;

  /**
   * 设置/获取渲染窗口尺寸
   * @type {Array<Number>}
   */
  size;

  /**
   * 设置天空盒
   * @type {String}
   */
  skyBox;

  /**
   * 设置动态天空效果
   * @type {Object}
   * @param {Number} options.time 时间
   * @param {Number} options.beta 角度
   * @param {Number} options.turbidity 混浊度
   * @param {Number} options.rayleigh 瑞利散射
   * @param {Number} options.mieCoefficient Mie（米氏）散射系数
   * @param {Number} options.mieDirectionalG 基于 Mie 散射理论的烟雾粒子数
   */
  skyEffect;

  /**
   * 添加控件
   * @param {Object} ctrl 控件对象
   * @param {String} name 控件自定义名称
   * @param {Boolean} afterRender 是否在渲染后
   */
  addControl(ctrl, name, afterRender) {}

  /**
   * 将当前 3D 渲染内容截屏保存到指定文件中
   * @param {String} fileName 文件名称
   */
  captureScreenshot(fileName) {}

  /**
   * 将当前 3D 渲染内容截屏保存到缓冲区中
   * @param {Number} width 图片宽度
   * @param {Number} height 图片高度
   * @param {String} extension 文件类型
   * @param {Number} quality 质量(0~1]之间
   * @returns {Object} base64 编码图片数据
   */
  captureScreenshotToImage(width, height, extension, quality) {}

  /**
   * 创建物体
   * @param {Object} param 参数
   * @param {String} param.type 物体类型
   * @param {Number|String} param.id 物体 ID
   * @param {String} param.name 物体名称
   * @param {String} param.url 模型资源地址
   * @param {Array<Number>} param.position 物体在世界坐标系下的位置
   * @param {Function} param.complete 物体加载完成后的回调函数
   * @returns {THING.BaseObject}
   */
  create(param) {}

  /**
   * 使 3D 窗口获得焦点
   */
  focus() {}

  /**
   * 根据名字获取控件
   * @param {String} name 控件自定义名称
   * @returns {Object} 控件对象
   */
  getControl(name) {}

  /**
   * 判断是否已添加了某控件
   * @param {Object|String} ctrl 控件对象 或 控件自定义名称
   * @returns {Boolean}
   */
  hasControl(ctrl) {}

  /**
   * 判断某按键是否按下
   * @param {THING.KeyType|Number} key 键值
   * @returns {Boolean}
   */
  isKeyPressed(key) {}

  /**
   * 移除事件绑定
   * @param {String} eventType 事件类型名称
   * @param {String} condition 物体类型选择条件
   * @param {Function|String} callback 事件触发的回调函数 或 事件标签
   */
  off(eventType, condition, callback) {}

  /**
   * 全局绑定事件
   * @param {String} eventType 事件类型名称
   * @param {String} condition 物体类型选择条件
   * @param {Object} userData 事件传递自定义数据
   * @param {Function} callback 事件触发的回调函数
   * @param {String} tag 事件标签
   * @param {Number} priority 优先级
   */
  on(eventType, condition, userData, callback, tag, priority) {}

  /**
   * 绑定事件，只触发一次
   * @param {THING.EventType|String} eventType 事件名称
   * @param {String} condition 物体类型选择条件
   * @param {Object} userData 事件绑定自定义数据
   * @param {Function} callback 事件触发的回调函数
   * @param {String} tag 事件标签
   * @param {Number} priority 优先级
   */
  one(eventType, condition, userData, callback, tag, priority) {}

  /**
   * 暂停事件响应
   * @param {THING.EventType|String} eventType 事件名称
   * @param {String} condition 物体类型选择条件
   * @param {String} tag 事件标签
   */
  pauseEvent(eventType, condition, tag) {}

  /**
   * 物体查询
   * @param {String} param 查询条件
   * @returns {THING.Selector} 查询结果
   */
  query(param) {}

  /**
   * 删除控件
   * @param {Object|String} ctrl 控件对象 或 控件自定义名称
   */
  removeControl(ctrl) {}

  /**
   * 恢复事件响应
   * @param {THING.EventType|String} eventType 事件名称
   * @param {String} condition 物体类型选择条件
   * @param {String} tag 事件标签
   */
  resumeEvent(eventType, condition, tag) {}

  /**
   * 保存文件到浏览器下载目录
   * @param {String} fileName 文件名称
   * @param {String} data 文件数据
   */
  saveFile(fileName, data) {}

  /**
   * 触发事件
   * @param {THING.EventType|String} eventType 事件名称
   * @param {String} condition 物体类型选择条件
   * @param {Object} ev 事件信息，传递回调参数
   */
  trigger(eventType, condition, ev) {}
}

/* 示例代码:
var app = new THING.App();

// 初始化 3D 应用，并加载场景
var app = new THING.App({
  url: 'https://www.thingjs.com/static/models/storehouse' 
});

// 设置天空盒
var app = new THING.App({
  url: 'https://www.thingjs.com/static/models/storehouse',
  skyBox:'BlueSky'
});
*/

/**
 * 属性说明
 */

/**
 * background - 背景颜色或者图片
 * @type {String|Number}
 */

/* 示例:
app.background = 0xFF00FF;
app.background = '#FF00FF';
app.background = 'rgb(255,0,255)';
app.background = 'http://www.thingjs.com/static/images/background_img_03.png'
*/

/**
 * camera - 获取摄像机
 * @type {THING.CameraController}
 */

/**
 * currentFrameCount - 获取从 3D 启动以来一共渲染了多少帧
 * @type {Number}
 */

/**
 * deltaTime - 获取距上一帧流逝的时间（毫秒）
 * @type {Number}
 */

/**
 * elapsedTime - 获取从 3D 启动到现在流逝的时间（毫秒）
 * @type {Number}
 */

/**
 * fog - 设置雾参数
 * @type {Object}
 * @param {String} options.color 雾颜色数值
 * @param {Number} options.far 设置远距离的雾效浓度
 * @param {Number} options.near 设置近距离的雾效浓度
 */

/* 示例:
app.fog = {color: '0x888888', near: 1, far: 100};
app.fog = null;
*/

/**
 * isMobileDevice - 判断是否为移动端设备
 * @type {Boolean}
 */

/**
 * keepBackgroundAspect - 是否保持背景图片的长宽比，默认值：true
 * @type {Boolean}
 */

/* 示例:
app.keepBackgroundAspect = true;
*/

/**
 * level - 获取场景层次管理器
 * @type {THING.SceneLevel}
 */

/**
 * lighting - 设置灯光参数
 * @type {Object}
 * @param {Boolean} options.showHelper 是否显示辅助线
 * @param {Object} options.ambientLight 环境光
 * @param {Number} options.ambientLight.intensity 环境光强度
 * @param {Number} options.ambientLight.color 环境光颜色
 * @param {Object} options.hemisphereLight 半球光
 * @param {Number} options.hemisphereLight.intensity 半球光强度
 * @param {Number} options.hemisphereLight.color 天空发出的光线颜色
 * @param {Number} options.hemisphereLight.groundColor 地面发出的光线颜色
 * @param {Object} options.mainLight 主灯光
 * @param {Boolean} options.mainLight.shadow 是否产生阴影
 * @param {String} options.mainLight.shadowQuality 获取/设置阴影效果品质
 * @param {Number} options.mainLight.intensity 主灯光强度
 * @param {Number} options.mainLight.color 主灯光颜色
 * @param {Number} options.mainLight.alpha 主灯光角度
 * @param {Number} options.mainLight.beta 主灯光角度
 * @param {Object} options.secondaryLight 第二光源
 * @param {Boolean} options.secondaryLight.shadow 是否产生阴影
 * @param {String} options.secondaryLight.shadowQuality 获取/设置阴影效果品质
 * @param {Number} options.secondaryLight.intensity 第二光源强度
 * @param {Number} options.secondaryLight.color 第二光源颜色
 * @param {Number} options.secondaryLight.alpha 第二光源角度
 * @param {Number} options.secondaryLight.beta 第二光源角度
 * @param {Object} options.tertiaryLight 第三光源
 * @param {Boolean} options.tertiaryLight.shadow 是否产生阴影
 * @param {String} options.tertiaryLight.shadowQuality 获取/设置阴影效果品质
 * @param {Number} options.tertiaryLight.intensity 第三光源强度
 * @param {Number} options.tertiaryLight.color 第三光源颜色
 * @param {Number} options.tertiaryLight.alpha 第三光源角度
 * @param {Number} options.tertiaryLight.beta 第三光源角度
 */

/* 示例:
app.lighting = {
  showHelper: false,
  ambientLight: {
    intensity: 0.5,
    color: 0xffffff
  },
  hemisphereLight: {
    intensity: 0.0,
    color: 0xffffff,
    groundColor: 0x222222
  },
  mainLight: {
    shadow: false,
    shadowQuality: 'high',
    intensity: 0.5,
    color: 0xffffff,
    alpha: 30,
    beta: 30
  },
  secondaryLight: {
    shadow: false,
    shadowQuality: 'high',
    intensity: 0,
    color: 0xffffff,
    alpha: 138,
    beta: 0
  },
  tertiaryLight: {
    shadow: false,
    shadowQuality: 'high',
    intensity: 0,
    color: 0xffffff,
    alpha: 0,
    beta: 0
  }
};
*/

/**
 * pixelRatio - 设置/获取像素比，默认为1
 * @type {Number}
 */

/* 示例:
app.pixelRatio = 0.8
*/

/**
 * postEffect - 设置后期处理参数
 * @type {Object}
 * @param {Object} options.temporalSuperSampling 超采样(场景静止时起作用)
 * @param {Boolean} options.temporalSuperSampling.enable 启用/禁用超采样
 * @param {Number} options.temporalSuperSampling.size 采样的帧数
 * @param {Object} options.postEffect 后期处理
 * @param {Boolean} options.postEffect.enable 启用/禁用后期处理
 * @param {Object} options.postEffect.bloom 泛光（会影响天空盒）
 * @param {Boolean} options.postEffect.bloom.enable 启用/禁用泛光
 * @param {Number} options.postEffect.bloom.strength 泛光强度
 * @param {Number} options.postEffect.bloom.radius 泛光半径
 * @param {Number} options.postEffect.bloom.threshold 泛光阈值
 * @param {Object} options.postEffect.screenSpaceAmbientOcclusion 屏幕空间环境光遮蔽
 * @param {Boolean} options.postEffect.screenSpaceAmbientOcclusion.enable 启用/禁用环境光遮蔽
 * @param {Number} options.postEffect.screenSpaceAmbientOcclusion.radius 采样半径
 * @param {Number} options.postEffect.screenSpaceAmbientOcclusion.quality 采样等级
 * @param {Number} options.postEffect.screenSpaceAmbientOcclusion.intensity 环境光遮蔽强度
 * @param {Number} options.postEffect.screenSpaceAmbientOcclusion.temporalFilter 使用temporal超采样时起作用
 * @param {Boolean} options.postEffect.screenSpaceAmbientOcclusion.ignoreTransparent 忽略透明物体
 * @param {Object} options.postEffect.colorCorrection 颜色校正
 * @param {Boolean} options.postEffect.colorCorrection.enable 启用/禁用颜色校正
 * @param {Number} options.postEffect.colorCorrection.exposure 曝光
 * @param {Number} options.postEffect.colorCorrection.brightness 亮度
 * @param {Number} options.postEffect.colorCorrection.contrast 对比度
 * @param {Number} options.postEffect.colorCorrection.saturation 饱和度
 * @param {Object} options.postEffect.vignette 光晕效果
 * @param {Boolean} options.postEffect.vignette.enable 启用/禁用光晕效果
 * @param {String} options.postEffect.vignette.type 光晕类型
 * @param {Number} options.postEffect.vignette.color 光晕颜色
 * @param {Number} options.postEffect.vignette.offset 光晕从边缘到中心的渐变偏移值
 * @param {Object} options.postEffect.FXAA 快速近似抗锯齿
 * @param {Boolean} options.postEffect.FXAA.enable 启用/禁用快速近似抗锯齿
 * @param {Object} options.postEffect.MSAA 多重采样抗锯齿
 * @param {Boolean} options.postEffect.MSAA.enable 启用/禁用多重采样抗锯齿
 * @param {Object} options.postEffect.film 电影特效
 * @param {Boolean} options.postEffect.film.enable 启用/禁用电影特效
 * @param {Boolean} options.postEffect.film.grayscale 黑白开关
 * @param {Number} options.postEffect.film.noiseIntensity 噪声强度
 * @param {Number} options.postEffect.film.scanlinesIntensity 扫描线强度
 * @param {Number} options.postEffect.film.scanlinesCount 扫描线数量
 * @param {Object} options.postEffect.chromaticAberration 色偏效果
 * @param {Boolean} options.postEffect.chromaticAberration.enable 启用/禁用色偏效果
 * @param {Number} options.postEffect.chromaticAberration.chromaFactor 色偏强度
 * @param {Object} options.postEffect.dof 景深
 * @param {Boolean} options.postEffect.dof.enable 启用/禁用景深
 * @param {Number} options.postEffect.dof.focalDepth 聚焦距离
 * @param {Number} options.postEffect.dof.focalLength 聚焦范围
 * @param {Number} options.postEffect.dof.maxblur 最大模糊度
 * @param {Object} options.postEffect.screenSpaceReflection 屏幕空间反射
 * @param {Boolean} options.postEffect.screenSpaceReflection.enable 启用/禁用屏幕空间反射
 * @param {Number} options.postEffect.screenSpaceReflection.maxRayDistance 最大射线距离
 * @param {Number} options.postEffect.screenSpaceReflection.pixelStride 采样跨度
 * @param {Number} options.postEffect.screenSpaceReflection.pixelStrideZCutoff 采样跨度缩放临界值
 * @param {Number} options.postEffect.screenSpaceReflection.screenEdgeFadeStart 屏幕边缘淡出
 * @param {Number} options.postEffect.screenSpaceReflection.eyeFadeStart 视界范围淡出开始值
 * @param {Number} options.postEffect.screenSpaceReflection.eyeFadeEnd 视界范围淡出结束值
 * @param {Number} options.postEffect.screenSpaceReflection.minGlossiness SSR生效所要求的材质最小光泽度
 * @param {Boolean} options.postEffect.resetOther 是否重置其它未设置的后期处理配置
 */

/* 示例:
app.postEffect = {
  enable: false,
  bloom: {
    enable: false,
    strength: 0.14,
    radius: 0.4,
    threshold: 0.7
  },
  screenSpaceAmbientOcclusion: {
    enable: false,
    radius: 0.2,
    quality: 'medium',
    intensity: 0.8,
    temporalFilter: true,
    ignoreTransparent: false
  },
  colorCorrection: {
    enable: false,
    exposure: 0,
    brightness: 0,
    contrast: 1,
    saturation: 1,
    gamma: 1
  },
  FXAA: {
    enable: false
  },
  MSAA: {
    enable: true
  },
  film: {
    enable: false,
    grayscale: false,
    noiseIntensity: 0.35,
    scanlinesIntensity: 0,
    scanlinesCount: 2048
  },
  chromaticAberration: {
    enable: false,
    chromaFactor: 0.025
  },
  dof: {
    enable: false,
    focalDepth: 1,
    focalLength: 24,
    maxblur: 1
  },
  screenSpaceReflection: {
    enable: false,
    maxRayDistance: 200,
    pixelStride: 16,
    pixelStrideZCutoff: 50,
    screenEdgeFadeStart: 0.9,
    eyeFadeStart: 0.4,
    eyeFadeEnd: 0.8,
    minGlossiness: 0.2
  }
};
*/

/**
 * root - 获取场景根节点
 * @type {THING.SceneRoot}
 */

/**
 * size - 设置/获取渲染窗口尺寸
 * @type {Array<Number>}
 */

/* 示例:
app.size = [640, 480];
*/

/**
 * skyBox - 设置天空盒
 * @type {String}
 */

/* 示例:
app.skyBox = 'SunCloud';
app.skyBox = {
  negx: './images/Night/negx.jpg',
  negy: './images/Night/negy.jpg',
  negz: './images/Night/negz.jpg',
  posx: './images/Night/posx.jpg',
  posy: './images/Night/posy.jpg',
  posz: './images/Night/posz.jpg'
};
app.skyBox = [
  './images/Night/posx.jpg',
  './images/Night/negx.jpg',
  './images/Night/posy.jpg',
  './images/Night/negy.jpg',
  './images/Night/posz.jpg',
  './images/Night/negz.jpg'
];
*/

/**
 * skyEffect - 设置动态天空效果
 * @type {Object}
 * @param {Number} options.time 时间
 * @param {Number} options.beta 角度
 * @param {Number} options.turbidity 混浊度
 * @param {Number} options.rayleigh 瑞利散射
 * @param {Number} options.mieCoefficient Mie（米氏）散射系数
 * @param {Number} options.mieDirectionalG 基于 Mie 散射理论的烟雾粒子数
 */

/* 示例:
app.skyEffect = {
  time: 9,
  beta: 45,
  turbidity: 10,
  rayleigh: 1.5,
  luminance: 1,
  mieCoefficient: 0.005,
  mieDirectionalG: 0.98
};
*/

/**
 * 方法说明
 */

/**
 * addControl - 添加控件
 * @param {Object} ctrl 控件对象
 * @param {String} name 控件自定义名称
 * @param {Boolean} afterRender 是否在渲染后
 */

/* 示例:
var ctrl = app.addControl(new THING.WalkControl(),'第一人称行走控件');
*/

/**
 * captureScreenshot - 将当前 3D 渲染内容截屏保存到指定文件中
 * @param {String} fileName 文件名称
 */

/* 示例:
app.captureScreenshot('myScreenshot');
*/

/**
 * captureScreenshotToImage - 将当前 3D 渲染内容截屏保存到缓冲区中
 * @param {Number} width 图片宽度
 * @param {Number} height 图片高度
 * @param {String} extension 文件类型
 * @param {Number} quality 质量(0~1]之间
 * @returns {Object} base64 编码图片数据
 */

/* 示例:
var base64 = app.captureScreenshotToImage(1024, 768, 'png', 0.5);
var img = new Image()
img.src = base64;
*/

/**
 * create - 创建物体
 * @param {Object} param 参数
 * @param {String} param.type 物体类型
 * @param {Number|String} param.id 物体 ID
 * @param {String} param.name 物体名称
 * @param {String} param.url 模型资源地址
 * @param {Array<Number>} param.position 物体在世界坐标系下的位置
 * @param {Function} param.complete 物体加载完成后的回调函数
 * @returns {THING.BaseObject}
 */

/* 示例:
var truck = app.create({
  type: 'Thing',
  id: 'myCar01',
  name: 'truck',
  url: 'https://www.thingjs.com/static/models/truck/',
  position: [-5, 0, 0],
  complete: function() {
    THING.Utils.log('truck created!');
  }
});
*/

/**
 * focus - 使 3D 窗口获得焦点
 */

/* 示例:
app.focus();
*/

/**
 * getControl - 根据名字获取控件
 * @param {String} name 控件自定义名称
 * @returns {Object} 控件对象
 */

/* 示例:
var ctrl = app.getControl('第一人称行走控件');
*/

/**
 * hasControl - 判断是否已添加了某控件
 * @param {Object|String} ctrl 控件对象 或 控件自定义名称
 * @returns {Boolean}
 */

/* 示例:
app.hasControl('第一人称行走');
*/

/**
 * isKeyPressed - 判断某按键是否按下
 * @param {THING.KeyType|Number} key 键值
 * @returns {Boolean}
 */

/**
 * off - 移除事件绑定
 * @param {String} eventType 事件类型名称
 * @param {String} condition 物体类型选择条件
 * @param {Function|String} callback 事件触发的回调函数 或 事件标签
 */

/* 示例:
app.off('click');
app.off('click','.Thing');
app.off('click','.Thing','我的点击事件01')
app.off('click',null,'我的点击事件02')
*/

/**
 * on - 全局绑定事件
 * @param {String} eventType 事件类型名称
 * @param {String} condition 物体类型选择条件
 * @param {Object} userData 事件传递自定义数据
 * @param {Function} callback 事件触发的回调函数
 * @param {String} tag 事件标签
 * @param {Number} priority 优先级
 */

/* 示例:
app.on('click',function(ev){
  THING.Utils.log(ev.object.name);
})
app.on('click','.Thing',function(ev){
  THING.Utils.log(ev.object.name);
})
app.on('click','.Thing',function(ev){
  THING.Utils.log(ev.object.name);
},'我的点击事件01');
app.on('click',function(ev){
  THING.Utils.log(ev.object.name);
},'我的点击事件02',51)
app.on('click', { color: '#ff0000' }, function (ev) {
  var color = ev.data.color;
  THING.Utils.log(color)
});
*/

/**
 * one - 绑定事件，只触发一次
 * @param {THING.EventType|String} eventType 事件名称
 * @param {String} condition 物体类型选择条件
 * @param {Object} userData 事件绑定自定义数据
 * @param {Function} callback 事件触发的回调函数
 * @param {String} tag 事件标签
 * @param {Number} priority 优先级
 */

/* 示例:
app.one('click', '.Building', function(ev) {...});
app.one('click', '.Thing', {color:'#ff0000'}, function(ev) {...});
app.one('update', function(ev) {...});
*/

/**
 * pauseEvent - 暂停事件响应
 * @param {THING.EventType|String} eventType 事件名称
 * @param {String} condition 物体类型选择条件
 * @param {String} tag 事件标签
 */

/* 示例:
app.pauseEvent(THING.EventType.DBLClick, '*', THING.EventTag.LevelEnterOperation);
app.pauseEvent(THING.EventType.Click, null, THING.EventTag.LevelBackOperation);
app.pauseEvent(THING.EventType.EnterLevel, '.Thing', THING.EventTag.LevelSceneOperations);
app.pauseEvent(THING.EventType.LeaveLevel, '.Thing', THING.EventTag.LevelSceneOperations);
app.pauseEvent(THING.EventType.EnterLevel, '.Thing', THING.EventTag.LevelFly);
app.pauseEvent(THING.EventType.EnterLevel, '.Thing', THING.EventTag.LevelSetBackground);
app.pauseEvent('click','.Thing','我的点击事件01')
*/

/**
 * query - 物体查询
 * @param {String} param 查询条件
 * @returns {THING.Selector} 查询结果
 */

/* 示例:
app.query('#001');
app.query('car01');
app.query('.Thing');
app.query('["userData/power"=60]');
app.query(/car/);
var obj=app.query('#001')[0];
var objs=app.query('.Thing');
objs.forEach(function(obj){
  THING.Utils.log(obj.name)
})
*/

/**
 * removeControl - 删除控件
 * @param {Object|String} ctrl 控件对象 或 控件自定义名称
 */

/* 示例:
app.removeControl(ctrl);
app.removeControl('第一人称行走控件');
*/

/**
 * resumeEvent - 恢复事件响应
 * @param {THING.EventType|String} eventType 事件名称
 * @param {String} condition 物体类型选择条件
 * @param {String} tag 事件标签
 */

/* 示例:
app.resumeEvent(THING.EventType.DBLClick, '*', THING.EventTag.LevelEnterOperation);
app.resumeEvent(THING.EventType.Click, null, THING.EventTag.LevelBackOperation);
app.resumeEvent(THING.EventType.EnterLevel, '.Thing', THING.EventTag.LevelSceneOperations);
app.resumeEvent(THING.EventType.LeaveLevel, '.Thing', THING.EventTag.LevelSceneOperations);
app.resumeEvent(THING.EventType.EnterLevel, '.Thing', THING.EventTag.LevelFly);
app.resumeEvent(THING.EventType.EnterLevel, '.Thing', THING.EventTag.LevelSetBackground);
app.resumeEvent('click','.Thing','我的点击事件01')
*/

/**
 * saveFile - 保存文件到浏览器下载目录
 * @param {String} fileName 文件名称
 * @param {String} data 文件数据
 */

/* 示例:
var json = { 'name': 'ThingJs', 'time': '2019' };
app.saveFile('test.json',JSON.stringify(json))
*/

/**
 * trigger - 触发事件
 * @param {THING.EventType|String} eventType 事件名称
 * @param {String} condition 物体类型选择条件
 * @param {Object} ev 事件信息，传递回调参数
 */

/* 示例:
app.trigger('Alarm');
app.on('Alarm',function(){  })
app.trigger('Alarm','.Thing',{level:2});
app.on('Alarm','.Thing',function(ev){
  THING.Utils.log(ev.level)
})
*/