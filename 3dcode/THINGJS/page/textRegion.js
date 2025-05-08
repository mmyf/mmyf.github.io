/**
 * @class THING.TextRegion
 * @extends THING.BaseObject
 * @description TextRegion 区域文本类,提供区域文本绘制功能
 */
class TextRegion {
  /**
   * 文本保持像素大小不变
   * @type {Boolean}
   */
  keepSize;

  /**
   * 获取文本样式对象
   * @type {THING.TextRegionStyle}
   */
  style;

  /**
   * 设置/获取文本内容
   * @type {String}
   */ 
  text;
}

/* 示例代码:
// 创建文本
var textRegion01 = app.create({
  type: 'TextRegion',
  id: 'textRegion01', 
  position: [0, 9, -5], // 世界坐标
  text: '生产厂房',
  style: {
    fontColor: '#000000',
    fontSize: 32
  }
}); 

// 以某物体为父亲创建文本
var textRegion02 = app.create({
  type: 'TextRegion',
  parent: obj,
  localPosition: [0, 2.5, 0],
  text: 'Hello World',
  style: {
    fontColor: 'rgb(0,0,255)',
    fontSize: 20
  }
});
*/