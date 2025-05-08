/**
 * Heatmap 热力图
 * 提供热力图绘制功能
 * @class
 * @extends THING.BaseObject
 */
class Heatmap extends THING.BaseObject {
  /**
   * 设置未插值区域是否透明
   * @param {Boolean} alpha - 是否透明
   * @example
   * // 设置未插值区域是否透明
   * heatMap.setAlpha(true)
   */
  setAlpha(alpha) {}

  /**
   * 设置热力图数据，数据格式为 [x坐标, y坐标, 热力值] 组成的数组，其中坐标值为相对坐标
   * @param {Array<Array<Number>>} data - 热力图数据
   * @example
   * // 设置热力图数据
   * heatMap.setData([
   *   [0,0,10],
   *   [0,1,12],
   *   [0,2,11]
   * ])
   */
  setData(data) {}

  /**
   * 设置颜色渐变，色值可设置为 css 可识别的色值
   * @param {Object} gradient - 颜色渐变
   * @example
   * // 设置颜色渐变，色值可设置为css可识别的色值
   * heatMap.setGradient({ 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' })
   */
  setGradient(gradient) {}
}

export default Heatmap;

// 创建热力图
var heatMap = app.create({
  type: "Heatmap",
  width: 12, // 宽度 单位米
  height: 10, // 长度 单位米
  minValue: 20, // 热力值下限
  maxValue: 27, // 热力值上限
  radius: 0.8, // （可选）单个点的热力影响半径，默认为0.8
  blur: 0.8, // (可选) 单个点的热力影响模糊半径，默认为0.8
  alpha: false, // （可选）未插值区域是否透明，默认为 false 不透明
  mapSize: 256, // （可选）实际分辨率大小，值越大分辨率越高，推荐为2次幂的值但不大于2048，默认为256
  mosaic: false, // (可选) 是否叠加马赛克效果，默认为false
  mosaicSize: 4, // (可选) 单个马赛克尺寸，此尺寸相对mapSize
  clipShape: { // (可选) 热力图的裁剪形状，坐标系以热力图平面中心为原点
        shape: [[0, 0], [-5, 0], [-5, -5], [5, -5], [5, 5], [0, 5]],
        holes: [
            [[2, -1], [4, -1], [4, -3], [2, -3]]
        ]
  },
  gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' } // （可选）颜色渐变，色值可设置为css可识别的色值
});
heatMap.rotateX(90);
// 设置热力图数据 数据格式为
// [x坐标,y坐标,热力值] 组成的数组
// 坐标系以热力图平面中心为原点
heatMap.setData([
  [-0.91, -1.07, 24],
  [-2.11, -1.07, 27],
  [0, 0, 25],
  [-2.71, -1.07, 25],
  [-0.86, 1.13, 20],
  [-0.31, -1.07, 23],
  [2, -2, 23],
  [3, 3, 25]
]);