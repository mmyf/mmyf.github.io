/**
 * @class THING.WebView
 * @extends THING.BaseObject  
 * @description WebView 页面类,用于 3D 场景内嵌入页面
 */
class WebView {
  /**
   * 设置/获取页面是否可被拾取（交互操作）
   * @type {Boolean}
   */
  pickable;

  /**
   * 设置/获取页面资源地址
   * @type {String}  
   */
  url;
}

/* 示例代码:
// 创建 webView
var webView01 = app.create({
  type: 'WebView',
  id: 'webView01',
  url: 'https://www.thingjs.com',// 页面地址
  width: 16, // 3D 中实际宽度 单位 米
  height: 16, // 3D 中实际高度 单位 米
  domWidth: 1024, // 页面高度 单位 px
  domHeight: 1024, // 页面高度 单位 px
  position: [0, 5, 0]// 在世界坐标系下的位置
});

// 以某物体为父亲创建
var webView02 = app.create({
  type: 'WebView',
  id: 'webView02',
  url: 'https://www.thingjs.com',// 页面地址 
  width: 16,
  height: 16,
  domWidth: 1024,
  domHeight: 1024,
  parent: obj, // 设置父物体
  localPosition: [0, 5, 0]// 父物体坐标系下相对坐标
});
*/