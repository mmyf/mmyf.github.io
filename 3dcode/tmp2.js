/**
 * @authors myf
 * @date    2024-09-05
 * @description 删除规划路径点位（布局时）
 * @param {string} pathPointModelId 路径点位模型id
 * @return 无
 */
function deleteLayoutPath (modelId, isLine) {
    if (!isLine) {
        deleteLayoutPathPoint(modelId);
        return;
    }
    const pathModel = app.query('#' + modelId)[0];
    $.confirm({msgtype:'warn',title:$.t('common.tip'),content:$.t('common.confirm.delete',{name: pathModel.name}),confirmText:$.t('common.operation.delete'),cancelText:$.t('common.operation.cancel')}, ()=>{
        const savedFlag = pathModel.getAttribute("userData/savedFlag");
        if (savedFlag) {
            const tableId = pathModel.getAttribute('userData/tableId');
            const params = {innerPathId: tableId};
            const result = getDataByAjax(dtvpApiServ,"innerPath/api","deleteInnerPath",params,"","post","json","","application/x-www-form-urlencoded");
            // const result = saveLayoutPath (modelId, true, true);
            if (!result) {
                $.toast({msgtype:'info',content:$.t('layout.tip.deleteFail'),time:1000});
                return;
            }
        }
        pathModel.destroy();
        // const pathModelId = pathPointModel.parent.id;
        // refreshLayoutPath (modelId);
        equipLayoutInfoListQuickSearch();
        $('#layoutPositionPanel').remove();
        $.toast({msgtype:'info',content:$.t('layout.tip.deleteSuccess'),time:1000});
    },undefined);
}

/**
 * @interface
 * @description 查看信息点
 * @authors myf
 * @date    2024-09-18
 * @param {string} type 信息点类型
 * @return 无
 */
function showInfoPoints (btnElement, userParams) {
    const type = userParams.mode;
    const curParams = {
        "poiTypeId": '7',
        "levelObjectId": chooesLevel(CurSencceObj.type) === '1' ? BindSysUsers["Sys"]["HospitalID"] : CurSencceObj.id, // myf 20231227 修改医院id获取
        "levelTypeId": chooesLevel(CurSencceObj.type),
    }
    const curPois = getDataByAjax(dtvpApiServ,"innerPoi/api","getInnerPoiList",curParams,"","get","json","","",false);
    CurScenePoints = [...curPois];
    if (CurSencceObj.type === 'Floor') {
        const curBuildingParams = {
            "poiTypeId": '7',
            "levelObjectId": CurSencceObj.building.id,
            "levelTypeId": chooesLevel(CurSencceObj.building.type),
        }
        const curBuildingPois = getDataByAjax(dtvpApiServ,"innerPoi/api","getInnerPoiList",curBuildingParams,"","get","json","","",false);
        CurScenePoints.push(...curBuildingPois);
    }
    // myf 20241126 添加样式，修改逻辑
    if (type === 'showPoint') {
        CurScenePoints.some((point)=>{
            const curDoor = CurSencceObj.query('#'+point.poiObjId)[0];
            if (!curDoor) {
                return;
            }
            setDefaultOutlineColor(curDoor, null, 2);
            setDefaultOutlineColor(curDoor, 'red', 2);
        });
    } else {
        NoAccessDoor = [];
        const doors = getCurSceneDoors();
        doors.forEach((door)=>{
            const curPoi = CurScenePoints.find(poi=>{
                return poi.poiObjId === door.id;
            });
            if (!curPoi) {
                NoAccessDoor.push(door);
            }
        });
        // console.log('doors',doors);
        // console.log('NoAccessDoor',NoAccessDoor);
        // console.log('CurScenePoints',CurScenePoints);
        NoAccessDoor.forEach((door)=>{
            setDefaultOutlineColor(door, null, 2);
            setDefaultOutlineColor(door, 'green', 2);
        });
    }
}

/**
 * @description 保存已搜集信息点（布局时）
 * @authors myf
 * @date    2024-09-18
 * @param {string} pathModelId 路径模型id
 * @return 无
 */
