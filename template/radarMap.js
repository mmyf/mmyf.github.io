 /**
 * 创建雷达图
 * @param {String} divID 容器id
 * @param {Object} mapData 图表数据
 * @returns {String} html html串
 * @author myf 2022-10-13
 * @info 
 * mapData {
 *  {String} mapID: 'figure' 确保唯一有效
 *  {Number} width: 500  注意是数字，canvas默认单位是px
 *  {Number} height: 500
 *  {Number} angle: 60 旋转角度
 *  {Array<Number>} lineWidth: [1, 2] 线条粗细,前为底图粗细，后为维度数据线条粗细
 *  {String} lineColor: '#fff' 底图线条颜色
 *  {Number} dimension: 5 维度（>=3）
 *  {Array} dimensionDesc: ['体力','耐力','力量','敏捷','智力'] 维度描述
 *  {Array} dimensionValue: ['physical','endurance','power','agile','intelligence'] 维度字段
 *  {Array<Number>} || {Number} dimensionScale: [20,10,5,10,10] 维度字段数据和深度的比例，如例physical设1.1值为22
 *                                              2   所有维度比例都为2
 *  {Array} || {String} dimensionUnit: ['点','张','元','个','台'] 维度字段数据单位，如上例physical值为‘22点’
 *                                      '米'  所有维度单位都为米
 *  {String} dimensionDescColor: '#fff' 维度描述字体颜色
 *  {String} dimensionDescStyle: '30px 微软雅黑' 维度描述字体  空格前为文字大小，空格后为字体类型
 *  {Number} deep: 4 深度
 *  {Number} deepGap: 50 深度间隙，应满足deepGap*deep < width/2,注意给文字留出空间
 *  {Array} data: [
 *      {
 *          {String} name: 'alysa', 数据名
 *          {Number} physical: 1.1,
 *          {Number} endurance: 2.5,
 *          {Number} power: 2.3,
 *          {Number} agile: 3.1,
 *          {Number} intelligence：4, 应<=deep深度,上同
 *          {String} color: '#fff', 折线颜色，默认白色
 *      },
 *  ] 图数据
 *  {Boolean} showData: true 鼠标点击点位是否展示数值 // todo 建议false
 * }
 */
function createRadarMap(divID, mapData) {
    const isReturn = !divID;
    const mapID = mapData.mapID;
    const width = mapData.width;
    const height = mapData.height;
    const angle = mapData.angle || 0;
    const lineWidth = mapData.lineWidth || [1,4];
    const lineColor = mapData.lineColor || '#fff';
    const dimension = mapData.dimension;
    const dimensionDesc = mapData.dimensionDesc;
    const dimensionValue = mapData.dimensionValue;
    const dimensionScale = mapData.dimensionScale || 1;
    const dimensionUnit = mapData.dimensionUnit || '';
    const dimensionDescColor = mapData.dimensionDescColor || '#fff';
    const dimensionDescStyle = mapData.dimensionDescStyle || '0.7rem';
    const deep = mapData.deep;
    const deepGap = mapData.deepGap || 30;
    const data = mapData.data;
    const showData = mapData.showData || false;
    if(!mapID || !width || !height || !dimension || !dimensionDesc || !dimensionValue || !deep || !data) throw new Error('请检查mapData，必要参数未传入');
    const canvas = document.createElement('canvas');
    canvas.id = mapID;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.font = dimensionDescStyle;
    context.fillStyle = dimensionDescColor;
    context.strokeStyle = lineColor;
    context.lineWidth = lineWidth[0];
    const allPoints = [];
    for (let d = 1; d <= deep; d++){
        const points = createPath(width/2, height/2, angle, deepGap*d, dimension);
        allPoints.push(points);
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for(let i = 1;  i < dimension;  i++){
            context.lineTo(points[i].x, points[i].y);
        }
        context.closePath();
        context.save();
        context.stroke();
        context.restore();
        if (d === deep) {
            points.forEach((point, index)=>{
                let x = point.x,y = point.y;
                const text = dimensionDesc[index];
                if (point.x < width/2) {
                    x = x - (text.length * 25);
                } else {
                    x += 5;
                }
                if (point.y > height/2) {
                    y += 25;
                } else {
                    y -= 5;
                }
                context.fillText(text,x,y);
            });
        }
    }
    for (let i = 0; i < dimension; i++){
        context.beginPath();
        context.moveTo(width/2, height/2);
        for(let j = 0;  j < deep;  j++){
            context.lineTo(allPoints[j][i].x,allPoints[j][i].y);
        }
        context.save();
        context.stroke();
        context.restore();
    }
    context.lineWidth = lineWidth[1];
    const clickPoints = [];
    for (let d = 0; d < data.length; d++){
        const radius = [];
        dimensionValue.forEach((item)=>{
            radius.push(data[d][item] * deepGap);
        });
        const points = createPath(width/2, height/2, angle, radius, dimension);
        clickPoints.push({points: points,values: radius});
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for(let i = 1;  i < dimension;  i++){
            context.lineTo(points[i].x, points[i].y);
        }
        context.closePath();
        context.save();
        context.strokeStyle = data[d].color;
        context.stroke();
        context.restore();
    }
    if (showData) {
        canvas.onclick = (e)=>{
            const { clientX, clientY } = e;
            const { top, left } = canvas.getBoundingClientRect();
            const x = clientX - left;
            const y = clientY - top;
            clickPoints.forEach((lineInfo, i)=>{
                lineInfo.points.forEach((point, index)=>{
                    if (Math.abs(point.x - x) <= 5 && Math.abs(point.y - y) <= 5) {
                        const textCanvas = document.getElementById('textCanvas' + i + index);
                        if (textCanvas) {
                            textCanvas.remove();
                            return;
                        }
                        const newTextCanvas = document.createElement('canvas');
                        newTextCanvas.id = 'textCanvas' + i + index;
                        const context = newTextCanvas.getContext('2d');
                        context.font = dimensionDescStyle;
                        context.fillStyle = dimensionDescColor;
                        context.fillText((lineInfo.values[index] / deepGap) * (Array.isArray(dimensionScale) ? dimensionScale[index] : dimensionScale) + (Array.isArray(dimensionUnit) ? dimensionUnit[index] : dimensionUnit),point.x,point.y);
                        const div = document.getElementById(divID);
                        div.appendChild(newTextCanvas);
                        return;
                    }
                });
            });
        };
    }
    if (!isReturn) {
        const div = document.getElementById(divID);
        div.appendChild(canvas);
    }
}
function createPath(x, y, angle, radius, dimension) {
    const points = [];
    const centerAngle = 2 * Math.PI / dimension;
    if (Array.isArray(radius)) {
        for(let i = 0;  i < dimension;  i++){
            points.push({x:x + radius[i] * Math.sin(angle), y:y - radius[i] * Math.cos(angle)});
            angle += centerAngle;
        }
    } else {
        for(let i = 0;  i < dimension;  i++){
            points.push({x:x + radius * Math.sin(angle), y:y - radius * Math.cos(angle)});
            angle += centerAngle;
        }
    }
    return points;
}