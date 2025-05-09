/**
 * Grid 正方网格
 * @class
 * @extends THING.ThingGeometry
 */
class Grid extends THING.ThingGeometry {
  /**
   * 判断是否 Grid 类型
   * @type {Boolean}
   */
  isGrid;
}

export default Grid;

var grid = app.create({
  type: 'Grid',
  size: 10,// 格网大小
  divisions: 10,// 细分的格网数
  position:[0,0,0] // 格网中心在世界坐标系下的位置
});