function savePathLayoutInfoPoints (pathModelId) {
    if (!HosInnerPoints || !HosInnerPoints.length) {
        $.toast({msgtype:'info',content:$.t('space.path.tip.collectInfoPointFrist'),time:1000});
        return;
    }
    let pathModel = app.query('#' + pathModelId)[0];
    let tableId = pathModel.getAttribute('userData/tableId');
    if (tableId.includes('new')) {
        tableId = '';
    }
    if (!tableId) {
        $.confirm({msgtype:'error',title:$.t('common.tip'),content:$.t('space.path.tip.ifNotSave'),confirmText:$.t('common.operation.continue'),cancelText:$.t('common.operation.cancel')}, ()=>{
            saveLayoutPath(pathModelId, true);
            savePathLayoutInfoPoints (pathModelId);
        }, undefined);
        return;
    }
    const params = {
        innerPois: HosInnerPoints,
        planPathId: tableId,
    }
    const pointPromise = postInterfaceData(dtvpApiServ + "/innerPoi/api/insertNoRepeat", params, {contentType: "application/json;charset=utf-8"});
    pointPromise.then(()=>{
        postInterfaceData(dtvpApiServ + "/metaPath/api/insertNoRepeat", HosMetaPaths, {contentType: "application/json;charset=utf-8"});
        postInterfaceData(dtvpApiServ + "/metaPath/api/insertNoRepeat", HosMetaPathsEx, {contentType: "application/json;charset=utf-8"});
        // showInfoPoints
        HosInnerPoints.forEach(poi=>{
            if(poi.poiObjId) {
                const door = CurSencceObj.query('#' + poi.poiObjId)[0];
                if (door) {
                    setDefaultOutlineColor(door, null, 2);
                    setDefaultOutlineColor(door, 'red', 2);
                }
            }
        });
        TurningPoints = []; // 拐点数组
        HosInnerPoints = []; // 要保存的院内信息点数组
        HosMetaPaths = []; // 要保存的基元路径数组
        HosMetaPathsEx = []; // 要保存的基元路径数组（反向）
        $.toast({msgtype:'info',content:$.t('layout.tip.saveSuccess'),time:1000});
    });
}

/**
 * @description 收集路径附近信息点（布局时）
 * @authors myf
 * @date    2024-09-18
 * @param {string} lineModelId 路径模型id
 * @return 无
 */
