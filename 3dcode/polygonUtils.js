function calculateAngle(p1, p2, p3) {
    // 计算向量
    const v1 = [p1[0] - p2[0], p1[2] - p2[2]]; // 使用x和z坐标
    const v2 = [p3[0] - p2[0], p3[2] - p2[2]];
    
    // 计算向量点积
    const dotProduct = v1[0] * v2[0] + v1[1] * v2[1];
    // 计算向量模长
    const mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
    const mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
    
    // 计算角度（弧度）
    const angle = Math.acos(dotProduct / (mag1 * mag2));
    return angle * (180 / Math.PI); // 转换为角度
}

function isVertex(points, index, angleTolerance = 5) {
    const numPoints = points.length;
    const prev = points[(index - 1 + numPoints) % numPoints];
    const current = points[index];
    const next = points[(index + 1) % numPoints];
    
    const angle = calculateAngle(prev, current, next);
    // 如果角度接近180度（允许误差范围），则不是顶点
    return Math.abs(180 - angle) > angleTolerance;
}

function extractPolygonInfo(points) {
    // 找出真正的顶点
    const vertices = points.filter((point, index) => isVertex(points, index));
    
    // 提取边
    const edges = [];
    for (let i = 0; i < vertices.length; i++) {
        const currentPoint = vertices[i];
        const nextPoint = vertices[(i + 1) % vertices.length];
        edges.push([currentPoint, nextPoint]);
    }
    
    return {
        vertices: vertices,
        edges: edges,
        allPoints: points
    };
}

// 处理示例数据并输出
function printPolygonInfo(polygon, name) {
    console.log(`\n${name}：`);
    console.log("所有点数量:", polygon.allPoints.length);
    console.log("真实顶点数量:", polygon.vertices.length);
    console.log("边数量:", polygon.edges.length);
}

// 导出需要的函数
export { extractPolygonInfo, isVertex, calculateAngle };
