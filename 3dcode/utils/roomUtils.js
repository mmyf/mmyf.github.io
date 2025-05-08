/**
 * 批量设置房间天花板颜色
 * @param {Array<THING.Room>} rooms - 房间对象数组
 * @param {String|Number} color - 要设置的颜色值
 * @param {Number} [opacity=1] - 不透明度，默认为1
 */
export function setCeilingsColor(rooms, color, opacity = 1) {
    if (!Array.isArray(rooms) || rooms.length === 0) return;
    
    rooms.forEach(room => {
        if (!room.ceiling) return;
        
        room.ceiling.style.color = color;
        room.ceiling.style.opacity = opacity;
    });
}

/**
 * 根据条件批量设置房间天花板颜色
 * @param {String} queryCondition - THING.js查询条件
 * @param {String|Number} color - 要设置的颜色值
 * @param {Object} [options] - 配置选项
 * @param {Number} [options.opacity=1] - 不透明度
 * @param {Boolean} [options.smooth=false] - 是否使用渐变效果
 * @param {Number} [options.duration=500] - 渐变动画持续时间(毫秒)
 */
export function setRoomsCeilingColorByCondition(queryCondition, color, options = {}) {
    const { opacity = 1, smooth = false, duration = 500 } = options;
    
    const rooms = app.query(queryCondition);
    if (rooms.length === 0) return;

    if (smooth) {
        // 使用渐变效果
        rooms.forEach(room => {
            if (!room.ceiling) return;
            
            const ceiling = room.ceiling;
            const originalColor = ceiling.style.color;
            const originalOpacity = ceiling.style.opacity;
            
            // 使用TWEEN创建渐变动画
            new THING.TWEEN({
                color: originalColor, 
                opacity: originalOpacity
            })
            .to({ color: color, opacity: opacity }, duration)
            .onUpdate(function(object) {
                ceiling.style.color = object.color;
                ceiling.style.opacity = object.opacity;
            })
            .start();
        });
    } else {
        // 直接设置颜色
        setCeilingsColor(rooms, color, opacity);
    }
}

/**
 * 重置房间天花板颜色为默认值
 * @param {Array<THING.Room>} rooms - 房间对象数组
 * @param {String|Number} [defaultColor=null] - 默认颜色值，null表示清除颜色设置
 */
export function resetCeilingsColor(rooms, defaultColor = null) {
    if (!Array.isArray(rooms) || rooms.length === 0) return;
    
    rooms.forEach(room => {
        if (!room.ceiling) return;
        
        room.ceiling.style.color = defaultColor;
        room.ceiling.style.opacity = 1;
    });
}

/**
 * 根据房间类型设置不同的天花板颜色
 * @param {Object} colorMapping - 房间类型与颜色的映射对象
 * @param {Object} [options] - 配置选项
 * @param {Number} [options.opacity=1] - 不透明度
 * @param {Boolean} [options.smooth=false] - 是否使用渐变效果
 */
export function setCeilingColorByRoomType(colorMapping, options = {}) {
    if (typeof colorMapping !== 'object') return;
    
    Object.entries(colorMapping).forEach(([roomType, color]) => {
        // 使用userData中的roomTypeCode进行查询
        const condition = `["userData/roomTypeCode"="${roomType}"]`;
        setRoomsCeilingColorByCondition(condition, color, options);
    });
}

/* 使用示例:
// 1. 简单设置颜色
const rooms = app.query('.Room');
setCeilingsColor(rooms, '#FF0000', 0.8);

// 2. 根据条件设置颜色(带渐变效果)
setRoomsCeilingColorByCondition('.Room', '#00FF00', {
    opacity: 0.9,
    smooth: true,
    duration: 1000
});

// 3. 根据房间类型设置不同颜色
const colorMapping = {
    clinic: '#FF0000',     // 诊室
    examine: '#00FF00',    // 检查室
    treatment: '#0000FF'   // 治疗室
};
setCeilingColorByRoomType(colorMapping, {
    opacity: 0.8,
    smooth: true
});

// 4. 重置天花板颜色
resetCeilingsColor(rooms);
*/