function collectInfoPointAroundPath (lineModelId) {
    if (HosInnerPoints.length) {
        // 没有保存，重新搜集
        // p.obj.setAttribute('userData/originalDefaultOutlineColor', p.obj.style.defaultOutlineColor);
        HosInnerPoints.forEach(poi=>{
            if(poi.poiObjId) {
                const door = CurSencceObj.query('#' + poi.poiObjId)[0];
                if (door) {
                    setDefaultOutlineColor(door, null, 2);
                    setDefaultOutlineColor(door, door.getAttribute('userData/originalDefaultOutlineColor'), 2);
                }
            }
        });
        TurningPoints = []; // 拐点数组
        HosInnerPoints = []; // 要保存的院内信息点数组
        HosMetaPaths = []; // 要保存的基元路径数组
        HosMetaPathsEx = []; // 要保存的基元路径数组（反向）
    }
    autoLevelClear();
    const lineModel = app.query('#' + lineModelId)[0];
    const lineLocalPoints = lineModel.points.map(poi=>{
        return CurSencceObj.worldToSelf(poi);
    });
    const paintPaths = lineLocalPoints.map((poi, index)=>{
        if (index < lineLocalPoints.length - 1) {
            return [poi, lineLocalPoints[index + 1]];
        }
    });
    const handleSort = (property,propChild) => {
        return function(a,b){
            const val1 = Number.parseFloat(a[property][propChild]);
            const val2 = Number.parseFloat(b[property][propChild]);
            return val1 - val2;
        }
    }
    const hosInnerInfoPoints = getCurSceneDoors();
    console.log('hosInnerInfoPoints',hosInnerInfoPoints);
    hosInnerInfoPoints.forEach(door=>{
        // door.style.color = null;
        door.calcPosition = CurSencceObj.worldToSelf(door.position);
        // setDefaultOutlineColor(door, 'green', 2);
    });
    const hosMetaPaths = [];
    let levelTypeId = chooesLevel(CurSencceObj.type);
    const pathRange = $("#rangeDataSelect").attr('valueKey');
    // const pathRangeNum = pathRange ? JSON.parse(pathRange) : [null];
    let distanceScale = pathRange || 2;
    // for (let i = 0; i < lineModel.points.length - 1; i++) {
    //     paintPaths.push([PathObj.pointsObjArr[i].coor,PathObj.pointsObjArr[i + 1].coor])
    // }
    const params = {
        "levelObjectId": CurSencceObj.id,
        "levelTypeId": levelTypeId,
        "name": '拐点',
        "poiTypeId": '7',
        "hospitalId": BindSysUsers["Sys"]["HospitalID"],
        "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
    }
    const turningPoints = getDataByAjax(dtvpApiServ,"innerPoi/api","getInnerPoiList",params,"","get","json","","", false);
    if (turningPoints.length > 0) {
        TurningPoints = turningPoints.map((poi)=>{
            return {
                calcPosition: [Number.parseFloat(poi.posY),Number.parseFloat(poi.posZ),Number.parseFloat(poi.posX)],
                // position: CurSencceObj.selfToWorld([Number.parseFloat(poi.posY),Number.parseFloat(poi.posZ),Number.parseFloat(poi.posX)]),
                info: poi.poiObjId
            }
        });
    }
    
    TurningPoints.forEach((tPoint)=>{
        hosInnerInfoPoints.push(tPoint);
    }); // 将拐点也记录进信息点数组
    console.log('paintPaths',paintPaths);
    console.log('hosInnerInfoPoints',hosInnerInfoPoints);
    console.log('TurningPoints',TurningPoints, distanceScale);
    const points = [];
    for (let i = 0; i < paintPaths.length - 1; i++) {
        let isTurnning = true;
        let pointIndex = 0;
        let lineDirection = '';
        let pointApart = [];
        for (let j = 0; j < hosInnerInfoPoints.length; j++) {
            const distance = get3DDistancePointToLine(paintPaths[i][0],paintPaths[i][1],hosInnerInfoPoints[j].calcPosition); // 计算所有信息点到所有路径的距离
            // console.log('distance',paintPaths[i][0],paintPaths[i][1],hosInnerInfoPoints[j].calcPosition,distance);
            if (distance.distance < distanceScale) { // 距离小于2时，确定为途径信息点
                pointApart.push({obj:hosInnerInfoPoints[j],calcPosition:hosInnerInfoPoints[j].calcPosition,pointG:distance.pointG});
                pointIndex = distance.pointIndex; // 垂点计算用的是x坐标还是y坐标
                if (get3DDistancePointToPoint(paintPaths[i][1],hosInnerInfoPoints[j].calcPosition) <= distanceScale) { // 当这个途径点距离路径终点小于等于2时，不创建拐点，否则将路径终点作为拐点创建
                    isTurnning = false;
                }
            }
            lineDirection = distance.lineDirection;
        }
        if (isTurnning) { // 创建拐点
            pointApart.push({calcPosition:paintPaths[i][1],info:'crossing' + CurSencceObj.id + TurningPoints.length,pointG:paintPaths[i][1]});
            TurningPoints.push({calcPosition:paintPaths[i][1],info:'crossing' + CurSencceObj.id + TurningPoints.length}); // 新拐点需要加入拐点数组全局变量
            hosInnerInfoPoints.push({calcPosition:paintPaths[i][1],info:'crossing' + CurSencceObj.id + TurningPoints.length}); // 拐点也需要加入信息点数组，参与下次计算
        }
        pointApart.sort(handleSort('pointG',pointIndex)); // 排序
        if (lineDirection === '-') {
            pointApart.reverse();
        }
        pointApart.forEach((p,index)=>{ // 将这段路径上的途径点标记颜色
            
            if (p.obj && p.obj.style) {
                // if (index === 0) {
                //     p.obj.style.color = 'green';
                // } else if (index === pointApart.length - 1) {
                //     p.obj.style.color = 'red';
                // } else {
                //     p.obj.style.color = '#D95059';
                // }
                // setObjColor(p.obj, 'green', 2);
                p.obj.setAttribute('userData/originalDefaultOutlineColor', p.obj.style.defaultOutlineColor);
                setDefaultOutlineColor(p.obj, null, 2);
                setDefaultOutlineColor(p.obj, '#ff7b00', 2);
            } else { // 拐点处理
                // setDefaultOutlineColor(p.obj, 'red', 2);
            }
        });
        pointApart.forEach((pa)=>{ // 信息点去重后推入全路径数组
            if (!points.find((d)=>{return JSON.stringify(d.calcPosition) === JSON.stringify(pa.calcPosition)})) {
                points.push(pa);
            }
        });
    }
    console.log('全路径数组',points);
    console.log('hosMetaPaths',hosMetaPaths);

    HosInnerPoints = points.map((point)=>{
        let objId = '';
        let objName = '';
        let isGate = false;
        let poiInfo = "";
        let parPoiId = '';
        // let location = CurSencceObj.worldToSelf(point.position);
        let location = point.calcPosition;
        let levelTypeId = chooesLevel(CurSencceObj.type);
        let levelObjectId = CurSencceObj.id;
        if (point.obj) {
            objId = point.obj.room ? point.obj.room.id : point.obj.id;
	    ///modify by lmm 2023-05-22 房屋接口替换hos
            objName = getRoomJson(objId) ? getRoomJson(objId).description + $.t('space.path._door') : point.obj.bundleName;
            objId = point.obj.id;
            if (point.obj.info) {
                objId = point.obj.info;
                objName = '拐点';
            }
            const exits = ['ElevatorDoor','StairDoor','GateDoor'];
            if (point.obj.userData && exits.includes(point.obj.userData['3DType_'])) {
                isGate = true;
                
                if (point.obj.userData['3DType_'] === 'GateDoor') {
                    if (point.obj.parent.type === 'Floor') { // 建筑出口
                        levelTypeId = '2';
                        levelObjectId = point.obj.parent.parent.id;
                        const curBuild = app.query('#'+levelObjectId)[0];
                        location = curBuild.worldToSelf(point.obj.position);
                        console.log('curBuild', curBuild, location, point.calcPosition, point.obj);
                    }
                }
            }
        }
        // myf 20230327 修改parPoiId
        switch(levelTypeId) {
            case '1': parPoiId='';break;
            case '2': parPoiId='';break;
            case '3': parPoiId= objId.slice(0,-3); break;
            default: parPoiId='';break;
        }
        if (point.info) {
            objId = point.info;
            objName = '拐点';
        }
        return {
            "poiTypeId": '7',
            "poiCatId": '',
            "poiObjId": objId,
            "name": objName,
            "parPoiId": parPoiId,
            "location": location.toString(),
            "posX": location[2].toString(),
            "posY": location[0].toString(),
            "posZ": location[1].toString(),
            "levelTypeId": levelTypeId,
            "levelObjectId": levelObjectId,
            "poiInfo": poiInfo || '',
            "remark": "",
            "size": 0,
            "isGate": isGate,
            "updateUserId": "",
            "actived": true,
            "code": "",
            "createUserId": "",
            "current": 0,
            "defaultLocation": true,
            "deleted": false,
            "deptId": "",
            "hospitalId": BindSysUsers["Sys"]["HospitalID"],
            "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
        }; 
    });
    for (let k = 0; k < points.length - 1; k++) { // 将途径点转换为基元路径,[起点信息点，终点信息点]
        hosMetaPaths.push([points[k],points[k + 1]]);
    }
    HosMetaPaths = hosMetaPaths.map((path)=>{
        let startObjId = '';
        let startObjName = '';
        let startLevelTypeId = chooesLevel(CurSencceObj.type);
        let endLevelTypeId = chooesLevel(CurSencceObj.type);
        let startLevelObjectId = CurSencceObj.id;
        let endLevelObjectId = CurSencceObj.id;
        // let endLocation = CurSencceObj.worldToSelf(path[1].pointG);
        let endLocation = path[1].pointG;
        // let startLocation = CurSencceObj.worldToSelf(path[0].pointG);
        let startLocation = path[0].pointG;
        if (path[0].obj) {
            startObjId = path[0].obj.room ? path[0].obj.room.id : path[0].obj.id;
	    ///modify by lmm 2023-05-22 房屋接口替换hos
            startObjName = getRoomJson(startObjId) ? getRoomJson(startObjId).description : startObjId;
            startObjId = path[0].obj.id;
            if (path[0].obj.info) {
                startObjId = path[0].obj.info;
                startObjName = path[0].obj.info;
            }
            const exits = ['ElevatorDoor','StairDoor','GateDoor'];
            if (path[0].obj.userData && exits.includes(path[0].obj.userData['3DType_'])) {
                if (path[0].obj.userData['3DType_'] === 'GateDoor') {
                    if (path[0].obj.parent.type === 'Floor') { // 建筑出口
                        startLevelTypeId = '2';
                        startLevelObjectId = path[0].obj.parent.parent.id;
                        const curBuild = app.query('#'+startLevelObjectId)[0];
                        startLocation = curBuild.worldToSelf(CurSencceObj.selfToWorld(path[0].pointG));
                    }
                }
            }
        }
        if (path[0].info) {
            startObjId = path[0].info;
            startObjName = path[0].info;
        }
        let endObjId = '';
        let endObjName = '';
        if (path[1].obj) {
            endObjId = path[1].obj.room ? path[1].obj.room.id : path[1].obj.id;;
	    ///modify by lmm 2023-05-22 房屋接口替换hos
            endObjName = getRoomJson(endObjId) ? getRoomJson(endObjId).description : endObjId;
            endObjId = path[1].obj.id;
            if (path[1].obj.info) {
                endObjId = path[1].obj.info;
                endObjName = path[1].obj.info;
            }
            const exits = ['ElevatorDoor','StairDoor','GateDoor'];
            if (path[1].obj.userData && exits.includes(path[1].obj.userData['3DType_'])) {
                if (path[1].obj.userData['3DType_'] === 'GateDoor') {
                    if (path[1].obj.parent.type === 'Floor') { // 建筑出口
                        endLevelTypeId = '2';
                        endLevelObjectId = path[1].obj.parent.parent.id;
                        const curBuild = app.query('#'+endLevelObjectId)[0];
                        endLocation = curBuild.worldToSelf(CurSencceObj.selfToWorld(path[1].pointG));
                    }
                }
            }
        }
        if (path[1].info) {
            endObjId = path[1].info;
            endObjName = path[1].info;
        }
        const distance = get3DDistancePointToPoint(startLocation,endLocation);
        // const startPoiInfo = CurScenePoints.find((item)=>{return item.poiObjId === startObjId});
        // const endPoiInfo = CurScenePoints.find((item)=>{return item.poiObjId === endObjId});
        HosMetaPathsEx.push(
            {
                // "innerPathObjId": endObjId + 'To' + startObjId,
                "id": '',
                "code": '',
                "name": '',
                "hospitalId": BindSysUsers["Sys"]["HospitalID"],
                "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
                "startLevelTypeId": endLevelTypeId,
                "startLevelObjectId": endLevelObjectId,
                // "startPoiId": endPoiInfo.id,
                "startPoiObjId": endObjId,
                "startPathPoiX": endLocation[2].toString(),
                "startPathPoiY": endLocation[0].toString(),
                "startPathPoiZ": endLocation[1].toString(),
                "endLevelTypeId": startLevelTypeId,
                "endLevelObjectId": startLevelObjectId,
                // "endPoiId": startPoiInfo.id,
                "endPoiObjId": startObjId,
                "endPathPoiX": startLocation[2].toString(),
                "endPathPoiY": startLocation[0].toString(),
                "endPathPoiZ": startLocation[1].toString(),
                "distance": distance.toString(),
                "actived": true,
                "deleted": false,
                "remark": "",
            }
        );
        return {
            // "innerPathObjId": startObjId + 'To' + endObjId,
            "id": '',
            "code": '',
            "name": '',
            "hospitalId": BindSysUsers["Sys"]["HospitalID"],
            "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
            "startPoiObjId": startObjId,
            // "startPoiId": startPoiInfo.id,
            "startLevelTypeId": startLevelTypeId,
            "startLevelObjectId": startLevelObjectId,
            "startPathPoiX": startLocation[2].toString(),
            "startPathPoiY": startLocation[0].toString(),
            "startPathPoiZ": startLocation[1].toString(),
            "endLevelTypeId": endLevelTypeId,
            "endLevelObjectId": endLevelObjectId,
            "endPoiObjId": endObjId,
            // "endPoiId": endPoiInfo.id,
            "endPathPoiX": endLocation[2].toString(),
            "endPathPoiY": endLocation[0].toString(),
            "endPathPoiZ": endLocation[1].toString(),
            "distance": distance.toString(),
            "actived": true,
            "deleted": false,
            "remark": "",
        }
    });
    showTurnningPoints();
    
    console.log('当前规划路径：TurningPoints',TurningPoints);
    console.log('当前规划路径：HosInnerPoints',HosInnerPoints);
    console.log('当前规划路径：HosMetaPaths&HosMetaPathsEx',HosMetaPaths, HosMetaPathsEx);
}

