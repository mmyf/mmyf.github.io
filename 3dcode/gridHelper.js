/**
 * 场景网格辅助工具
 */

// 存储创建的网格线对象
const gridLineObjects = new Set();

// 存储网格线的 x 和 z 坐标
const gridXCoordinates = [];
const gridZCoordinates = [];

/**
 * 创建场景网格
 * @param {Object} config - 网格配置项 
 * @param {number} [config.spacing=0.1] - 网格间距
 * @param {number} [config.rangeX=10] - X轴网格范围
 * @param {number} [config.rangeZ=10] - Z轴网格范围
 * @param {string} [config.color=#cccccc] - 网格线颜色
 * @param {number} [config.opacity=0.3] - 网格线透明度
 * @param {THING.BaseObject} [config.parent=app.query('.Campus')[0]] - 网格父对象
 */
function createSceneGrid(config = {}) {
    const spacing = config.spacing || 0.1;
    const rangeX = config.rangeX || 10;
    const rangeZ = config.rangeZ || 10;
    const color = config.color || '#cccccc';
    const opacity = config.opacity || 0.3;
    const parent = config.parent || app.query('.Campus')[0];

    // 清除已有的网格线
    clearSceneGrid();
    gridXCoordinates.length = 0; // 清空 x 坐标数组
    gridZCoordinates.length = 0; // 清空 z 坐标数组

    // 创建x轴方向的网格线
    for (let i = -rangeZ; i <= rangeZ; i += spacing) {
        // x轴方向的线(平行于x轴)
        const xLinePoints = [[-rangeX, 0, i], [rangeX, 0, i]].map(point => 
            parent.selfToWorld(point)
        );
        createGridLine(xLinePoints, {
            id: `gridLineX_${i}`,
            parent,
            color,
            opacity
        });
        gridZCoordinates.push(i); // 记录 z 坐标
    }

    // 创建z轴方向的网格线
    for (let i = -rangeX; i <= rangeX; i += spacing) {
        // z轴方向的线(平行于z轴)
        const zLinePoints = [[i, 0, -rangeZ], [i, 0, rangeZ]].map(point => 
            parent.selfToWorld(point)
        );
        createGridLine(zLinePoints, {
            id: `gridLineZ_${i}`,
            parent,
            color,
            opacity
        });
        gridXCoordinates.push(i); // 记录 x 坐标
    }

    // 创建突出显示的坐标轴
    // const xAxisPoints = [[-rangeX, 0, 0], [rangeX, 0, 0]].map(point => 
    //     parent.selfToWorld(point)
    // );
    // createGridLine(xAxisPoints, {
    //     id: 'axisX',
    //     parent,
    //     color: '#ff0000',
    //     opacity: 0.8,
    //     lineWidth: 2
    // });

    // const zAxisPoints = [[0, 0, -rangeZ], [0, 0, rangeZ]].map(point => 
    //     parent.selfToWorld(point)
    // );
    // createGridLine(zAxisPoints, {
    //     id: 'axisZ',
    //     parent,
    //     color: '#0000ff',
    //     opacity: 0.8,
    //     lineWidth: 2
    // });
}

/**
 * 创建单根网格线
 * @param {Array} points - 线段起点和终点坐标
 * @param {Object} config - 线段配置
 */
function createGridLine(points, config) {
    const line = app.create({
        type: 'Line',
        id: config.id,
        name: 'gridLine',
        points: points,
        parent: config.parent,
        style: {
            color: config.color,
            opacity: config.opacity,
            lineWidth: config.lineWidth || 1,
            renderOrder: -1 // 让网格线显示在最底层
        }
    });
    
    gridLineObjects.add(line);
}

/**
 * 清除场景网格
 */
function clearSceneGrid() {
    gridLineObjects.forEach(line => {
        line.destroy();
    });
    gridLineObjects.clear();
}

/**
 * 切换网格显示/隐藏
 * @param {boolean} visible - 是否显示
 */
function toggleSceneGrid(visible) {
    gridLineObjects.forEach(line => {
        line.visible = visible;
    });
}
