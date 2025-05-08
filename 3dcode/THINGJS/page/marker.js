/**
 * Marker 图标
 * 提供 Marker 的创建和设置能力
 * @class
 * @extends THING.BaseObject
 */
class Marker extends THING.BaseObject {
  /**
   * 设置/获取 canvas 画布
   * @type {HTMLCanvasElement}
   * @example
   * // marker 以 canvas 绘制结果作为图片
   * marker.canvas = createCanvas(16);
   * 
   * // 创建 canvas 并写字
   * function createCanvas(text) {
   *   // 创建 canvas
   *   var canvas = document.createElement("canvas");
   *   canvas.width = 64;
   *   canvas.height = 64;
   * 
   *   var ctx = canvas.getContext("2d");
   *   ctx.fillStyle = "rgb(32, 32, 256)";
   *   ctx.beginPath();
   *   ctx.arc(32, 32, 30, 0, Math.PI * 2);
   *   ctx.fill();
   * 
   *   ctx.fillStyle = "rgb(255, 255, 255)";
   *   ctx.font = "32px sans-serif";
   *   ctx.textAlign = "center";
   *   ctx.textBaseline = "middle";
   *   ctx.fillText(text, 32, 32);
   * 
   *   return canvas;
   * }
   */
  canvas;

  /**
   * 设置/获取锚点位置
   * @type {Array<Number>}
   */
  pivot;

  /**
   * 设置/获取锚点像素位置
   * @type {Array<Number>}
   */
  pivotPixel;

  /**
   * 设置/获取图标长宽比例大小
   * @type {Array<Number>|Number}
   * @example
   * // 图标长宽等比缩放 4 倍，等同于 marker.size = [4,4];
   * marker.size = 4;
   * // 图标长度缩放 2 倍，宽度缩放 4 倍数
   * marker.size = [2,4];
   */
  size;

  /**
   * 设置/获取图片资源地址
   * @type {String}
   * @example
   * // 图片资源可上传至 ThingJS 在线开发网站
   * // 若使用其他服务器上的图片资源，需保证服务器图片资源允许跨域访问
   * marker.url = "https://www.thingjs.com/static/images/warning.png";
   */
  url;
}

export default Marker;

// 创建 Marker
var marker01 = app.create({
  type: 'Marker',
  id: 'myMarker01',
  url: 'https://www.thingjs.com/static/images/warning1.png',// 图片地址
  position: [0,5,0], // 在世界坐标系下的位置
  size: 4 // 图标长宽比例大小
});

// 以某物体为父亲 创建
var marker02 = app.create({
  type: 'Marker',
  id: 'myMarker02',
  url: 'https://www.thingjs.com/static/images/warning1.png',// 图片地址
  parent: obj, // 设置父物体
  localPosition: [0,5,0], // 父物体坐标系下的相对位置
  ignoreParentBoundingBox: false, // 是否忽略父物体包围盒，如果忽略的话则直接使用指定的相对位置进行设置
  size: 4 // 图标长宽比例大小
});

// 图标始终保持像素大小
var marker03 = app.create({
  type: 'Marker',
  id: 'myMarker03',
  url: 'https://www.thingjs.com/static/images/warning1.png',// 图片地址
  parent: obj, // 设置父物体
  localPosition: [0,5,0], // 父物体坐标系下的相对位置
  ignoreParentBoundingBox: true, // 是否忽略父物体包围盒，如果忽略的话则直接使用指定的相对位置进行设置
  size: 4, // 图标长宽比例大小
  keepSize: true // 设置图标始终保持像素大小
});