/**
 * @description 自动规划走廊路径
 * @authors myf
 * @date    2024-09-20
 * @return {array} pathObjList 路径对象数组
 */
function autoPlanCorridorPath() {
    const corridors = [];
    // 获取所有走廊
    CurSencceObj.traverse((obj) => {
        if (obj.userData && obj.userData['3DType_'] === 'Room' && 
            (obj.name.includes('走廊') || obj.name.includes('通道'))) {
            corridors.push(obj);
        }
    });

    if (!corridors.length) {
        $.toast({msgtype:'info',content:'未找到走廊',time:1000});
        return null;
    }

    // 为每个走廊创建一个路径对象
    const pathObjList = corridors.map((corridor, corridorIndex) => {
        const pathPoints = [];
        // 获取走廊的顶点
        const corridorPoints = corridor.points.map(point => {
            return CurSencceObj.worldToSelf(point);
        });
        
        // 使用多边形分析工具获取顶点和边
        const polygonInfo = getPolygonEdgeAndPoint(corridorPoints);
        
        // 将顶点转换为路径点
        polygonInfo.vertices.forEach((vertex, index) => {
            pathPoints.push({
                posY: vertex[0].toFixed(2),
                posZ: vertex[1].toFixed(2),
                posX: vertex[2].toFixed(2),
                id: 'auto_' + new Date().getTime() + '_' + corridorIndex + '_' + index,
                name: corridor.name + '拐点' + (index + 1)
            });
        });

        // 如果是长廊，可以在两个顶点之间添加额外的中间点
        polygonInfo.edges.forEach((edge, edgeIndex) => {
            const distance = get3DDistancePointToPoint(edge[0], edge[1]);
            if (distance > 10) { // 如果边长超过10米，添加中间点
                const midPoint = [
                    (edge[0][0] + edge[1][0]) / 2,
                    (edge[0][1] + edge[1][1]) / 2,
                    (edge[0][2] + edge[1][2]) / 2
                ];
                pathPoints.push({
                    posY: midPoint[0].toFixed(2),
                    posZ: midPoint[1].toFixed(2),
                    posX: midPoint[2].toFixed(2),
                    id: 'auto_' + new Date().getTime() + '_' + corridorIndex + '_m_' + edgeIndex,
                    name: corridor.name + '中间点'
                });
            }
        });

        // 返回这个走廊的路径对象
        return {
            innerPath: {
                name: corridor.name + '自动路径',
                id: 'new' + new Date().getTime() + '_' + corridorIndex,
                planPathType: 'auto_corridor'
            },
            innerPathPosList: pathPoints
        };
    });

    return pathObjList;
}

/**
 * @authors myf
 * @date    2024-09-08
 * @description 开始路径布局
 * @return 无
 */
function startPathLayout () {
    const planPathType = $('input[id*=planPathTypeSelecte]').attr('valuekey');
    if (!planPathType) {
        $.toast({msgtype:'info',content:$.t('layout.tip.selectPlanPathTypePlease'),time:1000});
        return;
    }

    if (planPathType === 'auto_corridor') {
        // 自动规划走廊路径
        const pathObjList = autoPlanCorridorPath();
        if (pathObjList && pathObjList.length) {
            // 依次处理每条路径
            let currentIndex = 0;
            const processNextPath = () => {
                if (currentIndex < pathObjList.length) {
                    const pathObj = pathObjList[currentIndex];
                    createLayoutPath(pathObj, false);
                    // 自动搜集信息点
                    setTimeout(() => {
                        collectInfoPointAroundPath('line' + pathObj.innerPath.id);
                        currentIndex++;
                        // 处理下一条路径
                        setTimeout(processNextPath, 1000);
                    }, 500);
                }
            };
            processNextPath();
        }
    } else {
        const pathObj = {
            innerPath: {
                name: '',
                id: 'new' + new Date().getTime(),
                planPathType: planPathType
            },
            innerPathPosList: [],
        };
        createLayoutPath(pathObj, true);
    }
}

/**
 * @authors myf
 * @date    2024-09-07
 * @description 新增规划路径点位（布局时）
 * @param {string} pathModelId 路径模型id
 * @return 无
 */
function addPointToLayoutPath (pathModelId) {
    $.toast({msgtype:'info',content:'点击任意地点创建新的路径点',time:1000});
    const pointData = {
        id: 'point' + new Date().getTime(),
        name: 'point name',
        levelObjectId: pathModelId,
        url: '/api/models/474f45ea76324eb5820fc4081537d041/0/gltf/',
        scale: [0.2,0.2,0.2],
        tableId: '',
    }
    clickFloorCreateModelEvent (pointData);
}

/**
 * @authors myf
 * @date    2024-09-07
 * @description 保存规划路径（布局时）
 * @param {string} pathModelId 路径模型id
 * @param {boolean} isLine 是否是路径
 * @return 无
 */
function saveLayoutPath (pathModelId, isLine, isDeleted=false) {
    let pathModel = app.query('#' + pathModelId)[0];
    if (!isLine) {
        pathModel = pathModel.parent;
    }
    let lineTableId = pathModel.getAttribute('userData/tableId');
    if (lineTableId.includes('new')) {
        lineTableId = '';
    }
    const innerPath = {
        "endLevelObjectId": pathModel.parent.id,
        "endPoiId": pathModel.getAttribute('userData/poiId') || 'endPoi' + new Date().getTime(),
        "hospitalId": BindSysUsers["Sys"]["HospitalID"],
        "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
        "id": lineTableId,
        "name": pathModel.name,
        "plan": true,
        "planPathType": pathModel.getAttribute('userData/planPathType'),
        "startLevelObjectId": pathModel.parent.id,
        "startPoiId": pathModel.getAttribute('userData/poiId') || 'startPoi' + new Date().getTime(),
        "deleted": isDeleted
    }
    const innerPathPosList = [];
    if (!isDeleted) {
        pathModel.children.forEach((child, index)=>{
            const localPosition = CurSencceObj.worldToSelf(child.position);
            innerPathPosList.push({
                "hospitalId": BindSysUsers["Sys"]["HospitalID"],
                "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
                "id": child.id.includes('point') ? '' : child.id,
                "innerPathId": lineTableId,
                "levelObjectId": CurSencceObj.id,
                "levelTypeId": CurSencceObj.level,
                "name": child.name,
                "posX": localPosition[2].toFixed(2).toString(),
                "posY": localPosition[0].toFixed(2).toString(),
                "posZ": localPosition[1].toFixed(2).toString(),
                "seqNo": index + ''
            });
        });
    }
    const para = {
        innerPath: innerPath,
        innerPathPosList: innerPathPosList,
    };
    const paraStr = JSON.stringify(para);
    const savedId = getDataByAjax(dtvpApiServ,"innerPath/api","saveInnerPath",paraStr,"","post","json","","application/json;charset=utf-8",false);
    if (savedId) {
        pathModel.setAttribute('userData/tableId', savedId);
        $.toast({msgtype:'info',content:$.t('layout.tip.saveSuccess'),time:1000});
        equipLayoutInfoListQuickSearch();
    } else {
        $.toast({msgtype:'info',content:$.t('layout.tip.saveFail'),time:1000});
    }
    return savedId;
}

/**
 * @authors myf
 * @date    2024-09-05
 * @description 删除规划路径点位（布局时）
 * @param {string} pathPointModelId 路径点位模型id
 * @return 无
 */
function deleteLayoutPathPoint (pathPointModelId) {
    let pathPointModel = app.query('#' + pathPointModelId)[0];
    // console.log('pathPointModel',pathPointModel, pathPointModelId);
    $.confirm({msgtype:'warn',title:$.t('common.tip'),content:$.t('common.confirm.delete',{name: pathPointModel.name}),confirmText:$.t('common.operation.delete'),cancelText:$.t('common.operation.cancel')}, ()=>{
        const savedFlag = pathPointModel.getAttribute("userData/savedFlag");
        if (savedFlag) {
            const result = saveLayoutPath (pathPointModel.parent.id, true);
            if (!result) {
                $.toast({msgtype:'info',content:$.t('layout.tip.deleteFail'),time:1000});
                return;
            }
        }
        const pathModel = pathPointModel.parent;
        pathPointModel.destroy();
        refreshLayoutPath (pathModel.id);
        createLayoutPositionPanel(pathModel);
        $.toast({msgtype:'info',content:$.t('layout.tip.deleteSuccess'),time:1000});
    },undefined);
}

/**
 * @authors myf
 * @date    2024-09-04
 * @description 刷新规划路径点位（布局时）
 * @param {string} pathModelId 路径模型id
 * @return 无
 */
function refreshLayoutPath (pathModelId) {
    if (EquipLayoutConfig.code !== 'path') { return; }
    const pathModel = app.query('#' + pathModelId)[0];
    if (pathModel && pathModel.type === 'RouteLine') {
        const points = pathModel.children.map(child=>{return child.position;});
        refreshPolygonRegionPoints(pathModel, points);
    }
}

/**
 * @authors myf
 * @date    2024-09-03
 * @description 创建规划路径（布局时）
 * @param {object} pathObj 路径信息
 * @return 无
 */
function createLayoutPath (pathObj, isAddPoint = false) {
    if (EquipLayoutConfig.code !== 'path') {return}
    const pathInfo = pathObj.innerPath;
    const points = pathObj.innerPathPosList.map(pos=>{
        const point = [pos.posY - 0, pos.posZ - 0, pos.posX - 0];
        return CurSencceObj.selfToWorld(point);
    });
    const line = app.create({
        type: "RouteLine",
        name: pathInfo.name,
        id: 'line' + pathInfo.id,
        points: points,
        parent: CurSencceObj,
        scrollUV: true,
        scrollSpeed: 5,
        width: 2,
        arrowCap: false,
        style: {
            color: '#00FF00',
            image: ImgUrl+"aqtddhr.png",
        },
        complete: function() {
            const curLine = this;
            curLine.setAttribute('userData/tableId', pathInfo.id);
            curLine.setAttribute('userData/distance', pathInfo.distance);
            curLine.setAttribute('userData/planPathType', pathInfo.planPathType);
            curLine.setAttribute("userData/modelFlag","layoutModel");
            curLine.setAttribute("userData/isLine",true);
            curLine.setAttribute("userData/savedFlag", !pathInfo.id.includes('new'));
            createModelOperaPanel(curLine);
            curLine.on('click',function(ev){
                // showModelPosition(curLine.id);
                createLayoutPositionPanel(curLine);
            }, 'layoutModelClick');
            registerArrayByType(1, curLine.id, 1);
            pathObj.innerPathPosList.forEach((pos, index)=>{
                const pointData = {
                    id: 'point' + pos.id,
                    name: pos.name || pathInfo.name + '点' + index,
                    levelObjectId: curLine.id,
                    url: '/api/models/474f45ea76324eb5820fc4081537d041/0/gltf/',
                    localPosition: curLine.worldToSelf(CurSencceObj.selfToWorld([pos.posY - 0, pos.posZ - 0, pos.posX - 0])),
                    scale: [0.2,0.2,0.2],
                    tableId: pos.id,
                }
                layoutCreateModelObj(pointData);
            });
            if (isAddPoint) {
                addPointToLayoutPath (curLine.id);
            }
        }
    });

}

/**
 * @interface
 * 获取多边形的边和顶点
 * @author myf
 * @date 2025-04-16
 * @param {array} points - 组成多边形的点
 * @returns {object} 多边形的边和顶点
 */
function getPolygonEdgeAndPoint (points) {
    const vertices = points.filter((point, index) => {
        const numPoints = points.length;
        const prev = points[(index - 1 + numPoints) % numPoints];
        const current = point;
        const next = points[(index + 1) % numPoints];
        
        const angle = calculateAngleBetweenEdges(prev, current, next);
        // 如果角度接近180度（允许误差范围），则不是顶点
        return Math.abs(180 - angle) > 5;
    });

    const edges = [];
    for (let i = 0; i < vertices.length; i++) {
        const currentPoint = vertices[i];
        const nextPoint = vertices[(i + 1) % vertices.length];
        edges.push([currentPoint, nextPoint]);
    }
    
    return {vertices: vertices, edges: edges, allPoints: points};
}