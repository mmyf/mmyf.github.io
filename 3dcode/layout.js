var EquipLayoutConfig = {
    name: '', // 布局类型名称
    code: '', // 布局类型code
    equipName: '', // 设备名称，用于筛选 myf 20231120
    z: 0.2, // 模型离地面高度
    modelType: '', 
    
    // 布局模式 true:列表布局 false:自由布局
    listMode: false,
    
    // 布局数据保存方法
    saveMethod: null,
    
    // 布局模型创建方法 
    createMethod: null,
    
    // 布局模型删除方法
    deleteMethod: null,
    
    // 撤销操作数组
    layoutBackoutArr: [],
    
    // 视图模式 2D/3D
    viewMode2D: false,
};

/**
 * @description 进入布局模式
 * @return 无
 * @authors myf 2024-03-19
 */
/**
 * 初始化布局模式
 * @param {string} mode list/free 布局模式
 */
function initLayoutMode(mode) {
    EquipLayoutConfig.listMode = mode === 'list';
    
    if(mode === 'list') {
        // 列表布局初始化
        initListLayout();
    } else {
        // 自由布局初始化  
        initFreeLayout();
    }
    
    // 更新布局操作方法
    updateLayoutMethods(); 
}

/**
 * 初始化列表布局
 */
function initListLayout() {
    // 清除自由布局相关内容
    app.query('["userData/modelFlag"="layoutModel"]').destroyAll();
    $('#layoutPositionPanel').remove();
    
    // 加载列表和模型
    loadModelList();
}

/**
 * 初始化自由布局
 */  
function initFreeLayout() {
    // 清除列表布局相关内容
    $('#equipLayoutList' + EquipLayoutConfig.code).remove();
    $('#equipModelLayoutEmpty' + EquipLayoutConfig.code).remove();
    
    // 初始化自由布局配置
    EquipLayoutConfig.modelCreatedMode = false;
    EquipLayoutConfig.mulSelect = false; 
    EquipLayoutConfig.zoom = 1;
    
    // 加载自由布局模型
    loadLayoutModel();
}

/**
 * 更新布局操作方法
 */
function updateLayoutMethods() {
    if(EquipLayoutConfig.listMode) {
        // 列表模式操作方法
        EquipLayoutConfig.createMethod = layoutPanelCreateModelClickWithList;
        EquipLayoutConfig.saveMethod = saveModelWithList;
        EquipLayoutConfig.deleteMethod = deleteModelWithList;
    } else {
        // 自由模式操作方法
        EquipLayoutConfig.createMethod = clickFloorCreateModelEvent; 
        EquipLayoutConfig.saveMethod = saveModelWithFree;
        EquipLayoutConfig.deleteMethod = deleteModelWithFree;
    }
}

/**
 * 切换布局模式
 * @param {string} mode list/free 布局模式
 */
function switchLayoutMode(mode) {
    const oldMode = EquipLayoutConfig.listMode;
    const newMode = mode === 'list';
    
    if(oldMode === newMode) {
        return;
    }
    
    // 初始化新布局模式
    initLayoutMode(mode);
    
    // 更新工具栏按钮状态
    updateToolbarStatus(mode);
}

function enterLayoutMode () {
    app.pauseEvent('singleclick','*','roomclick');
    app.pauseEvent('click','*','thingClick');
    app.pauseEvent(THING.EventType.DBLClick,'*');
    app.pauseEvent(THING.EventType.EnterLevel,'*');
    app.pauseEvent(THING.EventType.LeaveLevel,'*');
    initAreaStretchEvent ();
    app.on('click',(e)=>{
        if (e.button === 2) {
            $.confirm({msgtype:'warn',title:$.t('common.tip'),content:$.t('layout.tip.isQuit'),confirmText:$.t('common.operation.continue'),cancelText:$.t('common.operation.cancel')}, ()=>{
                quitLayoutMode();
            },undefined);
        }
    },'quitLayoutLeavelLevel');
    app.on('click', '.Floor', (e)=>{
        createModelOperaPanel(e.pickedObject);
    }, 'layoutFloorClick');
    EquipLayoutConfig.pickedResultFunc = app.picker.pickedResultFunc;
    app.picker.pickedResultFunc = function (obj) {
        if (obj.getAttribute('userData/modelFlag') || obj.type !== 'Thing') {
            return obj;
        } else {
            return null;
        }
    }
    
    // 只在区域布局做旋转操作 myf 20241028
    if (CurSencceObj.angleY && EquipLayoutConfig.code === 'area') {
        EquipLayoutConfig.senceAngleY = CurSencceObj.angleY;
        CurSencceObj.angleY = 0;
    }
    EquipLayoutConfig.setAttrArr = ['roomId', 'savedFlag', 'modelId', 'meterId', 'code', 'equipNo', 'sysExid', 'inputType',
        'isLevelLayout', 'isRoomLayout', 'isFollowLayout', 'followObjectId', 'mainModelId', 'childModelId', 'eqmodel',
        'bendRadius', 'radius', 'facilityTypeSubCode', 'savedId', 'facilityWayCode', 'facilityUseModeCode', 'parentId', 'hospitalId', 'hospitalAreaId'];
    // CurSencceObj.query('.Thing').objects.forEach(item=>{item.visible = false;});
    // CurSencceObj.query('.Misc').objects.forEach(item=>{item.visible = false;});
    EquipLayoutConfig.layoutBackoutArr = [];
    if (CurSencceObj.misc) {
        CurSencceObj.misc.visible = false;
    }
    if (CurSencceObj.things) {
        CurSencceObj.things.objects.forEach(obj=>{
            if (!obj.type.includes('Door')) {
                obj.visible = false;
            }
        });
    }
    if (CurSencceObj.type === 'Floor') {
        createRoomText(CurSencceObj, {'fontColor':'#ffffff'});
        // CurSencceObj.showAllCeilings(false);
        CurSencceObj.showAllRoofs(false);
    } else if (CurSencceObj.type === 'Building') {
        expandFloorButton();
        CurSencceObj.floors.forEach(floor=>{
            createRoomText(floor, {'fontColor':'#ffffff'});
        });
    }
    const selectRoomLayoutTypes = ['equip', 'base-equip', 'access', 'area', 'information-equip', 'window'];
    const loadLayoutModels = ['facility', 'window'];
    if (selectRoomLayoutTypes.includes(EquipLayoutConfig.code)) {
        app.on('click','.Room',(e)=>{
            if (EquipLayoutConfig.selectedRoomId) {
                const room = app.query('#'+EquipLayoutConfig.selectedRoomId)[0];
                setObjColor(room.plan, '#6398FE');
                setObjOpacity(room.plan, 0.65);
                if (EquipLayoutConfig.code === 'window') {
                    EquipLayoutConfig.selectedWallPosition = [0,0,0];
                    EquipLayoutConfig.selectedWallRotationY = null;
                    $(`[id*=windowLayoutWallSelect]`).remove();
                    app.query('["name"="windowLayoutWallSelect"]').destroyAll();
                    app.query(`[id*=windowLayoutWallSelect]`).destroyAll();
                }
            }
            EquipLayoutConfig.selectedRoomId = e.object.id;
            setObjColor(e.object.plan, 'green');
            if (EquipLayoutConfig.code === 'window') {

                const roomPointInfo = getPolygonEdgeAndPoint(e.object._points);
                // console.log('roomPointInfo', roomPointInfo, e.object);
                const topCardPosition = roomPointInfo.edges;
                
                topCardPosition.forEach((edge, index)=>{
                    const localPosition = calculateCenterPoint(edge[0], edge[1]);
                    const baseModel = app.create({
                        id: 'windowLayoutWallSelect' + e.object.id + index,
                        type: 'Box',
                        width: 0.001,
                        height: 0.001,
                        depth: 0.001,
                        parent: e.object,
                        localPosition: localPosition,
                        name: 'windowLayoutWallSelect',
                        pickable: false,
                    });
                    let html = `<div id="windowLayoutWallSelect${e.object.id+index}" style="width:2rem;height:2rem;background-image:url(${ImgUrl}icon/eq-dialog-success.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;"></div>`;
                    const panelInfo = {panelPosition: [0,1,0],panelId:'',panelPivot:[0.5,0],levelType:2,hasLine:true,closeable:true,isDestroyParent:true, panelZIndex: 2, panelClassName:`"name"="windowLayoutWallSelect"`};
                    createCommonTopCard(baseModel, html, panelInfo);
                    $('#windowLayoutWallSelect'+e.object.id+index).click(function(event){
                        event.stopPropagation();
                        $.toast({msgtype:'info',content:$.t('layout.tip.wallSelected'),time:400});
                        $(`[id*=windowLayoutWallSelect${e.object.id}]`).remove();
                        app.query('["name"="windowLayoutWallSelect"]').destroyAll();
                        app.query(`#windowLayoutWallSelect${e.object.id + index+"TopCardPanel_Line"}`).destroyAll();
                        EquipLayoutConfig.selectedWallPosition = e.object.selfToWorld(localPosition);
                        // EquipLayoutConfig.selectedWallLength = get3DDistancePointToPoint(edge[0], edge[1]);
                        EquipLayoutConfig.selectedWallEdge = edge.map(poi=>{
                            return CurSencceObj.worldToSelf(e.object.selfToWorld(poi));
                        });
                    });
                });
            }
            $.toast({msgtype:'info',content:$.t('layout.tip.roomSelected'),time:400});
        },'selectRoomClick');
        if (EquipLayoutConfig.code === 'base-equip') {
            loadBaseEquipModel();
        }
    }
    if (EquipLayoutConfig.code === 'area') {
        const buildingUnitData = getDataByAjax(dtvpApiServ,"buildingUnit/api","getBuildingUnitInfo",`hospitalId=${BindSysUsers["Sys"]["HospitalID"]}&floorObjectId=${getSceneIdByTpye('Floor')}`,"","get","json","","",false);
        EquipLayoutConfig.buildingUnitData = buildingUnitData;
        loadAreaModel();
    }
    EquipLayoutConfig.zoom = 1;
    if (EquipLayoutConfig.code === 'meter') {
        const pipeNodes = getDataByAjax(dtvpApiServ,"pipelineNode/api","getPipelineNodePageVO",`hospitalId=${BindSysUsers["Sys"]["HospitalID"]}&buildingObjectId=${getSceneIdByTpye('Building')}&floorObjectId=${getSceneIdByTpye('Floor')}`,"","get","json","","",false);
        const curWaterMeters = pipeNodes.filter(node=>{return node.id.includes('WM')}).map(item=>{return item.id.slice(item.id.lastIndexOf('-') + 1)}).sort((a,b)=>{return a - 0 > b - 0 ? -1 : 1});
        const curElecticMeters = pipeNodes.filter(node=>{return node.id.includes('EM')}).map(item=>{return item.id.slice(item.id.lastIndexOf('-') + 1)}).sort((a,b)=>{return a - 0 > b - 0 ? -1 : 1});
        PipeLineSystemForm.pipelineWMLength = curWaterMeters.length ? curWaterMeters[0] - 0 : 1;
        PipeLineSystemForm.pipelineEMLength = curElecticMeters.length ? curElecticMeters[0] - 0 : 1;
    }else if (EquipLayoutConfig.code === 'path') {
        const hosInnerInfoPoints = getCurSceneDoors();
        hosInnerInfoPoints.forEach(door=>{
            setDefaultOutlineColor(door, 'green', 2);
        });
    }else if (loadLayoutModels.includes(EquipLayoutConfig.code)) {
        loadLayoutModel();
    }
}

/**
 * @description 退出布局模式
 * @return 无
 * @authors myf 2023-12-12
 */
function quitLayoutMode () {
    // myf 20240509 取消跨楼层模式
    if (EquipLayoutConfig.isOverFloorLinkMode) {
        overFloorPipeLinkFloorSelect();
    }
    app.resumeEvent('singleclick','*','roomclick');
    app.resumeEvent('click','*','thingClick');
    app.resumeEvent(THING.EventType.DBLClick,'*');
    app.resumeEvent(THING.EventType.EnterLevel,'*');
    app.resumeEvent(THING.EventType.LeaveLevel,'*');
    app.off('click',null,'quitLayoutLeavelLevel');
    app.off('click',null,'modelGroupLayoutClick');
    app.off('click',null,'createPolygonAreaClick');
    app.off('click',null,'drawAreaClick');
    app.off('click',null,'layoutPanelCreateModelClickWith');
    app.off('click',null,'pipeModelGroupLayoutClick');
    app.off('click',null,'layoutModelClick');
    app.off('click','*','followTypeModelClick');
    app.off('click','["userData/modelFlag"="layoutModel"]','brushCopy');
    app.off('click','.Room','selectRoomClick');
    app.off('mousedown',null,'layoutBoxSelectMousedown');
    app.off('mouseup',null,'layoutBoxSelectMouseup');
    app.off('mousemove', null, 'layoutMousemove');
    app.off('mousemove', '.PolygonRegion', 'polygonRegionMousemove');
    app.off('mousedown', null, 'polygonRegionMousedown');
    app.off('mousemove', null, 'polygonRegionStretch');
    app.off('mouseup', null, 'polygonRegionMouseup');
    app.off('mousedown', null, 'stretchToCreatePolygonAreaMousedown');
    app.off('mousemove', null, 'stretchToCreatePolygonAreaMousemove');
    app.off('mouseup', null, 'stretchToCreatePolygonAreaMouseup');
    app.off('click', '.Floor', 'layoutFloorClick');
    app.camera.inputEnabled = true;
    app.removeControl('boxSelectControl');
    // $('[id*=water-pipeline-layout]').remove();
    // $('[id*=monitor-layout]').remove();
    // $('[id*=equip-layout]').remove();
    // $('[id*=access-layout]').remove();
    // $('[id*=meter-layout]').remove();
    // $('[id*=area-layout]').remove();
    // $('[id*=model-group-layout]').remove();
    $('[id*=layout][data-role=root]').remove();
    $('[id$=TopCardPanel]').remove();
    removeRoomText();
    $(`[id*=T-PIPE]`).remove();
    $(`[id*=T-WM]`).remove();
    $(`[id*=T-EM]`).remove();
    $(`#layoutPositionPanel`).remove();
    app.query('["name"="pipelinePlan"]').destroyAll();
    app.query('["name"="pipelineSaved"]').destroyAll();
    app.query('["name"="floorBlueprint"]').destroyAll();
    app.query('["userData/modelFlag"="layoutModel"]').destroyAll();
    destroyFluidFlow();
    autoLevelClear();

    if (EquipLayoutConfig.senceAngleY) {
        CurSencceObj.angleY = EquipLayoutConfig.senceAngleY;
    }

    if (CurSencceObj.misc) {
        CurSencceObj.misc.visible = true;
    }
    if (CurSencceObj.things) {
        CurSencceObj.things.visible = true;
    }
    app.picker.pickedResultFunc = EquipLayoutConfig.pickedResultFunc;
    // myf 20240410 恢复楼层楼宇高度
    if (CurSencceObj.type === 'Floor') {
        CurSencceObj.scale = [1,1,1];
        // CurSencceObj.showAllCeilings(true);
        // CurSencceObj.showAllRoofs(true);
        CurSencceObj.building.floors.forEach(floor=>{
            floor.visible = false;
        });
        CurSencceObj.visible = true;
    } else if (CurSencceObj.type === 'Building') {
        CurSencceObj.floors.forEach(floor=>{
            floor.scale = [1,1,1];
        });
    }
    if (EquipLayoutConfig.code === 'path') {
        const hosInnerInfoPoints = getCurSceneDoors();
        hosInnerInfoPoints.forEach(door=>{
            setDefaultOutlineColor(door, null, 2);
        });
    }
    const roomObj = app.query('#'+ EquipLayoutConfig.selectedRoomId)[0];
    if (roomObj) {
        setObjColor(roomObj.plan, '#6398FE');
        setObjOpacity(roomObj.plan, 0.65);
    }
    EquipLayoutConfig.selectedRoomId = '';
    layoutPositionPanelUnlock();
    EquipLayoutConfig.zoom = 1;
    EquipLayoutConfig.showPipeline = false;
    EquipLayoutConfig.showPipeRadius = false;
    // myf 20240823 数据恢复初始化
    EquipLayoutConfig.mulSelect = false;
    EquipLayoutConfig.mulReplace = false;
    EquipLayoutConfig.boxSelect = false;
    EquipLayoutConfig.brushCopyMode = false;
    EquipLayoutConfig.highlight = '';
    EquipLayoutConfig.measureTypeX = 0.1;
    EquipLayoutConfig.measureTypeY = 0.1;
    EquipLayoutConfig.measureTypeZ = 0.1;
    EquipLayoutConfig.viewMode2D = false;
    EquipLayoutConfig.lastSelectModelIds = '';
    EquipLayoutConfig.mainModelObjId = '';
    EquipLayoutConfig.mainModelId = '';
    EquipLayoutConfig.selectedAreaId = '';
    EquipLayoutConfig.pipelineSystemId = '';
    EquipLayoutConfig.pipelineTypeCode = '';
    EquipLayoutConfig.pipelineTypeId = '';
    EquipLayoutConfig.buildingUnitData = [];
    EquipLayoutConfig.mousemoveEventArr = [];
    EquipLayoutConfig.mousemoveEvent = false;
    EquipLayoutConfig.layoutBackoutArr = [];
    EquipLayoutConfig.pipeModelRadioMode = '';

    if (EquipLayoutConfig.antiShakeTimeout) {
        clearTimeout(EquipLayoutConfig.antiShakeTimeout);
        EquipLayoutConfig.antiShakeTimeout = null;
    }
    // 退出布局时增加一个回调函数 myf 20240930
    if (EquipLayoutConfig.quitLayoutCallFunction) {
        EquipLayoutConfig.quitLayoutCallFunction();
        EquipLayoutConfig.quitLayoutCallFunction = null;
    }
}

/**
 * @description 布局面板创建区域模型点击事件(自由布局)
 * @param {Object} element 点击元素
 * @param {array} clickedDesc 选择描述
 * @param {array} clickedValue 选择值
 * @return 无
 * @authors myf 2024-08-14
 */
function layoutPanelCreateAreaModelClick (element, clickedDesc, clickedValue) {
    if (!clickedValue[0]) {return}
    if (!EquipLayoutConfig.selectedAreaId) {
        triggerElementEvent($(element).attr('id'), 'click');
        $.toast({msgtype:'info',content:$.t('layout.tip.selectAreaFirst'),time:1000});
        return;
    }
    $.toast({msgtype:'info',content:$.t('layout.tip.clickAnywhere'),time:1000});
    // const checkboxDataStr =  $(element).parent().parent().parent().attr('itemdata');
    // const checkboxData = checkboxDataStr ? JSON.parse(checkboxDataStr) : [];
    const checkboxData = getPageData($(element).parent().parent().parent().attr('id'), 'itemdata'); // myf 20250102 html挂载数据改造
    const curModelData = checkboxData.find(item=>{return item.id === clickedValue[0]});
    if (curModelData) {
        let modelInfo = {
            id: 'areaModel' + new Date().getTime(),
            url: curModelData.modelUrl,
            name: curModelData.name,
            levelObjectId: CurSencceObj.id,
            modelId: curModelData.id,
            areaId: EquipLayoutConfig.selectedAreaId
        }
        clickFloorCreateModelEvent(modelInfo, element, true);
    }
}

/**
 * @description 布局面板创建模型点击事件(自由布局)
 * @param {Object} list 点击列表行
 * @param {String} mode 模式
 * @return 无
 * @authors myf 2023-12-05
 */
function layoutPanelCreateModelClick (list, mode, clickedValue) {
    if (!clickedValue.length) {
        return;
    }
    if (EquipLayoutConfig.code !== 'pipeline' && EquipLayoutConfig.code !== 'model-group-pipeline') {
        let equipId = $(list).attr('equipId');
        if (!equipId && EquipLayoutConfig.code !== 'meter') {
            $.toast({msgtype:'info',content:$.t('layout.tip.noEquipInfo'),time:1000});
            return;
        }
        let equipNo = $(list).attr('equipNo');
        if (mode === '1') { // 已布局设备，重置
            resetModelLayout(equipId,equipNo);
            $.toast({msgtype:'info',content:$.t('layout.tip.resetLayout'),time:1000});
            return;
        }
        let modelName = $(list).attr('name');
        let radioId = $('#equipLayoutList'+EquipLayoutConfig.code).attr('radioId');
        // const modelValueStr = $($(`[id*=${radioId}]`)[2]).attr('valuekey');
        // if (!modelValueStr || modelValueStr === '[]') {
        //     $.toast({msgtype:'info',content:$.t('layout.tip.selectModelFirst',{name: EquipLayoutConfig.name}),time:1000});
        //     return;
        // }
        // const modelValue = JSON.parse(modelValueStr);
        const modelValue = getPageData($($(`[id*=${radioId}]`)[2]).attr('id'), 'valuekey'); // myf 20250102 html挂载数据改造
        if (!modelValue[0]) {
            $.toast({msgtype:'info',content:$.t('layout.tip.selectModelFirst',{name: EquipLayoutConfig.name}),time:1000});
            return;
        }
        // const itemDataStr = $($(`[id*=${radioId}]`)[2]).parent().attr('itemdata');
        // const itemData = JSON.parse(itemDataStr);
        const itemData = getPageData($($(`[id*=${radioId}]`)[2]).parent().attr('id'), 'itemdata'); // myf 20250102 html挂载数据改造
        const modelData = itemData.find(model=>{
            return model.id === modelValue[0];
        });
        if (!equipId && EquipLayoutConfig.code === 'meter') {
            if (!EquipLayoutConfig.pipelineTypeCode) {
                $.toast({msgtype:'info',content:$.t('layout.tip.selectPipeSysFirst'),time:1000});
                return;
            }

            if (modelData.name.includes($.t('common.item.waterMeter'))) {
                PipeLineSystemForm.pipelineWMLength++;
                equipId = `T-WM-${EquipLayoutConfig.pipelineTypeCode}-${CurSencceObj.id}-${PipeLineSystemForm.pipelineWMLength}`;

            } else if (modelData.name.includes($.t('common.item.electricityMeter'))) {
                PipeLineSystemForm.pipelineEMLength++;
                equipId = `T-EM-${EquipLayoutConfig.pipelineTypeCode}-${CurSencceObj.id}-${PipeLineSystemForm.pipelineEMLength}`;
            }
            $(list).attr('equipId', equipId);
        }

        $.toast({msgtype:'info',content:$.t('layout.tip.clickAnywhere'),time:1000});
        let modelInfo = {
            id: equipId,
            url: modelData.modelUrl,
            name: modelName,
            levelObjectId: CurSencceObj.id,
            meterId: $(list).attr('meterId'),
            modelId: modelData.id,
        }
        const radioElement = $(`[title='${modelData.name}']`)[0];
        clickFloorCreateModelEvent(modelInfo, radioElement, true);
        return;

    }
    // const pipelineTypeStr = $($(`[id*=pipelineTypeRadio]`)[1]).attr('valuekey');
    // if (!pipelineTypeStr || pipelineTypeStr === '[]') {
    //     $.toast({msgtype:'info',content:$.t('layout.tip.selectPipeTypeFirst'),time:1000});
    //     return;
    // }
    if (!EquipLayoutConfig.pipelineTypeCode) {
        $.toast({msgtype:'info',content:$.t('layout.tip.selectPipeTypeFirst'),time:1000});
        return;
    }
    // if (!clickedValue.length) {
    //     // $.toast({msgtype:'info',content:$.t('layout.tip.selectPipeModelFirst'),time:1000});
    //     return;
    // }
    $.toast({msgtype:'info',content:$.t('layout.tip.clickAnywhere'),time:1000});
    const radioName = EquipLayoutConfig.code === 'model-group-pipeline' ? 'gourpFittingModelRadio' : 'fittingModelRadio';
    // const itemDataStr = $($(`[id*=${radioName}]`).filter('[id$=Checkbox]')).attr('itemdata');
    // const itemData = JSON.parse(itemDataStr);
    const itemData = getPageData($($(`[id*=${radioName}]`).filter('[id$=Checkbox]')).attr('id'), 'itemdata'); // myf 20250102 html挂载数据改造
    // let modelData = itemData.find(model=>{
    //     return model.code === clickedValue[0];
    // });

    // if (EquipLayoutConfig.code === 'pipeline') {
    let modelData = itemData.find(model=>{
        return model.id === clickedValue[0];
    });
    // }
    // myf 20240119 水电表名称和类型
    const curPipelineCatId = modelData.pipelineCatId;
    let nodeType = 0;
    let equipId = `T-PIPE-${EquipLayoutConfig.pipelineTypeCode}-${CurSencceObj.id}-${PipeLineSystemForm.pipelineNodeLength + 1}`;
    if (curPipelineCatId === '6') {
        equipId = `T-WM-${EquipLayoutConfig.pipelineTypeCode}-${CurSencceObj.id}-${PipeLineSystemForm.pipelineWMLength + 1}`;
        nodeType = 1;
    } else if (curPipelineCatId === '7') {
        equipId = `T-EM-${EquipLayoutConfig.pipelineTypeCode}-${CurSencceObj.id}-${PipeLineSystemForm.pipelineEMLength + 1}`;
        nodeType = 1;
    }
    let modelInfo = {
        id: equipId,
        url: modelData.modelUrl,
        name: modelData.name,
        levelObjectId: CurSencceObj.id,
        modelId: clickedValue[0],
        nodeType: nodeType,
        color: '#00ff35',
        curPipelineCatId: curPipelineCatId,
        pipelineType: EquipLayoutConfig.pipelineTypeId,
        equipNo: equipId,
        radius: modelData.radius,
        bendRadius: modelData.bendRadius,
    }
    const radioElement = $(`[title='${modelData.name}']`)[0];
    clickFloorCreateModelEvent(modelInfo, radioElement);
}

/**
 * @interface
 * @description 布局面板创建模型点击事件(根据设备数据布局)
 * @param {Object} list 点击列表行
 * @param {String} mode 模式
 * @return 无
 * @authors myf 2023-10-26
 */
function layoutPanelCreateModelClickWithList (list,mode) {

    // console.log('layoutPanelCreateModelClickWithList', list, mode);
    let equipId = $(list).attr('equipId');
    let equipNo = $(list).attr('equipNo');
    if (mode === '1') { // 已布局设备，重置
        resetModelLayout(equipId,equipNo);
        $.toast({msgtype:'info',content:$.t('layout.tip.resetLayout'),time:1000});
        return;
    }
    let modelName = $(list).attr('name');
    let radioId = $('#equipLayoutList'+EquipLayoutConfig.code).attr('radioId');

    // const itemDataStr = $(`[id*=${radioId}]`).filter('[id$=Checkbox]').attr('itemdata');
    // const itemData = JSON.parse(itemDataStr);
    const itemData = getPageData($(`[id*=${radioId}]`).filter('[id$=Checkbox]').attr('id'), 'itemdata'); // myf 20250102 html挂载数据改造
    let modelId = '';
    // 设备默认模型
    const modelDefaultData = getDataByAjax(dtvpApiServ,"model/api","getModelDescByEquipNo",{equipNo:equipNo},"","get","json","","",false);
    if (modelDefaultData && modelDefaultData.modelId) {
        modelId = modelDefaultData.modelId;
    } else {
        // const modelValueStr = $(`[id*=${radioId}]`).filter('[id$=Checkbox]').children().attr('valuekey');
        // if (!modelValueStr || modelValueStr === '[]') {
        //     $.toast({msgtype:'info',content:$.t('layout.tip.selectModelFirst', {name: EquipLayoutConfig.name}),time:1000});
        //     return;
        // }
        // const modelValue = JSON.parse(modelValueStr);
        const modelValue = getPageData($(`[id*=${radioId}]`).filter('[id$=Checkbox]').children().attr('id'), 'valuekey'); // myf 20250102 html挂载数据改造
        if (!modelValue[0]) {
            $.toast({msgtype:'info',content:$.t('layout.tip.selectModelFirst',{name: EquipLayoutConfig.name}),time:1000});
            return;
        }
        modelId = modelValue[0];
    }
    const modelData = itemData.find(model=>{
        return model.id === modelId;
    });
    
    if (!modelData) {return;}
    const modelUrl = modelData.modelUrl;

    if (!EquipLayoutConfig.selectedRoomId) {
        $.toast({msgtype:'info',content:$.t('layout.tip.selectRoomFirst'),time:1000});
        return;
    }

    EquipLayoutConfig.z = modelData.defaultPosY ? modelData.defaultPosY - 0 : EquipLayoutConfig.z;
    if (EquipLayoutConfig.z === 99) {
        EquipLayoutConfig.z = 3;
    }
    let modelInfo = {
        id: equipId,
        url: modelUrl,
        name: modelName,
        levelObjectId: CurSencceObj.id,
        equipNo: $(list).attr('equipNo'),
        sysExid: $(list).attr('sysExid'),
    }
    clickRoomCreateModelEvent(modelInfo);
}

/**
 * @interface
 * @description 点击选择房间创建模型事件（布局）
 * @param {Object} list 点击列表行
 * @param {String} mode 模式
 * @return 无
 * @authors myf 2023-12-05
 */
function clickRoomCreateModelEvent (modelInfo) {
    const clickedRoom = app.query('#'+EquipLayoutConfig.selectedRoomId)[0];
    let modelPosition = CurSencceObj.worldToSelf(clickedRoom.position);
    modelInfo.roomId = clickedRoom.id;
    if (EquipLayoutConfig.code === 'access') { // 门禁类型
        const doorDatas = getDataByAjax(dtvpApiServ,"door/api","doorDetailList",{roomObjectId:clickedRoom.id},"","get","json","","",false);
        if (doorDatas) {
            if (doorDatas.length === 1) { // 只有一个门，直接绑定
                if (EquipLayoutConfig.accessLayoutBindDoorObjIds.includes(doorDatas[0].doorObjectId)) {
                    $.toast({msgtype:'warn',content:$.t('layout.tip.hasAccess'),time:1000});
                    return;
                }
                const door = app.query('#'+doorDatas[0].doorObjectId)[0];
                if (!door) {
                    $.toast({msgtype:'warn',content:$.t('layout.tip.doorDataNotExist'),time:1000});
                    return;
                }
                modelInfo.localPosition = CurSencceObj.worldToSelf(door.position);
                modelInfo.localPosition[1] = EquipLayoutConfig.z;
                const modelObj = layoutCreateModelObj(modelInfo);
                accessLayoutBindDoorClick(modelObj.id, doorDatas[0].id);
                return;
            } else { // 多个门，先选门，再绑定
                let doorNum = 0;
                doorDatas.some(door=>{
                    if (EquipLayoutConfig.accessLayoutBindDoorObjIds.includes(door.doorObjectId)) {
                        return;
                    }
                    const doorObj = app.query('#'+door.doorObjectId)[0];
                    if (!doorObj) {
                        $.toast({msgtype:'warn',content:$.t('layout.tip.doorDataNotExist'),time:1000});
                        return;
                    }
                    let html = `<div id="layoutDoorSelect${door.doorObjectId}" style="width:2rem;height:2rem;background-image:url(${ImgUrl}icon/eq-dialog-success.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;"></div>`;
                    const panelInfo = {panelPosition: [0,0,0],panelId:'',panelPivot:[0,0],levelType:2,hasLine:false,closeable:false, panelZIndex: 2, panelClassName:"class='layoutDoorSelect'"};
                    createCommonTopCard(doorObj, html, panelInfo);
                    $('#layoutDoorSelect'+door.doorObjectId).click(function(event){
                        event.stopPropagation();
                        $('[class*=layoutDoorSelect]').remove();
                        app.query('[class*=layoutDoorSelect]').destroyAll();
                        modelInfo.localPosition = CurSencceObj.worldToSelf(doorObj.position);
                        modelInfo.localPosition[1] = EquipLayoutConfig.z;
                        const modelObj = layoutCreateModelObj(modelInfo);
                        accessLayoutBindDoorClick(modelObj.id, door.id);
                    });
                    doorNum++;
                });
                if (doorNum === 0) {
                    $.toast({msgtype:'warn',content:$.t('layout.tip.allHasAccess'),time:1000});
                    return;
                }
                $.toast({msgtype:'info',content:$.t('layout.tip.selectDoorFirst'),time:1000});
                return;
            }
        }
        return;
    }
    modelInfo.localPosition = modelPosition;
    modelInfo.localPosition[1] = EquipLayoutConfig.z;
    if (EquipLayoutConfig.code === 'information-equip') {
        const isAccurateLayout = getPageData($('[formkey=isAccurateLayout]').children().eq(0).attr('id'), 'valuekey');
        if (isAccurateLayout === '0') {
            // todo
            const data = [{
                "hospitalId": BindSysUsers["Sys"]["HospitalID"],
                "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
                "equipNo": modelInfo.equipNo,
                "levelObjectId": CurSencceObj.id,
                "levelType": CurSencceObj.level,
                "name": modelInfo.name || '',
                "modelType": 3,
                "modelUrl": modelInfo.url || '',
                "objectId": modelInfo.equipNo,
                "roomObjectId": EquipLayoutConfig.selectedRoomId || '',
                "posX": modelInfo.localPosition[0].toString(),
                "posY": modelInfo.localPosition[1].toString(),
                "posZ": modelInfo.localPosition[2].toString(),
                "rotateX": '0',
                "rotateY": '0',
                "rotateZ": '0',
                "scaleX": '1',
                "scaleY": '1',
                "scaleZ": '1',
            }];
            const paraStr = JSON.stringify(data);
            getDataByAjax(dtvpApiServ,"objectMap/api","saveObjectMapList",paraStr,"","post","json","","application/json;charset=utf-8",false);
            $.toast({msgtype:'info',content:$.t('layout.tip.savedLayout'),time:1000});
            equipLayoutInfoListQuickSearch();
            return;
        }
    }
    layoutCreateModelObj(modelInfo);
}

/**
 * @interface
 * @description 点击楼层任意地点创建模型事件（布局）
 * @param {Object} modelInfo 模型信息
 * @return 无
 * @authors myf 2023-12-06
 */
function clickFloorCreateModelEvent (modelInfo, radioElement, singleTrigger = false) {
    initThingJsTip($.t('layout.tip.createTip'));
    $('#all').css('top','5rem');
    $(document.body).css('cursor',`cell`);
    app.pauseEvent('click',null,'quitLayoutLeavelLevel');
    app.pauseEvent('mousemove',null,'layoutMousemove');
    EquipLayoutConfig.modelCreatedMode = true;
    if (radioElement) {
        EquipLayoutConfig.clickedRadioElement = radioElement;
    }
    // myf 20240827 醒目提示创建
    app.on('mousemove', (ev)=>{
        if ($('#createMouseTip')[0]) {
            $('#createMouseTip').css('top', ev.y + 5 + 'px');
            $('#createMouseTip').css('left', ev.x + 5 + 'px');
        } else {
            let html = `<div id="createMouseTip" style="color:#fff;position:absolute;top:${ev.y + 5}px;left:${ev.x + 5}px;">${$.t('layout.tip.clickToCreateRightClickToQuit')}</div>`;
            $('#div3d').append(html);
        }
    }, 'createMouseTipMousemove');
    app.on('click',(event)=>{
        event.stopPropagation();
        if (event.button === 2) {
            quitLayoutCreatedMode();
            return;
        }
        const modelGroupPipelineMode = EquipLayoutConfig.code === 'model-group-pipeline';
        if (modelGroupPipelineMode) {
            modelInfo.levelObjectId = EquipLayoutConfig.mainModelObjId;
        }
        let modelPosition = CurSencceObj.worldToSelf(event.pickedPosition);
        if (EquipLayoutConfig.code === 'model-group') {
            const mainModelObj = app.query('#' + EquipLayoutConfig.mainModelObjId)[0];
            if (EquipLayoutConfig.mainModelObjId && mainModelObj) {
                modelPosition = mainModelObj.worldToSelf(event.pickedPosition);
            }
        } else if (EquipLayoutConfig.code === 'path' || modelGroupPipelineMode) {
            const pathModel = app.query('#' + modelInfo.levelObjectId)[0];
            modelPosition = pathModel.worldToSelf(event.pickedPosition);
        }
        modelInfo.localPosition = modelPosition;
        modelInfo.localPosition[1] = EquipLayoutConfig.z;
        // myf 20240425 创建时锁坐标角度缩放处理
        modelInfo.localPosition[0] = EquipLayoutConfig.positionXLock ? $('#layoutPositionPanel-positionX').val() : modelInfo.localPosition[0];
        modelInfo.localPosition[1] = EquipLayoutConfig.positionYLock ? $('#layoutPositionPanel-positionY').val() : modelInfo.localPosition[1];
        modelInfo.localPosition[2] = EquipLayoutConfig.positionZLock ? $('#layoutPositionPanel-positionZ').val() : modelInfo.localPosition[2];
        modelInfo.rotation = modelInfo.rotation || [0,0,0];
        modelInfo.rotation[0] = EquipLayoutConfig.rotationXLock ? $('#layoutPositionPanel-rotationX').val() : modelInfo.rotation[0];
        modelInfo.rotation[1] = EquipLayoutConfig.rotationYLock ? $('#layoutPositionPanel-rotationY').val() : modelInfo.rotation[1];
        modelInfo.rotation[2] = EquipLayoutConfig.rotationZLock ? $('#layoutPositionPanel-rotationZ').val() : modelInfo.rotation[2];
        modelInfo.scale = modelInfo.scale || [1,1,1];
        modelInfo.scale[0] = EquipLayoutConfig.scaleXLock ? $('#layoutPositionPanel-scaleX').val() : modelInfo.scale[0];
        modelInfo.scale[1] = EquipLayoutConfig.scaleYLock ? $('#layoutPositionPanel-scaleY').val() : modelInfo.scale[1];
        modelInfo.scale[2] = EquipLayoutConfig.scaleZLock ? $('#layoutPositionPanel-scaleZ').val() : modelInfo.scale[2];
        layoutCreateModelObj(modelInfo);
        PipeLineSystemForm.lastSelectModelId = modelInfo.id;
        let equipId = modelInfo.id;
        if (EquipLayoutConfig.code === 'pipeline' || modelGroupPipelineMode) {
            // myf 20240131 新建管件保存数据处理
            PipeLineSystemForm.pipelineNodeList.push({
                "id": modelInfo.id,
                "hospitalId": BindSysUsers["Sys"]["HospitalID"],
                "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
                "pipelineSystemId": "",
                "code": "",
                "name": modelInfo.name,
                "nodeType": modelInfo.nodeType || 0, // 0:连接件 1：仪表 2：阀门
                "fittingModelId": modelInfo.modelId || '',
                "buildingObjectId": getSceneIdByTpye('Building'),
                "floorObjectId": getSceneIdByTpye('Floor'),
                "levelObjectId": modelGroupPipelineMode ? modelInfo.levelObjectId : CurSencceObj.id,
                "levelTypeId": modelGroupPipelineMode ? '' : CurSencceObj.level,
                "posX": modelInfo.localPosition[0] + '',
                "posY": modelInfo.localPosition[1] + '',
                "posZ": modelInfo.localPosition[2] + '',
                "rotationX": modelInfo.rotation ? modelInfo.rotation[0] : '0',
                "rotationY": modelInfo.rotation ? modelInfo.rotation[1] : '0',
                "rotationZ": modelInfo.rotation ? modelInfo.rotation[2] : '0',
                "rotationAngle": JSON.stringify(modelInfo.rotation),
                "installationDate": "",
                "meterId": modelInfo.meterId || "",
                "status": null,
                "remark": "",
            });
            if (modelInfo.curPipelineCatId === '6') {
                PipeLineSystemForm.pipelineWMLength++;
                equipId = `T-WM-${EquipLayoutConfig.pipelineTypeCode}-${CurSencceObj.id}-${PipeLineSystemForm.pipelineWMLength + 1}`;
            } else if (modelInfo.curPipelineCatId === '7') {
                PipeLineSystemForm.pipelineEMLength++;
                equipId = `T-EM-${EquipLayoutConfig.pipelineTypeCode}-${CurSencceObj.id}-${PipeLineSystemForm.pipelineEMLength + 1}`;
            } else {
                PipeLineSystemForm.pipelineNodeLength++;
                equipId = `T-PIPE-${EquipLayoutConfig.pipelineTypeCode}-${CurSencceObj.id}-${PipeLineSystemForm.pipelineNodeLength + 1}`;
            }
            modelInfo.id = equipId;
            // modelInfo.name = equipId;
            modelInfo.equipNo = equipId;
        } else {
            modelInfo.id = 'point' + new Date().getTime();
        }
        if (singleTrigger) {
            $('#createMouseTip').remove();
            $(document.body).css('cursor',`default`);
            addLayoutBackoutArr('create', [equipId], []);
            initThingJsTip($.t('layout.tip.createEnd') + "!");
            app.off('click',null,'layoutPanelCreateModelClickWith');
            app.off('mousemove',null,'createMouseTipMousemove');
            app.resumeEvent('click',null,'quitLayoutLeavelLevel');
            app.resumeEvent('mousemove',null,'layoutMousemove');
            if (radioElement) {
                triggerElementEvent($(radioElement).attr('id'), 'click');
            }
            return;
        }
    },'layoutPanelCreateModelClickWith');
}

/**
 * @description 布局创建模型
 * @param {Object} modelInfo 模型信息
 * @return modelObj 模型对象
 * @authors myf 2023-10-31
 */
function layoutCreateModelObj (curModelInfo, selected=true, createConfig={}) {
    // if (curModelInfo.delayConfig.isDelay) { // 需要等待主模型创建完毕并更改父对象后再创建
    //     const modelGroupPipelineNodeLevelObject = app.query('#' + curModelInfo.levelObjectId)[0];
    //     const modelGroupPipelineNodeMainObject = app.query('#' + curModelInfo.delayConfig.newParentId)[0];
    //     const modelGroupPipelineNodeLocalPosition = modelGroupPipelineNodeMainObject.worldToSelf(modelGroupPipelineNodeLevelObject.selfToWorld([curModelInfo.posX - 0, curModelInfo.posY - 0, curModelInfo.posZ - 0]));
    //     curModelInfo.levelObjectId = modelGroupPipelineNodeMainObject.id;
    //     curModelInfo.localPosition = modelGroupPipelineNodeLocalPosition;
    //     Promise.all(curModelInfo.delayConfig.waitPromise).then(()=>{
    //         layoutCreateModelObj(curModelInfo);
    //     });
    //     return;
    // }
    let prefix = 'model';
    const noPrefix = ['pipeline', 'area', 'model-group', 'path', 'model-group-pipeline', 'facility', 'window'];
    if (noPrefix.includes(EquipLayoutConfig.code)) {
        prefix = '';
    }
    // 防止对象修改 myf 20240618
    const modelInfo = JSON.parse(JSON.stringify(curModelInfo));
    let modelObj = app.query('#'+prefix+modelInfo.id)[0];
    if (modelObj) {
        if (modelObj.setAttribute("userData/createdBy") && modelObj.setAttribute("userData/createdBy") !== curModelInfo.createdBy) {
            return;
        }
        modelObj.destroy();
    }
    const parentObj = modelInfo.levelObjectId ? app.query('#'+modelInfo.levelObjectId)[0] : CurSencceObj;
    modelObj = app.create({
        type: 'Thing',
        id: prefix+modelInfo.id,
        url: modelInfo.url,
        parent: parentObj, // 楼层或者当前层级对象（楼宇、院区）
        localPosition: modelInfo.localPosition,
        name: modelInfo.name,
        angles: modelInfo.rotation || [0,0,0],
        scale: modelInfo.scale || [1,1,1],
        pickable: true,
        complete:function(ev){
            const curModel = this;
            EquipLayoutConfig.setAttrArr.forEach(attr=>{
                if (modelInfo[attr] || modelInfo[attr] === 0) {
                    curModel.setAttribute("userData/" + attr, modelInfo[attr]);
                }
            });
            if (modelInfo.color || EquipLayoutConfig.modelColor) {
                setObjColor(curModel, modelInfo.color || EquipLayoutConfig.modelColor);
            }
            if (modelInfo.areaId) {
                curModel.setAttribute("userData/areaId", modelInfo.areaId);
                refreshAreaModelData(curModel);
            }
            if (EquipLayoutConfig.highlight) {
                curModel.style.highlight = EquipLayoutConfig.highlight;
                curModel.style.highlightIntensity = 1;
            }
            if (curModelInfo.createdBy) {
                curModel.setAttribute("userData/createdBy", curModelInfo.createdBy);
            }
            curModel.setAttribute("userData/modelFlag","layoutModel");
            
            if (curModelInfo.clickPanel === 'operaPanel') {
                curModel.on('click',function(ev){
                    createModelOperaPanel(curModel);
                }, 'layoutModelClick');
            } else {
                curModel.on('click',function(ev){
                    showModelPosition(curModel.id);
                }, 'layoutModelClick');
            }
            registerArrayByType(1,prefix+modelInfo.id,1);
            if (!createConfig.banDrag) {
                addThingDragEvent(curModel);
            }
            if (selected) {
                if (EquipLayoutConfig.antiShakeTimeout) {
                    clearTimeout(EquipLayoutConfig.antiShakeTimeout);
                    EquipLayoutConfig.antiShakeTimeout = null;
                }
                EquipLayoutConfig.antiShakeTimeout = setTimeout(()=>{
                    createModelOperaPanel(curModel);
                    clearTimeout(EquipLayoutConfig.antiShakeTimeout);
                    EquipLayoutConfig.antiShakeTimeout = null;
                },100);
            }
            if (EquipLayoutConfig.code === 'path') {
                refreshLayoutPath (parentObj.id);
            }
            if (EquipLayoutConfig.createCallbackFunc) {
                if (typeof EquipLayoutConfig.createCallbackFunc === 'string') {
                    const createCallbackFunc = eval(EquipLayoutConfig.createCallbackFunc);
                    if (createCallbackFunc && createCallbackFunc instanceof Function) {
                        createCallbackFunc(curModel);
                    }
                } else if (EquipLayoutConfig.createCallbackFunc instanceof Function) {
                    EquipLayoutConfig.createCallbackFunc(curModel);
                }
                
            }
        }
    });
    return modelObj;
}


/**
 * @description 创建节点接口选择顶牌
 * @param {Object} curModel 模型对象
 * @return 无
 * @authors myf 2023-12-05
 */
function createNodeInterfaceSelectTopcard (curModel) {
    if (!PipeLineSystemForm.showInterfaceSelect || !curModel.visible || !(curModel.id.includes('T-PIPE') || curModel.id.includes('T-WM'))) {
        return;
    }
    if (EquipLayoutConfig.code === 'pipeline' || EquipLayoutConfig.code === 'model-group-pipeline') {
        const nodeInterfaces = curModel.subNodes.filter(node=>{return node.name.includes('pipe-interface')});
        const linkedInterfaceArr = PipeLineSystemForm.linkedInterfaceObj[curModel.id] || [];
        nodeInterfaces.objects.some(nodeInterface=>{
            if (linkedInterfaceArr.includes(nodeInterface.name)) {
                return;
            }
            const localPosition = [...nodeInterface.localPosition];
            localPosition.forEach(item=>{
                item = item * 100;
            });
            let html = `<div id="nodeInterfaceSelect${curModel.id+nodeInterface.name}" style="width:2rem;height:2rem;background-image:url(${ImgUrl}icon/eq-dialog-success.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;"></div>`;
            const panelInfo = {panelPosition: localPosition,panelId:curModel.id+nodeInterface.name,panelPivot:[0.5,1],levelType:2,hasLine:true,closeable:false, panelZIndex: 2, panelClassName:`class='nodeInterfaceSelect'${this.id}`};
            createCommonTopCard(nodeInterface, html, panelInfo);
            $('#nodeInterfaceSelect'+curModel.id+nodeInterface.name).click(function(event){
                event.stopPropagation();
                $(`#TopCardPanel${curModel.id+nodeInterface.name}`).remove();
                app.query(`#TopCardPanel${curModel.id+nodeInterface.name}_Line`).destroyAll();
                createPipeLine(curModel,nodeInterface);
            });
        });
    }
}

/**
 * @description 创建模型操作面板
 * @param {Object} modelObj 模型对象
 * @return 无
 * @authors myf 2023-10-31
 */
function createModelOperaPanel (modelObj) {
    // $('#layoutPositionPanel').remove();
    $('[name=modelOperaPanel]').remove();
    let html = `<div style="height:3rem;border-radius:0.25rem;background:rgb(166 226 255 / 50%);">`;
    html += `<div style="height:1.5rem;box-sizing:border-box;border-bottom:1px solid #D7D7D7;padding:0 0.2rem;">`;
    console.log('---------',modelObj);
    let btnHtml = ``;
    if (EquipLayoutConfig.code === 'area') {
        const isArea = modelObj.getAttribute('userData/isArea');
        if (isArea) {
            btnHtml += `<span equipId="${modelObj.id}" title="${$.t('common.operation.delete')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}delete-icon.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="deleteAreaData('${modelObj.id}')"></span>`;
        }
        btnHtml += `<span equipId="${modelObj.id}" title="${$.t('common.operation.save')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}save-icon.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="saveSingleAreaModelData(this)"></span>`;
    } else if (EquipLayoutConfig.code === 'path') {
        const isLine = modelObj.getAttribute('userData/isLine');
        btnHtml += `<span equipId="${modelObj.id}" title="${$.t('common.operation.delete')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}delete-icon.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="deleteLayoutPath('${modelObj.id}', ${isLine})"></span>`;
        btnHtml += `<span equipId="${modelObj.id}" title="${$.t('common.operation.save')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}save-icon.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="saveLayoutPath('${modelObj.id}', ${isLine})"></span>`;
        if (!isLine) {
            btnHtml += `<span equipId="${modelObj.id}" title="${$.t('layout.selectPath')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-cube.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="selectMainModel('${modelObj.id}')"></span>`;
        }
    } else if (EquipLayoutConfig.code === 'facility' || EquipLayoutConfig.code === 'window') {
        btnHtml += `<span id="${modelObj.id}SaveButton" equipId="${modelObj.id}" title="${$.t('common.operation.save')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}save-icon.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="saveSingleLayoutModel('${modelObj.id}')"></span>`;
        btnHtml += `<span equipId="${modelObj.id}" title="${$.t('common.operation.delete')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}delete-icon.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="deleteSingleLayoutModel('${modelObj.id}')"></span>`;
    } else if (EquipLayoutConfig.code !== 'pipeline' && EquipLayoutConfig.code !== 'model-group-pipeline') {
        btnHtml += `<span equipId="${modelObj.id}" title="${$.t('common.operation.delete')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}delete-icon.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="layoutPanelSaveModelClickWithList(this, 'delete')"></span>`;
        if (EquipLayoutConfig.code !== 'base-equip') {
            btnHtml += `<span id="${modelObj.id}SaveButton" equipId="${modelObj.id}" title="${$.t('common.operation.save')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}save-icon.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="layoutPanelSaveModelClickWithList(this, 'save')"></span>`;
        }
    } else {
        const type = modelObj.getAttribute('userData/type');
        if (type === 'modelGroupModel') {
            btnHtml += `<span equipId="${modelObj.id}" title="${$.t('layout.bindEquip')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}eq-bodystru-btn-sign.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="bindModelGroupEquip(this, '${modelObj.id}')"></span>`;
        } else {
            btnHtml += `<span equipId="${modelObj.id}" title="${$.t('common.operation.delete')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}delete-icon.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="layoutPanelSaveModelClick(this, 'delete')"></span>`;
            btnHtml += `<span equipId="${modelObj.id}" title="${$.t('layout.enterType')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}eq-bodystru-btn-sign.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="createPipelineNodeInputTypeSelect(this)"></span>`;
            btnHtml += `<span equipId="${modelObj.id}" title="${$.t('layout.linkMark')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-mark_.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="pipelineOverFloorMark(this)"></span>`;
            if (modelObj.id.includes('WM') || modelObj.id.includes('EM')) {
                btnHtml += `<span equipId="${modelObj.id}" title="${$.t('layout.bindNode')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}bind-door-icon.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="bindPipelineNodeData(this)"></span>`;
                btnHtml += `<span equipId="${modelObj.id}" title="${$.t('layout.bindMeter')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}bind-door-icon.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="bindMeterData(this)"></span>`;
            }
            btnHtml += `<span equipId="${modelObj.id}" title="${$.t('common.operation.copy')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-copy.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="layoutCopyModel(this)"></span>`;
            btnHtml += `<span equipId="${modelObj.id}" title="${$.t('layout.selectAllPipe')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-same.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="layoutSelectSameModel(this)"></span>`;
        }
    }
    if (EquipLayoutConfig.code !== 'area' && EquipLayoutConfig.code !== 'path' && EquipLayoutConfig.code !== 'facility') {
        btnHtml += `<span equipId="${modelObj.id}" title="${$.t('layout.replaceModel')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-replace.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="layoutReplaceModel('${modelObj.id}')"></span>`;
    }
    if (CurSencceObj.type === 'Floor' && EquipLayoutConfig.code !== 'model-group' && EquipLayoutConfig.code !== 'path') {
        btnHtml += `<span equipId="${modelObj.id}" title="${$.t('layout.relyWall')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-corner.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="layoutRelyWall('${modelObj.id}')"></span>`;
    }
    if (EquipLayoutConfig.code === 'model-group') {
        if (EquipLayoutConfig.newModelGroup) {
            btnHtml += `<span equipId="${modelObj.id}" title="${$.t('layout.becomeMainModel')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-check.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="becomeMainModel('${modelObj.id}')"></span>`;
        } else {
            btnHtml += `<span equipId="${modelObj.id}" title="${$.t('layout.selectMainModel')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-cube.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="selectMainModel('${modelObj.id}')"></span>`;
        }
    }
    btnHtml += `<span equipId="${modelObj.id}" title="${$.t('layout.layoutInfo')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}modal-icon.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="showModelPosition('${modelObj.id}')"></span>`;
    if (modelObj.type === 'Floor') {
        btnHtml = `<span equipId="${modelObj.id}" title="${$.t('common.operation.hidden') + $.t('common.object.floor')}" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-building-setting.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="showLayoutFloor('${modelObj.id}')"></span>`;
    }
    html += btnHtml;
    html += `</div>`;
    html += `<div style="height:1.5rem;color:#D7D7D7;line-height:1.5rem;padding:0 0 0 0.2rem;">${$.t('layout.tip.clickToDrag')}`;
    html += `</div>`;
    html += `</div>`;
    const panelInfo = {panelPosition: [0,0,0],panelId:'',panelPivot:[0,0],levelType:2,hasLine:false,closeable:true,isDestroyParent:false, panelZIndex: 2, panelClassName:'name="modelOperaPanel"'};
    createCommonTopCard(modelObj, html, panelInfo);
    if (modelObj.type !== 'Floor' && modelObj.getAttribute('userData/createdBy') !== 'modelGroup') {
        createLayoutPositionPanel(modelObj);
    }
}

/**
 * @description 绑定节点数据
 * @param {object} button 按钮
 * @return 无
 * @authors myf 2024-03-14
 */
function bindPipelineNodeData (button) {
    event.stopPropagation();
    const equipId = $(button).attr('equipId');
    const curModel = app.query('#'+equipId)[0];
    
    let meterNodeList = [];
    if (equipId.includes('WM')) {
        meterNodeList = PipeLineSystemForm.pipelineNodeList.filter(item=>item.id.includes('WM') && !item.fittingModelId);
    } else if (equipId.includes('EM')) {
        meterNodeList = PipeLineSystemForm.pipelineNodeList.filter(item=>item.id.includes('EM') && !item.fittingModelId);
    }

    let html = `<div id="bindPipelineNode${curModel.id}Panel" style="position:absolute;top:1rem;left:5rem;width:26rem;height:11rem;padding:1rem;background:#102b53;color:#fff;" title="">`;
    html += `<div><span>${$.t('layout.curBindNode')}：</span><span>${curModel.name}</span></div>`;
    html += `<div style="height:1.5rem;"><span>${$.t('common.name')}：</span><input id="bindPipelineNode${curModel.id}Input" type="text" class="page-set-form-default-input" style="width:12rem;height:1rem;margin-top:0.25rem;" /></div>`;
    const listItemObj = {
        headViewFlag:'Y',
        headStyle:'',
        itemStyles:[
            {
                styles:'width:6rem;height:1.5rem;line-height:1.5rem;margin-right:0.5rem;text-align:center;font-size:0.6rem;font-weight:400;',
                listTitle: $.t('common.no'),
                key:'code',
                clickFun:'',
            },
            {
                styles:'width:9rem;height:1.5rem;line-height:1.5rem;margin-right:0.5rem;text-align:center;font-size:0.6rem;font-weight:400;',
                listTitle: $.t('common.name'),
                key:'name',
                clickFun:'',
            },
            {
                styles:'width:6rem;height:1.5rem;line-height:1.5rem;margin-right:0.5rem;text-align:center;font-size:0.6rem;font-weight:400;',
                listTitle: $.t('common.positoin'),
                key:'levelObjectId',
                clickFun:'',
            },
            {
                styles:'width:3rem;height:1.5rem;line-height:1.5rem;text-align:center;font-size:0.6rem;font-weight:400;',
                listTitle: $.t('layout.bindMeter'),
                key:'meterId',
                clickFun:'',
            },
        ],
        listStyle:'background-color: rgb(19 56 101);',
        widgetPanelID:'pipelineNodeList'+curModel.id+'panel',
        id:'pipelineNodeList'+curModel.id,
        widgetStyle:'height:9rem;overflow:unset;',
        evenStyleInfo:'background-color:rgba(33,126,214, 0.5);',
        oddStyleInfo:'background-color:rgba(25,46,83, 0.6);',
        clickFun:'bindPipelineNodeListClick',
        widgetCondition:[],
        widgetKey:'pipelineNodeList'+curModel.id+'widget',
        listDateNode:'',
    };
    const listHtml = style_table_base('',listItemObj);
    html += listHtml;
    html += `</div>`
    $(button).append(html);
    registerArrayByType(0,'bindPipelineNode'+curModel.id+'Panel',1);
    const panel = document.getElementById('bindPipelineNode'+curModel.id+'Panel');
    panel.addEventListener('wheel',function(event){event.stopPropagation();});
    panel.addEventListener('click',function(event){event.stopPropagation();panel.remove();});
    const input = document.getElementById('bindPipelineNode'+curModel.id+'Input');
    input.addEventListener('click',function(event){event.stopPropagation();});
    input.addEventListener('input',function(){
        const curMeterNodeList = meterNodeList.filter(meter=>meter.name.includes(input.value));
        style_table_base(curMeterNodeList,listItemObj);
    });
    style_table_base(meterNodeList,listItemObj);
}

/**
 * @description 绑定节点列表点击函数
 * @param {object} row 列表行
 * @return 无
 * @authors myf 2024-03-14
 */
function bindPipelineNodeListClick (row) {
    const itemdataStr = $(row).attr('itemdata');
    const itemdata = JSON.parse(itemdataStr);
    const equipId = $(row).parents().filter('[equipid*=T]').attr('equipId');
    const curModel = app.query('#'+equipId)[0];
    const foundPipelineNode = PipeLineSystemForm.pipelineNodeList.find(item=>{return item.id === equipId});
    if (foundPipelineNode) {
        PipeLineSystemForm.pipelineNodeList.splice(PipeLineSystemForm.pipelineNodeList.indexOf(foundPipelineNode),1);
    }
    curModel.id = itemdata.id;
    curModel.name = itemdata.name;
    curModel.setAttribute('userData/meterId',itemdata.meterId);
    curModel.setAttribute('userData/code',itemdata.code);
    $('#'+equipId+'TopCardPanel').remove();
    createModelOperaPanel(curModel);
    refreshPipelineNodeData(itemdata.id);
}
/**
 * @description 绑定仪表数据
 * @param {object} button 按钮
 * @return 无
 * @authors myf 2024-02-01
 */
function bindMeterData (button) {
    event.stopPropagation();
    const equipId = $(button).attr('equipId');
    const curModel = app.query('#'+equipId)[0];
    if (curModel) {
        let meterType = '';
        if (curModel.id.includes('WM')) {
            meterType = '1';
        } else if (curModel.id.includes('EM')) {
            meterType = '2';
        }
        const meterPara = `hospitalId=${BindSysUsers["Sys"]["HospitalID"]}&hospitalAreaId=${BindSysUsers["Sys"]["HospitalAreaID"]}&meterType=${meterType}`;
        const meterList = getDataByAjax(dtvpApiServ,"pipelineMeter/api","getPipelineMeters",meterPara,"","get","json","","",false);
        const meterId = curModel.getAttribute('userData/meterId');
        const curMeter = meterList.find(item=>item.id === meterId);
        let html = `<div id="bindMeter${curModel.id}Panel" style="position:absolute;top:1rem;left:5rem;width:23rem;height:11rem;padding:1rem;background:#102b53;color:#fff;" title="">`;
        html += `<div><span>${$.t('layout.curBindNode')}：</span><span>${curMeter ? curMeter.name : '无'}</span></div>`;
        html += `<div style="height:1.5rem;"><span>${$.t('common.name')}：</span><input id="bindMeter${curModel.id}Input" type="text" class="page-set-form-default-input" style="width:12rem;height:1rem;margin-top:0.25rem;" /></div>`;
        const listItemObj = {
            headViewFlag:'Y',
            headStyle:'',
            itemStyles:[
                {
                    styles:'width:6rem;height:1.5rem;line-height:1.5rem;text-align:center;font-size:0.6rem;font-weight:400;',
                    listTitle: $.t('common.no'),
                    key:'code',
                    clickFun:'',
                },
                {
                    styles:'width:9rem;height:1.5rem;line-height:1.5rem;margin-right:0.5rem;text-align:center;font-size:0.6rem;font-weight:400;',
                    listTitle: $.t('common.name'),
                    key:'name',
                    clickFun:'',
                },
                {
                    styles:'width:6rem;height:1.5rem;line-height:1.5rem;margin-right:0.5rem;text-align:center;font-size:0.6rem;font-weight:400;',
                    listTitle: $.t('common.description'),
                    key:'description',
                    clickFun:'',
                },
            ],
            listStyle:'background-color: rgb(19 56 101);',
            widgetPanelID:'meterList'+curModel.id+'panel',
            id:'meterList'+curModel.id,
            widgetStyle:'height:9rem;overflow:unset;',
            evenStyleInfo:'background-color:rgba(33,126,214, 0.5);',
            oddStyleInfo:'background-color:rgba(25,46,83, 0.6);',
            clickFun:'bindMeterListClick',
            widgetCondition:[],
            widgetKey:'meterList'+curModel.id+'widget',
            listDateNode:'',
        };
        const listHtml = style_table_base('',listItemObj);
        html += listHtml;
        html += `</div>`
        $(button).append(html);
        registerArrayByType(0,'bindMeter'+curModel.id+'Panel',1);
        const panel = document.getElementById('bindMeter'+curModel.id+'Panel');
        panel.addEventListener('wheel',function(event){event.stopPropagation();});
        panel.addEventListener('click',function(event){event.stopPropagation();panel.remove();});
        const input = document.getElementById('bindMeter'+curModel.id+'Input');
        input.addEventListener('click',function(event){event.stopPropagation();});
        input.addEventListener('input',function(){
            const curMeterList = meterList.filter(meter=>meter.name.includes(input.value));
            style_table_base(curMeterList,listItemObj);
        });
        style_table_base(meterList,listItemObj);
    }
}

/**
 * @description 绑定仪表列表点击函数
 * @param {object} row 列表行
 * @return 无
 * @authors myf 2024-02-01
 */
function bindMeterListClick (row) {
    const itemdataStr = $(row).attr('itemdata');
    const itemdata = JSON.parse(itemdataStr)
    const equipId = $(row).parents().filter('[equipid*=T]').attr('equipId');
    const isBind = itemdata.pipelineNodes && itemdata.pipelineNodes.length;
    const curModel = app.query('#'+equipId)[0];
    const curPipeNodePosition = curModel.localPosition.map(pos=>{
        return pos.toFixed(2);
    });
    const data = {
        "id": equipId,
        "hospitalId": BindSysUsers["Sys"]["HospitalID"],
        "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
        "pipelineSystemId": PipeLineSystemForm.id,
        "code": curModel.getAttribute('userData/code') || '',
        "name": curModel.name || '',
        "nodeType": 1, // 0:连接件 1：仪表 2：阀门
        "fittingModelId": curModel.getAttribute('userData/modelId') || '',
        "buildingObjectId": getSceneIdByTpye('Building'),
        "floorObjectId": getSceneIdByTpye('Floor'),
        "levelObjectId": CurSencceObj.id,
        "levelTypeId": CurSencceObj.level,
        "posX": curPipeNodePosition[0] + '',
        "posY": curPipeNodePosition[1] + '',
        "posZ": curPipeNodePosition[2] + '',
        "rotationX": curModel.angleX,
        "rotationY": curModel.angleY,
        "rotationZ": curModel.angleZ,
        "rotationAngle": JSON.stringify([curModel.angleX, curModel.angleY, curModel.angleZ]),
        "installationDate": "",
        "meterId": itemdata.id,
        "status": null,
        "remark": "",
    }
    if (isBind) {
        $.confirm({msgtype:'warn',title:$.t('common.tip'),content:itemdata.name + $.t('layout.tip.bindMeter'),confirmText:$.t('common.operation.continue'),cancelText:$.t('common.operation.cancel')}, ()=>{
            const resetData = {
                "id": itemdata.pipelineNodes[0].id,
                "meterId": '',
            };
            const resetResult = savePipelineNode(resetData);
            const result = savePipelineNode(data);
            if (result && resetResult) {
                curModel.setAttribute('userData/meterId',itemdata.id);
                $.toast({msgtype:'info',content:$.t('layout.tip.saveSuccess'),time:1000});
            } else {
                $.toast({msgtype:'info',content:$.t('layout.tip.saveFail'),time:1000});
            }
        },undefined);
    } else {
        const result = savePipelineNode(data);
        if (result) {
            curModel.setAttribute('userData/meterId',itemdata.id);
            $.toast({msgtype:'info',content:$.t('layout.tip.saveSuccess'),time:1000});
        } else {
            $.toast({msgtype:'info',content:$.t('layout.tip.saveFail'),time:1000});
        }
    }
}

/**
 * @description 保存管线节点
 * @param {object} data 管线节点数据
 * @return result 保存成功与否
 * @authors myf 2024-02-01
 */
function savePipelineNode (data) {
    const paraStr = JSON.stringify(data);
    const result = getDataByAjax(dtvpApiServ,"pipelineNode/api","savePipelineNode",paraStr,"","post","json","","application/json;charset=utf-8",false);
    return result;
}

/**
 * @description 创建管件节点入口类型选择面板
 * @param {object} button 按钮元素
 * @return 无
 * @authors myf 2024-02-01
 */
function createPipelineNodeInputTypeSelect (button) {
    event.stopPropagation();
    const equipId = $(button).attr('equipId');
    const types = [{name: $.t('layout.campusEnter'), value: 1},{name: $.t('layout.buildingEnter'), value: 2},{name: $.t('layout.floorEnter'), value: 3},{name: $.t('layout.noEnter'), value: ''}];
    const obj = {
        divId: '',
        checkboxId: 'inputTypeCheckbox',
        data: types,
        dataDesc: 'name',
        dataValue: 'value',
        isRadio: true,
        clickFun: 'savePipelineNodeInputType',
        levelType: 2,
        clickFunParam: equipId
    };
    const curModel = app.query('#'+equipId)[0];
    const curInputType = curModel.getAttribute('userData/inputType');
    const curType = types.find(item=>item.value === curInputType);
    let html = `<div id="inputTypeDiv" style="padding:0.5rem;position:absolute;background:#102b5366;">`;
    html += `<div style="color:#fff;"><span>${$.t('common.current')}：</span><span>${curType ? curType.name : $.t('layout.noEnter')}</span></div>`;
    html += createNormalCheckbox(obj);
    html += `</div>`;
    if ($('#inputTypeDiv')[0]) {
        $(button).html("");
    } else {
        $(button).html(html);
    }
}

/**
 * @description 保存管线节点入口类型
 * @param {object} button 按钮
 * @return 无
 * @authors myf 2023-12-13
 */
function savePipelineNodeInputType (button, text, value, equipId) {
    const itemvalue = $(button).attr('itemvalue');
    const itemtext = $(button).text();
    const data = {
        "inputType": itemvalue,
        "id": equipId,
    };
    const result = savePipelineNode(data);
    if (result) {
        $.toast({msgtype:'info',content: $.t('layout.tip.setTo') + `${itemtext}`,time:1000});
        const curModel = app.query('#'+equipId)[0];
        curModel.setAttribute('userData/inputType', data.inputType - 0);
    } else {
        $.toast({msgtype:'info',content:$.t('layout.tip.setFail'),time:1000});
    }
}
/**
 * @description 布局面板保存删除模型点击事件
 * @param {object} button 按钮
 * @param {string} mode 模式
 * @return 无
 * 
 * @authors myf 2023-12-06
 */
function layoutPanelSaveModelClick (button, mode) {
    event.stopPropagation();
    const equipId = $(button).attr('equipId');
    if (mode === 'delete') {
        $.confirm({msgtype:'warn',title:$.t('common.tip'),content:$.t('common.confirm.delete',{name: equipId}),confirmText:$.t('common.operation.delete'),cancelText:$.t('common.operation.cancel')}, ()=>{
            const curModel = app.query('#'+equipId)[0];
            if (curModel) {
                const savedFlag = curModel.getAttribute("userData/savedFlag");
                if (savedFlag) {
                    const para = {id:equipId};
                    const result = getDataByAjax(dtvpApiServ,"pipelineNode/api","deletePipelineNodeById",para,"","post","json","","application/x-www-form-urlencoded",false);
                    if (!result) {
                        $.toast({msgtype:'info',content:$.t('layout.tip.deleteFail'),time:1000});
                        return;
                    }
                }
                deletePipelineNodeModelAppend(curModel);
                curModel.destroy();
                const foundNode = PipeLineSystemForm.pipelineNodeList.find(item=>{return item.id === curModel.id});
                if (foundNode) {
                    PipeLineSystemForm.pipelineNodeList.splice(PipeLineSystemForm.pipelineNodeList.indexOf(foundNode),1);
                }
                const deletedNodeIds = new Set();
                const deletedLines = [];
                const deletedRouteLines = [];
                PipeLineSystemForm.pipelineVOList.forEach(line=>{
                    const foundInterface = line.pipelineNodeInterfaceList.find(item=>item.pipelineNodeId === equipId);
                    if (foundInterface) {
                        let routeLineId = '';
                        line.pipelineNodeInterfaceList.forEach(interface=>{
                            routeLineId += interface.id;
                            deletedNodeIds.add(interface.pipelineNodeId);
                        });
                        deletedRouteLines.push(routeLineId);
                        deletedLines.push(line);
                    }
                });
                deletedLines.forEach(line=>{
                    PipeLineSystemForm.pipelineVOList.splice(PipeLineSystemForm.pipelineVOList.indexOf(line),1);
                });
                deletedRouteLines.forEach(routeLine=>{
                    const curRouteline = app.query('#'+routeLine)[0];
                    if (curRouteline) {
                        curRouteline.destroy();
                    }
                });
                refreshPipelineLinkedInterfaceObj();
                deletedNodeIds.forEach(node=>{
                    const curNodeModel = app.query('#'+node)[0];
                    if (curNodeModel) {
                        deletePipelineNodeModelAppend(curNodeModel);
                        createNodeInterfaceSelectTopcard(curNodeModel);
                    }
                });
            }
            $.toast({msgtype:'info',content:$.t('layout.tip.deleteSuccess'),time:1000});
            return;
        },undefined);
    }
}
/**
 * @description 删除管线节点模型附属（选择接口顶牌以及连接线）
 * @param {object} model 模型
 * @return 无
 * @authors myf 2023-12-06
 */
function deletePipelineNodeModelAppend (model) {
    const nodeInterfaces = model.subNodes.filter(node=>{return node.name.includes('pipe-interface')});
    nodeInterfaces.objects.forEach(interface=>{
        $(`#TopCardPanel${model.id+interface.name}`).remove();
        app.query(`#TopCardPanel${model.id+interface.name}_Line`).destroyAll();
    });
}
/**
 * @description 展示当前模型布局参数面板
 * @param {string} modelId 模型id
 * @return 无
 * @authors myf 2023-11-10
 */
function showModelPosition (modelId, type) {
    event.stopPropagation();
    let modelObj = app.query('#'+modelId)[0];
    if (!modelObj) {
        modelObj = app.query('#model'+modelId)[0];
        modelId = 'model' + modelId;
    }
    show2DDiv('layoutPositionPanel');
    registerArrayByType(0,'layoutPositionPanel',1);
    if (modelObj) {
        
        if (EquipLayoutConfig.lastSelectModelIds && EquipLayoutConfig.lastSelectModelIds.length) {
            if (!EquipLayoutConfig.mulSelect) {
                EquipLayoutConfig.lastSelectModelIds.forEach(item=>{
                    const lastModelObj = app.query('#'+item)[0];
                    // setObjColor(lastModelObj, null);
                    setDefaultOutlineColor(lastModelObj, null);
                });
                EquipLayoutConfig.lastSelectModelIds = [];
            }
        }
        // setObjColor(modelObj, '#99FF00');
        setDefaultOutlineColor(modelObj, 'yellow');
        EquipLayoutConfig.lastSelectModelIds ? EquipLayoutConfig.lastSelectModelIds.push(modelId) : EquipLayoutConfig.lastSelectModelIds = [modelId];
        $('[name=modelOperaPanel]').remove();
        $('#pipelineOperaPanel').remove();
        if (type === 'pipeline') {
            createPipelineOperaPanel (modelObj);
        } else {
            createModelOperaPanel(modelObj);
        }
    }
}
/**
 * @description 门禁布局绑定门事件
 * @param {string} modelId 模型id
 * @param {string} doorId 门id
 * @return 无
 * @authors myf 2023-10-31
 */
function accessLayoutBindDoorClick (modelId, doorId) {
    const equipModel = app.query('#'+modelId)[0];
    if (!equipModel) {
        return;
    }
    // myf 20240322 同时保存布局
    const data = [{
        "doorId": doorId,
        "id": modelId.slice(5),
        "posX": equipModel.position[0].toFixed(2).toString(),
        "posY": equipModel.position[1].toFixed(2).toString(),
        "posZ": equipModel.position[2].toFixed(2).toString(),
    }];
    const paraStr = JSON.stringify(data);
    getDataByAjax(dtvpApiServ, "entranceGuard/api", "saveEntranceGuards", paraStr, "", "post", "json", "", "application/json;charset=utf-8", false);
    $.toast({msgtype: 'info', content: $.t('layout.tip.bindDoor') + doorId, time:1000});
    equipLayoutInfoListQuickSearch()
}

/**
 * @description 设备布局保存模型事件
 * @param {Object} button 按钮
 * @return 无
 * @authors myf 2023-10-26
 */
function layoutPanelSaveModelClickWithList (button, mode) {
    event.stopPropagation();
    const equipId = $(button).attr('equipId');
    if (mode === 'delete') {
        if (EquipLayoutConfig.code === 'model-group') {
            deleteModelGroup(equipId);
            return;
        }
        resetModelLayout(equipId.slice(5));
        $.toast({msgtype:'info',content:$.t('layout.tip.deletedLayout'),time:1000});
        return;
    }
    if (EquipLayoutConfig.code === 'model-group') {
        saveModelGroup();
        return;
    }
    const equipModel = app.query('#'+equipId)[0];
    if (!equipModel) {
        return;
    }
    const localPosition = equipModel.localPosition.map(pos=>{
        return pos.toFixed(2);
    });
    const floorObjectId = getSceneIdByTpye('Floor');
    const buildingObjectId = getSceneIdByTpye('Building');
    if (EquipLayoutConfig.code === 'access') {
        const data = [{
            "hospitalId": BindSysUsers["Sys"]["HospitalID"],
            "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
            "id": equipId.slice(5),
            "posX": localPosition[0].toString(),
            "posY": localPosition[1].toString(),
            "posZ": localPosition[2].toString(),
            "modelUrl": equipModel.url,
            "roomObjectId": equipModel.getAttribute("userData/roomId") || '',
            "floorObjectId": floorObjectId,
            "buildingObjectId": buildingObjectId
        }];
        const paraStr = JSON.stringify(data);
        getDataByAjax(dtvpApiServ,"entranceGuard/api","saveEntranceGuards",paraStr,"","post","json","","application/json;charset=utf-8",false);
    } else if (EquipLayoutConfig.code === 'equip' || EquipLayoutConfig.code === 'information-equip') {
        const data = [{
            "hospitalId": BindSysUsers["Sys"]["HospitalID"],
            "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
            "equipNo": equipModel.getAttribute("userData/equipNo"),
            "levelObjectId": CurSencceObj.id,
            "levelType": CurSencceObj.level,
            "name": equipModel.name || '',
            "modelType": 3,
            "modelUrl": equipModel.url + '/' || '',
            "objectId": equipModel.getAttribute("userData/equipNo"),
            "roomObjectId": equipModel.getAttribute("userData/roomId") || '',
            "posX": localPosition[0].toString(),
            "posY": localPosition[1].toString(),
            "posZ": localPosition[2].toString(),
            "rotateX": equipModel.angles[0].toString(),
            "rotateY": equipModel.angles[1].toString(),
            "rotateZ": equipModel.angles[2].toString(),
            "scaleX": (equipModel.scale[0] / EquipLayoutConfig.zoom).toFixed(2).toString(),
            "scaleY": (equipModel.scale[1] / EquipLayoutConfig.zoom).toFixed(2).toString(),
            "scaleZ": (equipModel.scale[2] / EquipLayoutConfig.zoom).toFixed(2).toString(),
        }];
        const paraStr = JSON.stringify(data);
        getDataByAjax(dtvpApiServ,"objectMap/api","saveObjectMapList",paraStr,"","post","json","","application/json;charset=utf-8",false);
        if (EquipLayoutConfig.name === $.t('common.item.airConditioner')) {
            const saveObj = data.map(item=>{
                return {
                    "eqNo": item.equipNo,
                    "no": buildingstr[getSceneIdByTpye('Building')].code + '-' + getSceneIdByTpye('Floor').split('F')[1] + 'F-' + "FTS"+item.name.split('_')[1],
                }
            });
            const saveObjStr = JSON.stringify(saveObj);
            getDataByAjax(dtvpApiServ,"airconditionerEquip/api","saveAirconditionerEquips",saveObjStr,"","post","json","","application/json;charset=utf-8",false);
        }
    } else if (EquipLayoutConfig.code === 'monitor') {
        const data = [{
            "hospitalId": BindSysUsers["Sys"]["HospitalID"],
            "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
            "id": equipId.slice(5),
            "levelObjectId": CurSencceObj.id,
            "levelType": CurSencceObj.level,
            "modelUrl": equipModel.url + '/' || '',
            "roomObjectId": equipModel.getAttribute("userData/roomId") || '',
            "posX": localPosition[0].toString(),
            "posY": localPosition[1].toString(),
            "posZ": localPosition[2].toString(),
            "angleX": equipModel.angles[0].toString(),
            "angleY": equipModel.angles[1].toString(),
            "angleZ": equipModel.angles[2].toString(),
        }];
        const paraStr = JSON.stringify(data);
        getDataByAjax(dtvpApiServ,"monitorAttach/api","saveMonitorAttachList",paraStr,"","post","json","","application/json;charset=utf-8",false);
    } else if (EquipLayoutConfig.code === 'meter') {
        const data = {
            "id": equipId.slice(5),
            "posX": localPosition[0] + '',
            "posY": localPosition[1] + '',
            "posZ": localPosition[2] + '',
            "rotationX": equipModel.angleX.toFixed(2) + '',
            "rotationY": equipModel.angleY.toFixed(2) + '',
            "rotationZ": equipModel.angleZ.toFixed(2) + '',
            "hospitalId": BindSysUsers["Sys"]["HospitalID"],
            "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
            "pipelineSystemId": EquipLayoutConfig.pipelineSystemId,
            "code": "",
            "name": "",
            "nodeType": 1, // 0:连接件 1：仪表 2：阀门
            "fittingModelId": equipModel.getAttribute('userData/modelId') || '',
            "buildingObjectId": getSceneIdByTpye('Building'),
            "floorObjectId": getSceneIdByTpye('Floor'),
            "levelObjectId": CurSencceObj.id,
            "levelTypeId": CurSencceObj.level,
            "meterId": equipModel.getAttribute("userData/meterId") || '',
            "roomObjectId": equipModel.room ? equipModel.room.id : '', // myf 20241105 仪表布局添加房间id
        }
        savePipelineNode(data);
    }
    // else if (EquipLayoutConfig.code === 'facility') { // myf 20250124 添加设施布局
    //     const equipModelRadioId = $('[id*=equipModelRadio][formtype=radio]').children().eq(0).attr('id');
    //     const facilityModelId = getPageData(equipModelRadioId, 'valuekey');
    //     const data = {
    //         "buildingUnitId": "",
    //         "id": equipId.slice(5),
    //         "levelObjectId": CurSencceObj.id,
    //         "levelType": CurSencceObj.level,
    //         "objectId": "",
    //         "posX": localPosition[0] + '',
    //         "posY": localPosition[1] + '',
    //         "posZ": localPosition[2] + '',
    //         "rotateX": equipModel.angleX.toFixed(2) + '',
    //         "rotateY": equipModel.angleY.toFixed(2) + '',
    //         "rotateZ": equipModel.angleZ.toFixed(2) + '',
    //         "scaleX": (equipModel.scale[0] / EquipLayoutConfig.zoom).toFixed(2).toString(),
    //         "scaleY": (equipModel.scale[1] / EquipLayoutConfig.zoom).toFixed(2).toString(),
    //         "scaleZ": (equipModel.scale[2] / EquipLayoutConfig.zoom).toFixed(2).toString(),
    //         "sourceId": equipId.slice(5),
    //         "sourceType": "4",
    //         "subSourceType": '',
    //         "facilityModelId": facilityModelId || '',
    //     }
    //     postInterfaceData(dtvpApiServ + "/objectFacilitiesPos/api/saveObjectFacilitiesPos", data, {contentType: "application/json;charset=utf-8", async: false});
    //     const facilityData = {
    //         "facilityModelId": facilityModelId || '',
    //         "facilityTypeSubCode": "",
    //         "hospitalId": BindSysUsers["Sys"]["HospitalID"],
    //         "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
    //         "id": equipId.slice(5)
    //     };
    //     postInterfaceData(dtvpApiServ + "/facFacility/api/saveFacFacility", facilityData, {contentType: "application/json;charset=utf-8", async: false});
    // }
    saveEquipPositionChange(equipModel);
    $.toast({msgtype:'info',content:$.t('layout.tip.savedLayout'),time:1000});
    equipLayoutInfoListQuickSearch();
}

/**
 * @description 重置模型布局
 * @param {String} equipId 设备id
 * @return 无
 * @authors myf 2023-10-31
 */
function resetModelLayout (equipId,equipNo) {
    const equipModel = app.query('#model'+equipId)[0];
    if (EquipLayoutConfig.code === 'access') {
        const data = [{
            "doorId": "",
            "hospitalId": BindSysUsers["Sys"]["HospitalID"],
            "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
            "id": equipId,
            "posX": '',
            "posY": '',
            "posZ": '',
            "modelUrl": '',
            "roomObjectId": '',
            "floorObjectId": '',
            "buildingObjectId": ''
        }];
        const paraStr = JSON.stringify(data);
        getDataByAjax(dtvpApiServ,"entranceGuard/api","saveEntranceGuards",paraStr,"","post","json","","application/json;charset=utf-8",false);
    } else if (EquipLayoutConfig.code === 'equip' || EquipLayoutConfig.code === 'information-equip') {
        const data = [{
            "hospitalId": BindSysUsers["Sys"]["HospitalID"],
            "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
            "equipNo": equipNo,
            "buildingUnitId": "",
            "levelObjectId": "",
            "modelId": "",
            "modelUrl": "",
            "objectId": "",
            "roomObjectId": "",
            "posX": '',
            "posY": '',
            "posZ": '',
            "rotateX": "",
            "rotateY": "",
            "rotateZ": "",
            "scaleX": "",
            "scaleY": "",
            "scaleZ": ""
        }];
        const paraStr = JSON.stringify(data);
        getDataByAjax(dtvpApiServ,"objectMap/api","saveObjectMapList",paraStr,"","post","json","","application/json;charset=utf-8",false);
        if (EquipLayoutConfig.name === $.t('common.item.airConditioner')) {
            const saveObj = data.map(item=>{
                return {
                    "eqNo": item.equipNo,
                    "no": '',
                }
            });
            const saveObjStr = JSON.stringify(saveObj);
            getDataByAjax(dtvpApiServ,"airconditionerEquip/api","saveAirconditionerEquips",saveObjStr,"","post","json","","application/json;charset=utf-8",false);
        }
    } else if (EquipLayoutConfig.code === 'monitor') {
        const data = [{
            "hospitalId": BindSysUsers["Sys"]["HospitalID"],
            "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
            "id": equipId,
            "levelObjectId": '',
            "levelType": '',
            "modelUrl": '',
            "roomObjectId": '',
            "posX": '',
            "posY": '',
            "posZ": '',
            "angleX": '',
            "angleY": '',
            "angleZ": '',
        }];
        const paraStr = JSON.stringify(data);
        getDataByAjax(dtvpApiServ,"monitorAttach/api","saveMonitorAttachList",paraStr,"","post","json","","application/json;charset=utf-8",false);
    } else if (EquipLayoutConfig.code === 'meter') {
        // const para = {id:equipId};
        // const result = getDataByAjax(dtvpApiServ,"pipelineNode/api","deletePipelineNodeById",para,"","post","json","","application/x-www-form-urlencoded",false);
        const data = {
            "id": equipId,
            "posX": '',
            "posY": '',
            "posZ": '',
            "rotationX": "",
            "rotationY": "",
            "rotationZ": "",
            "roomObjectId": '', // myf 20241105 仪表布局添加房间id
        };
        const result = savePipelineNode(data);

        if (!result) {
            $.toast({msgtype:'info',content:$.t('layout.tip.deleteFail'),time:1000});
            return;
        }
    } else if (EquipLayoutConfig.code === 'base-equip') {
        if (!equipId.includes('baseEquip')) {
            const result = getDataByAjax(dtvpApiServ,"modelLayout/api","deletedModelLayout",`id=${equipId}`,"","get","json","","",false);
            if (!result) {
                $.toast({msgtype:'info',content:$.t('layout.tip.deleteFail'),time:1000});
                return;
            }
        }
    } else if (EquipLayoutConfig.code === 'facility') { // myf 20250124 添加设施布局
        const data = {
            "buildingUnitId": "",
            "id": equipId,
            "levelObjectId": "",
            "levelType": "",
            "objectId": "",
            "posX": '',
            "posY": '',
            "posZ": '',
            "rotateX": '',
            "rotateY": '',
            "rotateZ": '',
            "scaleX": '',
            "scaleY": '',
            "scaleZ": '',
            "sourceId": equipId,
            "sourceType": "4",
            "subSourceType": "",
            "facilityModelId": '',
        }
        postInterfaceData(dtvpApiServ + "/objectFacilitiesPos/api/saveObjectFacilitiesPos", data, {contentType: "application/json;charset=utf-8", async: false});
    }
    
    if (equipModel) {
        $('#'+equipModel.id+'TopCardPanel').remove();
        equipModel.destroy();
    }
    hidden2DDiv('layoutPositionPanel');
    equipLayoutInfoListQuickSearch();
}

/**
 * @description 设备布局信息列表快速搜索
 * @return 无
 * @authors myf 2023-10-30
 */
function equipLayoutInfoListQuickSearch() {
    if (EquipLayoutConfig.code === 'base-equip') {
        loadBaseEquipModel();
        return;
    }
    // const res = pageInputArray.map((input)=>{
    //     return {id:input,desc: input ? $('#'+input).attr('valueDesc') || $('#'+input).val() : '',value: input ? $('#'+input).attr('valueKey') || $('#'+input).val() : ''};
    // });
    const param = {};
    const formname = 'layout';
    if (formname) {
        $(`[formname*=${formname}]`).each(function (index, formInput){
            const type = $(formInput).attr('formtype');
            const key = $(formInput).attr('formkey');
            let value;
            switch (type) {
                case 'text': value = $(formInput).find('input').eq(0).val();break;
                case 'select': value = $(formInput).find('input').eq(0).attr('valuekey');break;
                case 'checkbox': value = $(formInput).find('input').eq(0)[0].checked;break;
                case 'radio': {
                    // const valuekey = $(formInput).children().eq(0).attr('valuekey');
                    // value = valuekey ? JSON.parse(valuekey) + '' : '';
                    value = getPageData ($(formInput).children().eq(0).attr('id'), 'valuekey') + '';
                    break;
                }
                default: break;
            }
            if (key) {
                param[key] = value;
            }
        });
    }
    equipLayoutInfoListSearch(param);
}

/**
 * @description 设备布局信息列表搜索
 * @param {Object} datas 设备列表搜索
 * @return 无
 * @authors myf 2023-10-30
 */
function equipLayoutInfoListSearch (datas, dataSource) {
    
    const form = {
        hospitalId: BindSysUsers["Sys"]["HospitalID"],
        "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
        "time": new Date().getTime(),
    };
    // if (CurSencceObj.type === 'Building') {
    //     form.buildingObjectId = CurSencceObj.id;
    // } else if (CurSencceObj.type === 'Floor') {
    //     form.floorObjectId = CurSencceObj.id;
    // } else if (CurSencceObj.type === 'Room') {
    //     form.roomObjectId = CurSencceObj.id;
    // }
    
    if (EquipLayoutConfig.code === 'path') {
        form.startLevelObjectId = CurSencceObj.id;
        form.endLevelObjectId = CurSencceObj.id;
        form.plan = 1;
    }
    form.modelType = EquipLayoutConfig.modelType;
    if (datas) {
        Object.keys(datas).forEach(key=>{
            form[key] = datas[key] || '';
        });
    }
    const noDefaultFloorType = ['facility']; // myf 20250206 不需要默认层级的布局（查询全部）
    if (!noDefaultFloorType.includes(EquipLayoutConfig.code)) {
        if (CurSencceObj.type === 'Building') {
            form.buildingObjectId = form.buildingObjectId || CurSencceObj.id;
        } else if (CurSencceObj.type === 'Floor') {
            form.floorObjectId = form.floorObjectId || CurSencceObj.id;
        } else if (CurSencceObj.type === 'Room') {
            form.roomObjectId = form.roomObjectId || CurSencceObj.id;
        }
        form.levelObjectId = CurSencceObj.id;
    }
    if (form.layout) {form.layout = form.layout[0];}
    if (form.isLayout) {form.isLayout = form.isLayout[0];}
    if (form.isLayoutFlag) {form.isLayoutFlag = form.isLayoutFlag[0];}
    if (form.layoutFlag) {form.layoutFlag = form.layoutFlag[0];}
    if ([form.layout, form.isLayout, form.isLayoutFlag, form.layoutFlag].includes('0')) {
        form.buildingObjectId = '';
        form.floorObjectId = '';
        form.roomObjectId = '';
        form.levelObjectId = '';
    }
    console.log('设备布局信息列表搜索', datas, form);
    // datas.some(item=>{
    //     if (!item.value || item.value === '[]') {
    //         if (item.id.includes("otherFloorInput")) {
    //             form.levelObjectId = '';
    //             form.floorObjectId = '';
    //         }
    //         return;
    //     }
    //     if (item.id.includes("accessNameInput")) {
    //         item.value = item.value || EquipLayoutConfig.equipName;
    //         if (EquipLayoutConfig.code === 'equip') {
    //             form.equipName = item.value;
    //             form.name = item.value;
    //         } else if (EquipLayoutConfig.code === 'monitor') {
    //             form.posDesc = item.value;
    //         } else {
    //             form.name = item.value;
    //         }
    //     } else if (item.id.includes("isLayoutRadio")) {
    //         let isLayoutData = JSON.parse(item.value);
    //         form.layout = isLayoutData[0];
    //         form.isLayout = isLayoutData[0];
    //         form.isLayoutFlag = isLayoutData[0];
    //     } else if (item.id.includes("bindDoorRadio")) {
    //         let isDoorData = JSON.parse(item.value);
    //         form.door = isDoorData[0];
    //     } else if (item.id.includes("equipNoInput")) {
    //         if (EquipLayoutConfig.code === 'access') {
    //             form.guardObjectId = item.value;
    //         } else if (EquipLayoutConfig.code === 'monitor') {
    //             form.monitorNo = item.value;
    //         } else if (EquipLayoutConfig.code === 'meter') {
    //             form.code = item.value;
    //         } else {
    //             form.equipNo = item.value;
    //             form.no = item.value;
    //         }
    //     } else if (item.id.includes("otherFloorInput")) {
    //         form.levelObjectId = item.value;
    //         form.buildingObjectId = '';
    //         form.floorObjectId = item.value;
    //         form.roomObjectId = '';
    //     } else if (item.id.includes("sysExidInput")) {
    //         if (EquipLayoutConfig.code === 'meter') {
    //             form.sysEquipId = item.value;
    //         }
    //         form.sysExid = item.value;
    //     } else if (item.id.includes("planPathTypeSelecte")) {
    //         form.planPathType = item.value;
    //     }
    // });

    const sourceId = $('#equipLayoutList'+EquipLayoutConfig.code).attr('sourceId');
    if (EquipLayoutConfig.getDataSourceId) {
        dataSource = EquipLayoutConfig.getDataSourceId;
    }
    addLoadingMaskPanel($('#equipLayoutList'+EquipLayoutConfig.code).parent().parent().attr('id'));
    setTimeout(()=>{
        getInterfaceinfo("",dataSource || sourceId,"","",form,equipLayoutInfoListStyle,"");
    }, 100);
}

/**
 * @description 设备布局模型搜索
 * @param {Object} input 输入框
 * @return 无
 * @authors myf 2023-10-31
 */
function equipLayoutModelSearch (input) {
    const inputId = $(input).attr('id');
    const inputIdArr = inputId.split('_');
    const radioId = inputIdArr[0];
    const filterKey = inputIdArr[1];
    const filterType = inputIdArr[2];
    const radioCheckboxId = $(`[id*=${radioId}]`).filter(`[id*=Checkbox]`).attr('id');

    // const hasSelectedArrStr = $(`[id*=${radioId}]`).filter(`[id*=Checkbox]`).attr('hasSelectedArr');
    // const hasSelectedArr = hasSelectedArrStr ? JSON.parse(hasSelectedArrStr) : [];
    const hasSelectedArr = getPageData(radioCheckboxId, 'hasSelectedArr') || [];
    if (!hasSelectedArr.includes(filterKey)) {
        hasSelectedArr.push({key:filterKey,type:filterType});
    }
    addPageData(radioCheckboxId, 'hasSelectedArr', hasSelectedArr);
    // $(`[id*=${radioId}]`).filter(`[id*=Checkbox]`).attr('hasSelectedArr', JSON.stringify(hasSelectedArr).replace(new RegExp(/( )/g),""));
    
    // const radioDataStr = $(`[id*=${radioId}]`).filter(`[id*=Checkbox]`).attr('itemdata');
    // const radioData = JSON.parse(radioDataStr);
    const radioData = getPageData(radioCheckboxId, 'itemdata'); // myf 20250102 html挂载数据改造
    let curRadioData = [...radioData];
    hasSelectedArr.forEach(filterObj=>{
        if (filterObj.type === 'input') {
            const curValue = $(`input[id*=${radioId}_${filterObj.key}_]`).val();
            curRadioData = curRadioData.filter(item=>item[filterObj.key].includes(curValue) || !curValue);
        } else if (filterObj.type === 'select') {
            const curValue = $(`input[id*=${radioId}_${filterObj.key}_]`).attr('valuekey');
            curRadioData = curRadioData.filter(item=>item[filterObj.key] === curValue || !curValue);
        }
    });
    const modelIds = curRadioData.map(item=>item.id);
    $(`div[id*=${radioId}]`).each(function(index, item){
        const itemvalue = $(item).attr('itemvalue');
        if (!itemvalue && itemvalue !== 0 && itemvalue !== false) {
            return;
        }
        if (modelIds.includes(itemvalue)) {
            $(item).css('display','flex');
        } else {
            $(item).css('display','none');
        }
    });
    let display = 'none';
    if (!curRadioData.length) {
        display = 'block';
    }
    $(`[name*=checkboxGroupName${radioId}]`).each(function(index, item){
        $(item).css('display',display);
    });
}

/**
 * @description 设备模型数据源函数（给设备分组）
 * @param {Object} data 数据
 * @return data 分组后得数据
 * @authors myf 2023-10-31
 */
function equipModelDataSource (data, widgetObj) {
    const modelTypeData = getInterfaceinfo("","","EMS_GetStateType","",{"code":"09"},"","","","","");
    const modelTypeObj = {};
    modelTypeData.forEach(item=>{
        modelTypeObj[item.value] = item.label;
    });
    data.forEach(item=>{
        item.gourpName = modelTypeObj[item.modelType];
    });
    return layoutModelCheckboxImgData(data, widgetObj);
}

/**
 * @authors myf
 * @date    2023-11-09
 * @params modelObj 模型对象
 * @description 创建布局位置面板
 * @return 无
 */
function createLayoutPositionPanel (modelObj, type) {
    if (!modelObj || modelObj.isSelector) {
        return;
    }
    if (EquipLayoutConfig.mulSelect) {
        if ($('#layoutPositionPanel')[0]) {
            $('#layoutPositionPanel').css('visibility','visible');
        }
        refreshLayoutPosition (modelObj);
        const modelIds = $('#layoutPositionPanel').attr('modelIds');
        if (modelIds) {
            const modelIdArr = modelIds.split('^');
            if (modelIdArr.includes(modelObj.id)) {
                modelIdArr.splice(modelIdArr.indexOf(modelObj.id), 1);
                // setObjColor(modelObj, null);
                setDefaultOutlineColor(modelObj, null);
            } else {
                modelIdArr.push(modelObj.id);
            }
            $('#layoutPositionPanel').attr('modelIds', modelIdArr.join('^'));
            $('#layoutPositionPanelName').text($.t('layout.tip.totalNumber', {number: modelIdArr.length}) +'\n');
            modelIdArr.forEach(modelId=>{
                const curModel = app.query('#' + modelId)[0];
                if (curModel) {
                    $('#layoutPositionPanelName').text($('#layoutPositionPanelName').text() + curModel.name + '\n');
                }
            });
        } else {
            $('#layoutPositionPanel').attr('modelIds', modelObj.id);
            $('#layoutPositionPanelName').text(modelObj.name);
        }
        return;
    }
    let isArea = modelObj.getAttribute('userData/isArea');
    let isLine = modelObj.getAttribute('userData/isLine');
    let isMainModelGroup = modelObj.getAttribute('userData/isMain');
    if ($('#layoutPositionPanelMain')[0]) {
        $('#layoutPositionPanelMain').html('');
    }
    let html = `<div id="layoutPositionPanel" modelIds="" style="position:absolute;width:24rem;right:1rem;top:3rem;background-color:rgba(15, 39, 72, 1);border-radius:0.25rem;padding:0.5rem 0.5rem 0.5rem 0;font-size:0.7rem;">`;
    html += `<div style="position:absolute;right:0.5rem;font-size:0.7rem;color:#fff;cursor:pointer;" onclick="hidden2DDiv('layoutPositionPanel')">X</div>`;

    html += `<div id="layoutPositionPanelMain">`;
    let minHtml = ``;

    minHtml += `<div style="height:1rem;display:flex;margin-bottom: 0.5rem;">`;
    minHtml += `<div style="width:0.25rem;height:0.5rem;margin:0.25rem 0.25rem 0.25rem 0;background-color:rgba(135, 173, 217, 1)"></div>`;
    minHtml += `<div style="height:1rem;line-height:1rem;color:#fff;">${$.t('layout.paramSet')}</div>`;
    minHtml += `</div>`;
    if (isArea) {
        minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;"><div class="eq-form-item-label" style="width: 25%;">${$.t('layout.room')}：</div><div id="layoutPositionAreaRoomName" class="eq-form-item-label eq-hidden-scroll" style="width: 75%;text-align:left;white-space: pre-wrap; max-height:5rem;">${modelObj.getAttribute('userData/roomName') || modelObj.getAttribute('userData/roomId') || ''}</div></div>`;
        minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;"><div class="eq-form-item-label" style="width: 25%;">${$.t('layout.areaObjectId')}：</div><div id="layoutPositionAreaObjectId" class="eq-form-item-label eq-hidden-scroll" style="width: 75%;text-align:left;white-space: pre-wrap; max-height:5rem;">${modelObj.getAttribute('userData/objectId') || ''}</div></div>`;

        minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;align-items: center;"><div class="eq-form-item-label" style="width: calc(25% - 0.5rem);margin-right: 0.5rem;">${$.t('space.buildUnitPanel.areaId') + $.t('common.description')}</div>`;
        minHtml += `<input id="layoutPositionAreaDescInput" class="page-set-form-default-input" style="width: 75%;text-align:left;" value="${modelObj.getAttribute('userData/description') || ''}" oninput="areaInfoChange(this, '${modelObj.id}', 'description')" /></div>`;

        minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;align-items: center;"><div class="eq-form-item-label" style="width: calc(25% - 0.5rem);margin-right: 0.5rem;">${$.t('space.buildUnitPanel.areaId') + $.t('common.position')}</div>`;
        minHtml += `<input id="layoutPositionAreaLocationInput" class="page-set-form-default-input" style="width: 75%;text-align:left;" value="${modelObj.getAttribute('userData/place') || ''}" oninput="areaInfoChange(this, '${modelObj.id}', 'place')" /></div>`;

        minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;align-items: center;"><div class="eq-form-item-label" style="width: calc(25% - 0.5rem);margin-right: 0.5rem;">${$.t('space.buildUnitPanel.areaId') + $.t('layout.placeCode')}</div>`;
        minHtml += `<div style="width: 75%;">`;
        const placeTypeDatas = getDataByAjax(dtvpApiServ, "placeType/api", "getPlaceType", "", "", "get", "json", "", "", false);
        const placeTypeConfig = {
            parentElementId: '',
            selectId: 'placeTypeSelect',
            optionData: placeTypeDatas,
            optionText: 'description',
            optionValue: 'code',
            isMultiple: false,
            selectStyle: '',
            clickCallFun: 'areaInfoChange',
            defaultFlag: '',
            placeholder: $.t('layout.pleaseSelect'),
            optionStyle: '',
            optionListStyle: '',
            levelType: '',
            clickCallFunParam: {id: modelObj.id, valueType: 'placeType'},
            defaultValue: modelObj.getAttribute('userData/placeType') || '',
        }
        minHtml += createNormalOptions(placeTypeConfig);
        minHtml += `</div></div>`;
        // 临时添加
        minHtml += `<div style="display:flex;margin-bottom: 0.5rem;align-items: center;">`;
        minHtml += `<div class="eq-form-item-label" style="width: 25%;"><span>${$.t('layout.rotationAngle')}</span></div>`;
        minHtml += `<div class="input-prefix-positionX ${EquipLayoutConfig['rotationXLock'] ? 'icon-lock' : 'icon-unlock'}" style="width: 25%;position: relative;margin-right: 0.5rem;" onclick="layoutPositionLockClick(event,'rotationX')"><input id="layoutPositionPanel-rotationX" class="page-set-form-default-input" style="padding-left: 1rem;" value="${modelObj.angles[0]}" /></div>`;
        minHtml += `<span title=${$.t('common.operation.click') + $.t('common.operation.modify')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem;background-image:url(${ImgUrl}icon-check.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="changeLayoutPosition('${modelObj.id}','rotationX')"></span>`;
        
        minHtml += `<div class="input-prefix-positionY ${EquipLayoutConfig['rotationYLock'] ? 'icon-lock' : 'icon-unlock'}" style="width: 25%;position: relative;margin-right: 0.5rem;" onclick="layoutPositionLockClick(event,'rotationY')"><input id="layoutPositionPanel-rotationY" class="page-set-form-default-input" style="padding-left: 1rem;" value="${modelObj.angles[1]}" /></div>`;
        minHtml += `<span title=${$.t('common.operation.click') + $.t('common.operation.modify')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem;background-image:url(${ImgUrl}icon-check.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="changeLayoutPosition('${modelObj.id}','rotationY')"></span>`;
    
        minHtml += `<div class="input-prefix-positionZ ${EquipLayoutConfig['rotationZLock'] ? 'icon-lock' : 'icon-unlock'}" style="width: 25%;position: relative;" onclick="layoutPositionLockClick(event,'rotationZ')"><input id="layoutPositionPanel-rotationZ" class="page-set-form-default-input" style="padding-left: 1rem;" value="${modelObj.angles[2]}" /></div>`;
        minHtml += `<span title=${$.t('common.operation.click') + $.t('common.operation.modify')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem;background-image:url(${ImgUrl}icon-check.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="changeLayoutPosition('${modelObj.id}','rotationZ')"></span>`;
        minHtml += `</div>`;
        // 
    } else {
        if (EquipLayoutConfig.code === 'path') {
            if (isLine) {
                isMainModelGroup = true;
                minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;align-items: center;"><div class="eq-form-item-label" style="width: calc(25% - 0.5rem);margin-right: 0.5rem;">${$.t('space.path.path') + $.t('common.name')}</div>`;
                minHtml += `<input id="layoutPositionModelGroupNameInput" class="page-set-form-default-input" style="width: 75%;text-align:left;" value="${modelObj.name || ''}" onblur="changeLayoutPosition('${modelObj.id}', 'name')" /></div>`;

                minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;align-items: center;"><div class="eq-form-item-label" style="width: calc(25% - 0.5rem);margin-right: 0.5rem;">${$.t('space.path.path') + $.t('common.type')}</div>`;
                // minHtml += `<input id="layoutPositionModelGroupNameInput" class="page-set-form-default-input" style="width: 75%;text-align:left;" value="${modelObj.name || ''}" onblur="changeLayoutPosition('${modelObj.id}', 'name')" /></div>`;
                minHtml += `<div style="width: 75%;">`;
                const planTypes = getInterfaceData (dtvpApiServ + "/stateTypeDefine/api/getListByCode", {code: 'plan_path_type'}, {async: false});
                const planTypesConfig = {
                    parentElementId: '',
                    selectId: 'planTypesSelect',
                    optionData: planTypes,
                    optionText: 'label',
                    optionValue: 'value',
                    isMultiple: false,
                    selectStyle: '',
                    clickCallFun: '',
                    defaultFlag: '',
                    placeholder: $.t('layout.pleaseSelect'),
                    optionStyle: '',
                    optionListStyle: '',
                    levelType: '',
                    clickCallFunParam: {id: modelObj.id, valueType: 'planPathType'},
                    defaultValue: modelObj.getAttribute('userData/planPathType') || '',
                }
                minHtml += createNormalOptions(planTypesConfig);
                minHtml += `</div></div>`;


                const pathLayoutLastMenu = $('#layoutPositionPanel').attr('pathLayoutLastMenu');
                minHtml += `<div style="width: 85%;display:flex;margin-bottom: 0.5rem;align-items: center;">`;
                minHtml += `<div class="path-layout-toolbar-checkbox ${pathLayoutLastMenu === 'pathPoint' && 'path-layout-toolbar-checkbox-checked'}" style="margin-left: 15%;" onclick="pathLayoutShowBtn(this, 'pathPoint')">${$.t('space.path.path') + $.t('space.path.point')}</div>`;
                minHtml += `<div class="path-layout-toolbar-checkbox ${pathLayoutLastMenu === 'infoPoint' && 'path-layout-toolbar-checkbox-checked'}" onclick="pathLayoutShowBtn(this, 'infoPoint')">${$.t('space.path.infoPoint')}</div>`;
                minHtml += `</div>`;

                minHtml += `<div style="width: 90%;margin-left: 10%;">`;
                // 路径点
                minHtml += `<div id="pathLayoutPathPointPanel" style="display:${pathLayoutLastMenu === 'pathPoint' ? 'block' : 'none'};">`;
                minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;align-items: center;"><div class="eq-form-item-label" style="width: calc(25% - 0.5rem);margin-right: 0.5rem;">${$.t('common.operation.add') + $.t('space.path.path') + $.t('space.path.point')}</div>`
                minHtml += `<div style="width: 75%;">`;
                minHtml += `<div equipId="${modelObj.id}" title="${$.t('common.operation.add') + $.t('space.path.path') + $.t('space.path.point')}" style="display:inline-block;width:1rem;height:1rem;background-image:url(${ImgUrl}icon-plus.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="addPointToLayoutPath('${modelObj.id}')"></div>`;
                minHtml += `</div></div>`;

                // minHtml += `<div equipId="${modelObj.id}" title="${$.t('space.path.tip.collectInfoPointAroundPath')}" style="display:inline-block;width:1rem;height:1rem;background-image:url(${ImgUrl}icon-point-to-line.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="collectInfoPointAroundPath('${modelObj.id}')"></div>`;
                minHtml += `<div style="max-height: 8rem;" class="eq-hidden-scroll">`;
                modelObj.children.forEach((child, index)=>{
                    minHtml += `<div style="display:inline-block;width: calc(100% - 3rem);background-color:#5385f2;height:2rem;line-height:2rem;margin:0.5rem;border-radius:0.5rem;color:#fff;cursor:pointer;" onclick="showModelPosition('${child.id}');">`;
                    minHtml += `<span style="margin:0 0.5rem;">${index + 1}</span><span>${child.name}</span>`;
                    minHtml += `</div>`;
                    minHtml += `<div equipId="${child.id}" title="${$.t('common.operation.delete')}" style="display:inline-block;width:1rem;height:1rem;margin:0 0.5rem;background-image:url(${ImgUrl}delete-icon.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="deleteLayoutPathPoint('${child.id}')"></div>`;
                });
                minHtml += `</div>`;
                minHtml += `</div>`;
                // 信息点
                minHtml += `<div id="pathLayoutInfoPointPanel" style="display:${pathLayoutLastMenu === 'infoPoint' ? 'block' : 'none'};padding: 0.5rem;border: 1px solid #4183c2;background: rgb(21 50 89);">`;

                // minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;align-items: center;">`;
                // minHtml += `<div class="eq-form-item-label path-layout-toolbar-checkbox" style="margin-right: 0.5rem;cursor:pointer;" onclick="showInfoPoints(this, 'showPoint')">${$.t('space.path.havedInfoPoint')}</div>`;
                // minHtml += `<div class="eq-form-item-label path-layout-toolbar-checkbox" style="margin-right: 0.5rem;cursor:pointer;" onclick="showInfoPoints(this, 'showNoAccessPoint')">${$.t('space.path.noAccessInfoPoint')}</div></div>`;

                minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;align-items: center;"><div class="eq-form-item-label" style="margin-right: 0.5rem;">${$.t('space.path.pickRange')}</div>`
                minHtml += `<div>`;
                // minHtml += `<div equipId="${modelObj.id}" title="${$.t('common.operation.add') + $.t('space.path.path') + $.t('space.path.point')}" style="display:inline-block;width:1rem;height:1rem;background-image:url(${ImgUrl}icon-plus.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="addPointToLayoutPath('${modelObj.id}')"></div>`;
                const rangeData = [{name: 1,value: 1,},{name: 1.5,value: 1.5,},{name: 2,value: 2,},{name: 2.5,value: 2.5,},{name: 3,value: 3,},{name: 4,value: 4,},{name: 5,value: 5,}];
                const rangeDataCampus = [{name: 2,value: 2,},{name: 3,value: 3,},{name: 5,value: 5,},{name: 7,value: 7,},{name: 10,value: 10,}];
                const rangeDataConfig = {
                    parentElementId: '',
                    selectId: 'rangeDataSelect',
                    optionData: CurSencceObj.type === 'Campus' ? rangeDataCampus : rangeData,
                    optionText: 'name',
                    optionValue: 'value',
                    isMultiple: false,
                    selectStyle: '',
                    clickCallFun: '',
                    defaultFlag: '',
                    placeholder: $.t('layout.pleaseSelect'),
                    optionStyle: '',
                    optionListStyle: '',
                    levelType: '',
                    clickCallFunParam: '',
                    defaultValue: '',
                }
                minHtml += createNormalOptions(rangeDataConfig);
                minHtml += `</div></div>`;
                
                minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;align-items: center;"><div class="eq-form-item-label" style="margin-right: 0.5rem;">${$.t('space.path.tip.collectInfoPointAroundPath')}</div>`;
                minHtml += `<div equipId="${modelObj.id}" title="${$.t('space.path.tip.collectInfoPointAroundPath')}" style="display:inline-block;width:1rem;height:1rem;background-image:url(${ImgUrl}icon-point-to-line.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="collectInfoPointAroundPath('${modelObj.id}')"></div>`;
                minHtml += `</div>`;

                minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;align-items: center;"><div class="eq-form-item-label" style="margin-right: 0.5rem;">${$.t('space.path.infoPoint')}</div>`;
                minHtml += `<div equipId="${modelObj.id}" title="${$.t('space.path.infoPoint')}" style="display:inline-block;width:1rem;height:1rem;background-image:url(${ImgUrl}save-icon.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="savePathLayoutInfoPoints('${modelObj.id}')"></div>`;
                minHtml += `</div>`;

                minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;align-items: center;"><div class="eq-form-item-label" style="margin-right: 0.5rem;">${$.t('space.path.tip.initPathBetweenBuilding')}</div>`;
                minHtml += `<div title="${$.t('space.path.tip.initPathBetweenBuilding')}" style="display:inline-block;width:1rem;height:1rem;background-image:url(${ImgUrl}save-icon.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;" onclick="initPathBetweenBuildings()"></div>`;
                minHtml += `</div>`;

                minHtml += `</div>`;

                minHtml += `</div>`;
            } else {
                const lineObj = modelObj.parent;
                // minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;align-items: center;"><div class="eq-form-item-label" style="width: calc(25% - 0.5rem);margin-right: 0.5rem;">${$.t('space.path.path') + $.t('common.name')}</div>`;
                // minHtml += `<input id="layoutPositionModelGroupNameInput" class="page-set-form-default-input" style="width: 75%;text-align:left;" value="${lineObj.name || ''}" onblur="changeLayoutPosition('${lineObj.id}', 'name')" /></div>`;
                minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;"><div class="eq-form-item-label" style="width: 25%;">${$.t('space.path.path') + $.t('common.name')}：</div>`;
                minHtml += `<div id="layoutPositionLineName" class="eq-form-item-label eq-hidden-scroll" style="width: 75%;text-align:left;" onclick="selectMainModel('${modelObj.id}')">${lineObj.name || ''}`;
                minHtml += `<span title="${$.t('layout.selectPath')}" style="display:inline-block;width:1rem;height:1rem;margin:0 0 0 0.25rem;padding:0;background-image:url(${ImgUrl}icon-cube.png);background-size:100% 100%;background-repeat: no-repeat;cursor:pointer;"></span>`;
                minHtml += `</div></div>`;

                minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;align-items: center;"><div class="eq-form-item-label" style="width: calc(25% - 0.5rem);margin-right: 0.5rem;">${$.t('space.path.markPoint') + $.t('common.name')}</div>`;
                minHtml += `<input id="layoutPositionModelGroupNameInput" class="page-set-form-default-input" style="width: 75%;text-align:left;" value="${modelObj.name || ''}" onblur="changeLayoutPosition('${modelObj.id}', 'name')" /></div>`;
            }
            
        } else if (EquipLayoutConfig.code === 'model-group') {
            minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;align-items: center;"><div class="eq-form-item-label" style="width: calc(25% - 0.5rem);margin-right: 0.5rem;">${$.t('layout.modelGroup') + $.t('common.name')}</div>`;
            minHtml += `<input id="layoutPositionModelGroupNameInput" class="page-set-form-default-input" style="width: 75%;text-align:left;" value="${modelObj.name || ''}" onblur="changeLayoutPosition('${modelObj.id}', 'name')" /></div>`;

            minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;align-items: center;"><div class="eq-form-item-label" style="width: calc(25% - 0.5rem);margin-right: 0.5rem;">${$.t('layout.modelGroup') + $.t('common.code')}</div>`;
            minHtml += `<input id="layoutPositionModelGroupCodeInput" class="page-set-form-default-input" style="width: 75%;text-align:left;" value="${modelObj.getAttribute('userData/code') || ''}" onblur="changeLayoutPosition('${modelObj.id}', 'code')" /></div>`;
            minHtml += `<div style="width: 100%;display:none;margin-bottom: 0.5rem;"><div class="eq-form-item-label" style="width: 25%;">${$.t('layout.curInfo')}：</div><div id="layoutPositionPanelName" class="eq-form-item-label eq-hidden-scroll" style="width: 75%;text-align:left;white-space: pre-wrap; max-height:5rem;">${modelObj.name}</div></div>`;

        } else {
            if (EquipLayoutConfig.code === 'area') {
                minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;"><div class="eq-form-item-label" style="width: 25%;">${$.t('layout.bindAreaObjectId')}：</div><div id="layoutPositionAreaObjectId" class="eq-form-item-label eq-hidden-scroll" style="width: 75%;text-align:left;">${modelObj.getAttribute('userData/areaId') || ''}</div></div>`;
            }
            minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;"><div class="eq-form-item-label" style="width: 25%;">${$.t('layout.curInfo')}：</div><div id="layoutPositionPanelName" class="eq-form-item-label eq-hidden-scroll" style="width: 75%;text-align:left;white-space: pre-wrap; max-height:5rem;">${modelObj.name}</div></div>`;
            minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;"><div class="eq-form-item-label" style="width: 25%;">${$.t('layout.equipNo')}：</div><div id="layoutPositionPanelEquipNo" class="eq-form-item-label" style="width: 75%;text-align:left;">${modelObj.getAttribute('userData/equipNo') || ''}</div></div>`;
            minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;"><div class="eq-form-item-label" style="width: 25%;">${$.t('layout.exNo')}：</div><div id="layoutPositionPanelSysExid" class="eq-form-item-label" style="width: 75%;text-align:left;">${modelObj.getAttribute('userData/sysExid') || ''}</div></div>`;
        }
        // html += `<div style="display:flex;">`;
        // html += '<div class="eq-form-item-label" style="width: 25%;"><span>尺寸</span></div>';
        // html += `<input id="layoutPositionPanel-length" class="input-prefix-length" style="width: 25%;" class="page-set-form-default-input" placeholder="长" value=""/>`;
        // html += `<input id="layoutPositionPanel-width" style="width: 25%;" class="page-set-form-default-input" placeholder="宽" value=""/>`;
        // html += `<input id="layoutPositionPanel-height" style="width: 25%;" class="page-set-form-default-input" placeholder="高" value=""/>`;
        // html += `</div>`;
        if (!isMainModelGroup && EquipLayoutConfig.code !== 'path') {
            minHtml += `<div style="display:flex;margin-bottom: 0.5rem;align-items: center;">`;
            minHtml += `<div class="eq-form-item-label"  style="width: 25%;"><span>${$.t('layout.pantographRatio')}</span></div>`;
            minHtml += `<div class="input-prefix-positionX ${EquipLayoutConfig['scaleXLock'] ? 'icon-lock' : 'icon-unlock'}" style="width: 25%;position: relative;margin-right: 0.5rem;" onclick="layoutPositionLockClick(event,'scaleX')"><input id="layoutPositionPanel-scaleX" class="page-set-form-default-input" style="padding-left: 1rem;" value="${modelObj.scale[0]}" /></div>`;
            minHtml += `<span title=${$.t('common.operation.click') + $.t('common.operation.modify')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem;background-image:url(${ImgUrl}icon-check.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="changeLayoutPosition('${modelObj.id}','scaleX')"></span>`;
            
            minHtml += `<div class="input-prefix-positionY ${EquipLayoutConfig['scaleYLock'] ? 'icon-lock' : 'icon-unlock'}" style="width: 25%;position: relative;margin-right: 0.5rem;" onclick="layoutPositionLockClick(event,'scaleY')"><input id="layoutPositionPanel-scaleY" class="page-set-form-default-input" style="padding-left: 1rem;" value="${modelObj.scale[1]}" /></div>`;
            minHtml += `<span title=${$.t('common.operation.click') + $.t('common.operation.modify')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem;background-image:url(${ImgUrl}icon-check.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="changeLayoutPosition('${modelObj.id}','scaleY')"></span>`;
            
            minHtml += `<div class="input-prefix-positionZ ${EquipLayoutConfig['scaleZLock'] ? 'icon-lock' : 'icon-unlock'}" style="width: 25%;position: relative;" onclick="layoutPositionLockClick(event,'scaleZ')"><input id="layoutPositionPanel-scaleZ" class="page-set-form-default-input" style="padding-left: 1rem;" value="${modelObj.scale[2]}" /></div>`;
            minHtml += `<span title=${$.t('common.operation.click') + $.t('common.operation.modify')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem;background-image:url(${ImgUrl}icon-check.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="changeLayoutPosition('${modelObj.id}','scaleZ')"></span>`;
            minHtml += `</div>`;
            
            minHtml += `<div style="display:flex;margin-bottom: 0.5rem;align-items: center;">`;
            minHtml += `<div class="eq-form-item-label" style="width: 25%;"><span>${$.t('layout.rotationAngle')}</span></div>`;
            minHtml += `<div class="input-prefix-positionX ${EquipLayoutConfig['rotationXLock'] ? 'icon-lock' : 'icon-unlock'}" style="width: 25%;position: relative;margin-right: 0.5rem;" onclick="layoutPositionLockClick(event,'rotationX')"><input id="layoutPositionPanel-rotationX" class="page-set-form-default-input" style="padding-left: 1rem;" value="${modelObj.angles[0]}" /></div>`;
            minHtml += `<span title=${$.t('common.operation.click') + $.t('common.operation.modify')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem;background-image:url(${ImgUrl}icon-check.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="changeLayoutPosition('${modelObj.id}','rotationX')"></span>`;
            
            minHtml += `<div class="input-prefix-positionY ${EquipLayoutConfig['rotationYLock'] ? 'icon-lock' : 'icon-unlock'}" style="width: 25%;position: relative;margin-right: 0.5rem;" onclick="layoutPositionLockClick(event,'rotationY')"><input id="layoutPositionPanel-rotationY" class="page-set-form-default-input" style="padding-left: 1rem;" value="${modelObj.angles[1]}" /></div>`;
            minHtml += `<span title=${$.t('common.operation.click') + $.t('common.operation.modify')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem;background-image:url(${ImgUrl}icon-check.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="changeLayoutPosition('${modelObj.id}','rotationY')"></span>`;
        
            minHtml += `<div class="input-prefix-positionZ ${EquipLayoutConfig['rotationZLock'] ? 'icon-lock' : 'icon-unlock'}" style="width: 25%;position: relative;" onclick="layoutPositionLockClick(event,'rotationZ')"><input id="layoutPositionPanel-rotationZ" class="page-set-form-default-input" style="padding-left: 1rem;" value="${modelObj.angles[2]}" /></div>`;
            minHtml += `<span title=${$.t('common.operation.click') + $.t('common.operation.modify')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem;background-image:url(${ImgUrl}icon-check.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="changeLayoutPosition('${modelObj.id}','rotationZ')"></span>`;
            minHtml += `</div>`;
        }
    }

    if (!isMainModelGroup) {
        minHtml += `<div style="display:flex;align-items: center;">`;
        minHtml += `<div class="eq-form-item-label" style="width: 25%;"><span>${$.t('layout.position')}</span></div>`;
        minHtml += `<div class="input-prefix-positionX ${EquipLayoutConfig['positionXLock'] ? 'icon-lock' : 'icon-unlock'}" style="width: 25%;position: relative;margin-right: 0.5rem;" onclick="layoutPositionLockClick(event,'positionX')"><input id="layoutPositionPanel-positionX" class="page-set-form-default-input" style="padding-left: 1rem;" value="${modelObj.localPosition[0].toFixed(2)}" /></div>`;
        minHtml += `<span id="layoutPositionPanel-positionXConfirm" title=${$.t('common.operation.click') + $.t('common.operation.modify')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem;background-image:url(${ImgUrl}icon-check.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="changeLayoutPosition('${modelObj.id}','positionX')"></span>`;
        
        minHtml += `<div class="input-prefix-positionY ${EquipLayoutConfig['positionYLock'] ? 'icon-lock' : 'icon-unlock'}" style="width: 25%;position: relative;margin-right: 0.5rem;" onclick="layoutPositionLockClick(event,'positionY')"><input id="layoutPositionPanel-positionY" class="page-set-form-default-input" style="padding-left: 1rem;" value="${modelObj.localPosition[1].toFixed(2)}" /></div>`;
        minHtml += `<span id="layoutPositionPanel-positionYConfirm" title=${$.t('common.operation.click') + $.t('common.operation.modify')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem;background-image:url(${ImgUrl}icon-check.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="changeLayoutPosition('${modelObj.id}','positionY')"></span>`;
        
        minHtml += `<div class="input-prefix-positionZ ${EquipLayoutConfig['positionZLock'] ? 'icon-lock' : 'icon-unlock'}" style="width: 25%;position: relative;" onclick="layoutPositionLockClick(event,'positionZ')"><input id="layoutPositionPanel-positionZ" class="page-set-form-default-input" style="padding-left: 1rem;" value="${modelObj.localPosition[2].toFixed(2)}" /></div>`;
        minHtml += `<span id="layoutPositionPanel-positionZConfirm" title=${$.t('common.operation.click') + $.t('common.operation.modify')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem;background-image:url(${ImgUrl}icon-check.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="changeLayoutPosition('${modelObj.id}','positionZ')"></span>`;
        minHtml += `</div>`;

        const measureTypes = [{name: '1.00', value: '1.00'},{name: '0.10', value: '0.10'},{name: '0.01', value: '0.01'}];
        const selectConfig = {
            parentElementId: '',
            selectId: 'measureTypesSelector_X',
            optionData: measureTypes,
            optionText: 'name',
            optionValue: 'value',
            isMultiple: false,
            selectStyle: 'border:none;background:none;padding: 0;height:1rem;',
            clickCallFun: 'measureTypesSelectClick',
            defaultFlag: '',
            placeholder: $.t('layout.pleaseSelect'),
            optionStyle: '',
            optionListStyle: '',
            levelType: '',
        }

        minHtml += `<div style="display:flex;align-items: center;">`;

        minHtml += `<div class="eq-form-item-label" style="width: 25%;"><span>${$.t('layout.fineAdjustment')}</span></div>`;

        minHtml += `<div style="width: 25%;position: relative;margin-right: 0.5rem;height:1rem;display:flex;">`;
        minHtml += `<div style="width: 70%;height:1rem;">`;
        minHtml += createNormalOptions(selectConfig);
        minHtml += `</div>`;
        minHtml += `<div style="width: 30%;height:1rem;line-height:1rem;color:#fff;display:flex;justify-content:space-between;font-size:0.8rem;font-weight:600;">`;
        minHtml += `<span onclick="measureLayoutPosition('X', '+')">+</span><span onclick="measureLayoutPosition('X', '-')">-</span>`
        minHtml += `</div>`;
        minHtml += `</div>`;

        minHtml += `<div style="width: 1rem;height:1rem;margin:0.25rem;"></div>`;

        minHtml += `<div style="width: 25%;position: relative;margin-right: 0.5rem;height:1rem;display:flex;">`;
        minHtml += `<div style="width: 70%;height:1rem;">`;
        selectConfig.selectId = 'measureTypesSelector_Y';
        minHtml += createNormalOptions(selectConfig);
        minHtml += `</div>`;
        minHtml += `<div style="width: 30%;height:1rem;line-height:1rem;color:#fff;display:flex;justify-content:space-between;font-size:0.8rem;font-weight:600;">`;
        minHtml += `<span onclick="measureLayoutPosition('Y', '+')">+</span><span onclick="measureLayoutPosition('Y', '-')">-</span>`
        minHtml += `</div>`;
        minHtml += `</div>`;

        minHtml += `<div style="width: 1rem;height:1rem;margin:0.25rem;"></div>`;

        minHtml += `<div style="width: 25%;position: relative;height:1rem;display:flex;">`;
        minHtml += `<div style="width: 70%;height:1rem;">`;
        selectConfig.selectId = 'measureTypesSelector_Z';
        minHtml += createNormalOptions(selectConfig);
        minHtml += `</div>`;
        minHtml += `<div style="width: 30%;height:1rem;line-height:1rem;color:#fff;display:flex;justify-content:space-between;font-size:0.8rem;font-weight:600;">`;
        minHtml += `<span onclick="measureLayoutPosition('Z', '+')">+</span><span onclick="measureLayoutPosition('Z', '-')">-</span>`
        minHtml += `</div>`;
        minHtml += `</div>`;

        minHtml += `<div style="width: 1rem;height:1rem;margin:0.25rem;"></div>`;

        minHtml += `</div>`;
        if (EquipLayoutConfig.code === 'model-group') {
            minHtml += `<div style="display:flex;margin: 0.5rem 0;align-items: center;">`;
            minHtml += `<div class="eq-form-item-label"  style="width: 25%;"><span>${$.t('layout.eqmodelFlag')}</span></div>`;
            // minHtml += `<div style="width: 25%;"><input style="width: 0.8rem;height: 0.8rem;display:flex;align-items: center;" id="layoutPositionPanel-eqmodel" type="checkbox" ${modelObj.setAttribute('userData/eqmodel') ? 'checked' : ''}/></div>`;
            minHtml += `<div style="width: 25%;"><input style="width: 0.8rem;height: 0.8rem;display:flex;align-items: center;" id="layoutPositionPanel-eqmodel" type="checkbox" ${modelObj.getAttribute('userData/eqmodel') ? 'checked' : ''} oninput="changeLayoutPosition('${modelObj.id}','eqmodel')"/></div>`;
            minHtml += `<div style="width: 25%;"></div>`;
            minHtml += `<div style="width: 25%;"></div>`;
            minHtml += `</div>`;
        }
    }
    

    if (EquipLayoutConfig.code === 'base-equip') {
        minHtml += `<div id="baseEquipLocationSet">`;
        minHtml += `<div style="display:flex;align-items: center;">`;
        minHtml += `<div class="eq-form-item-label" style="width: 25%;"><span>${$.t('layout.placementSetting')}</span></div>`;
        const locationSetArr = [
            {name: $.t('layout.enterLevelPlacement'), value: 'isLevelLayout'},
            {name: $.t('layout.enterRoomPlacement'), value: 'isRoomLayout'},
            {name: $.t('layout.followItemPlacement'), value: 'isFollowLayout'},
        ];
        const checkboxConfig = {
            divId: "",
            checkboxId: `baseEquipLocationCheckbox`,
            data: locationSetArr,
            dataDesc: "name",
            dataValue: "value",
            css: "",
            cssChecked: "",
            isRadio: false,
            clickFun: "baseEquipLocationCheckboxClick",
            levelType: "",
            clickFunParam: {
                equipId: modelObj.id
            }
        };
        const checkboxHtml = createNormalCheckbox(checkboxConfig);
        minHtml += checkboxHtml;
        
        minHtml += `</div>`;
        minHtml += `<div style="display:none;" id="baseEquipfollowTypeSelect" equipId="${modelObj.id}">`;
        minHtml += `<div class="eq-form-item-label" style="width: 25%;"><span>${$.t('layout.followItem')}</span></div>`;
        minHtml += `<div>`;
        const followTypes = [{name: $.t('layout.equip'), value: '0'},{name: $.t('layout.powerDistribution'), value: '1'}];
        const selectConfig = {
            parentElementId: '',
            selectId: 'followTypesSelector',
            optionData: followTypes,
            optionText: 'name',
            optionValue: 'value',
            isMultiple: false,
            selectStyle: 'border:none;background:none;padding: 0 0 0 0.5rem;',
            clickCallFun: 'followTypesSelectClick',
            defaultFlag: '',
            placeholder: $.t('layout.pleaseSelect'),
            optionStyle: '',
            optionListStyle: '',
            levelType: ''
        }
        minHtml += createNormalOptions(selectConfig);
        minHtml += `</div>`;
        minHtml += `<div style="cursor:pointer;background: rgba(33, 126, 214, 0.8);color:#fff;" onclick="followTypeModelClick('${modelObj.id}', this)">${$.t('layout.clickToFollowItem')}</div>`;
        minHtml += `</div>`;

        minHtml += `</div>`;
    }
    
    html += minHtml;
    html += `</div>`;
    // 工具栏 myf
    const notBatchSave = ['pipeline', 'base-equip', 'area', 'model-group', 'path', 'facility', 'window'];
    const notBatchReplace = ['area', 'path', 'facility', 'window'];
    const notBatchSelect = ['path'];
    html += `<div id="layoutPositionPanelToolBar">`;
    html += `<div style="height:1rem;display:flex;margin-bottom: 0.5rem;">`;
    html += `<div style="width:0.25rem;height:0.5rem;margin:0.25rem 0.25rem 0.25rem 0;background-color:rgba(135, 173, 217, 1)"></div>`;
    html += `<div style="height:1rem;line-height:1rem;color:#fff;">${$.t('layout.toolbar')}</div>`;
    html += `</div>`;
    html += `<div style="margin-left:1rem;">`;

    html += `<span title=${$.t('common.operation.show') + $.t('common.object.floor')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-building-setting.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="layoutSceneSetting(this)"></span>`;
    if (EquipLayoutConfig.code === 'pipeline') {
        html += `<span title=${$.t('layout.copyToFloor')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-copy.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="layoutCopyModelToOtherFloor(this)"></span>`;
        html += `<span title=${$.t('layout.linkOverFloorPipeline')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-linelink.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="overFloorPipeLinkFloorSelect(this)"></span>`;
        html += `<span title=${$.t('layout.showPipeRadius')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-radius.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="showPipeRadius(this)"></span>`;
    }
    html += `<span title=${$.t('layout.roomName')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-text.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="showHiddenRoomName(this)"></span>`;
    if (!notBatchSelect.includes(EquipLayoutConfig.code)) {
        html += `<span title=${$.t('layout.mulSelectMode')} id="layoutMulSelectBtn" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-select.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="layoutMulSelectMode(this)"></span>`;
        html += `<span title=${$.t('layout.boxSelectMode')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-box-select.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="layoutBoxSelectBtnClick(this)"></span>`;
    }
    if (!notBatchSave.includes(EquipLayoutConfig.code)) {
        html += `<span title=${$.t('layout.batchSave')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-save-all.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="batchSaveLayoutData(this)"></span>`;
    }
    if (!notBatchReplace.includes(EquipLayoutConfig.code)) {
        html += `<span title=${$.t('layout.batchReplaceModel')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-replace.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="layoutBatchReplaceModel(this)"></span>`;
    }
    html += `<span title=${$.t('layout.formatBrush')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-brush.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="layoutBrushCopyLockInfo(this)"></span>`;
    html += `<span title=${$.t('layout.cancel')} id="layoutBackoutBtn" style="position:relative;display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-refund-back.png);background-size:100%;background-repeat: no-repeat;cursor:not-allowed;box-sizing:border-box;" onclick="layoutBackout()">`;
    html += `<span id="layoutBackoutExBtn" style="position:absolute;left:0rem;bottom:0rem;width:0.3rem;height:0.3rem;background-size:100%;background-repeat: no-repeat;"></span>`;    
    html += `</span>`;
    html += `<span title=${$.t('layout.zoomOutModel')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-zoom-in.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="layoutModelZoom('in')"></span>`;
    html += `<span title=${$.t('layout.zoomInModel')} style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-zoom-out.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="layoutModelZoom('out')"></span>`;
    // html += `<span title="靠墙" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-corner.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="layoutRelyWall(this)"></span>`;
    html += `<span title=${$.t('layout.switchTo2DMode')} id="layoutSwitchTo2DModelBtn" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-video-2d.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="switch2D3DLayoutMode(this)"></span>`;
    html += `<span title=${$.t('layout.highlightModel')} id="layoutHighlightModelBtn" style="display:inline-block;width:1rem;height:1rem;margin:0.25rem 0.5rem;background-image:url(${ImgUrl}icon-highlight.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;box-sizing:border-box;" onclick="layoutHighlightModel(this)"></span>`;
    html += `</div>`;
    html += `</div>`;
    html += `</div>`;

    if ($('#layoutPositionPanel')[0]) {
        $('#layoutPositionPanelMain').html(minHtml);
        $('#layoutPositionPanel').css('visibility','visible');
    } else {
        $('#div2d').append($(html));
    }
    triggerElementEvent('measureTypesSelector_XOption' + (EquipLayoutConfig['measureTypeX'] || '0.10'), 'mousedown');
    triggerElementEvent('measureTypesSelector_YOption' + (EquipLayoutConfig['measureTypeY'] || '0.10'), 'mousedown');
    triggerElementEvent('measureTypesSelector_ZOption' + (EquipLayoutConfig['measureTypeZ'] || '0.10'), 'mousedown');
    if (EquipLayoutConfig.code === 'base-equip') {
        const isLevelLayout = modelObj.getAttribute('userData/isLevelLayout');
        const isRoomLayout = modelObj.getAttribute('userData/isRoomLayout');
        const isFollowLayout = modelObj.getAttribute('userData/isFollowLayout');
        const followType = modelObj.getAttribute('userData/followType');
        const followObjectId = modelObj.getAttribute('userData/followObjectId');
        if (isLevelLayout === '1') {
            triggerElementEvent('baseEquipLocationCheckbox0', 'click');
        }
        if (isRoomLayout === '1') {
            triggerElementEvent('baseEquipLocationCheckbox1', 'click');
        }
        if (isFollowLayout === '1') {
            triggerElementEvent('baseEquipLocationCheckbox2', 'click');
        }
        if (followType === 0) {
            triggerElementEvent('followTypesSelectorOption0', 'mousedown');
        }
        if (followType === 1) {
            triggerElementEvent('followTypesSelectorOption1', 'mousedown');
        }
        
    }
    registerArrayByType(0,'layoutPositionPanel',1);

    if (type === 'pipeline') {
        $('#layoutPositionPanelMain').html('');
        $('#layoutPositionPanelToolBar').css('display','none');
        let minHtml = `<div style="height:1rem;display:flex;margin-bottom: 0.5rem;">`;
        minHtml += `<div style="width:0.25rem;height:0.5rem;margin:0.25rem 0.25rem 0.25rem 0;background-color:rgba(135, 173, 217, 1)"></div>`;
        minHtml += `<div style="height:1rem;line-height:1rem;color:#fff;">${$.t('layout.paramSet')}</div>`;
        minHtml += `</div>`;
        minHtml += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;"><div class="eq-form-item-label" style="width: 25%;">${$.t('layout.curInfo')}：</div><div id="layoutPositionPanelName" class="eq-form-item-label eq-hidden-scroll" style="width: 75%;text-align:left;white-space: pre-wrap; max-height:5rem;">管线</div></div>`;
        $('#layoutPositionPanelMain').append(minHtml);
        const curPipeline = PipeLineSystemForm.pipelineVOList.find(line=>line.id === modelObj.id);
        if (curPipeline) {
            const radius = modelObj.getAttribute('userData/radius');
            let html = `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;"><div class="eq-form-item-label" style="width: 25%;">${$.t('layout.startPipe')}：</div><div id="layoutPositionPanelName" class="eq-form-item-label eq-hidden-scroll" style="width: 75%;text-align:left;white-space: pre-wrap; max-height:5rem;">${curPipeline.startNodeInterfaceId.slice(0,-2)}</div></div>`;
            html += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;"><div class="eq-form-item-label" style="width: 25%;">${$.t('layout.endPipe')}：</div><div id="layoutPositionPanelName" class="eq-form-item-label eq-hidden-scroll" style="width: 75%;text-align:left;white-space: pre-wrap; max-height:5rem;">${curPipeline.endNodeInterfaceId.slice(0,-2)}</div></div>`;
            html += `<div style="width: 100%;display:flex;margin-bottom: 0.5rem;"><div class="eq-form-item-label" style="width: 25%;">${$.t('layout.pipelineRadius')}：</div><div id="layoutPositionPanelName" class="eq-form-item-label eq-hidden-scroll" style="width: 75%;text-align:left;white-space: pre-wrap; max-height:5rem;">${radius}</div></div>`;
            $('#layoutPositionPanelMain').append(html);
        }
    } else {
        $('#layoutPositionPanelToolBar').css('display','block');
    }
}

/**
 * @authors myf
 * @date    2024-04-09
 * @params e 点击事件
 * @params type 参数类型
 * @description 布局参数锁点击事件
 * @return 无
 */
function layoutPositionLockClick (e, type) {
    if (e.offsetX / e.target.clientWidth > 0.75) {
        if ($(e.target).hasClass('icon-lock')) {
            $(e.target).addClass('icon-unlock');
            $(e.target).removeClass('icon-lock');
            EquipLayoutConfig[type+'Lock'] = false;
            $.toast({msgtype:'info',content:$.t('layout.unlock'),time:300});
        } else {
            $(e.target).removeClass('icon-unlock');
            $(e.target).addClass('icon-lock');
            EquipLayoutConfig[type+'Lock'] = true;
            $.toast({msgtype:'info',content:$.t('layout.lock'),time:300});
        }
    }
}
/**
 * @authors myf
 * @date    2023-11-09
 * @params id 模型id
 * @params para 模型参数字段
 * @description 修改面板改变模型布局位置
 * @return 无
 */
function changeLayoutPosition (id, para) {
    if (!!EquipLayoutConfig.mulSelect) {
        const modelIds = $('#layoutPositionPanel').attr('modelIds');
        if (!modelIds) {return;}
        const operOldValues = [];
        let operName = '';
        const modelIdArr = modelIds.split('^');
        modelIdArr.forEach(modelId=>{
            const modelObj = app.query('#'+modelId)[0];
            $('#'+modelObj.id+'TopCardPanel').remove();
            const nodeInterfaces = modelObj.subNodes.filter(node=>{return node.name.includes('pipe-interface')});
            nodeInterfaces.objects.forEach(interface=>{
                $(`#TopCardPanel${modelObj.id+interface.name}`).remove();
                app.query(`#TopCardPanel${modelObj.id+interface.name}_Line`).destroyAll();
            });
            // const position = modelObj.parent.selfToWorld([$('#layoutPositionPanel-positionX').val(), $('#layoutPositionPanel-positionY').val(), $('#layoutPositionPanel-positionZ').val()]);
            if (para.includes('scale')) {
                operOldValues.push([...modelObj.scale]);
                operName = 'scale';
            } else if (para.includes('rotation')) {
                operOldValues.push([...modelObj.angles]);
                operName = 'angles';
            } else if (para.includes('position')) {
                operOldValues.push([...modelObj.position]);
                operName = 'position';
            }
            switch(para) {
                case 'scale': {
                    modelObj.scale = [$('#layoutPositionPanel-scaleX').val(),$('#layoutPositionPanel-scaleY').val(),$('#layoutPositionPanel-scaleZ').val()];
                    break;
                }
                case 'angle': {
                    modelObj.angleX = $('#layoutPositionPanel-rotationX').val();
                    modelObj.angleY = $('#layoutPositionPanel-rotationY').val();
                    modelObj.angleZ = $('#layoutPositionPanel-rotationZ').val();
                    break;
                }
                case 'position': {
                    modelObj.x = position[0];
                    modelObj.y = position[1];
                    modelObj.z = position[2];
                    break;
                }
                case 'scaleX': {
                    modelObj.scale = [$('#layoutPositionPanel-scaleX').val(),modelObj.scale[1],modelObj.scale[2]];
                    break;
                }
                case 'scaleY': {
                    modelObj.scale = [modelObj.scale[0],$('#layoutPositionPanel-scaleX').val(),modelObj.scale[2]];
                    break;
                }
                case 'scaleZ': {
                    modelObj.scale = [modelObj.scale[0],modelObj.scale[1],$('#layoutPositionPanel-scaleX').val()];
                    break;
                }
                case 'rotationX': {
                    modelObj.angleX = $('#layoutPositionPanel-rotationX').val();
                    break;
                }
                case 'rotationY': {
                    modelObj.angleY = $('#layoutPositionPanel-rotationY').val();
                    break;
                }
                case 'rotationZ': {
                    modelObj.angleZ = $('#layoutPositionPanel-rotationZ').val();
                    break;
                }
                case 'positionX': {
                // modelObj.x = position[0];
                    modelObj.localPosition = [$('#layoutPositionPanel-positionX').val(),modelObj.localPosition[1],modelObj.localPosition[2]];
                    break;
                }
                case 'positionY': {
                    // modelObj.y = position[1];
                    modelObj.localPosition = [modelObj.localPosition[0],$('#layoutPositionPanel-positionY').val(),modelObj.localPosition[2]];
                    break;
                }
                case 'positionZ': {
                    // modelObj.z = position[2];
                    modelObj.localPosition = [modelObj.localPosition[0],modelObj.localPosition[1],$('#layoutPositionPanel-positionZ').val()];
                    break;
                }
                case 'name': {
                    modelObj.name = $('#layoutPositionModelGroupNameInput').val();
                    break;
                }
                case 'code': {
                    modelObj.setAttribute('userData/code', $('#layoutPositionModelGroupCodeInput').val());
                    break;
                }
                case 'eqmodel': {
                    modelObj.setAttribute('userData/eqmodel', !!$('#layoutPositionPanel-eqmodel').prop('checked'));
                }
                default: break;
            }
            createNodeInterfaceSelectTopcard (modelObj);
            refreshPipelinePlan(modelObj.id);
            refreshPipelineNodeData(modelObj.id);
        });
        addLayoutBackoutArr(operName, modelIdArr, operOldValues);
    } else {
        const modelObj = app.query('#'+id)[0];
        $('#'+modelObj.id+'TopCardPanel').remove();
        const nodeInterfaces = modelObj.subNodes.filter(node=>{return node.name.includes('pipe-interface')});
        nodeInterfaces.objects.forEach(interface=>{
            $(`#TopCardPanel${modelObj.id+interface.name}`).remove();
            app.query(`#TopCardPanel${modelObj.id+interface.name}_Line`).destroyAll();
        });
        
        // const position = modelObj.parent.selfToWorld([$('#layoutPositionPanel-positionX').val(), $('#layoutPositionPanel-positionY').val(), $('#layoutPositionPanel-positionZ').val()]);
        // const localPosition = [$('#layoutPositionPanel-positionX').val(), $('#layoutPositionPanel-positionY').val(), $('#layoutPositionPanel-positionZ').val()];

        const operOldValues = [];
        let operName = '';
        if (para.includes('scale')) {
            operOldValues.push([...modelObj.scale]);
            operName = 'scale';
        } else if (para.includes('rotation')) {
            operOldValues.push([...modelObj.angles]);
            operName = 'angles';
        } else if (para.includes('position')) {
            operOldValues.push([...modelObj.position]);
            operName = 'position';
        }
        addLayoutBackoutArr(operName, [id], operOldValues);
        switch(para) {
            case 'scale': {
                modelObj.scale = [$('#layoutPositionPanel-scaleX').val(),$('#layoutPositionPanel-scaleY').val(),$('#layoutPositionPanel-scaleZ').val()];
                break;
            }
            case 'angle': {
                modelObj.angleX = $('#layoutPositionPanel-rotationX').val();
                modelObj.angleY = $('#layoutPositionPanel-rotationY').val();
                modelObj.angleZ = $('#layoutPositionPanel-rotationZ').val();
                break;
            }
            case 'position': {
                modelObj.x = position[0];
                modelObj.y = position[1];
                modelObj.z = position[2];
                break;
            }
            case 'scaleX': {
                modelObj.scale = [$('#layoutPositionPanel-scaleX').val(),modelObj.scale[1],modelObj.scale[2]];
                break;
            }
            case 'scaleY': {
                modelObj.scale = [modelObj.scale[0],$('#layoutPositionPanel-scaleY').val(),modelObj.scale[2]];
                break;
            }
            case 'scaleZ': {
                modelObj.scale = [modelObj.scale[0],modelObj.scale[1],$('#layoutPositionPanel-scaleZ').val()];
                break;
            }
            case 'rotationX': {
                modelObj.angleX = $('#layoutPositionPanel-rotationX').val();
                break;
            }
            case 'rotationY': {
                modelObj.angleY = $('#layoutPositionPanel-rotationY').val();
                break;
            }
            case 'rotationZ': {
                modelObj.angleZ = $('#layoutPositionPanel-rotationZ').val();
                break;
            }
            case 'positionX': {
                // modelObj.x = position[0];
                modelObj.localPosition = [$('#layoutPositionPanel-positionX').val(),modelObj.localPosition[1],modelObj.localPosition[2]];
                break;
            }
            case 'positionY': {
                // modelObj.y = position[1];
                modelObj.localPosition = [modelObj.localPosition[0],$('#layoutPositionPanel-positionY').val(),modelObj.localPosition[2]];
                break;
            }
            case 'positionZ': {
                // modelObj.z = position[2];
                modelObj.localPosition = [modelObj.localPosition[0],modelObj.localPosition[1],$('#layoutPositionPanel-positionZ').val()];
                break;
            }
            case 'color': {
                modelObj.style.color = $('#layoutPositionPanel-color').val();
                break;
            }
            case 'opacity': {
                modelObj.style.opacity = $('#layoutPositionPanel-opacity').val()*1;
                break;
            }
            case 'defaultOutlineColor': {
                modelObj.style.defaultOutlineColor = $('#layoutPositionPanel-defaultOutlineColor').val();
                break;
            }
            case 'highlight': {
                modelObj.style.highlight = $('#layoutPositionPanel-highlight').val();
                break;
            }
            case 'highlightIntensity': {
                modelObj.style.highlightIntensity = $('#layoutPositionPanel-highlightIntensity').val()*1;
                break;
            }
            case 'name': {
                modelObj.name = $('#layoutPositionModelGroupNameInput').val();
                break;
            }
            case 'code': {
                modelObj.setAttribute('userData/code', $('#layoutPositionModelGroupCodeInput').val());
                break;
            }
            case 'eqmodel': {
                modelObj.setAttribute('userData/eqmodel', !!$('#layoutPositionPanel-eqmodel').prop('checked'));
            }
            default: break;
        }
        createModelOperaPanel(modelObj);
        createNodeInterfaceSelectTopcard (modelObj);
        refreshPipelinePlan(modelObj.id);
        refreshPipelineNodeData(modelObj.id);
        refreshAreaModelData(modelObj);
        if (EquipLayoutConfig.code && EquipLayoutConfig.code === 'path') {
            refreshLayoutPath (modelObj.parent.id);
        }
    }
}

/**
 * @interface
 * @authors myf
 * @date    2023-11-09
 * @params id 面板id
 * @description 移除面板
 * @return 无
 */
function remove2DPanel (id) {
    $('#'+id).remove();
}


/**
 * 布局窗口模型
 * @param {Object} checkbox 元素
 * @param {string} desc 选中描述
 * @param {string} value 选中值
 * @author myf 2025-04-15
 * @returns 无
 */
function layoutByModelOnWall (checkbox, desc, value) {
    if (!value[0]) {
        return;
    }
    if (!EquipLayoutConfig.selectedRoomId) {
        triggerElementEvent($(checkbox).attr('id'), 'click');
        $.toast({msgtype:'info',content:$.t('layout.tip.selectRoomFirst'),time:1000});
        return;
    }
    if (!EquipLayoutConfig.selectedWallPosition || JSON.stringify(EquipLayoutConfig.selectedWallPosition) === '[0, 0, 0]') {
        triggerElementEvent($(checkbox).attr('id'), 'click');
        $.toast({msgtype:'info',content:$.t('layout.tip.selectWallFirst'),time:1000});
        return;
    }
    // const checkboxDataStr = $(checkbox).parent().parent().parent().attr('itemdata');
    // const checkboxData = JSON.parse(checkboxDataStr);
    const checkboxData = getPageData($(checkbox).parent().parent().parent().attr('id'), 'itemdata');
    const modelData = checkboxData.find(item=>item.id === value[0]);
    if (modelData) {
        EquipLayoutConfig.z = modelData.defaultPosY ? modelData.defaultPosY - 0 : EquipLayoutConfig.z;
        // if (EquipLayoutConfig.z === 99) {
        //     EquipLayoutConfig.z = 3;
        // }
        let wallWindowNum = EquipLayoutConfig.layoutSaveArr.filter(item=>{return item.includes(EquipLayoutConfig.selectedRoomId);}).length + 1;
        let modelInfo = {
            id: EquipLayoutConfig.selectedRoomId + '-W' + wallWindowNum,
            url: modelData.modelUrl,
            name: modelData.name,
            levelObjectId: CurSencceObj.id,
        }
        modelInfo.roomId = EquipLayoutConfig.selectedRoomId;
        modelInfo.equipNo = modelInfo.id;
        modelInfo.localPosition = CurSencceObj.worldToSelf(EquipLayoutConfig.selectedWallPosition);
        modelInfo.localPosition[1] = EquipLayoutConfig.z;
        modelInfo.rotation = [0, EquipLayoutConfig.selectedWallRotationY, 0];
        EquipLayoutConfig.layoutSaveArr.push(modelInfo.id);
        EquipLayoutConfig.createCallbackFunc = function (curModel) {
            EquipLayoutConfig.createCallbackFunc = null;
            const result = calculatePlacement(EquipLayoutConfig.selectedWallEdge, curModel.boxSize[2]);
            console.log('result',result,curModel.boxSize);
            if (result.count > 0) {
                result.placements.forEach((item, index)=>{
                    if (index > 0) {
                        wallWindowNum++;
                        let curModelInfo = {
                            id: EquipLayoutConfig.selectedRoomId + '-W' + wallWindowNum,
                            url: modelData.modelUrl,
                            name: modelData.name,
                            levelObjectId: CurSencceObj.id,
                        }
                        curModelInfo.roomId = EquipLayoutConfig.selectedRoomId;
                        curModelInfo.equipNo = modelInfo.id;
                        curModelInfo.rotation = [0, item.rotation, 0];
                        curModelInfo.localPosition = item.position;
                        layoutCreateModelObj(curModelInfo);
                        EquipLayoutConfig.layoutSaveArr.push(curModelInfo.id);
                    } else {
                        curModel.localPosition = item.position;
                        curModel.angleY = item.rotation;
                    }
                });
            }
            
            
        }
        layoutCreateModelObj(modelInfo);
        // clickRoomCreateModelEvent(modelInfo);
        triggerElementEvent($(checkbox).attr('id'), 'click');
    }
}

/**
 * @description: 按模型布局（选模型事件）
 * @param {Object} checkbox 元素
 * @param {string} desc 选中描述
 * @param {string} value 选中值
 * @author myf 2025-02-08
 * @returns {void} 无
 */
function layoutByModel (checkbox, desc, value) {
    if (!value[0]) {
        return;
    }
    const checkboxData = getPageData($(checkbox).parent().parent().parent().attr('id'), 'itemdata');
    const modelData = checkboxData.find(item=>item.id === value[0]);
    console.log('按模型布局', modelData);
    if (modelData) {
        EquipLayoutConfig.z = modelData.defaultPosY ? modelData.defaultPosY - 0 : EquipLayoutConfig.z;
        if (EquipLayoutConfig.z === 99) {
            EquipLayoutConfig.z = 3;
        }
        let modelInfo = {
            id: 'newModel' + new Date().getTime(),
            code: 'newModel' + new Date().getTime(),
            url: modelData.modelUrl,
            name: modelData.description || modelData.name || '',
            levelObjectId: CurSencceObj.id,
            modelId: modelData.id,
        }
        if (EquipLayoutConfig.code === 'facility') {
            modelInfo.facilityTypeSubCode = modelData.facilityTypeSubCode;
            modelInfo.facilityWayCode = modelData.facilityWayCode;
            modelInfo.facilityUseModeCode = modelData.facilityUseModeCode;
            modelInfo.parentId = modelData.parentId;
            $('#facilityLayoutChildModelRadioDiv').remove();
            const data = getInterfaceData(dtvpApiServ + "/facFacilityModelChild/api/getFacFacilityModelChild", {parentFacModelId: modelData.id}, {async: false});
            if (data && data.length) {
                const childrenModelIds = data.map((item)=>{return item.childFacModelId});
                const childrenModels = checkboxData.filter(item=>{return childrenModelIds.includes(item.id)});
                const radioConfig = {
                    divId: '',
                    checkboxId: 'facilityLayoutChildModelRadio',
                    data: childrenModels,
                    dataDesc: 'description',
                    dataValue: 'id',
                    isRadio: true,
                    clickFun: 'facilityLayoutChildModelRadioClick',
                    levelType: 2,
                    clickFunParam: {modelInfo: modelInfo, checkbox: checkbox, models: childrenModels, modelChildData: data}
                };
                let html = `<div id="facilityLayoutChildModelRadioDiv" style="padding:0.5rem;background:#102b5366;">`;
                html += `<div style="color:#fff;">${$.t('facility-layout.selectFireWeight')}</div>`;
                html += createNormalCheckbox(radioConfig);
                html += `</div>`;
                if ($('#facilityLayoutChildModelRadioDiv')[0]) {
                    $('#facilityLayoutChildModelRadioDiv').remove();
                } else {
                    $('[id*=equipModelRadio][formtype=radio]').parent().parent().append(html);
                }
                $.toast({msgtype:'info',content:$.t('facility-layout.tip.selectFireWeight'),time:1000});
                return;
            }
        }
        $.toast({msgtype:'info',content:$.t('layout.tip.clickAnywhere'),time:1000});
        EquipLayoutConfig.layoutSaveArr.push(modelInfo.id);
        clickFloorCreateModelEvent(modelInfo, checkbox, true);
    }
}

/**
 * 设施布局-子模型选择事件（选择消防栓中的灭火器质量等）
 * @param {Object} checkbox 元素
 * @param {string} desc 选中描述
 * @param {string} value 选中值
 * @param {string} params 自定义参数
 * @author myf 2025-03-07
 * @returns 无
 */
function facilityLayoutChildModelRadioClick (button, text, value, params) {
    const curModelData = params.models.find(item=>item.id === value[0]);
    const curModelChildData = params.modelChildData.find(item=>item.childFacModelId === value[0]);
    if (params.modelInfo) {
        EquipLayoutConfig.createCallbackFunc = createFacilityLayoutChildModelClosureFunc(curModelData, curModelChildData);
        EquipLayoutConfig.layoutSaveArr.push(params.modelInfo.id);
        clickFloorCreateModelEvent(params.modelInfo, params.checkbox, true);
    }
}

/**
 * 设施布局-创建子模型
 * @param {array} curModelData 模型数据
 * @param {array} curModelChildData 父子关系数据
 * @author myf 2025-03-07
 * @returns function 创建父模型的子模型
 */
function createFacilityLayoutChildModelClosureFunc (curModelData, curModelChildData) {
    return function (parentObject) {
        EquipLayoutConfig.createCallbackFunc = '';
        const createNum = curModelChildData.num || 1;
        const facilityTypeSubCode = parentObject.getAttribute('userData/facilityTypeSubCode');
        const facilityWayCode = parentObject.getAttribute('userData/facilityWayCode');
        let localPosition = [0, 0, 0];
        const maxLength = parentObject.size[2];
        const fireEquipLength = 0.3;
        const maxEquipments = maxLength / fireEquipLength;
        let scaleNum = 1;
        let offsetLength = fireEquipLength;
        if (maxEquipments < createNum) {
            scaleNum = maxEquipments / createNum;
            offsetLength = offsetLength * scaleNum;
        }
        if (facilityTypeSubCode === '01-03' && facilityWayCode) { // 连体消防栓
            const container = parentObject.subNodes.objects.find(item=>{return item.name === 'container'});
            if (container) {
                localPosition = parentObject.worldToSelf(container.position);
            }
            localPosition[2] -= 0.05
        } else if (facilityTypeSubCode === '01-01') { // 灭火器箱
            localPosition[1] += 0.1
        }
        console.log('createNum', createNum)
        console.log('facilityTypeSubCode', facilityTypeSubCode)
        console.log('facilityWayCode', facilityWayCode)
        console.log('maxLength', maxLength)
        console.log('scaleNum', scaleNum)
        // console.log('offsetLength', offsetLength)
        for (let i = 0; i < createNum; i++) {
            const x = (localPosition[0] - (maxLength / 2)) + ((maxLength / (createNum * 2)) * (i * 2 + 1))
            // const x = (localPosition[0] - maxLength) + (maxLength * (maxLength / createNum));
            // localPosition[0] = localPosition[0] + (offsetLength * ((i % 2) * -1));
            console.log('createFacilityLayoutChildModelClosureFunc', i, localPosition)
            const modelInfo = {
                id: 'newModel' + i + new Date().getTime(),
                code: 'newModel' + i + new Date().getTime(),
                url: curModelData.modelUrl,
                name: curModelData.description || '',
                levelObjectId: parentObject.id,
                modelId: curModelData.id,
                localPosition: [x, localPosition[1], localPosition[2]],
                scale: [scaleNum, scaleNum, scaleNum],
                facilityTypeSubCode: curModelData.facilityTypeSubCode,
                facilityWayCode: curModelData.facilityWayCode,
                facilityUseModeCode: curModelData.facilityUseModeCode,
            }
            layoutCreateModelObj(modelInfo);
        }
    }
}

/**
 * 加载（自由）布局模型
 * @author myf 2025-02-08
 * @returns 无
 */
function loadLayoutModel () {
    app.query('["userData/modelFlag"="layoutModel"]').destroyAll();
    EquipLayoutConfig.layoutSaveArr = [];
    let modelLayoutData = [];
    let idKey = 'id';
    let nameKey = 'name';
    let equipNoKey = 'equipNo';
    if (EquipLayoutConfig.code === 'facility') {
        modelLayoutData = getInterfaceData(dtvpApiServ + "/facFacility/api/getFacFacilityByObjectFacilitiesPos", {hospitalId: BindSysUsers["Sys"]["HospitalID"]}, {async: false});
        nameKey = 'no';
    } else if (EquipLayoutConfig.code === 'window') {
        modelLayoutData = getInterfaceData(dtvpApiServ + "/bussWindow/api/getBussWindowAndBuss", {hospitalId: BindSysUsers["Sys"]["HospitalID"], levelObjectId: CurSencceObj.id}, {async: false});
        idKey = 'objectId';
        nameKey = 'description';
        equipNoKey = 'objectId';
    }
    const creatingModelData = modelLayoutData.filter(item=>{
        return item.levelObjectId === CurSencceObj.id;
    }).map(item=>{
        EquipLayoutConfig.layoutSaveArr.push(item.id);
        return {
            id: item[idKey],
            url: item.modelUrl,
            localPosition: [item.posX - 0, item.posY - 0, item.posZ - 0],
            name: item[nameKey],
            // levelObjectId: item.levelObjectId,
            rotation: item.rotateX ? [item.rotateX - 0, item.rotateY - 0, item.rotateZ - 0] : [0,0,0],
            savedFlag: true,
            modelId: item.facilityModelId,
            // facilityTypeSubCode: item.facilityTypeSubCode,
            savedId: item.id,
            equipNo: item[equipNoKey],
            // facilityWayCode: item.facilityWayCode,
            // facilityUseModeCode: item.facilityUseModeCode,
            // parentId: item.parentId,
            ...item
        };
    });
    if (creatingModelData && creatingModelData.length) {
        creatingModelData.forEach(model=>{
            layoutCreateModelObj(model);
        });
    }
}

/**
 * 批量保存（自由）布局模型
 * @author myf 2025-02-08
 * @returns 无
 */
function saveBatchLayoutModel () {
    if (EquipLayoutConfig.code === 'window') {
        const data = EquipLayoutConfig.layoutSaveArr.map(modelId=>{
            const equipModel = app.query('#' + modelId)[0];
            const localPosition = equipModel.localPosition.map(pos=>{
                return pos.toFixed(2);
            });
            const savedFlag = equipModel.getAttribute("userData/savedFlag");
            const saveId = savedFlag ? equipModel.getAttribute("userData/savedId") : '';
            return {
                "id": saveId,
                "hospitalId": BindSysUsers["Sys"]["HospitalID"],
                "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
                "levelObjectId": CurSencceObj.id,
                "levelType": CurSencceObj.level,
                "objectId": equipModel.id,
                "roomObjectId": equipModel.getAttribute("userData/roomId"),
                "posX": localPosition[0] + '',
                "posY": localPosition[1] + '',
                "posZ": localPosition[2] + '',
                "rotateX": equipModel.angleX.toFixed(2) + '',
                "rotateY": equipModel.angleY.toFixed(2) + '',
                "rotateZ": equipModel.angleZ.toFixed(2) + '',
                "scaleX": (equipModel.scale[0] / EquipLayoutConfig.zoom).toFixed(2).toString(),
                "scaleY": (equipModel.scale[1] / EquipLayoutConfig.zoom).toFixed(2).toString(),
                "scaleZ": (equipModel.scale[2] / EquipLayoutConfig.zoom).toFixed(2).toString(),
                "priority": false,
                "status": 1,
                "modelUrl": equipModel.url,
                "description": equipModel.name
            }
        });
        postInterfaceData(dtvpApiServ + "/bussWindow/api/saveBussWindows", data, {contentType: "application/json;charset=utf-8", async: false});
    } else {
        EquipLayoutConfig.layoutSaveArr.forEach(modelId=>{
            if (modelId) {
                saveSingleLayoutModel (modelId, false);
            }
        });
    }
    
    loadLayoutModel();
}

/**
 * 保存单个（自由）布局模型
 * @params {string} modelId 模型id
 * @params {string} refreshData 是否刷新数据
 * @author myf 2025-02-08
 * @returns 无
 */
function saveSingleLayoutModel (modelId, refreshData = true) {
    const equipModel = app.query('#' + modelId)[0];
    if (!equipModel) {
        return;
    }
    const localPosition = equipModel.localPosition.map(pos=>{
        return pos.toFixed(2);
    });
    if (EquipLayoutConfig.code === 'facility') {
        // const equipModelRadioId = $('[id*=equipModelRadio][formtype=radio]').children().eq(0).attr('id');
        // const facilityModelId = getPageData(equipModelRadioId, 'valuekey');
        const facilityModelId = equipModel.getAttribute('userData/modelId');
        const facilityTypeSubCode = equipModel.getAttribute('userData/facilityTypeSubCode');
        const facilityWayCode = equipModel.getAttribute('userData/facilityWayCode');
        const facilityUseModeCode = equipModel.getAttribute('userData/facilityUseModeCode');
        const parentId = equipModel.getAttribute('userData/parentId');
        const savedFlag = equipModel.getAttribute("userData/savedFlag");
        const facilityId = savedFlag ? equipModel.getAttribute("userData/savedId") : '';
        const facilityData = {
            "facilityModelId": facilityModelId || '',
            "facilityTypeSubCode": facilityTypeSubCode || '',
            "facilityWayCode": facilityWayCode || '',
            "facilityUseModeCode": facilityUseModeCode || '',
            "facilityTypeCode": '01',
            "parentId": parentId || '',
            "hospitalId": BindSysUsers["Sys"]["HospitalID"],
            "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
            "id": facilityId
        };
        const savedId = postInterfaceData(dtvpApiServ + "/facFacility/api/saveFacFacility", facilityData, {contentType: "application/json;charset=utf-8", async: false});
        if (equipModel.children.length) {
            equipModel.children.forEach(child=>{
                child.setAttribute('userData/parentId', savedId);
                saveSingleLayoutModel(child.id, false);
            });
        }
        const data = {
            "buildingUnitId": "",
            "levelObjectId": CurSencceObj.id,
            "levelType": CurSencceObj.level,
            "objectId": '',
            "posX": localPosition[0] + '',
            "posY": localPosition[1] + '',
            "posZ": localPosition[2] + '',
            "rotateX": equipModel.angleX.toFixed(2) + '',
            "rotateY": equipModel.angleY.toFixed(2) + '',
            "rotateZ": equipModel.angleZ.toFixed(2) + '',
            "scaleX": (equipModel.scale[0] / EquipLayoutConfig.zoom).toFixed(2).toString(),
            "scaleY": (equipModel.scale[1] / EquipLayoutConfig.zoom).toFixed(2).toString(),
            "scaleZ": (equipModel.scale[2] / EquipLayoutConfig.zoom).toFixed(2).toString(),
            "sourceId": savedId,
            "sourceType": "4",
            "subSourceType": '',
            "facilityModelId": facilityModelId ? facilityModelId[0] : '',
        }
        postInterfaceData(dtvpApiServ + "/objectFacilitiesPos/api/saveObjectFacilitiesPos", data, {contentType: "application/json;charset=utf-8", async: false});
    } else if (EquipLayoutConfig.code === 'window') {
        const savedFlag = equipModel.getAttribute("userData/savedFlag");
        const saveId = savedFlag ? equipModel.getAttribute("userData/savedId") : '';
        const data = [{
            "id": saveId,
            "hospitalId": BindSysUsers["Sys"]["HospitalID"],
            "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
            "levelObjectId": CurSencceObj.id,
            "levelType": CurSencceObj.level,
            "objectId": equipModel.id,
            "roomObjectId": equipModel.getAttribute("userData/roomId"),
            "posX": localPosition[0] + '',
            "posY": localPosition[1] + '',
            "posZ": localPosition[2] + '',
            "rotateX": equipModel.angleX.toFixed(2) + '',
            "rotateY": equipModel.angleY.toFixed(2) + '',
            "rotateZ": equipModel.angleZ.toFixed(2) + '',
            "scaleX": (equipModel.scale[0] / EquipLayoutConfig.zoom).toFixed(2).toString(),
            "scaleY": (equipModel.scale[1] / EquipLayoutConfig.zoom).toFixed(2).toString(),
            "scaleZ": (equipModel.scale[2] / EquipLayoutConfig.zoom).toFixed(2).toString(),
            "priority": false,
            "status": 1,
            "modelUrl": equipModel.url,
            "description": equipModel.name
        }];
        postInterfaceData(dtvpApiServ + "/bussWindow/api/saveBussWindows", data, {contentType: "application/json;charset=utf-8", async: false});
    }
    // saveEquipPositionChange(equipModel);
    if (refreshData) {
        loadLayoutModel();
    }
}

/**
 * 删除单个（自由）布局模型
 * @params {string} modelId 模型id
 * @author myf 2025-02-08
 * @returns 无
 */
function deleteSingleLayoutModel (modelId) {
    const equipModel = app.query('#' + modelId)[0];
    if (!equipModel) {
        return;
    }
    const savedFlag = equipModel.getAttribute("userData/savedFlag");
    if (savedFlag) {
        const savedId = equipModel.getAttribute("userData/savedId") || '';
        if (EquipLayoutConfig.code === 'facility') {
            getInterfaceData(dtvpApiServ + "/facFacility/api/deleteFacFacility", {ids: savedId}, {async: false});
            getInterfaceData(dtvpApiServ + "/objectFacilitiesPos/api/deleteObjectFacilitiesPos", {sourceId: savedId}, {async: false});
        } else if (EquipLayoutConfig.code === 'window') {
            getInterfaceData(dtvpApiServ + "/bussWindow/api/deleteBussWindow", {ids: savedId}, {async: false});
        }
    }
    equipModel.destroy();
    EquipLayoutConfig.layoutSaveArr.splice(EquipLayoutConfig.layoutSaveArr.indexOf(modelId), 1);
    $.toast({msgtype:'info',content:$.t('layout.tip.deleteSuccess'),time:1000});
}

/**
 * @description 管线布局-模型组模型绑定设备列表点击函数
 * @param {object} row 列表行
 * @return 无
 * @authors myf 2024-12-02
 */
function bindEquipListClick (row, params) {
    event.stopPropagation();
    const itemdataStr = $(row).attr('itemdata');
    const itemdata = JSON.parse(itemdataStr);
    // console.log('dddd', itemdata);
    $(row).siblings().css('color', '');
    $(row).css('color', 'aquamarine');
    const modelObjId = params.modelObjId;
    const curModel = app.query('#' + modelObjId)[0];
    // curModel.setAttribute('userData/bindEquipName', itemdata.equipName);
    // curModel.setAttribute('userData/bindEquipId', itemdata.equipId);
    curModel.setAttribute('userData/bindEquipNo', itemdata.equipNo);
    const modelGroupEquipType = curModel.getAttribute('userData/modelGroupType') === 'main' ? 0 : 1;
    const modelGroupId = modelGroupEquipType === 0 ? curModel.getAttribute('userData/modelGroupId') : curModel.getAttribute('userData/modelGroupListId');
    const saveModelEquipData = {
        "equipNo": itemdata.equipNo,
        "hospitalId": BindSysUsers["Sys"]["HospitalID"],
        "id": curModel.getAttribute('userData/modelGroupEquipId'),
        "modelGroupId": modelGroupId,
        "type": modelGroupEquipType,
        "pipelineSystemId": PipeLineSystemForm.id,
    }

    const savePromise = postInterfaceData(dtvpApiServ + "/modelGroupEquip/api/saveModelGroupEquipPage", saveModelEquipData, {contentType: "application/json;charset=utf-8"});
    savePromise.then(result=>{
        const modelGroupEquipId = result.data;
        curModel.setAttribute('userData/modelGroupEquipId', modelGroupEquipId);
        if (modelGroupEquipType === 0) {
            const saveModelGroupEquipPipelineData = [];
            curModel.children.forEach(child=>{
                if (child.id.includes('T-')) {
                    saveModelGroupEquipPipelineData.push({
                        hospitalId: BindSysUsers["Sys"]["HospitalID"],
                        id: '',
                        modelGroupEquipId: modelGroupEquipId,
                        pipelineNodeId: child.id
                    });
                }
            });
            postInterfaceData(dtvpApiServ + "/modelGroupEquipPipelineNode/api/saveModelGroupEquipPipeline", saveModelGroupEquipPipelineData, {contentType: "application/json;charset=utf-8"});
        }
    });


    $.toast({msgtype:'info',content:$.t('layout.tip.bindEquip', {name: itemdata.equipName}),time:800});
}

/**
 * @description 管线布局-模型组模型绑定设备列表
 * @param {object} buttonElement 设备绑定按钮
 * @param {string} modelObjId 模型对象id
 * @return 无
 * @authors myf 2024-12-02
 */
function bindModelGroupEquip (buttonElement, modelObjId) {
    event.stopPropagation();
    const curModel = app.query('#' + modelObjId)[0];
    let html = `<div id="bindEquip${modelObjId}Panel" style="position:absolute;top:1rem;left:5rem;width:23rem;height:15rem;padding:1rem;background:#102b53;color:#fff;" title="">`;
    html += `<div><span style="display:inline-block;line-height:1.5rem;width:5rem;text-align: right;">${$.t('layout.curBindEquip')}：</span><span>${curModel.getAttribute('userData/bindEquipNo') || '无'}</span></div>`;
    html += `<div style="height:1.5rem;"><span style="display:inline-block;line-height:1.5rem;width:5rem;text-align: right;">${$.t('common.item.equip') + $.t('common.name')}：</span><input id="bindEquip${modelObjId}NameInput" type="text" class="page-set-form-default-input" style="width:12rem;height:1rem;margin-top:0.25rem;" /></div>`;
    html += `<div style="height:1.5rem;"><span style="display:inline-block;line-height:1.5rem;width:5rem;text-align: right;">${$.t('common.item.equip')}ID：</span><input id="bindEquip${modelObjId}IdInput" type="text" class="page-set-form-default-input" style="width:12rem;height:1rem;margin-top:0.25rem;" /></div>`;
    html += `<div style="height:1.5rem;"><span style="display:inline-block;line-height:1.5rem;width:5rem;text-align: right;">${$.t('common.item.equip') + $.t('common.no')}：</span><input id="bindEquip${modelObjId}NoInput" type="text" class="page-set-form-default-input" style="width:12rem;height:1rem;margin-top:0.25rem;" />`;
    html += `<span style="display:inline-block;background: #385d96ff;cursor: pointer;color:#fff;width: 5rem;height:1.5rem;line-height:1.5rem;margin: 0 0.5rem;text-align:center;" id="bindEquip${modelObjId}Search">查询</span></div>`;
    
    const listItemObj = {
        headViewFlag: 'Y',
        headStyle: '',
        itemStyles: [
            {
                styles: 'width:9rem;height:1.5rem;line-height:1.5rem;text-align:center;font-size:0.6rem;font-weight:400;',
                listTitle: $.t('common.item.equip') + $.t('common.no'),
                key: 'equipNo',
                clickFun: '',
            },
            {
                styles: 'width:9rem;height:1.5rem;line-height:1.5rem;margin-right:0.5rem;text-align:center;font-size:0.6rem;font-weight:400;',
                listTitle: $.t('common.item.equip') + $.t('common.name'),
                key: 'equipName',
                clickFun: '',
            },
        ],
        listStyle: 'background-color: rgb(19 56 101);',
        widgetPanelID: 'equipList' + modelObjId + 'panel',
        id: 'equipList' + modelObjId,
        widgetStyle: 'height:9rem;overflow:unset;',
        evenStyleInfo: 'background-color:rgba(33,126,214, 0.5);',
        oddStyleInfo: 'background-color:rgba(25,46,83, 0.6);',
        clickFun: 'bindEquipListClick',
        widgetCondition: [],
        widgetKey: 'equipList' + modelObjId + 'widget',
        listDateNode: '',
        clickParam: {modelObjId: modelObjId},
    };
    const listHtml = style_table_base('', listItemObj);
    html += listHtml;
    html += `</div>`
    $(buttonElement).append(html);
    registerArrayByType(0, 'bindEquip'+modelObjId+'Panel', 1);
    const panel = document.getElementById('bindEquip' + modelObjId + 'Panel');
    panel.addEventListener('wheel',function(event){event.stopPropagation();});
    panel.addEventListener('click',function(event){event.stopPropagation();panel.remove();});
    const nameInput = document.getElementById('bindEquip' + modelObjId + 'NameInput');
    nameInput.addEventListener('click',function(event){event.stopPropagation();$(nameInput).focus();});
    const idInput = document.getElementById('bindEquip' + modelObjId + 'IdInput');
    idInput.addEventListener('click',function(event){event.stopPropagation();$(idInput).focus();});
    const noInput = document.getElementById('bindEquip' + modelObjId + 'NoInput');
    noInput.addEventListener('click',function(event){event.stopPropagation();$(noInput).focus();});

    const button = document.getElementById('bindEquip' + modelObjId + 'Search');
    button.addEventListener('click',function(event){
        event.stopPropagation();
        const equipParam = {equipId: idInput.value || '', equipName: nameInput.value || '', equipNo: noInput.value || ''};
        const equipListPromise = getInterfaceData(dtvpApiServ + "/objectMap/api/getEqModelObjectList", equipParam);
        equipListPromise.then(result=>{
            style_table_base(result.data, listItemObj);
        });
    });
}

/**
 * @description 管线布局-模型组布局点击事件
 * @param {object} element 盒子元素
 * @param {array} desc 模型组名称
 * @param {array} value 模型组id
 * @return 无
 * @authors myf 2024-11-29
 */
function pipeModelGroupLayoutClick (element, desc, value) {
    if (!value[0]) {return;}
    if (!EquipLayoutConfig.pipelineTypeCode) {
        $.toast({msgtype:'info',content:$.t('layout.tip.selectPipeTypeFirst'),time:1000});
        triggerElementEvent($(element).attr('id'), 'click');
        return;
    }
    if (!PipeLineSystemForm.id) {
        $.toast({msgtype:'info',content:$.t('layout.tip.newPipelineSystemTip'),time:1000});
        triggerElementEvent($(element).attr('id'), 'click');
        return;
    }
    $.toast({msgtype:'info',content:$.t('layout.tip.clickAnywhere'),time:1000});
    EquipLayoutConfig.modelCreatedMode = true;
    EquipLayoutConfig.clickedRadioElement = element;
    // const checkboxDataStr = $(element).parent().parent().parent().attr('itemdata');
    // const checkboxData = JSON.parse(checkboxDataStr);
    const checkboxData = getPageData($(element).parent().parent().parent().attr('id'), 'itemdata'); // myf 20250102 html挂载数据改造
    const modelData = checkboxData.find(item=>item.id === value[0]);
    
    app.one('click', (ev)=>{
        ev.stopPropagation();
        modelData.position = CurSencceObj.worldToSelf(ev.pickedPosition);
        app.create({
            type: "Thing",
            id: 'mainModel' + modelData.code + new Date().getTime(),
            name: modelData.name,
            url: modelData.modelUrl,
            parent: CurSencceObj,
            localPosition: modelData.position,
            pickable: true,
            complete: function () {
                EquipLayoutConfig.useModelGroup = true;
                const mainModel = this;
                // mainModel.setAttribute("userData/bindEquipNo", modelData.equipNo || '');
                mainModel.setAttribute("userData/bindEquipNo", '');
                mainModel.setAttribute("userData/modelGroupEquipId", '');
                mainModel.setAttribute("userData/code", modelData.code);
                mainModel.setAttribute("userData/modelFlag", "layoutModel");
                mainModel.setAttribute("userData/type", "modelGroupModel");
                mainModel.setAttribute("userData/modelGroupType", "main");
                mainModel.setAttribute("userData/modelGroupId", modelData.id);
                mainModel.on('click',function(ev){
                    showModelPosition(mainModel.id);
                }, 'layoutModelClick');
                registerArrayByType(1, mainModel.id, 1);
                addThingDragEvent(mainModel);
                const modelListPromise = getInterfaceData(dtvpApiServ + "/modelGroupList/api/getModelGroupList", {hospitalId: BindSysUsers["Sys"]["HospitalID"], modelGroupId: value[0]});
                modelListPromise.then(modelListResult=>{
                    const modelListData = modelListResult.data;
                    modelListData.filter(item=>{return !!item.modelUrl}).forEach(item=>{
                        app.create({
                            id: 'chlidModel' + item.code + new Date().getTime(),
                            name: item.name,
                            url: item.modelUrl,
                            parent: mainModel,
                            localPosition: [item.posX - 0, item.posY - 0, item.posZ - 0],
                            angles: [item.rotateX - 0, item.rotateY - 0, item.rotateZ - 0],
                            scale: [item.scaleX - 0, item.scaleY - 0, item.scaleZ - 0],
                            pickable: true,
                            complete: function () {
                                // this.setAttribute("userData/bindEquipNo", modelData.equipNo || '');
                                this.setAttribute("userData/bindEquipNo", '');
                                this.setAttribute("userData/modelGroupEquipId", '');
                                this.setAttribute("userData/modelFlag", "layoutModel");
                                this.setAttribute("userData/type", "modelGroupModel");
                                this.setAttribute("userData/modelGroupType", "child");
                                this.setAttribute("userData/modelGroupId", modelData.id);
                                this.setAttribute("userData/modelGroupListId", item.id);
                                this.setAttribute('userData/createdBy', 'modelGroup');
                                this.on('click',function(ev){
                                    createModelOperaPanel(this);
                                }, 'layoutModelClick');
                                registerArrayByType(1, this.id, 1);
                            }
                        });
                    });
                });
                const pipeNodeIdMap = {};
                const pipeNodeFittingIdMap = {};
                const pipeInterfaceNodeIdMap = {};
                const hospitalId = BindSysUsers["Sys"]["HospitalID"];
                const hospitalAreaId = BindSysUsers["Sys"]["HospitalAreaID"];
                const buildingObjectId = getSceneIdByTpye('Building');
                const floorObjectId = getSceneIdByTpye('Floor');
                const pipelineSystemId = PipeLineSystemForm.id;
                const levelTypeId = CurSencceObj.level;
                const levelObjectId = CurSencceObj.id;
                const pipelineTypeCode = EquipLayoutConfig.pipelineTypeCode;
                const pipelineTypeId = EquipLayoutConfig.pipelineTypeId;

                const systemParam = {hospitalId: hospitalId, pipelineSystemId: modelData.pipelineSystemId, pipelineTypeId: '17'};
                const pipeSystemPromise = getInterfaceData(dtvpApiServ + "/pipelineSystem/api/getPipelineSystemList", systemParam);
                const fittingModels = getInterfaceData(dtvpApiServ + "/fittingModel/api/getFittingModel", {pipelineTypeId: '17'}, {async: false});
                pipeSystemPromise.then(pipeSystemResult=>{
                    const pipeSystemData = pipeSystemResult.data[0];
                    pipeSystemData.pipelineNodeList.forEach(node=>{
                        const nodeFittingModel = fittingModels.find(fitting=>{return fitting.id === node.fittingModelId});
                        const newFittingModel = PipeLineSystemForm.fittingModels.find(fitting=>{return fitting.modelId === nodeFittingModel.modelId && fitting.pipelineTypeId === pipelineTypeId});
                        if (newFittingModel) {
                            pipeNodeFittingIdMap[node.id] = newFittingModel.id;
                            node.fittingModelId = newFittingModel.id;
                            const curPipelineCatId = newFittingModel.pipelineCatId;
                            let nodeType = 0;
                            let nodeId = `T-PIPE-${pipelineTypeCode}-${levelObjectId}-${PipeLineSystemForm.pipelineNodeLength + 1}`;
                            if (curPipelineCatId === '6') {
                                nodeId = `T-WM-${pipelineTypeCode}-${levelObjectId}-${PipeLineSystemForm.pipelineWMLength + 1}`;
                                nodeType = 1;
                                PipeLineSystemForm.pipelineWMLength++;
                            } else if (curPipelineCatId === '7') {
                                nodeId = `T-EM-${pipelineTypeCode}-${levelObjectId}-${PipeLineSystemForm.pipelineEMLength + 1}`;
                                nodeType = 1;
                                PipeLineSystemForm.pipelineEMLength++;
                            } else {
                                PipeLineSystemForm.pipelineNodeLength++;
                            }
                            pipeNodeIdMap[node.id] = nodeId;
                            pipeInterfaceNodeIdMap[node.id + '01'] = nodeId + '01';
                            pipeInterfaceNodeIdMap[node.id + '02'] = nodeId + '02';
                            pipeInterfaceNodeIdMap[node.id + '03'] = nodeId + '03';
                            pipeInterfaceNodeIdMap[node.id + '04'] = nodeId + '04';
                            node.id = nodeId;
                            node.nodeType = nodeType;
                            node.levelTypeId = levelTypeId;
                            node.levelObjectId = levelObjectId;
                            const modelInfo = {
                                id: node.id,
                                url: newFittingModel.modelUrl,
                                localPosition: [node.posX - 0, node.posY - 0, node.posZ - 0],
                                name: node.name,
                                levelObjectId: mainModel.id,
                                rotation: [node.rotationX, node.rotationY, node.rotationZ] || [0,0,0],
                                savedFlag: false,
                                modelId: newFittingModel.id,
                                radius: newFittingModel.radius,
                                bendRadius: newFittingModel.bendRadius,
                                nodeType: node.nodeType,
                                inputType: node.inputType,
                                equipNo: node.id,
                                code: node.code,
                                createdBy: 'modelGroup',
                                clickPanel: 'operaPanel'
                            }
                            layoutCreateModelObj(modelInfo, true, {banDrag: true});
                            // app.create({
                            //     type: 'Thing',
                            //     id: node.id,
                            //     url: newFittingModel.modelUrl,
                            //     parent: mainModel,
                            //     localPosition: [node.posX - 0, node.posY - 0, node.posZ - 0],
                            //     name: node.name,
                            //     angles: [node.rotationX, node.rotationY, node.rotationZ] || [0,0,0],
                            //     scale: [1,1,1],
                            //     pickable: false,
                            //     complete: function () {
                            //         this.setAttribute("userData/modelFlag", "layoutModel");
                            //         registerArrayByType(1, this.id, 1);
                            //     }
                            // });
                            const localPosition = CurSencceObj.worldToSelf(mainModel.selfToWorld([node.posX - 0, node.posY - 0, node.posZ - 0]));
                            node.posX = localPosition[0];
                            node.posY = localPosition[1];
                            node.posZ = localPosition[2];
                            node.hospitalId = hospitalId;
                            node.hospitalAreaId = hospitalAreaId;
                            node.buildingObjectId = buildingObjectId;
                            node.floorObjectId = floorObjectId;
                            node.pipelineSystemId = pipelineSystemId;
                            node.createdBy = 'modelGroup';
                            PipeLineSystemForm.pipelineNodeList.push(node);
                        } else {
                            $.toast({msgtype:'info',content:`当前管线类型(id:${nodeFittingModel.pipelineTypeId})无模型组中管件模型：` + nodeFittingModel.name,time:1000});
                            return;
                        }
                    });
                    pipeSystemData.pipelineVOList.forEach(line=>{
                        const newPipelineModel = PipeLineSystemForm.pipelineModels.find(pipelineModel=>{return pipelineModel.pipelineTypeId === pipelineTypeId});
                        line.id = '';
                        line.hospitalId = hospitalId;
                        line.pipelineSystemId = pipelineSystemId;
                        line.buildingObjectId = buildingObjectId;
                        line.floorObjectId = floorObjectId;
                        line.pipelineTypeId = pipelineTypeId;
                        line.startNodeInterfaceId = pipeInterfaceNodeIdMap[line.startNodeInterfaceId];
                        line.endNodeInterfaceId = pipeInterfaceNodeIdMap[line.endNodeInterfaceId];
                        line.pipelineModelId = newPipelineModel ? newPipelineModel.id : '';
                        line.pipelineNodeInterfaceList.forEach(interface=>{
                            const newPipelineInterfaceModel = PipeLineSystemForm.fittingInterfaceModels.find(fittingInterfaceModel=>{return fittingInterfaceModel.fittingModelId === pipeNodeFittingIdMap[interface.pipelineNodeId]});
                            if (newPipelineInterfaceModel) {
                                interface.id = pipeInterfaceNodeIdMap[interface.id];
                                interface.hospitalId = hospitalId;
                                interface.pipelineNodeId = pipeNodeIdMap[interface.pipelineNodeId];
                                interface.linkPipelineId = '';
                                interface.fittingInterfaceModelId = newPipelineInterfaceModel.id;
                            }
                        });
                        PipeLineSystemForm.pipelineVOList.push(line);
                    });
                    refreshPipelineLinkedInterfaceObj();
                });
                
            }
        });
        EquipLayoutConfig.modelCreatedMode = false;
        triggerElementEvent($(element).attr('id'), 'click');
    }, 'pipeModelGroupLayoutClick');
    
}

/**
 * 保存管线布局
 * @returns 无
 * @author myf 2023-12-06
 */
function savePipeSystemClick () {
    const saveEquipMapDatas = [];
    let allEquipBind = true;
    const equipBindArr = [];
    if (EquipLayoutConfig.useModelGroup) {
        CurSencceObj.query(`["userData/type"="modelGroupModel"]`).objects.forEach(model=>{
            const equipNo = model.getAttribute('userData/bindEquipNo');
            // console.log('savePipeSystemClick', model, equipNo);
            // const equipName = model.getAttribute('userData/bindEquipName');
            if (!equipNo) {
                allEquipBind = false;
                equipBindArr.push(model);
            }
            const localPosition = CurSencceObj.worldToSelf(model.position);
            const data = {
                "hospitalId": BindSysUsers["Sys"]["HospitalID"],
                "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
                "equipNo": equipNo,
                "levelObjectId": CurSencceObj.id,
                "levelType": CurSencceObj.level,
                // "name": equipName || '',
                "modelType": 3,
                "modelUrl": model.url + '/' || '',
                "objectId": equipNo,
                "roomObjectId": '',
                "posX": localPosition[0].toString(),
                "posY": localPosition[1].toString(),
                "posZ": localPosition[2].toString(),
                "rotateX": model.angles[0].toString(),
                "rotateY": model.angles[1].toString(),
                "rotateZ": model.angles[2].toString(),
                "scaleX": (model.scale[0] / EquipLayoutConfig.zoom).toFixed(2).toString(),
                "scaleY": (model.scale[1] / EquipLayoutConfig.zoom).toFixed(2).toString(),
                "scaleZ": (model.scale[2] / EquipLayoutConfig.zoom).toFixed(2).toString(),
            };
            saveEquipMapDatas.push(data);
        });
    }
    if (!allEquipBind) {
        equipBindArr.forEach(model=>{
            setDefaultOutlineColor(model, 'red', 2);
        });
        $.toast({msgtype:'info',content:'请先给模型组模型绑定设备！',time:1000});
        return;
    }
    const savedIds = [];
    EquipLayoutConfig.layoutBackoutArr.forEach(layoutBackout=>{
        layoutBackout.targetObjIds.forEach(targetObjId=>{
            if (!savedIds.includes(targetObjId)) {
                savedIds.push(targetObjId);
            }
        });
    });
    console.log('PipeLineSystemFormsavePipeSystemClick',PipeLineSystemForm);
    $.confirm({msgtype:'info',title:$.t('common.tip'),content:`${savedIds.length ? '本次改动内容:(' + savedIds.length + ')条\n' + savedIds.join('\n') + '。\n' : ''}是否要保存布局？`,confirmText:$.t('common.operation.save'),cancelText:$.t('common.operation.cancel')}, ()=>{
        addLoadingMaskPanel('eq-dialog-confirm');
        if (saveEquipMapDatas.length) {
            postInterfaceData(dtvpApiServ + "/objectMap/api/saveObjectMapList", saveEquipMapDatas, {contentType: "application/json;charset=utf-8"});
        }
        const paraStr = JSON.stringify(PipeLineSystemForm);
        const result = getDataByAjax(dtvpApiServ,"pipelineSystem/api","savePipelineSystemList",paraStr,"","post","json","","application/json;charset=utf-8",false);
        if (result) {
            $.toast({msgtype:'info',content:'保存成功！',time:1000});
            if (EquipLayoutConfig.code === 'pipeline') {
                setTimeout(()=>{
                    // const pipelineTypeStr = $($(`[id*=pipelineTypeRadio]`)[1]).attr('valuekey');
                    // const pipelineTypeData = JSON.parse(pipelineTypeStr);
                    const pipelineTypeData = getPageData($($(`[id*=pipelineTypeRadio]`)[1]).attr('id'), 'valuekey'); // myf 20250102 html挂载数据改造
                    initPipeData ('', '', pipelineTypeData);
                },5000);
            } else if (EquipLayoutConfig.code === 'model-group-pipeline') {
                const mainModelObj = app.query('#' + EquipLayoutConfig.mainModelObjId)[0];
                mainModelObj.setAttribute('userData/pipelineSystemId', EquipLayoutConfig.mainModelId);
                goBackModelGroupLayout();
                saveModelGroup();
                removeLoadingMaskPanel('eq-dialog-confirm');
            }
        } else {
            removeLoadingMaskPanel('eq-dialog-confirm');
            $.toast({msgtype:'info',content:'保存失败！',time:1000});
        }
    });
}

/**
  * 管件布局-模型组模型盒子数据
  * @param {array} interfaceData 接口数据
  * @param {object} widgetObj 部件对象
  * @returns 筛选后数据
  * @author myf 2024-11-26
  */
function pipelineModelGroupFilterData (interfaceData, widgetObj) {
    interfaceData = interfaceData.filter(modelGroup=>{return !!modelGroup.pipelineSystemId;});
    interfaceData = layoutModelCheckboxImgData(interfaceData, widgetObj);
    return interfaceData;
}

/**
  * 管件布局-切换管件模型盒子
  * @param {object} btnElement 按钮元素
  * @param {object} userParams 自定义参数（事件参数）
  * @returns 无
  * @author myf 2024-11-26
  */
function pipelineLayoutSwitchFittingRadio (btnElement, userParams) {
    EquipLayoutConfig.pipeModelRadioMode = userParams.to;
    quitLayoutCreatedMode();
    if (userParams.to === 'modelGroup') {
        // EquipLayoutConfig.pipeModelRadioMode = 'modelGroup';
        $(btnElement).parent().parent().css('display', 'none');
        $(btnElement).parent().parent().parent().next().children().eq(0).css('display', 'block');
    } else {
        // EquipLayoutConfig.pipeModelRadioMode = 'fitting';
        $(btnElement).parent().parent().css('display', 'none');
        $(btnElement).parent().parent().parent().prev().children().eq(0).css('display', 'block');
    }
}

/**
  * 模型组布局-返回模型组布局
  * @returns 无
  * @author myf 2024-11-22
  */
function goBackModelGroupLayout () {
    $('[id*=model-group-layout][data-role=root]').css('display', 'block');
    $('[id*=model-group-pipeline-layout][data-role=root]').remove();

    EquipLayoutConfig.code = 'model-group';
    app.query('["name"="pipelinePlan"]').destroyAll();
    app.query('["name"="pipelineSaved"]').destroyAll();
    $(`[id*=T-PIPE]`).remove();
    $(`[id*=T-WM]`).remove();
    $(`[id*=T-EM]`).remove();
    destroyFluidFlow();
    $(`#layoutPositionPanel`).remove();
}

/**
  * 模型组布局-添加管件模型
  * @returns 无
  * @author myf 2024-11-22
  */
function addModelGroupPipelineNode () {
    if (!EquipLayoutConfig.mainModelId) {
        $.toast({msgtype:'info',content:$.t('layout.tip.selectModelGroupFirst'),time:1000});
        return;
    }
    if (EquipLayoutConfig.newModelGroup) {
        $.toast({msgtype:'info',content:$.t('layout.tip.selectMainModelFirst'),time:1000});
        return;
    }
    if (!EquipLayoutConfig.mainModelObjId) {
        $.toast({msgtype:'info',content:$.t('layout.tip.placeMainModelFirst'),time:1000});
        return;
    }
    $('[id*=model-group-layout][data-role=root]').css('display', 'none');

    EquipLayoutConfig.code = 'model-group-pipeline';
    pageLoad('model-group-pipeline-layout',1);
}

/**
 * @description 布局时展示其他楼层
 * @return 无
 * @authors myf 2024-11-08
 */
function layoutSceneSetting () {
    const buildingId = getSceneIdByTpye('Building');
    const curBuildingObj = app.query('#'+buildingId)[0];
    if (!curBuildingObj || curBuildingObj.type !== 'Building') {
        return;
    }
    curBuildingObj.floors.objects.forEach(floor=>{
        floor.visible = true;
    });
}

/**
 * @description 布局时隐藏楼层
 * @param {string} floorId 楼层对象id
 * @return 无
 * @authors myf 2024-11-08
 */
function showLayoutFloor (floorId) {
    const floor = app.query('#' + floorId)[0];
    floor.visible = false;
}


/**
 * @interface
 * @description 刷新管线节点位置数据
 * @params {string} modelId 节点id
 * @return {void} 无
 * @author myf 2023-12-11
 */
function refreshPipelineNodeData (modelId) {
    const foundPipelineNode = PipeLineSystemForm.pipelineNodeList.find(item=>{return item.id === modelId});
    if (foundPipelineNode) {
        const curModel = app.query('#'+modelId)[0];
        let curPipeNodePosition = curModel.localPosition.map(pos=>{
            return pos.toFixed(2);
        });
        // 模型组的管件子模型位置处理 myf 20241216
        if (curModel.getAttribute('userData/createdBy') === 'modelGroup') {
            const levelObject = app.query('#' + foundPipelineNode.levelObjectId)[0];
            curPipeNodePosition = levelObject.worldToSelf(curModel.position);
            curPipeNodePosition = curPipeNodePosition.map(pos=>{
                return pos.toFixed(2);
            });
        }
        foundPipelineNode.posX = curPipeNodePosition[0] + '';
        foundPipelineNode.posY = curPipeNodePosition[1] + '';
        foundPipelineNode.posZ = curPipeNodePosition[2] + '';
        foundPipelineNode.rotationX = curModel.angleX;
        foundPipelineNode.rotationY = curModel.angleY;
        foundPipelineNode.rotationZ = curModel.angleZ;
        foundPipelineNode.rotationAngle = JSON.stringify([curModel.angleX, curModel.angleY, curModel.angleZ]);
        foundPipelineNode.fittingModelId = curModel.getAttribute('userData/modelId');
    }
}

/**
 * 刷新管线已连接接口对象
 * @returns 无
 * @author myf 2023-12-06
 */
function refreshPipelineLinkedInterfaceObj() {
    const linkedInterfaceObj = {};
    PipeLineSystemForm.pipelineVOList.forEach(line=>{
        // const foundInterface = line.pipelineNodeInterfaceList.find(item=>item.pipelineNodeId === curModel.id);
        // if (foundInterface) {
            
        // }
        line.pipelineNodeInterfaceList.forEach(interface=>{
            linkedInterfaceObj[interface.pipelineNodeId] ? linkedInterfaceObj[interface.pipelineNodeId].push(interface.name) : linkedInterfaceObj[interface.pipelineNodeId] = [interface.name];
        });
    });
    PipeLineSystemForm.linkedInterfaceObj = linkedInterfaceObj;
}
/**
 * 刷新管线已规划的连接管线位置
 * @param modelId 模型id
 * @returns 无
 * @author myf 2023-12-06
 */
function refreshPipelinePlan (modelId) {

    // const pipelinePlans = app.query(`["id"*="${modelId}"]`);
    const pipelinePlans = app.query(`pipelinePlan`);
    
    const curPipelinePlans = pipelinePlans.objects.filter(item=>item.id.includes(modelId));
    const startNodeLines = PipeLineSystemForm.pipelineVOList.filter(item=>item.startNodeInterfaceId.includes(modelId));
    const endNodeLines = PipeLineSystemForm.pipelineVOList.filter(item=>item.endNodeInterfaceId.includes(modelId));
    // console.log('刷新正在规划中的管线',curPipelinePlans, startNodeLines, endNodeLines);
    // PipeLineSystemForm.pipelineVOList.forEach(line=>{
    //     curPipelinePlans.forEach(plan=>{
    //         // if (line.startNodeInterfaceId.includes(plan.id)) {

    //         // }
    //         if (plan.id.includes(line.startNodeInterfaceId) && line.startNodeInterfaceId.includes(modelId)) {
    //             // line.points[0] = 
    //             console.log('刷新正在规划中的管线',plan);
    //         }
    //     });
    // });
}

/**
 * @authors myf
 * @date    2024-09-30
 * @description 进入路径规划
 * @return 无
 */
function enterPathLayout () {
    $('[id*=guide-anime-edit][data-role=root]').css('visibility', 'hidden');
    $('[id*=guide-anime-set][data-role=root]').css('visibility', 'hidden');
    EquipLayoutConfig.name = '路径规划';
    EquipLayoutConfig.code = 'path';
    EquipLayoutConfig.getDataSourceId = '';
    EquipLayoutConfig.modelType = '';
    // CurOperateMenu.name = 'path-layout';
    pageLoad('path-layout',1);
    enterLayoutMode();

    EquipLayoutConfig.quitLayoutCallFunction = ()=>{
        $('[id*=guide-anime-edit][data-role=root]').css('visibility', 'visible');
        $('[id*=guide-anime-set][data-role=root]').css('visibility', 'visible');
        const data = getInterfaceData (dtvpApiServ + "/innerPath/api/getInnerPathList", {planPathType: 3, hospitalId: BindSysUsers["Sys"]["HospitalID"], hospitalAreaId: BindSysUsers["Sys"]["HospitalAreaID"]});
        data.then(result=>{
            const paths = result.data.map(item=>{
                return {
                    id: item.innerPath.id,
                    name: item.innerPath.name
                }
            });
            $('#guideAnimationFunctionParamsmovepathid').html('');
            const selectConfig = {
                parentElementId: 'guideAnimationFunctionParamsmovepathid',
                selectId: 'guideAnimationPathSelector',
                optionData: paths,
                optionText: 'name',
                optionValue: 'id',
                isMultiple: false,
                selectStyle: 'border:none;background:none;padding: 0 0 0 0.5rem;',
                clickCallFun: '',
                defaultFlag: '',
                placeholder: $.t('layout.pleaseSelect'),
                optionStyle: '',
                optionListStyle: '',
                levelType: ''
            }
            createNormalOptions(selectConfig);
        });
    }
}


/**
 * @authors myf
 * @date    2024-09-18
 * @description 路径布局功能切换按钮
 * @param {object} btnElement 按钮元素
 * @param {string} type 功能类型
 * @return 无
 */
function pathLayoutShowBtn (btnElement, type) {
    if ($(btnElement).hasClass('path-layout-toolbar-checkbox-checked')) {
        $('#layoutPositionPanel').attr('pathLayoutLastMenu', '');
        return;
    } else {
        $('.path-layout-toolbar-checkbox-checked').removeClass('path-layout-toolbar-checkbox-checked');
        $(btnElement).addClass('path-layout-toolbar-checkbox-checked');
        if (type === 'pathPoint') {
            $('#layoutPositionPanel').attr('pathLayoutLastMenu', 'pathPoint');
            $('#pathLayoutPathPointPanel').css('display', 'block');
            $('#pathLayoutInfoPointPanel').css('display', 'none');
        } else if (type === 'infoPoint') {
            $('#layoutPositionPanel').attr('pathLayoutLastMenu', 'infoPoint');
            $('#pathLayoutPathPointPanel').css('display', 'none');
            $('#pathLayoutInfoPointPanel').css('display', 'block');
        }
    }
}

/**
 * @authors myf
 * @date    2024-05-06
 * @description 跨楼层管线连接点击事件
 * @param {Object} button 按钮
 * @return 无
 */
function overFloorPipeLinkFloorSelect (button) {
    event.stopPropagation();
    if (EquipLayoutConfig.isOverFloorLinkMode) {
        EquipLayoutConfig.isOverFloorLinkMode = false;
        CurSencceObj.visible = true;
        app.query('.Floor').objects.forEach(floor=>{
            floor.showAllRoofs(false);
        });
        if (CurSencceObj.type === 'Building') {
            CurSencceObj.facade.visible = false;
        }
        $('[id*=overFloorTopCard]').remove();
        $('#overFloorPipeLinkFloorSelectRadioDiv').remove();
        app.query('["userData/overFloor"="true"]').style.defaultOutlineColor = null;
        app.query('["userData/overFloor"="true"]').objects.forEach(node=>{
            deletePipelineNodeModelAppend(node);
        });
    } else {
        EquipLayoutConfig.isOverFloorLinkMode = true;
        CurSencceObj.visible = false;
        app.query('.Floor').objects.forEach(floor=>{
            floor.visible = false;
        });
        const buildingId = getSceneIdByTpye('Building');
        const curBuildingObj = app.query('#'+buildingId)[0];
        if (!curBuildingObj || curBuildingObj.type !== 'Building') {
            return;
        }
        const radioConfig = {
            divId: '',
            checkboxId: 'overFloorPipeLinkFloorSelectRadio',
            data: curBuildingObj.floors.objects,
            dataDesc: 'id',
            dataValue: 'id',
            isRadio: false,
            clickFun: 'pipelineOverFloorLink',
            levelType: 2,
            clickFunParam: ''
        };
        let html = `<div id="overFloorPipeLinkFloorSelectRadioDiv" style="padding:0.5rem;position:absolute;background:##345990d1;z-index:1;">`;
        html += createNormalCheckbox(radioConfig);
        html += `</div>`;
        $(button).html(html);
    }
}

/**
 * @authors myf
 * @date    2024-08-23
 * @description 创建顶牌展示管件半径
 * @param {object} buttonElement 按钮元素
 * @return 无
 */
function showPipeRadius (buttonElement) {
    if (EquipLayoutConfig.showPipeRadius) {
        $(buttonElement).css('border','');
        EquipLayoutConfig.showPipeRadius = false;
        $('[name=showPipeRadius]').remove();
    } else {
        $(buttonElement).css('border','2px solid #fff');
        EquipLayoutConfig.showPipeRadius = true;
        $('[name=modelOperaPanel]').remove();
        app.query(`["userData/modelFlag"="layoutModel"]`).objects.forEach(obj=>{
            const html = `<div style="width:6rem;height:2rem;color:#fff;font-size:0.8rem;background-color:#00CC997f;line-height:2rem;text-align:center;">${obj.name}</div>`;
            const panelInfo = {panelPosition:[0,0,0],panelId:'',panelPivot:[0,0],levelType:1, isDestroyParent:false, hasLine: false, panelClassName:`name='showPipeRadius'`};
            createCommonTopCard(obj,html,panelInfo);
        });
    }
}

/**
 * @authors myf
 * @date    2024-08-22
 * @description 刷新模型组radio
 * @param {string} code 模型code
 * @return 无
 */
function resfreshModelGroupRadio (code) {
    const modelGroupData = getInterfaceData (dtvpApiServ + "/modelGroup/api/getModelGroupList", {hospitalId: BindSysUsers["Sys"]["HospitalID"]});
    modelGroupData.then(result=>{
        const radioId = $('[id*=model-group-layout][data-role=root] [id*=modelGroupRadio][id*=Checkbox]').attr('id');
        refreshWidgetRadio(radioId, result.data);
        if (code) {
            const checkboxId = $(`[title='${code}']`).attr('id');
            triggerElementEvent(checkboxId, 'click');
            $(`[title='${code}']`).parent().parent().parent().scrollTop($(`[title='${code}']`).position().top);
        }
    });
}

/**
 * @authors myf
 * @date    2024-08-21
 * @description 删除模型组
 * @param {string} modelId 模型id
 * @return 无
 */
function deleteModelGroup (modelId) {
    let promiseArr = [];
    const deleteGroupUrl = dtvpApiServ + "/modelGroup/api/deleteModelGroup";
    const deleteListUrl = dtvpApiServ + "/modelGroupList/api/deleteModelGroupList";
    if (modelId === EquipLayoutConfig.mainModelObjId) {
        // 主模型
        const childModelIds = app.query(`["userData/mainModelId"="${EquipLayoutConfig.mainModelId}"]`).objects.map(item=>{return item.getAttribute('userData/childModelId');});
        const childModelIdStr = childModelIds.join(',');
        
        promiseArr.push(getInterfaceData (deleteGroupUrl, {ids: EquipLayoutConfig.mainModelId}));
        promiseArr.push(getInterfaceData (deleteListUrl, {ids: childModelIdStr}));
    } else {
        const childModelObj = app.query('#' + modelId)[0];
        promiseArr.push(getInterfaceData (deleteListUrl, {ids: childModelObj.getAttribute('userData/childModelId')}));
    }
    Promise.all(promiseArr).then((datas)=>{
        if (datas.every(item=>{return !!item.success})) {
            $.toast({msgtype:'info',content:$.t('layout.tip.deleteSuccess'),time:1000});
            if (modelId === EquipLayoutConfig.mainModelObjId) {
                app.query(`["userData/modelFlag"="layoutModel"]`).destroyAll();
                resfreshModelGroupRadio();
            } else {
                app.query(`#` + modelId).destroy();
            }
        } else {
            $.toast({msgtype:'info',content:$.t('layout.tip.deleteFail'),time:1000});
        }
    });
}

/**
 * @authors myf
 * @date    2024-08-20
 * @description 保存模型组
 * @return 无
 */
function saveModelGroup () {
    const mainModelObj = app.query('#' + EquipLayoutConfig.mainModelObjId)[0];
    if (mainModelObj) {
        const promiseArr = [];
        // if (!mainModelObj) { return; }
        // console.log('shenmewentia', Array.from(mainModelObj.children))
        const hasPipeNode = mainModelObj.children.some((child)=>{return child.id.includes('T-PIPE')});
        const pipelineSystemId = mainModelObj.getAttribute('userData/pipelineSystemId')
        if (hasPipeNode && !pipelineSystemId) {
            savePipeSystemClick();
            const paraStr = JSON.stringify(PipeLineSystemForm);
            const result = getDataByAjax(dtvpApiServ,"pipelineSystem/api","savePipelineSystemList",paraStr,"","post","json","","application/json;charset=utf-8",false);
            if (result) {
                // $.toast({msgtype:'info',content:'保存成功！',time:1000});
                const mainModelObj = app.query('#' + EquipLayoutConfig.mainModelObjId)[0];
                mainModelObj.setAttribute('userData/pipelineSystemId', EquipLayoutConfig.mainModelId);
                saveModelGroup();
                return;
            } else {
                $.toast({msgtype:'info',content:'保存失败！',time:1000});
                return;
            }
        }
        const data = {
            "id": EquipLayoutConfig.mainModelId,
            "code": mainModelObj.getAttribute('userData/code'),
            "pipelineSystemId": mainModelObj.getAttribute('userData/pipelineSystemId'),
            "hospitalId": BindSysUsers["Sys"]["HospitalID"],
            "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
            "modelUrl": mainModelObj.url + '/',
            "name": mainModelObj.name
        }
        if (data.code.includes('newModel')) {
            $.toast({msgtype:'info',content:$.t('layout.tip.modifyModelGroupCode'),time:1000});
            return;
        }
        // const para = JSON.stringify(data);
        // getDataByAjax(dtvpApiServ,"modelGroup/api","saveModelGroupPage",para,"","post","json","","application/json;charset=utf-8",false);
        promiseArr.push(postInterfaceData(dtvpApiServ + "/modelGroup/api/saveModelGroupPage", data, {contentType: "application/json;charset=utf-8"}));
        saveEquipPositionChange(mainModelObj);
        const saveModelData = [];
        app.query(`["userData/mainModelId"="${EquipLayoutConfig.mainModelId}"]`).objects.some(object=>{
            if (object.id === EquipLayoutConfig.mainModelObjId) {
                return;
            }
            const modelData = {
                id: object.getAttribute('userData/childModelId') || '',
                hospitalId: BindSysUsers["Sys"]["HospitalID"],
                "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
                name: object.name,
                code: object.getAttribute('userData/code'),
                modelUrl: object.url + '/',
                modelGroupId: EquipLayoutConfig.mainModelId,
                posX: object.localPosition[0].toFixed(2),
                posY: object.localPosition[1].toFixed(2),
                posZ: object.localPosition[2].toFixed(2),
                rotateX: object.angles[0].toFixed(2),
                rotateY: object.angles[1].toFixed(2),
                rotateZ: object.angles[2].toFixed(2),
                scaleX: object.scale[0].toFixed(2),
                scaleY: object.scale[1].toFixed(2),
                scaleZ: object.scale[2].toFixed(2),
                eqmodel: object.getAttribute('userData/eqmodel')
            }
            saveModelData.push(modelData);
            // const modelPara = JSON.stringify(modelData);
            // getDataByAjax(dtvpApiServ,"modelGroupList/api","saveModelGroupListPage",modelPara,"","post","json","","application/json;charset=utf-8",false);
            promiseArr.push(postInterfaceData(dtvpApiServ + "/modelGroupList/api/saveModelGroupListPage", modelData, {contentType: "application/json;charset=utf-8"}));
            saveEquipPositionChange(object);
        });
        
        Promise.all(promiseArr).then((datas)=>{
            if (datas.every(item=>{return !!item.success})) {
                $.toast({msgtype:'info',content:$.t('layout.tip.saveSuccess'),time:1000});
                app.query(`["userData/modelFlag"="layoutModel"]`).destroyAll();
                // const modelGroupData = getInterfaceData (dtvpApiServ + "/modelGroup/api/getModelGroupList", {hospitalId: BindSysUsers["Sys"]["HospitalID"]});
                // modelGroupData.then(result=>{
                //     const radioId = $('[id*=model-group-layout][data-role=root] [id*=modelGroupRadio][id*=Checkbox]').attr('id');
                //     refreshWidgetRadio(radioId, result.data);
                // });
                resfreshModelGroupRadio();
            } else {
                $.toast({msgtype:'info',content:$.t('layout.tip.saveFail'),time:1000});
            }
        });
    } else {
        // 没有主模型
        $.toast({msgtype:'info',content:$.t('layout.tip.selectMainModelFirst'),time:1000});
    }
}

/**
 * @authors myf
 * @date    2024-08-16
 * @description 让该模型成为主模型
 * @param {string} modelId 模型id
 * @return 无
 */
function becomeMainModel (modelId) {
    const modelObj = app.query('#' + modelId)[0];
    if (modelObj) {
        modelObj.setAttribute('userData/isMain', true);
        EquipLayoutConfig.newModelGroup = false;
        showModelPosition(modelId);
        EquipLayoutConfig.mainModelObjId = modelId;
        app.query(`["userData/mainModelId"="${EquipLayoutConfig.mainModelId}"]`).objects.some(object=>{
            if (object.id === modelId) {
                return;
            }
            const localPosition = modelObj.worldToSelf(object.position);
            const modelData = {
                id: object.id,
                name: object.name,
                code: object.getAttribute('userData/code'),
                levelObjectId: modelId,
                url: object.url,
                localPosition: localPosition,
                angles: object.angles,
                scale: object.scale,
                // modelId: object.getAttribute('userData/modelId'),
                mainModelId: EquipLayoutConfig.mainModelId
            }
            layoutCreateModelObj(modelData);
        });
    }
}

/**
 * @authors myf
 * @date    2024-08-15
 * @description 选择这个模型的主模型
 * @return 无
 */
function selectMainModel (modelObjId) {
    // if (EquipLayoutConfig.code === 'area') {
    //     if (!EquipLayoutConfig.mainModelObjId) { return; }
    //     showModelPosition(EquipLayoutConfig.mainModelObjId);
    // } else {
    //     const modelObj = app.query('#' + modelObjId)[0];
    //     if (!modelObj) {return;}
    //     const lineId = modelObj.parent.id;
    //     showModelPosition(lineId);
    // }
    const modelObj = app.query('#' + modelObjId)[0];
    if (!modelObj) {return;}
    const lineId = modelObj.parent.id;
    showModelPosition(lineId);
}

/**
 * @authors myf
 * @date    2024-08-15
 * @description 模型组布局明细radio点击
 * @param {object} element 被点击元素
 * @param {string} desc 描述
 * @param {string} value 值
 * @return 无
 */
function modelGroupListLayoutClick (element, desc, value) {
    if (!value[0]) {return}
    if (!EquipLayoutConfig.mainModelId) {
        triggerElementEvent($(element).attr('id'), 'click');
        $.toast({msgtype:'info',content:$.t('layout.tip.selectModelGroupFirst'),time:1000});
        return;
    }
    $.toast({msgtype:'info',content:$.t('layout.tip.clickAnywhere'),time:1000});
    // const checkboxDataStr =  $(element).parent().parent().parent().attr('itemdata');
    // const checkboxData = checkboxDataStr ? JSON.parse(checkboxDataStr) : [];
    const checkboxData = getPageData($(element).parent().parent().parent().attr('id'), 'itemdata'); // myf 20250102 html挂载数据改造
    const curModelData = checkboxData.find(item=>{return item.id === value[0]});
    if (curModelData) {
        let modelInfo = {
            id: 'newModel' + new Date().getTime(),
            code: 'newModel' + new Date().getTime(),
            url: curModelData.modelUrl,
            name: curModelData.name,
            levelObjectId: EquipLayoutConfig.newModelGroup ? CurSencceObj.id : EquipLayoutConfig.mainModelObjId,
            // modelId: curModelData.id,
            mainModelId: EquipLayoutConfig.mainModelId
        }
        clickFloorCreateModelEvent(modelInfo, element, true);
    }
}

/**
 * @authors myf
 * @date    2024-08-15
 * @description 创建模型组主模型
 * @param {object} modelData ，模型数据
 * @return 无
 */
function createModelGroupMainModel (modelData) {
    const promise = new Promise(resolve=>{
        app.create({
            type: "Thing",
            id: 'mainModel' + modelData.code,
            name: modelData.name,
            url: modelData.modelUrl,
            parent: CurSencceObj,
            localPosition: modelData.position,
            pickable: true,
            complete: function () {
                this.setAttribute("userData/isMain", true);
                this.setAttribute("userData/code", modelData.code);
                this.setAttribute("userData/modelFlag", "layoutModel");
                this.on('click',function(ev){
                    showModelPosition(this.id);
                }, 'layoutModelClick');
                registerArrayByType(1, this.id, 1);
                addThingDragEvent(this);
                resolve(this);
            }
        });
    });
    return promise;
}

/**
 * @authors myf
 * @date    2024-08-14
 * @description 模型组布局radio点击
 * @param {object} element 被点击元素
 * @param {string} desc 描述
 * @param {string} value 值
 * @return 无
 */
function modelGroupLayoutClick (element, desc, value) {
    // const checkboxDataStr = $(element).parent().parent().parent().attr('itemdata');
    // const checkboxData = JSON.parse(checkboxDataStr);
    const checkboxData = getPageData($(element).parent().parent().parent().attr('id'), 'itemdata'); // myf 20250102 html挂载数据改造

    const modelData = checkboxData.find(item=>item.id === value[0]);
    if (modelData) {
        app.query(`["userData/modelFlag"="layoutModel"]`).destroyAll();
        $('#layoutPositionPanel').remove();
        app.off('click', null, 'modelGroupLayoutClick');
        EquipLayoutConfig.mainModelId = modelData.id;
        EquipLayoutConfig.mainModelObjId = '';
        if (modelData.code.includes('newGroup')) {
            EquipLayoutConfig.newModelGroup = true;
            initPipeData('', '', '', EquipLayoutConfig.mainModelId);
        } else {
            $.toast({msgtype:'info',content:'点击任意地点创建模型组',time:1000});
            EquipLayoutConfig.newModelGroup = false;
            const modelListData = getDataByAjax(dtvpApiServ,"modelGroupList/api","getModelGroupList",`hospitalId=${BindSysUsers["Sys"]["HospitalID"]}&modelGroupId=${value[0]}`,"","get","json","","",false);
            app.one('click', (ev)=>{
                ev.stopPropagation();
                modelData.position = CurSencceObj.worldToSelf(ev.pickedPosition);
                const promise = createModelGroupMainModel(modelData);
                promise.then((mainModel)=>{
                    EquipLayoutConfig.mainModelObjId = 'mainModel' + modelData.code;
                    modelListData.filter(item=>{return !!item.modelUrl}).forEach(item=>{
                        const chlidModelData = {
                            id: 'chlidModel' + item.code,
                            name: item.name,
                            code: item.code,
                            levelObjectId: mainModel.id,
                            url: item.modelUrl,
                            localPosition: [item.posX - 0, item.posY - 0, item.posZ - 0],
                            angles: [item.rotateX - 0, item.rotateY - 0, item.rotateZ - 0],
                            scale: [item.scaleX - 0, item.scaleY - 0, item.scaleZ - 0],
                            // modelId: curModelData.id,
                            mainModelId: EquipLayoutConfig.mainModelId,
                            childModelId: item.id,
                            eqmodel: item.eqmodel
                        }
                        layoutCreateModelObj(chlidModelData);
                    });
                    initPipeData('', '', '', EquipLayoutConfig.mainModelId);
                });
            }, 'modelGroupLayoutClick');
        }
    } else {
        EquipLayoutConfig.mainModelId = '';
        EquipLayoutConfig.mainModelObjId = '';
    }
}

/**
 * @authors myf
 * @date    2024-08-14
 * @description 创建模型组布局
 * @return 无
 */
function createModelGroupLayout () {
    const code = "newGroup" + new Date().getTime();
    const data = {
        "code": code,
        "hospitalId": BindSysUsers["Sys"]["HospitalID"],
        "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
        "modelUrl": "",
        "name": code
    }
    const para = JSON.stringify(data);
    getDataByAjax(dtvpApiServ,"modelGroup/api","saveModelGroupPage",para,"","post","json","","application/json;charset=utf-8",false);
    // pageLoad('model-group-layout', 1);
    // const modelGroupData = getInterfaceData (dtvpApiServ + "/modelGroup/api/getModelGroupList", {hospitalId: BindSysUsers["Sys"]["HospitalID"]});
    // modelGroupData.then(result=>{
    //     const radioId = $('[id*=model-group-layout][data-role=root] [id*=modelGroupRadio][id*=Checkbox]').attr('id');
    //     refreshWidgetRadio(radioId, result.data);
    //     const checkboxId = $(`[title='${code}']`).attr('id');
    //     triggerElementEvent(checkboxId, 'click');
    //     $(`[title='${code}']`).parent().parent().parent().scrollTop($(`[title='${code}']`).position().top);
    // });
    resfreshModelGroupRadio(code);
    
    
    // $(`[title='${code}']`).parent().parent().animate({
    //     scrollTop: $(`[title='${code}']`).position().top + $(`[title='${code}']`).parent().parent().scrollTop()
    // }, 500); // 500 毫秒的动画时间
}

/**
 * @authors myf
 * @date    2024-08-14
 * @description 删除区域数据
 * @param {object} areaId 区域id
 * @return 无
 */
function deleteAreaData (areaId) {
    const areaObj = app.query('#' + areaId)[0];
    if (areaObj) {
        const tableId = areaObj.getAttribute('userData/tableId');
        const returnData = getDataByAjax(dtvpApiServ,"innerPoiArea/api","deletedInnerPoiArea","id=" + tableId,"","get","json","","application/x-www-form-urlencoded",false);
        if (!returnData) {
            $.toast({msgtype:'info',content:$.t('layout.tip.deleteFail'),time:1000});
            return;
        } else {
            $.toast({msgtype:'info',content:$.t('layout.tip.deleteSuccess'),time:1000});
            areaObj.destroy();
            loadAreaModel();
        }
    }
}

/**
 * @authors myf
 * @date    2024-08-14
 * @description 刷新区域模型数据
 * @param {object} areaObj 区域模型3D对象
 * @return 无
 */
function refreshAreaModelData (modelObj) {
    if (!modelObj || EquipLayoutConfig.code !== 'area') {return;}
    const areaId = modelObj.getAttribute('userData/areaId');
    const curLayoutData = EquipLayoutConfig.areaLayoutData.find(item=>{return item.objectId === areaId});
    if (curLayoutData) {
        const curModelData = curLayoutData.areaModel.find(item=>{return item.id === modelObj.id});
        if (curModelData) {
            curModelData.modelUrl = modelObj.url;
            curModelData.posX = modelObj.localPosition[0].toFixed(2);
            curModelData.posY = modelObj.localPosition[1].toFixed(2);
            curModelData.posZ = modelObj.localPosition[2].toFixed(2);
            curModelData.rotateX = modelObj.angles[0].toFixed(2);
            curModelData.rotateY = modelObj.angles[1].toFixed(2);
            curModelData.rotateZ = modelObj.angles[2].toFixed(2);
            curModelData.scaleX = modelObj.scale[0];
            curModelData.scaleY = modelObj.scale[1];
            curModelData.scaleZ = modelObj.scale[2];
        } else {
            const newModelData = {
                "hospitalId": BindSysUsers["Sys"]["HospitalID"],
                "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
                "id": modelObj.id,
                "levelObjectId": CurSencceObj.id,
                "levelType": CurSencceObj.level,
                "modelUrl": modelObj.url,
                "placeId": "",
                "posX": modelObj.localPosition[0].toFixed(2),
                "posY": modelObj.localPosition[1].toFixed(2),
                "posZ": modelObj.localPosition[2].toFixed(2),
                "rotateX": modelObj.angles[0].toFixed(2),
                "rotateY": modelObj.angles[1].toFixed(2),
                "rotateZ": modelObj.angles[2].toFixed(2),
                "scaleX": modelObj.scale[0],
                "scaleY": modelObj.scale[1],
                "scaleZ": modelObj.scale[2],
            }
            curLayoutData.areaModel.push(newModelData);
        }
    }
}

/**
 * @authors myf
 * @date    2024-08-13
 * @description 刷新区域数据
 * @param {object} areaObj 区域3D对象
 * @return 无
 */
function refreshAreaData (areaObj) {
    if (!areaObj || EquipLayoutConfig.code !== 'area') {return;}
    const isArea = areaObj.getAttribute('userData/isArea');
    if (!isArea) {return;}
    // const placeId = areaObj.id.includes('area') ? '' : areaObj.id;
    const areaVertices = areaObj.points.map((item, index)=>{
        const localPosition = CurSencceObj.worldToSelf(item);
        return {
            "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
            "hospitalId": BindSysUsers["Sys"]["HospitalID"],
            "id": "",
            "placeId": '',
            "posX": localPosition[0].toFixed(2),
            "posY": localPosition[1].toFixed(2),
            "posZ": localPosition[2].toFixed(2),
            "remark": "",
            "verticesIndex": index
        }
    });
    const curLayoutData = EquipLayoutConfig.areaLayoutData.find(item=>{return item.objectId === areaObj.id});
    if (curLayoutData) {
        curLayoutData.description = areaObj.getAttribute('userData/description');
        curLayoutData.place = areaObj.getAttribute('userData/place');
        curLayoutData.objectId = areaObj.getAttribute('userData/objectId');
        curLayoutData.areaVertices = areaVertices;
        if (curLayoutData.innerPoiData) {
            curLayoutData.innerPoiData.name = curLayoutData.description;
            curLayoutData.innerPoiData.location = curLayoutData.place;
            curLayoutData.innerPoiData.poiObjId = curLayoutData.objectId;
            curLayoutData.innerPoiData.posX = areaObj.localPosition[0].toFixed(2);
            curLayoutData.innerPoiData.posY = areaObj.localPosition[1].toFixed(2);
            curLayoutData.innerPoiData.posZ = areaObj.localPosition[2].toFixed(2);
        }
        
        return;
    }
    const buildingUnitData = getDataByAjax(dtvpApiServ,"buildingUnit/api","getBuildingUnitInfo",`hospitalId=${BindSysUsers["Sys"]["HospitalID"]}&roomObjectId=${EquipLayoutConfig.selectedRoomId}`,"","get","json","","",false);
    const areaInfo = {
        "buildingUnitId": buildingUnitData && buildingUnitData.length ? buildingUnitData[0].id : '',
        "description": "",
        "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
        "hospitalId": BindSysUsers["Sys"]["HospitalID"],
        "id": areaObj.id,
        "innerBuilding": true,
        "objectId": areaObj.id,
        "place": "",
    };
    const innerPoiData = {
        "code": "",
        "deptId": buildingUnitData && buildingUnitData.length ? buildingUnitData[0].useDeptId : '',
        "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
        "hospitalId": BindSysUsers["Sys"]["HospitalID"],
        "id": "",
        "isGate": false,
        "levelObjectId": CurSencceObj.id,
        "levelTypeId": CurSencceObj.level,
        "location": '',
        "name": '',
        "parPoiId": "",
        "poiCatId": "",
        "poiInfo": "",
        "poiObjId": '',
        "poiTypeId": 8,
        "posX": areaObj.localPosition[0].toFixed(2),
        "posY": areaObj.localPosition[1].toFixed(2),
        "posZ": areaObj.localPosition[2].toFixed(2),
        "remark": ""
    }

    const data = {
        "areaModel": [],
        "areaVertices": areaVertices,
        "innerPoiData": innerPoiData,
        ...areaInfo
    };
    EquipLayoutConfig.areaLayoutData.push(data);
}

/**
 * @authors myf
 * @date    2024-08-13
 * @description 保存单个区域模型数据
 * @param {object} buttonElement 按钮元素
 * @return 无
 */
function saveSingleAreaModelData (buttonElement) {
    let areaId = $(buttonElement).attr('equipId');
    const curModel = app.query('#'+areaId)[0];
    if (curModel) {
        const isArea = curModel.getAttribute('userData/isArea');
        if (!isArea) {
            areaId = curModel.getAttribute('userData/areaId');
        }
        const curLayoutData = EquipLayoutConfig.areaLayoutData.find(item=>{return item.objectId === areaId});
        if (curLayoutData) {
            saveAreaModelData([curLayoutData]);
        }
    }
}

/**
 * @authors myf
 * @date    2024-08-13
 * @description 保存区域模型数据
 * @param {array} data 区域数据
 * @return 无
 */
function saveAreaModelData (data) {
    if (!data || !data.length) {
        data = EquipLayoutConfig.areaLayoutData;
    }
    if (!data) {return;}
    data.forEach(item=>{
        deleteAreaData(item.objectId);
        item.id = '';
        if (item.areaModel) {
            item.areaModel.forEach(model=>{
                model.placeId = '';
                model.id = '';
            });
        }
        if (item.innerPoiData) {
            const innerPoiStr = JSON.stringify(item.innerPoiData);
            getDataByAjax(dtvpApiServ,"innerPoi/api","saveInnerPoi",innerPoiStr,"","post","json","","application/json;charset=utf-8",true);
        }
    });
    const paraStr = JSON.stringify(data);
    const returnData = getDataByAjax(dtvpApiServ,"innerPoiArea/api","saveInnerPoiAreaList",paraStr,"","post","json","","application/json;charset=utf-8",false);

    if (returnData) {
        $.toast({msgtype:'info',content:$.t('layout.tip.saveFail'),time:1000});
        loadAreaModel();
    } else {
        $.toast({msgtype:'info',content:$.t('layout.tip.saveSuccess'),time:1000});
    }
}

/**
 * @authors myf
 * @date    2024-08-13
 * @description 加载区域模型
 * @return 无
 */
function loadAreaModel () {
    app.query('["userData/modelFlag"="layoutModel"]').destroyAll();
    const areaLayoutData = getDataByAjax(dtvpApiServ,"innerPoiArea/api","getInnerPoiArea",`hospitalId=${BindSysUsers["Sys"]["HospitalID"]}&floorObjectId=${getSceneIdByTpye('Floor')}`,"","get","json","","",false);
    EquipLayoutConfig.areaLayoutData = areaLayoutData ? [...areaLayoutData] : [];
    EquipLayoutConfig.areaLayoutData = EquipLayoutConfig.areaLayoutData.map(item=>{
        const innerPoiData = getDataByAjax(dtvpApiServ,"innerPoi/api","getInnerPoiList",`poiObjId=${item.objectId}&hospitalId=`,"","get","json","","",false);
        return {tableId: item.id, innerPoiData: innerPoiData && innerPoiData.length ? innerPoiData[0] : '', ...item};
    });
    EquipLayoutConfig.areaLayoutNumber = EquipLayoutConfig.areaLayoutData.length;
    EquipLayoutConfig.areaLayoutData.forEach(data=>{
        const areaDatas = data.areaVertices;
        const areaModelDatas = data.areaModel;
        const areaId = data.objectId;
        const areaPoints = areaDatas.map(item=>{
            return [item.posX - 0, item.posY - 0, item.posZ - 0];
        }).map(item=>{
            const localPosition = CurSencceObj.selfToWorld(item);
            return localPosition;
        });
        createPolygonArea (areaId, areaPoints, data);
        areaModelDatas.filter(item=>{
            return item.levelObjectId === CurSencceObj.id;
        }).map(item=>{
            return {
                id: item.id,
                url: item.modelUrl,
                localPosition: [item.posX - 0, item.posY - 0, item.posZ - 0],
                name: item.description,
                levelObjectId: item.levelObjectId,
                rotation: item.rotateX ? [item.rotateX - 0, item.rotateY - 0, item.rotateZ - 0] : [0,0,0],
                savedFlag: true,
                areaId: areaId,
            };
        }).forEach(model=>{
            layoutCreateModelObj(model);
        });
    });
}

/**
 * @authors myf
 * @date    2024-08-09
 * @description 区域信息改变（表单输入，区域描述、区域位置、区域场所代码）
 * @param {object} inputElement 表单元素
 * @param {object} modelObjId 模型信息 或者模型id
 * @param {string} valueType 值类型 区域描述、区域位置、区域场所代码
 * @return 无
 */
function areaInfoChange (inputElement, modelObjId, valueType) {
    valueType = modelObjId.valueType || valueType;
    modelObjId = modelObjId.id || modelObjId;
    const modelObj = app.query('#' + modelObjId)[0];
    if (!modelObj) {
        return;
    }
    let value = $(inputElement).val();
    if (valueType === 'placeType') {
        value = $(inputElement).attr('valueKey');
        const areaIndex = modelObjId.slice(modelObjId.lastIndexOf('-'));
        let prefix = modelObjId.slice(0, modelObjId.lastIndexOf('-') - 1);
        prefix = prefix.slice(0, prefix.lastIndexOf('-'));
        const newAreaId = prefix + '-' + value + areaIndex;
        // refreshAreaId(modelObj.id, newAreaId);
        const curLayoutData = EquipLayoutConfig.areaLayoutData.find(item=>{return item.objectId === modelObj.id});
        if (curLayoutData) {
            // if (curLayoutData.areaModel) {
            //     curLayoutData.areaModel.forEach(model=>{
            //         const curModel = app.query('#' + model.id)[0];
            //         if (curModel) {
            //             curModel.setAttribute('userData/areaId')
            //         }
            //     });
            // }
            app.query(`["userData/areaId"="${curLayoutData.objectId}"]`).objects.forEach(obj=>{
                obj.setAttribute('userData/areaId', newAreaId);
            });
            curLayoutData.id = newAreaId;
            curLayoutData.objectId = newAreaId;
        }
        modelObj.id = newAreaId;
        modelObj.setAttribute('userData/objectId', newAreaId);
    }
    modelObj.setAttribute('userData/' + valueType, value);
    refreshAreaData (modelObj);
    if (valueType === 'placeType') {
        showModelPosition(modelObj.id);
    }
}

/**
 * @authors myf
 * @date    2024-08-06
 * @description 创建多边形区域页面点击事件
 * @param {object} element 按钮元素
 * @param {object} params 参数
 * @return 无
 */
function createPolygonAreaPageClick (element, params) {
    if (!EquipLayoutConfig.selectedRoomId && CurSencceObj.type === 'Floor' && params.type !== 'selectArea') {
        $.toast({msgtype:'info',content:$.t('layout.tip.selectRoomFirst'),time:1000});
        return;
    }
    const areaId = 'area' + new Date().getTime();
    if (params.type === 'selectArea') {
        $.toast({msgtype:'info',content:$.t('layout.tip.clickToSelectArea'),time:500});
        app.pauseEvent('click', 'Room', 'selectRoomClick');
        app.one('click', '.PolygonRegion', (ev)=>{
            ev.stopPropagation();
            EquipLayoutConfig.selectedAreaId = ev.pickedObject.id;
            $.toast({msgtype:'info',content:$.t('layout.tip.areaSelected'),time:500});
            app.resumeEvent('click', 'Room', 'selectRoomClick');
        }, 'createPolygonAreaClick');
    } else if (params.type === 'polygon') {
        $.toast({msgtype:'info',content:$.t('layout.tip.clickToCreateArea'),time:1000});
        startDrawArea (areaId);
    } else {
        $.toast({msgtype:'info',content:$.t('layout.tip.dragToCreateArea'),time:1000});
        stretchToCreatePolygonArea (areaId, params.type);
    }
}

/**
 * @authors myf
 * @date    2024-08-06
 * @description 刷新多边形区域点位(包括RouteLine,Line,PolygonLine,PolygonRegion)
 * @param {object} polygonRegionObj 多边形区域对象
 * @param {array} points 区域点数组
 * @return 无
 */
function refreshPolygonRegionPoints (polygonRegionObj, points) {
    polygonRegionObj.clearPoints();
    polygonRegionObj.addPoints(points);
}

/**
 * @authors myf
 * @date    2024-08-06
 * @description 拉伸创建区域
 * @param {string} areaId 区域id
 * @param {string} areaType 区域类型
 * @return 无
 */
function stretchToCreatePolygonArea (areaId, areaType) {
    let startPoint, radius;
    app.on('mousedown', function (ev) {
        if (ev.button === 0) { // 0: 左键, 1: 中键, 2: 右键
            app.camera.enableRotate = false;  // 关闭默认的旋转操作
            startPoint = [...ev.pickedPosition];
            app.on('mousemove', function (event) {
                const mousePos = event.pickedPosition;
                if (areaType === 'circle') {
                    radius = THING.Math.getDistance(startPoint, mousePos); // 获取两点间距离，即圆半径
                    createCircleArea(areaId, startPoint, radius);
                } else if (areaType === 'rectangle') {
                    createRectangleArea(areaId, startPoint, mousePos);
                }
            }, 'stretchToCreatePolygonAreaMousemove');
        }
    }, 'stretchToCreatePolygonAreaMousedown');

    app.on('mouseup', function (ev) {
        if (ev.button === 0) { // 0: 左键, 1: 中键, 2: 右键
            // myf 20241012 场景有旋转角度的，区域需要跟随旋转
            // if (CurSencceObj.angleY) {
                // const area = app.query(areaId)[0];
                // area.angleY = CurSencceObj.angleY;
                // refreshAreaModelData(area);
            // }
            app.off('mousedown', null, 'stretchToCreatePolygonAreaMousedown');
            app.off('mousemove', null, 'stretchToCreatePolygonAreaMousemove');
            app.off('mouseup', null, 'stretchToCreatePolygonAreaMouseup');
            app.camera.enableRotate = true; // 打开默认的旋转操作
        }
    }, 'stretchToCreatePolygonAreaMouseup');
}

/**
 * @authors myf
 * @date    2024-08-06
 * @description 创建矩形区域
 * @param {string} rectangleId 矩形区域id
 * @param {array} startPoint 起点
 * @param {array} endPoint 终点
 * @return 无
 */
function createRectangleArea (rectangleId, startPoint, endPoint) {
    const points = [startPoint, [startPoint[0], startPoint[1], endPoint[2]], endPoint, [endPoint[0], startPoint[1], startPoint[2]]];
    createPolygonArea(rectangleId, points);
}

/**
 * @authors myf
 * @date    2024-08-06
 * @description 创建圆形区域
 * @param {string} circleId 圆形区域id
 * @param {array} center 圆心点
 * @param {number} radius 半径
 * @return 无
 */
function createCircleArea(circleId, center, radius) {
    if (!center) {return;}
    const curCircleArea = app.query(circleId)[0];
    const points = [];
    // 根据圆形和半径计算圆形坐标点
    for (let degree = 0, y = 0.1; degree <= 360; degree += 1) {
        const x = Math.cos(degree * 2 * Math.PI / 360) * radius;
        const z = Math.sin(degree * 2 * Math.PI / 360) * radius;
        const pos = THING.Math.addVector([x, y, z], center);
        points.push(pos);
    }
    if (curCircleArea) {
        curCircleArea.setAttribute('userData/radius', radius);
        refreshPolygonRegionPoints (curCircleArea, points)
        return;
    }
    const promise = createPolygonArea(circleId, points);
    promise.then((polygonRegion)=>{
        polygonRegion.setAttribute('userData/radius', radius);
        addAreaStretchEventArr (polygonRegion);
    });
}

/**
 * @authors myf
 * @date    2024-08-06
 * @description 创建多边形区域
 * @param {string} id 区域id
 * @param {array} regionPoints 区域边界点数组
 * @return promise 创建promise
 */
function createPolygonArea (areaKey, regionPoints, areaInfo={}) {
    if (!regionPoints || regionPoints.length < 3) {return;}
    regionPoints.forEach(poi=>{
        poi[1] = CurSencceObj.position[1] + 0.02;
    });
    const curArea = app.query(areaKey)[0];
    if (curArea) { // 刷新
        refreshPolygonRegionPoints (curArea, regionPoints)
        return;
    }
    
    
    let objectId = areaInfo.objectId ;
    if (!objectId) {
        EquipLayoutConfig.areaLayoutNumber++;
        objectId = 'T-AREA-' + CurSencceObj.id + '-0-' + EquipLayoutConfig.areaLayoutNumber;
    }
    const lastIndex = objectId.lastIndexOf('-');
    const prefix = objectId.slice(0, lastIndex);
    const placeType = prefix.slice(prefix.lastIndexOf('-') + 1);
    const promise = new Promise((resolve)=>{
        app.create({
            id: objectId,
            type: 'PolygonRegion',
            name: areaKey,
            points: regionPoints,  // 传入世界坐标系下点坐标
            parent: CurSencceObj,
            style: {
                regionColor: '#0bd2f4',  // 区域颜色
                lineColor: '#0bd2f4',  // 边框颜色
                regionOpacity: 0.5,  // 不透明度 (默认是 0.5 半透明)
            },
            complete: function () {
                this.setAttribute("userData/modelFlag","layoutModel");
                this.setAttribute("userData/isArea", true);
                this.setAttribute("userData/description", areaInfo.description);
                this.setAttribute("userData/place", areaInfo.place);
                this.setAttribute("userData/placeType", placeType);
                this.setAttribute("userData/objectId", areaInfo.objectId);
                this.setAttribute("userData/tableId", areaInfo.tableId);
                const curBuildingUnit = EquipLayoutConfig.buildingUnitData.find(item=>{return item.id === areaInfo.buildingUnitId});
                if (curBuildingUnit) {
                    this.setAttribute("userData/roomName", curBuildingUnit.description);
                    this.setAttribute("userData/roomId", curBuildingUnit.roomObjectId);
                }
                this.style.alwaysOnTop = false;
                refreshAreaData (this);
                addThingDragEvent(this);
                createModelOperaPanel(this);
                this.on('click',function(ev){
                    showModelPosition(this.id);
                }, 'layoutModelClick');
                registerArrayByType(1, this.id, 1);
                resolve(this);
            }
        });
    });
    return promise;
}

/**
 * @authors myf
 * @date    2024-02-19
 * @description 开始多边形区域规划
 * @param {string} areaId 区域id
 * @return 无
 */
function startDrawArea (areaKey) {
    app.pauseEvent('click',null,'quitLayoutLeavelLevel');
    let drawAreaPoints = [];
    let drawAreaIndex = 0;
    let drawAreaLockedX;
    let drawAreaLockedY;
    app.on('click',(e)=>{
        e.stopPropagation();
        if (e.button === 2) {
            app.query('regionPoint').destroyAll();
            app.query('placementGuide').destroyAll();
            app.resumeEvent('click',null,'quitLayoutLeavelLevel');
            app.off('click', null, 'drawAreaClick');
            app.off('mousemove', null, 'drawAreaMousemove');
            drawAreaPoints = [];
            drawAreaIndex = 0;
            $.toast({msgtype:'info',content:$.t('layout.tip.createEnd'),time:1000});
            return;
        }
        drawAreaIndex = drawAreaIndex ? drawAreaIndex + 1 : 1;
        const index = drawAreaIndex;
        const ePosition = e.pickedPosition;
        const lockX = drawAreaLockedX;
        const lockY = drawAreaLockedY;
        if (lockX) {ePosition[0] = lockX - 0;}
        if (lockY) {ePosition[2] = lockY - 0;}
        const regionPoint = app.create({
            type: "Thing",
            id: 'regionPoint' + index,
            name: 'regionPoint',
            url: eqmodelurl["M_01075"],
            inheritPickable: false,
            parent: CurSencceObj,
            position: ePosition,
            size: 0.5,
            scale:[0.8,0.8,0.8],
        });
        const html = `<div style="width:2rem;height:2rem;color:#fff;font-size:0.8rem;background-color:rgb(25 28 80 / 80%);line-height:2rem;text-align:center;">${index}</div>`;
        const panelInfo = {panelPosition:[0,2,0],panelId:'',panelPivot:[0.5,1],levelType:1,isDestroyParent:true};
        createCommonTopCard(regionPoint,html,panelInfo);
        registerArrayByType(1,'createPathCurPoi' + index,1);
        drawAreaPoints ? drawAreaPoints.push(ePosition) : drawAreaPoints = [ePosition];
        createPolygonArea (areaKey, drawAreaPoints);
    },'drawAreaClick');
    app.on('mousemove', (e)=>{
        e.stopPropagation();
        const ePosition = e.pickedPosition;
        const regionPoints = drawAreaPoints || [];

        if (!ePosition) {return;}
        // const linePoints = [], xlineGuidePoints = [], ylineGuidePoints = [];
        const stretchRadius = CurSencceObj.type === 'Campus' ? 1 : 0.05;
        let xlineGuidePoint, ylineGuidePoint;
        regionPoints.forEach(item=>{
            if (ePosition[0] - stretchRadius <= item[0] && ePosition[0] + stretchRadius >= item[0]) {
                // xlineGuidePoints.push(item);
                xlineGuidePoint = item;
            }
            if (ePosition[2] - stretchRadius <= item[2] && ePosition[2] + stretchRadius >= item[2]) {
                // ylineGuidePoints.push(item);
                ylineGuidePoint = item;
            }
        });
        app.query('["name"="placementGuide"]').destroyAll();
        if (xlineGuidePoint) {
            const pipeLine = app.create({
                name: 'placementGuide',
                type: 'PolygonLine',
                points: [[xlineGuidePoint[0], xlineGuidePoint[1], ePosition[2]], xlineGuidePoint], //节点数据列表
                width: 0.05, // 管线半径宽度0.15米
                style: {
                    color: 'green'
                }
            });
            drawAreaLockedX = xlineGuidePoint[0];
        } else {
            drawAreaLockedX = '';
        }
        if (ylineGuidePoint) {
            const pipeLine = app.create({
                name: 'placementGuide',
                type: 'PolygonLine',
                points: [[ePosition[0], ylineGuidePoint[1], ylineGuidePoint[2]], ylineGuidePoint], //节点数据列表
                width: 0.05, // 管线半径宽度0.15米
                style: {
                    color: 'green'
                }
            });
            drawAreaLockedY = ylineGuidePoint[2];
        } else {
            drawAreaLockedY = '';
        }
    }, 'drawAreaMousemove');
}


/**
 * 管件布局初始化管件接口（不根据3D对象）
 * @param {object} fittingModel 管件型号信息
 * @returns 无
 * @author myf 2024-07-29
 */
function pipelineLayoutInitFittingModelInterfaceWithoutObj (fittingModel) {
    if (!fittingModel) {return;}
    const para = {
        "code": '',
        "fittingModelId": fittingModel.id,
        "hospitalId": fittingModel.hospitalId,
        "id": "",
        "name": fittingModel.name,
        "radius": fittingModel.radius,
    }
    let interfaceNum = 0, bendRadiusNums = [];
    if (fittingModel.pipelineCatId === '1') { // 直通
        interfaceNum = 2;
        bendRadiusNums = [2];
    } else if (fittingModel.pipelineCatId === '3') { // 三通
        interfaceNum = 3;
        bendRadiusNums = [3];
    } else if (fittingModel.pipelineCatId === '8') { // 四通
        interfaceNum = 4;
        bendRadiusNums = [1, 2];
    } else if (fittingModel.pipelineCatId === '2') { // 弯头
        interfaceNum = 2;
        bendRadiusNums = [2];
    }
    for (let i = 1; i <= interfaceNum; i++) {
        para.code = 'pipe-interface0' + i;
        para.radius = bendRadiusNums.includes(i) ? fittingModel.bendRadius || fittingModel.radius : fittingModel.radius;
        const paraStr = JSON.stringify(para);
        getDataByAjax(dtvpApiServ,"fittingModelInterface/api","saveFittingModelInterface",paraStr,"","post","json","","application/json;charset=utf-8",false);
    }
    PipeLineSystemForm.fittingInterfaceModels = getDataByAjax(dtvpApiServ,"fittingModelInterface/api","getAllFittingModelInterface","hospitalId=","","get","json","","",false);
}

/**
 * 布局高亮模型
 * @param {object} button 按钮元素
 * @returns 无
 * @author myf 2024-07-09
 */
function layoutHighlightModel (button) {
    if (EquipLayoutConfig.highlight) {
        $(button).css('border','');
        EquipLayoutConfig.highlight = '';
        app.query('["userData/modelFlag"="layoutModel"]').objects.forEach(item=>{
            item.style.highlight = '';
            item.style.highlightIntensity = 0.5;
        });
    } else {
        $(button).css('border','2px solid #fff');
        EquipLayoutConfig.highlight = 'red';
        app.query('["userData/modelFlag"="layoutModel"]').objects.forEach(item=>{
            item.style.highlight = 'red';
            item.style.highlightIntensity = 1;
        });
    }
}

/**
 * 管线布局初始化管件型号接口
 * @param {object} pipeNodeObj 管件节点对象
 * @author myf 2024-06-20
 * @returns 无
 */
function pipelineLayoutInitFittingModelInterface (pipeNodeObj) {
    if (!pipeNodeObj || !pipeNodeObj.subNodes) {return;}
    const pipeGroup = {};
    pipeNodeObj.subNodes.objects.filter(node=>node.name.includes('pipe-interface')).map(node=>{
        const boxRadius = node.boxRadius.toFixed(3);
        if (pipeGroup[boxRadius + '']) {
            pipeGroup[boxRadius + ''].push(node.name);
        } else {
            pipeGroup[boxRadius + ''] = [node.name];
        }
    });
    const curFittingModel = PipeLineSystemForm.fittingModels.find(item=>item.id === pipeNodeObj.getAttribute('userData/modelId'));
    if (curFittingModel) {
        const keys = Object.keys(pipeGroup);
        keys.sort();
        keys.forEach((key, index)=>{
            let radius = curFittingModel.radius;
            if (index === 0) {
                radius = curFittingModel.bendRadius || curFittingModel.radius;
            }
            pipeGroup[key].forEach(interfaceName=>{
                const para = {
                    "code": interfaceName,
                    "fittingModelId": curFittingModel.id,
                    "hospitalId": curFittingModel.hospitalId,
                    "id": "",
                    "name": curFittingModel.name,
                    "radius": radius,
                }
                const paraStr = JSON.stringify(para);
                const result = getDataByAjax(dtvpApiServ,"fittingModelInterface/api","saveFittingModelInterface",paraStr,"","post","json","","application/json;charset=utf-8",false);
            });
        });
    }
    // const paraStr = JSON.stringify(data);
    // const result = getDataByAjax(dtvpApiServ,"pipelineNode/api","savePipelineNode",paraStr,"","post","json","","application/json;charset=utf-8",false);
}

/**
 * 布局批量替换模型
 * @returns 无
 * @author myf 2024-06-18
 */
function layoutBatchReplaceModel () {
    if (!EquipLayoutConfig.mulSelect) {
        $.toast({msgtype:'info',content:$.t('layout.tip.batch'),time:1000});
        return;
    }
    EquipLayoutConfig.mulReplace = true;
    const tmpModel = app.create({
        id: 'layoutBatchReplaceModel',
        type: 'Box',
        width: 0.001,
        height: 0.001,
        depth: 0.001,
        position: app.camera.target,
        name: 'layoutBatchReplaceModel',
        pickable: false,
    });
    layoutReplaceModel('layoutBatchReplaceModel');
    return;
}

/**
 * 布局选择所有相同型号的3D对象
 * @param {object} button 按钮
 * @author myf 2024-06-18
 * @returns
 */
function layoutSelectSameModel (button) {
    if (!EquipLayoutConfig.mulSelect) {
        layoutMulSelectMode ();
    } else {
        $('#layoutPositionPanel').attr('modelIds', '');
    }
    const equipId = $(button).attr('equipId');
    const curModel = app.query('#'+equipId)[0];
    if (curModel) {
        app.query('["userData/modelFlag"="layoutModel"]').objects.filter(model=>{
            return curModel.getAttribute('userData/modelId') === model.getAttribute('userData/modelId');
        }).forEach(item=>{
            showModelPosition(item.id);
        });
    }
}

/**
 * 添加加载遮盖面板
 * 默认使用父面板高宽
 * @param {string} parentPanelId 父面板id
 * @author myf 2024-06-18
 * @returns
 */
function addLoadingMaskPanel (parentPanelId, loading=true) {
    const parentPanel = document.getElementById(parentPanelId);
    if (!parentPanel) {return;}
    if ($('#loadingMaskPanel' + parentPanelId)[0]) { return; }
    const clientData = parentPanel.getBoundingClientRect();
    let html = `<div id="loadingMaskPanel${parentPanelId}" style="width:${clientData.width}px;height:${clientData.height}px;position:absolute;top:${clientData.top}px;left:${clientData.left}px;`;
    if (loading) {
        html += `background-image:url(${ImgUrl}loading-1.svg);background-size:40% 40%;background-repeat: no-repeat;background-position:center;`;
    }
    html += `background-color:#6982b499;z-index:9999;"></div>`;
    $('#div2d').append(html);
    $('#loadingMaskPanel'+parentPanelId).on('click',(event)=>{
        event.stopPropagation();
    });
    $('#loadingMaskPanel'+parentPanelId).on('wheel',(event)=>{
        event.stopPropagation();
    });
}

/**
 * 移除加载遮盖面板
 * @param {string} parentPanelId 父面板id 不传移除所有遮盖面板
 * @author myf 2024-06-18
 * @returns
 */
function removeLoadingMaskPanel (parentPanelId) {
    if (parentPanelId) {
        $('#loadingMaskPanel'+parentPanelId).remove();
    } else {
        $('[id^=loadingMaskPanel]').remove();
    }
}

/**
 * 给管件型号数据按半径大小排序（数据源函数）
 * @param {object} interfaceData 接口数据
 * @param {object} widgetObj 部件对象
 * @author myf 2024-06-17
 * @returns interfaceData 排序之后的数据
 */
function getFittingModelRadiusTypes (interfaceData, widgetObj) {
    const radius = [];
    interfaceData.forEach(item=>{
        if (!radius.includes(item[widgetObj.clickParam.key]) && item[widgetObj.clickParam.key]) {
            radius.push(item[widgetObj.clickParam.key]);
        }
    });
    const res = radius.sort((a,b)=>{
        return a - b > 0 ? 1 : -1;
    }).map(item=>{
        return {radius: item, bendRadius: item};
    });
    return res;
}


/**
 * 布局替换模型提交
 * @param {object} button 按钮
 * @param {object} para 参数
 * @author myf 2024-06-11
 * @returns 无
 */
function layoutReplaceModelConfirm (button, para) {
    event.stopPropagation();
    // const valuekeyStr = $(`[id*=odelReplaceRadio]`).filter('[id$=Checkbox]').children().attr('valuekey');
    // const valuekey = JSON.parse(valuekeyStr);
    const valuekey = getPageData($(`[id*=odelReplaceRadio]`).filter('[id$=Checkbox]').children().attr('id'), 'valuekey'); // myf 20250102 html挂载数据改造
    // const itemdataStr = $(`[id*=odelReplaceRadio]`).filter('[id$=Checkbox]').attr('itemdata');
    // const itemdata = JSON.parse(itemdataStr);
    const itemdata = getPageData($(`[id*=odelReplaceRadio]`).filter('[id$=Checkbox]').attr('id'), 'itemdata'); // myf 20250102 html挂载数据改造
    const curModelData = itemdata.find(item=>{
        return item.id === valuekey[0];
    });
    $.confirm({msgtype:'info',title:$.t('common.tip'),content:$.t('layout.tip.replaceModel')+curModelData.name+'?' + (EquipLayoutConfig.mulReplace && EquipLayoutConfig.code === 'pipeline' ? '注意:批量替换管件可能会造成已连接管线混乱!' : ''),confirmText:$.t('common.operation.confirm'),cancelText:$.t('common.operation.cancel')}, ()=>{
        if (EquipLayoutConfig.code === 'pipeline') {
            const newPipelineModel = PipeLineSystemForm.pipelineModels.find(item=>item.radius === (curModelData.bendRadius || curModelData.radius) && item.pipelineTypeId === curModelData.pipelineTypeId);
            if (!newPipelineModel) {
                $.toast({msgtype:'info',content:$.t('layout.tip.noPipelineModel'),time:1000});
                return;
            }
            if (EquipLayoutConfig.mulReplace) {
                const modelIds = $('#layoutPositionPanel').attr('modelIds');
                if (modelIds) {
                    const modelIdArr = modelIds.split('^');
                    modelIdArr.forEach(item=>{
                        layoutReplaceModelRun (item, curModelData, newPipelineModel);
                    });
                }
            } else {
                addLoadingMaskPanel('eq-dialog-confirm');
                const isExtend = $('input[id^=isExtend]:checked').val();
                layoutReplaceModelRun (para.equipId, curModelData, newPipelineModel, isExtend);
            }
        } else {
            if (EquipLayoutConfig.mulReplace) {
                const modelIds = $('#layoutPositionPanel').attr('modelIds');
                if (modelIds) {
                    const modelIdArr = modelIds.split('^');
                    modelIdArr.forEach(item=>{
                        layoutReplaceModelRun (item, curModelData);
                    });
                }
            } else {
                layoutReplaceModelRun (para.equipId, curModelData);
            }
        }
        layoutReplaceModelCancel();
    });
}

/**
 * 布局替换模型启动
 * @param {string} equipId 模型id
 * @param {object} curModelData 替换模型数据
 * @param {object} newPipelineModel 新管线型号数据
 * @returns 无
 * @author myf 2024-07-02
 */
function layoutReplaceModelRun (equipId, curModelData, newPipelineModel, isExtend=false) {
    const curModel = app.query('#'+equipId)[0];
    if (curModel) {
        if (EquipLayoutConfig.code === 'pipeline' && isExtend) {
            const verifyPipelines = PipeLineSystemForm.pipelineVOList.filter(pipeline=>{ return pipeline.endNodeInterfaceId.slice(0,-2) === curModel.id});
            const verifyValue = verifyPipelines.every(pipe=>{
                const startNodeObj = app.query('#' + pipe.startNodeInterfaceId.slice(0,-2))[0];
                if (!startNodeObj) {return true;}
                // if (pipeline.startNodeInterfaceId.slice(-2) === '03')
                const startModelData = PipeLineSystemForm.fittingModels.find(item=>item.id === startNodeObj.getAttribute('userData/modelId'));
                const startRadius = startModelData.radius;
                const startBendRadius = startModelData.bendRadius;
                let startInterfaceRadius;
                if (startModelData.pipelineCatId === '3') {
                    if (pipe.startNodeInterfaceId.slice(-2) === '03') {
                        startInterfaceRadius = startBendRadius || startRadius;
                    } else {
                        startInterfaceRadius = startRadius;
                    }
                } else if (startModelData.pipelineCatId === '1' || startModelData.pipelineCatId === '2') {
                    if (pipe.startNodeInterfaceId.slice(-2) === '02') {
                        startInterfaceRadius = startBendRadius || startRadius;
                    } else {
                        startInterfaceRadius = startRadius;
                    }
                } else if (startModelData.pipelineCatId === '8') {
                    if (pipe.startNodeInterfaceId.slice(-2) === '01' || pipe.startNodeInterfaceId.slice(-2) === '02') {
                        startInterfaceRadius = startBendRadius || startRadius;
                    } else {
                        startInterfaceRadius = startRadius;
                    }
                } else {
                    startInterfaceRadius = startRadius;
                }
                let endInterfaceRadius;
                const endRadius = curModelData.radius;
                const endBendRadius = curModelData.bendRadius;
                if (curModelData.pipelineCatId === '3') {
                    if (pipe.endNodeInterfaceId.slice(-2) === '03') {
                        endInterfaceRadius = endBendRadius || endRadius;
                    } else {
                        endInterfaceRadius = endRadius;
                    }
                } else if (curModelData.pipelineCatId === '1' || curModelData.pipelineCatId === '2') {
                    if (pipe.endNodeInterfaceId.slice(-2) === '02') {
                        endInterfaceRadius = endBendRadius || endRadius;
                    } else {
                        endInterfaceRadius = endRadius;
                    }
                } else if (curModelData.pipelineCatId === '8') {
                    if (pipe.endNodeInterfaceId.slice(-2) === '01' || pipe.endNodeInterfaceId.slice(-2) === '02') {
                        endInterfaceRadius = endBendRadius || endRadius;
                    } else {
                        endInterfaceRadius = endRadius;
                    }
                } else {
                    endInterfaceRadius = endRadius;
                }
                return startInterfaceRadius === endInterfaceRadius;
            });
            console.log('verifyValue', verifyValue);
            if (!verifyValue) {
                $.toast({msgtype:'info',content:$.t('layout.tip.enterPipeInterfaceNotMatch'),time:1000});
                return;
            }
            const linkedLines = PipeLineSystemForm.pipelineVOList.find(pipeline=>{return pipeline.startNodeInterfaceId.includes(curModel.id);});
            isExtend = !!linkedLines;
        }
        curModel.url = curModelData.modelUrl;
        if (EquipLayoutConfig.code === 'pipeline') {
            curModel.name = curModelData.name;
        }
        createModelOperaPanel (curModel);
        if (EquipLayoutConfig.code === 'pipeline' && isExtend) {
            let isBend = !!curModelData.bendRadius;
            if (curModelData.pipelineCatId === '8' && isBend) { // 四通转管径需要选方向
                $.toast({msgtype:'info',content:$.t('layout.tip.bendRadius'),time:1000});
                PipeLineSystemForm.pipelineVOList.filter(pipeline=>{
                    return pipeline.startNodeInterfaceId.includes(curModel.id);
                }).forEach(pipeline=>{
                    const endPipeNode = app.query('#' + pipeline.endNodeInterfaceId.slice(0,-2))[0];
                    let html = `<div id="nodeReplaceDirectionSelect${endPipeNode.id}" style="width:2rem;height:2rem;background-image:url(${ImgUrl}icon/eq-dialog-success.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;"></div>`;
                    const panelInfo = {panelPosition: [0,1,0],panelId:endPipeNode.id,panelPivot:[0.5,1],levelType:2,hasLine:false,closeable:false, panelZIndex: 2, panelClassName:`name='nodeReplaceDirectionSelect'`};
                    createCommonTopCard(endPipeNode, html, panelInfo);
                    $('#nodeReplaceDirectionSelect'+endPipeNode.id).click(function(event){
                        event.stopPropagation();
                        $(`[name=nodeReplaceDirectionSelect]`).remove();
                        // 原本接口name来判断选择了多少度以及更新管线新的接口name
                        const startNodeInterfaces = PipeLineSystemForm.pipelineVOList.filter(item=>item.startNodeInterfaceId.includes(curModel.id));
                        const endNodeInterfaces = PipeLineSystemForm.pipelineVOList.filter(item=>item.endNodeInterfaceId.includes(curModel.id));
                        if (pipeline.startNodeInterfaceId.slice(-2) === '03') { // 90
                            curModel.angleY = curModel.angleY + 90;
                            startNodeInterfaces.some(item=>{
                                if (item.startNodeInterfaceId === curModel.id + '02') {
                                    item.startNodeInterfaceId = curModel.id + '03';
                                    layoutPipelineReplaceModelDataRefrensh(item, '03', true);
                                    return;
                                }
                                if (item.startNodeInterfaceId === curModel.id + '04') {
                                    item.startNodeInterfaceId = curModel.id + '02';
                                    layoutPipelineReplaceModelDataRefrensh(item, '02', true);
                                    return;
                                }
                                if (item.startNodeInterfaceId === curModel.id + '01') {
                                    item.startNodeInterfaceId = curModel.id + '04';
                                    layoutPipelineReplaceModelDataRefrensh(item, '04', true);
                                    return;
                                }
                            });
                            endNodeInterfaces.some(item=>{
                                if (item.endNodeInterfaceId === curModel.id + '02') {
                                    item.endNodeInterfaceId = curModel.id + '03';
                                    layoutPipelineReplaceModelDataRefrensh(item, '03', false);
                                    return;
                                }
                                if (item.endNodeInterfaceId === curModel.id + '04') {
                                    item.endNodeInterfaceId = curModel.id + '02';
                                    layoutPipelineReplaceModelDataRefrensh(item, '02', false);
                                    return;
                                }
                                if (item.endNodeInterfaceId === curModel.id + '01') {
                                    item.endNodeInterfaceId = curModel.id + '04';
                                    layoutPipelineReplaceModelDataRefrensh(item, '04', false);
                                    return;
                                }
                            });
                            pipeline.startNodeInterfaceId = curModel.id + '01';
                            layoutPipelineReplaceModelDataRefrensh(pipeline, '01', true);
                        } else if (pipeline.startNodeInterfaceId.slice(-2) === '02') { // 180
                            curModel.angleY = curModel.angleY + 180;
                            startNodeInterfaces.some(item=>{
                                if (item.startNodeInterfaceId === curModel.id + '03') {
                                    item.startNodeInterfaceId = curModel.id + '04';
                                    layoutPipelineReplaceModelDataRefrensh(item, '04', true);
                                    return;
                                }
                                if (item.startNodeInterfaceId === curModel.id + '04') {
                                    item.startNodeInterfaceId = curModel.id + '03';
                                    layoutPipelineReplaceModelDataRefrensh(item, '03', true);
                                    return;
                                }
                                if (item.startNodeInterfaceId === curModel.id + '01') {
                                    item.startNodeInterfaceId = curModel.id + '02';
                                    layoutPipelineReplaceModelDataRefrensh(item, '02', true);
                                    return;
                                }
                            });
                            endNodeInterfaces.some(item=>{
                                if (item.endNodeInterfaceId === curModel.id + '03') {
                                    item.endNodeInterfaceId = curModel.id + '04';
                                    layoutPipelineReplaceModelDataRefrensh(item, '04', false);
                                    return;
                                }
                                if (item.endNodeInterfaceId === curModel.id + '04') {
                                    item.endNodeInterfaceId = curModel.id + '03';
                                    layoutPipelineReplaceModelDataRefrensh(item, '03', false);
                                    return;
                                }
                                if (item.endNodeInterfaceId === curModel.id + '01') {
                                    item.endNodeInterfaceId = curModel.id + '02';
                                    layoutPipelineReplaceModelDataRefrensh(item, '02', false);
                                    return;
                                }
                            });
                            pipeline.startNodeInterfaceId = curModel.id + '01';
                            layoutPipelineReplaceModelDataRefrensh(pipeline, '01', true);
                        } else if (pipeline.startNodeInterfaceId.slice(-2) === '04') { // 270 原04 改为01
                            curModel.angleY = curModel.angleY + 270;
                            startNodeInterfaces.some(item=>{
                                if (item.startNodeInterfaceId === curModel.id + '03') {
                                    item.startNodeInterfaceId = curModel.id + '02';
                                    layoutPipelineReplaceModelDataRefrensh(item, '02', true);
                                    return;
                                }
                                if (item.startNodeInterfaceId === curModel.id + '02') {
                                    item.startNodeInterfaceId = curModel.id + '04';
                                    layoutPipelineReplaceModelDataRefrensh(item, '04', true);
                                    return;
                                }
                                if (item.startNodeInterfaceId === curModel.id + '01') {
                                    item.startNodeInterfaceId = curModel.id + '03';
                                    layoutPipelineReplaceModelDataRefrensh(item, '03', true);
                                    return;
                                }
                            });
                            endNodeInterfaces.some(item=>{
                                if (item.endNodeInterfaceId === curModel.id + '03') {
                                    item.endNodeInterfaceId = curModel.id + '02';
                                    layoutPipelineReplaceModelDataRefrensh(item, '02', false);
                                    return;
                                }
                                if (item.endNodeInterfaceId === curModel.id + '02') {
                                    item.endNodeInterfaceId = curModel.id + '04';
                                    layoutPipelineReplaceModelDataRefrensh(item, '04', false);
                                    return;
                                }
                                if (item.endNodeInterfaceId === curModel.id + '01') {
                                    item.endNodeInterfaceId = curModel.id + '03';
                                    layoutPipelineReplaceModelDataRefrensh(item, '03', false);
                                    return;
                                }
                            });
                            pipeline.startNodeInterfaceId = curModel.id + '01';
                            layoutPipelineReplaceModelDataRefrensh(pipeline, '01', true);
                        }
                        layoutPipelineReplaceModel (curModel, curModelData, newPipelineModel);
                        return;
                    });
                });
            }
            layoutPipelineReplaceModel (curModel, curModelData, newPipelineModel);
            return;
        } else if (EquipLayoutConfig.code === 'pipeline') {
            curModel.setAttribute('userData/modelId', curModelData.id);
            refreshPipelineNodeData (curModel.id);
            PipeLineSystemForm.pipelineVOList.filter(item=>item.endNodeInterfaceId.includes(curModel.id) || item.startNodeInterfaceId.includes(curModel.id))
            .forEach(pipeline=>{
                pipeline.pipelineNodeInterfaceList.forEach((interface, index)=>{
                    if (interface.pipelineNodeId === curModel.id) {
                        const newFittingInterfaceModel = PipeLineSystemForm.fittingInterfaceModels.find(item=>item.code === interface.name && item.fittingModelId === curModelData.id);
                        const oldFittingInterfaceModel = PipeLineSystemForm.fittingInterfaceModels.find(item=>item.id === interface.fittingInterfaceModelId);
                        if (newFittingInterfaceModel && oldFittingInterfaceModel) {
                            interface.fittingInterfaceModelId = newFittingInterfaceModel.id;
                            if (newFittingInterfaceModel.radius !== oldFittingInterfaceModel.radius) { // 半径不同
                                // 将该管线另一个接口id存入数组
                                let anotherInterfaceId = '';
                                if (index === 0) { anotherInterfaceId = pipeline.pipelineNodeInterfaceList[1].id; }
                                else { anotherInterfaceId = pipeline.pipelineNodeInterfaceList[0].id; }
                                EquipLayoutConfig.pipelineToReplaceInterface ? EquipLayoutConfig.pipelineToReplaceInterface.push(anotherInterfaceId) : EquipLayoutConfig.pipelineToReplaceInterface = [anotherInterfaceId];
                            }
                        }
                    }
                });
                app.query('#' + pipeline.startNodeInterfaceId + pipeline.endNodeInterfaceId).destroy();
                PipeLineSystemForm.pipelineVOList.splice(PipeLineSystemForm.pipelineVOList.indexOf(pipeline), 1);
                if (pipeline.id) {
                    app.query('#' + pipeline.id).destroy();
                    // deletePipeline
                    const para = {id:pipeline.id};
                    const result = getDataByAjax(dtvpApiServ,"pipeline/api","deletePipelineById",para,"","post","json","","application/x-www-form-urlencoded",false);
                }
                refreshPipelineLinkedInterfaceObj();
            });
            return;
        }
        const savedFlag = curModel.getAttribute("userData/savedFlag");
        if (savedFlag) {
            if (EquipLayoutConfig.code === 'base-equip') {
                curModel.name = curModelData.name;
                const curEquipData = EquipLayoutConfig.baseEquipSaveArr.find(item=>item.id === curModel.id.substring(5));
                curEquipData.equipModelId = curModelData.modelUrl;
                saveBaseEquipLayout();
            } else if (EquipLayoutConfig.code === 'pipeline') {
                const data = {
                    "id": para.equipId,
                    "fittingModelId": curModel.getAttribute('userData/modelId') || '',
                }
                savePipelineNode(data);
            } else {
                triggerElementEvent (para.equipId + 'SaveButton', 'click');
            }
        }
        $.toast({msgtype:'info',content:$.t('layout.tip.replaceSuccess'),time:1000});
    } else {
        $.toast({msgtype:'error',content:$.t('layout.tip.replaceFail'),time:1000});
    }
}

/**
 * 布局管件替换模型
 * @param {object} curModel 当前模型
 * @param {object} curModelData 替换模型数据
 * @param {object} newPipelineModel 新管线型号数据
 * @returns 无
 * @author myf 2024-07-04
 */
function layoutPipelineReplaceModel (curModel, curModelData, newPipelineModel) {
    const radius = curModelData.bendRadius || curModelData.radius;
    let isBend = !!curModelData.bendRadius;
    curModel.setAttribute('userData/modelId', curModelData.id);
    curModel.setAttribute('userData/radius', curModelData.radius);
    curModel.setAttribute('userData/bendRadius', curModelData.bendRadius);
    curModel.name = curModelData.name;
    refreshPipelineNodeData (curModel.id);
    // return;
    let curPipeNode = JSON.parse(JSON.stringify(curModel));
    const pipeNodeArr = [];
    const visitedNodeArr = [curPipeNode.id];
    while (curPipeNode && curModelData) {
        PipeLineSystemForm.pipelineVOList.filter(pipeline=>{
            if (pipeline.startNodeInterfaceId.slice(0,-2) === curPipeNode.id) {
                if (curModelData.pipelineCatId === '3' && isBend) { // 三通 并且转管径
                    if (pipeline.startNodeInterfaceId.slice(-2) === '03') { // 只有 03 的管件接口才替换
                        return true;
                    }
                } else if (curModelData.pipelineCatId === '1' && isBend) { // 直通 并且转管径
                    if (pipeline.startNodeInterfaceId.slice(-2) === '02') { // 只有 02 的管件接口才替换
                        return true;
                    }
                } else if (curModelData.pipelineCatId === '8' && isBend) { // 四通 并且转管径
                    // 选择 interface01 连接的管件
                    if (pipeline.startNodeInterfaceId.slice(-2) === '01' || pipeline.startNodeInterfaceId.slice(-2) === '02') { // 只有 03、04 的管件接口才替换
                        return true;
                    }
                } else if (curModelData.pipelineCatId === '2' && isBend) { // 弯头 并且转管径
                    if (pipeline.startNodeInterfaceId.slice(-2) === '02') { // 只有 02
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }).some(pipeline=>{
            if (!pipeline.endNodeInterfaceId) {
                return;
            }
            const endPipeNode = app.query('#' + pipeline.endNodeInterfaceId.slice(0,-2))[0];
            if (!endPipeNode) {
                return;
            }
            if (!visitedNodeArr.includes(endPipeNode.id)) {
                pipeNodeArr.push(endPipeNode);
                visitedNodeArr.push(endPipeNode.id)
                // data.sum++;
            }
            // createProgressBarStyle(data, widgetObj);
            isBend = false;
            const endPipeFittingModel = PipeLineSystemForm.fittingModels.find(item=>item.id === endPipeNode.getAttribute('userData/modelId'));
            const endReplacePipeFittingModel = PipeLineSystemForm.fittingModels.find(item=>item.pipelineCatId === endPipeFittingModel.pipelineCatId && item.radius === radius && item.defaulted === '1');
            if (!endReplacePipeFittingModel) { // 没有管径为',radius,'的对应种类管件
                return;
            }
            endPipeNode.url = endReplacePipeFittingModel.modelUrl;
            endPipeNode.setAttribute('userData/modelId', endReplacePipeFittingModel.id);
            endPipeNode.setAttribute('userData/radius', endReplacePipeFittingModel.radius);
            endPipeNode.setAttribute('userData/bendRadius', endReplacePipeFittingModel.bendRadius);
            endPipeNode.name = endReplacePipeFittingModel.name;
            pipeline.pipelineNodeInterfaceList.forEach(interface=>{
                if (interface.interfaceType === 1) { // 起点
                    let startFittingInterfaceModel = PipeLineSystemForm.fittingInterfaceModels.find(item=>item.code === interface.name && item.fittingModelId === curModelData.id);
                    if (startFittingInterfaceModel) {
                        interface.fittingInterfaceModelId = startFittingInterfaceModel.id;
                    } else {
                        pipelineLayoutInitFittingModelInterfaceWithoutObj (curModelData);
                        startFittingInterfaceModel = PipeLineSystemForm.fittingInterfaceModels.find(item=>item.code === interface.name && item.fittingModelId === curModelData.id);
                        interface.fittingInterfaceModelId = startFittingInterfaceModel.id;
                    }
                } else {
                    let endFittingInterfaceModel = PipeLineSystemForm.fittingInterfaceModels.find(item=>item.code === interface.name && item.fittingModelId === endReplacePipeFittingModel.id);
                    if (endFittingInterfaceModel) {
                        interface.fittingInterfaceModelId = endFittingInterfaceModel.id;
                    } else {
                        pipelineLayoutInitFittingModelInterfaceWithoutObj (endReplacePipeFittingModel);
                        endFittingInterfaceModel = PipeLineSystemForm.fittingInterfaceModels.find(item=>item.code === interface.name && item.fittingModelId === endReplacePipeFittingModel.id);
                        interface.fittingInterfaceModelId = endFittingInterfaceModel.id;
                    }
                }
            });
            refreshPipelineNodeData(endPipeNode.id);
            pipeline.pipelineModelId = newPipelineModel.id;
            const html = `<div style="width:8rem;height:2rem;color:#fff;font-size:0.8rem;background-color:#00CC997f;line-height:2rem;text-align:center;">${$.t('layout.replaced') + endReplacePipeFittingModel.name}</div>`;
            const panelInfo = {panelPosition:[0,0,0],panelId:'',panelPivot:[0,0],levelType:1, isDestroyParent:false, hasLine: false};
            createCommonTopCard(endPipeNode,html,panelInfo);
        });
        curPipeNode = pipeNodeArr.shift();
        curModelData = curPipeNode ? PipeLineSystemForm.fittingModels.find(item=>item.id === curPipeNode.getAttribute('userData/modelId')) : null;
    }
    app.query('["name"="pipelinePlan"]').destroyAll();
    app.query('["name"="pipelineSaved"]').destroyAll();
    refreshPipelineLinkedInterfaceObj();
}

/**
 * 布局管件替换模型数据更新
 * @param {object} pipelineObj 管线对象
 * @param {string} newInterfaceName 新接口名称
 * @param {Boolean} isStart 是否是起点
 * @returns 无
 * @author myf 2024-07-08
 */
function layoutPipelineReplaceModelDataRefrensh (pipelineObj, newInterfaceName, isStart) {
    const pipelineStartNodeInterface = pipelineObj.pipelineNodeInterfaceList.find(item=>item.interfaceType === (isStart ? 1 : 0));
    if (!pipelineStartNodeInterface) { // 未找到管线对应接口数据
        console.warn($.t('layout.tip.notFindPipeInterfaceData'));
        return;
    }
    pipelineStartNodeInterface.id = isStart ? pipelineObj.startNodeInterfaceId : pipelineObj.endNodeInterfaceId;
    pipelineStartNodeInterface.name = 'pipe-interface' + newInterfaceName;
    // pipelineObj.pipelineModelId = '';
    setTimeout(()=>{
        const curNodeObj = app.query('#'+pipelineStartNodeInterface.pipelineNodeId)[0];
        if (curNodeObj) {
            const curInterface = curNodeObj.subNodes.objects.find(item=>item.name === pipelineStartNodeInterface.name);
            pipelineStartNodeInterface.position = curInterface.position;
        }
    },0);
}

/**
 * 布局替换模型取消
 * @author myf 2024-06-11
 * @returns 无
 */
function layoutReplaceModelCancel () {
    $('[id$=TopCardPanellayoutReplaceModel]').remove();
    app.query('#layoutBatchReplaceModel').destroy();
    removeLoadingMaskPanel('eq-dialog-confirm');
}

/**
  * 布局模型盒子图片数据
  * @param {array} interfaceData 接口数据
  * @param {object} widgetObj 部件对象
  * @param {object} inputPara 自定义参数
  * @returns 无
  * @author myf 2024-06-11
  */
function layoutModelCheckboxImgData (interfaceData, widgetObj, inputPara) {
    const curInterfaceData = JSON.parse(JSON.stringify(interfaceData));
    // console.log('layoutModelCheckboxImgData222',curInterfaceData, widgetObj);
    curInterfaceData.forEach(item=>{
        const modelImgUrlKey = item.modelUrl.substring(item.modelUrl.indexOf('models/'), item.modelUrl.indexOf('/gltf/'));
        item.modelImgUrl = modelImgUrlKey ? 'https://model.3dmomoda.com/' + modelImgUrlKey + '/screenshot.jpg!thumb' : ImgUrl + 'empty.png';
    });
    if (widgetObj) {
        const blockClassName = JSON.parse(widgetObj.valueBlock.blockClassName);
        blockClassName.url = '';
        blockClassName.urlKey = 'modelImgUrl';
        widgetObj.valueBlock.blockClassName = JSON.stringify(blockClassName);
    }
    return curInterfaceData;
}

/**
 * 布局替换模型
 * @param {string} equipId 设备id
 * @author myf 2024-06-11
 * @returns 无
 */
function layoutReplaceModel (equipId) {
    event.stopPropagation();
    const curModel = app.query('#'+equipId)[0];
    if (!curModel) {return;}
    const panelPosition = {};
    panelPosition[equipId] = [-0.1,0.1,0.1];
    const panelInfo = {panelId:'layoutReplaceModel',panelPivot:[0.5,0.5],levelType:2,closeable:false,hasLine:false};
    pageLoadBy3D(EquipLayoutConfig.code === "pipeline" ? "layout-pipe-replace" : "layout-model-replace",{"panelInfo": panelInfo,"panelPosition": panelPosition},{equipId:equipId});
}


/**
 * 布局设备靠墙功能
 * @param {string} equipId 设备id
 * @author myf 2024-06-03
 * @returns 无
 */
function layoutRelyWall (equipId) {
    event.stopPropagation();
    const curModel = app.query('#'+equipId)[0];
    if (!curModel) {return;}
    const curRoom = curModel.room || curModel.parent.getRoomFromLocalPosition(curModel.localPosition);
    if (!curRoom) {return;}
    const modelBox = curModel.boundingBox.points.map(item=>curRoom.worldToSelf(item));
    const xs = modelBox.map(item=>item[0]);
    const zs = modelBox.map(item=>item[2]);
    const minx = Math.min(...xs);
    const maxx = Math.max(...xs);
    const minz = Math.min(...zs);
    const maxz = Math.max(...zs);
    
    const roomBox = curRoom.boundingBox.points.map(item=>curRoom.worldToSelf(item));
    const roomXs = roomBox.map(item=>item[0]);
    const roomZs = roomBox.map(item=>item[2]);
    const roomMinx = Math.min(...roomXs);
    const roomMaxx = Math.max(...roomXs);
    const roomMinz = Math.min(...roomZs);
    const roomMaxz = Math.max(...roomZs);

    const buildingUnitVertices = getDataByAjax(dtvpApiServ,"buildingUnitVertices/api","getBuildingUnitVertices",`roomObjectId=${curRoom.id}`,"","get","json","","",false);
    const wallThickness = buildingUnitVertices[0] ? (buildingUnitVertices[0].wallThickness || 0) : 0;

    const topCardPosition = [
        [roomMinx, 3, (roomMinz + roomMaxz) / 2],
        [roomMaxx, 3, (roomMinz + roomMaxz) / 2],
        [(roomMinx + roomMaxx) / 2, 3, roomMinz],
        [(roomMinx + roomMaxx) / 2, 3, roomMaxz]
    ];
    
    topCardPosition.forEach((item, index)=>{
        const baseModel = app.create({
            id: 'layoutRelyWallSelect' + curRoom.id + index,
            type: 'Box',
            width: 0.001,
            height: 0.001,
            depth: 0.001,
            parent: curRoom,
            localPosition: item,
            name: 'layoutRelyWallSelect',
            pickable: false,
        });
        let html = `<div id="layoutRelyWallSelect${curRoom.id+index}" style="width:2rem;height:2rem;background-image:url(${ImgUrl}icon/eq-dialog-success.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;"></div>`;
        const panelInfo = {panelPosition: [0,1,0],panelId:'',panelPivot:[0.5,0],levelType:2,hasLine:true,closeable:true,isDestroyParent:true, panelZIndex: 2, panelClassName:`"name"="layoutRelyWallSelect"`};
        createCommonTopCard(baseModel, html, panelInfo);
        $('#layoutRelyWallSelect'+curRoom.id+index).click(function(event){
            event.stopPropagation();
            $(`[id*=layoutRelyWallSelect${curRoom.id}]`).remove();
            app.query('["name"="layoutRelyWallSelect"]').destroyAll();
            app.query(`#layoutRelyWallSelect${curRoom.id + index+"TopCardPanel_Line"}`).destroyAll();
            switch(index) {
                case 0: {
                    curModel.localPosition = [curModel.localPosition[0] - minx + roomMinx + (wallThickness/2), curModel.localPosition[1], curModel.localPosition[2]];
                    if ($('#layoutPositionPanel-positionX').parent().hasClass('icon-unlock')) {
                        $('#layoutPositionPanel-positionX').parent().removeClass('icon-unlock');
                        $('#layoutPositionPanel-positionX').parent().addClass('icon-lock');
                        EquipLayoutConfig.positionXLock = true;
                    }
                    break;
                }
                case 1: {
                    curModel.localPosition = [curModel.localPosition[0] + roomMaxx - maxx - (wallThickness/2), curModel.localPosition[1], curModel.localPosition[2]];
                    if ($('#layoutPositionPanel-positionX').parent().hasClass('icon-unlock')) {
                        $('#layoutPositionPanel-positionX').parent().removeClass('icon-unlock');
                        $('#layoutPositionPanel-positionX').parent().addClass('icon-lock');
                        EquipLayoutConfig.positionXLock = true;
                    }
                    break;
                }
                case 2: {
                    curModel.localPosition = [curModel.localPosition[0], curModel.localPosition[1], curModel.localPosition[2] - minz + roomMinz + (wallThickness/2)];
                    if ($('#layoutPositionPanel-positionZ').parent().hasClass('icon-unlock')) {
                        $('#layoutPositionPanel-positionZ').parent().removeClass('icon-unlock');
                        $('#layoutPositionPanel-positionZ').parent().addClass('icon-lock');
                        EquipLayoutConfig.positionZLock = true;
                    }
                    break;
                }
                case 3: {
                    curModel.localPosition = [curModel.localPosition[0], curModel.localPosition[1], curModel.localPosition[2] + roomMaxz - maxz - (wallThickness/2)];
                    if ($('#layoutPositionPanel-positionZ').parent().hasClass('icon-unlock')) {
                        $('#layoutPositionPanel-positionZ').parent().removeClass('icon-unlock');
                        $('#layoutPositionPanel-positionZ').parent().addClass('icon-lock');
                        EquipLayoutConfig.positionZLock = true;
                    }
                    break;
                }
                default: break;
            }
            showModelPosition(equipId);
        });
    });
}

/**
 * 触发元素事件(仅鼠标事件)
 * @param {string} elementId 元素id
 * @param {string} eventType 触发类型
 * @param {number} buttonCode 按钮编码 1-左键，2-右键
 * @author myf 2024-05-31
 * @returns 无
 */
function triggerElementEvent (elementId, eventType, buttonCode=1) {
    let element = elementId;
    if (typeof elementId === 'string') {
        element = document.getElementById(elementId);
    }
    if (element) {
        const event = new MouseEvent(eventType, {
            'view': window,
            'bubbles': true,
            'cancelable': true,
            'button': buttonCode
        });
        element.dispatchEvent(event);
    }
}

/**
 * 坐标微调
 * @param {string} measureType 微调类型 X,Y,Z
 * @param {string} adjustType 调整类型 +,-
 * @author myf 2024-05-31
 * @returns 无
 */
function measureLayoutPosition (measureType, adjustType) {
    if (!measureType || !EquipLayoutConfig['measureType' + measureType]) {
        return;
    }
    const curNum = $('#layoutPositionPanel-position' + measureType).val() - 0;
    let adjustNum = EquipLayoutConfig['measureType' + measureType] - 0;
    if (adjustType === '-') {
        adjustNum = 0 - adjustNum;
    }
    $('#layoutPositionPanel-position' + measureType).val(curNum + adjustNum);
    $('#layoutPositionPanel-position' + measureType + 'Confirm').triggerHandler('click');
}

/**
 * 坐标微调量选择事件
 * @param {Object} select 选项元素
 * @author myf 2024-05-31
 * @returns 无
 */
function measureTypesSelectClick (select) {
    const valuedesc = $(select).attr('valuedesc');
    const type = $(select).attr('id').split('_')[1];
    EquipLayoutConfig['measureType' + type] = valuedesc;
}

/**
 * 切换2D3D布局模式
 * @param {Object} button 按钮
 * @author myf 2024-04-10
 * @returns 无
 * 20240531 从powerEnv迁移
 */
function switch2D3DLayoutMode (button) {
    EquipLayoutConfig.viewMode2D = !EquipLayoutConfig.viewMode2D;
    const floorBlueprint = app.query('floorBlueprint')[0];
    if (EquipLayoutConfig.viewMode2D) {
        // 2D模式
        if (CurSencceObj.type === 'Floor') {
            CurSencceObj.scale = [1,0.1,1];
        } else if (CurSencceObj.type === 'Building') {
            CurSencceObj.floors.forEach(floor=>{
                floor.scale = [1,0.1,1];
            });
        }
        if (floorBlueprint) {
            floorBlueprint.position = [floorBlueprint.position[0], floorBlueprint.position[1] + 0.01, floorBlueprint.position[2]];
        }
        $(button).css('background-image', `url(${ImgUrl}icon-video-3d.png)`);
        $(button).attr('title',$.t('layout.tip.switchTo3DMode'));
    } else { // 3D模式
        if (CurSencceObj.type === 'Floor') {
            CurSencceObj.scale = [1,1,1];
        } else if (CurSencceObj.type === 'Building') {
            CurSencceObj.floors.forEach(floor=>{
                floor.scale = [1,1,1];
            });
        }
        if (floorBlueprint) {
            floorBlueprint.localPosition = [floorBlueprint.localPosition[0], 0.02, floorBlueprint.localPosition[2]];
        }
        $(button).css('background-image', `url(${ImgUrl}icon-video-2d.png)`);
        $(button).attr('title',$.t('layout.tip.switchTo2DMode'));
    }
}

/**
 * 管线多选模式
 * @returns 无
 * @author myf 2023-12-11
 * 20240531 从powerEnv迁移
 */
function layoutMulSelectMode (button) {
    EquipLayoutConfig.mulSelect = !EquipLayoutConfig.mulSelect;
    if (EquipLayoutConfig.mulSelect) {
        $.toast({msgtype:'info',content:$.t('layout.tip.enterMulSelectMode'),time:1000});
        $(button).css('border','2px solid #fff');
        $('#layoutPositionPanelName').text('');
        if (EquipLayoutConfig.lastSelectModelIds) {
            EquipLayoutConfig.lastSelectModelIds.forEach(item=>{
                const lastModelObj = app.query('#'+item)[0];
                // setObjColor(lastModelObj, null);
                setDefaultOutlineColor(lastModelObj, null);
            });
        }
        EquipLayoutConfig.lastSelectModelIds = [];
        $('#layoutPositionPanelEquipNo').parent().css('display','none');
        $('#layoutPositionPanelSysExid').parent().css('display','none');
        if (EquipLayoutConfig.code === 'model-group') {
            $('#layoutPositionModelGroupNameInput').parent().css('display','none');
            $('#layoutPositionModelGroupCodeInput').parent().css('display','none');
            $('#layoutPositionPanelName').parent().css('display','flex');
        }
    } else {
        $(button).css('border','');
        $('#layoutPositionPanel').attr('modelIds', '');
        $.toast({msgtype:'info',content:$.t('layout.tip.quitMulSelectMode'),time:1000});
        $('#layoutPositionPanelName').text('');
        $('#layoutPositionPanelEquipNo').parent().css('display','flex');
        $('#layoutPositionPanelSysExid').parent().css('display','flex');
        if (EquipLayoutConfig.code === 'model-group') {
            $('#layoutPositionModelGroupNameInput').parent().css('display','flex');
            $('#layoutPositionModelGroupCodeInput').parent().css('display','flex');
            $('#layoutPositionPanelName').parent().css('display','none');
        }
    }
}

/**
 * 加载基础设备模型
 * @author myf 2024-05-30
 * @returns 无
 */
function loadBaseEquipModel () {
    app.query('["userData/modelFlag"="layoutModel"]').destroyAll();
    EquipLayoutConfig.baseEquipSaveArr = [];
    let modelLayoutData = getDataByAjax(dtvpApiServ,"modelLayout/api","modelLayoutList",`hospitalId=${BindSysUsers["Sys"]["HospitalID"]}`,"","get","json","","",false);
    const creatingModelData = modelLayoutData.filter(item=>{
        return item.levelObjectId === CurSencceObj.id;
    }).map(item=>{
        EquipLayoutConfig.baseEquipSaveArr.push({
            id: item.id,
            roomObjectId: item.roomObjectId,
            equipModelId: item.equipModelId,
            levelObjectId: item.levelObjectId,
            levelTypeId: item.levelType
        });
        return {
            id: item.id,
            url: item.equipModelId,
            localPosition: [item.posX - 0, item.posY - 0, item.posZ - 0],
            name: item.modelName,
            levelObjectId: item.levelObjectId,
            rotation: item.rotateX ? [item.rotateX - 0, item.rotateY - 0, item.rotateZ - 0] : [0,0,0],
            isLevelLayout: item.levelLayout ? '1' : '0',
            isRoomLayout: item.roomLayout ? '1' : '0',
            isFollowLayout: item.followLayout ? '1' : '0',
            followType: item.followType,
            followObjectId: item.followObjectId,
            savedFlag: true
        };
    });
    if (creatingModelData && creatingModelData.length) {
        creatingModelData.forEach(model=>{
            layoutCreateModelObj(model);
        });
    }
}

/**
 * 跟随设备类型模型选择
 * @param {string} modelId 模型id
 * @param {Object} button 按钮
 * @author myf 2024-05-30
 * @returns 无
 */
function followTypeModelClick (modelId, button) {
    const curModel = app.query('#' + modelId)[0];
    if (curModel) {
        $.toast({msgtype:'info',content:$.t('layout.tip.selectFollowEquip'),time:600});
        const modelObjs = app.query('["userData/modelFlag"="layoutModel"]');
        modelObjs.pauseEvent('click',null,'layoutModelClick');
        app.pauseEvent('click','.Room','selectRoomClick');
        app.one('click', '*', (e)=>{
            curModel.setAttribute('userData/followObjectId', e.object.id);
            $.toast({msgtype:'info',content: $.t('layout.tip.alreadyFollowedEquip') + e.object.id,time:1000});
            $(button).text($.t('layout.bound') + '：' + e.object.id);
            $(button).attr('title', e.object.id);
            app.resumeEvent('click','.Room','selectRoomClick');
            modelObjs.resumeEvent('click',null,'layoutModelClick');
        }, 'followTypeModelClick');
    }
}

/**
 * 跟随设备类型选择
 * @param {Object} select 选项元素
 * @author myf 2024-05-30
 * @returns 无
 */
function followTypesSelectClick (select) {
    const valuekey = $(select).attr('valuekey');
    const equipId = $('#baseEquipfollowTypeSelect').attr('equipId');
    const curModel = app.query('#' + equipId)[0];
    curModel.setAttribute('userData/followType', valuekey);
}

/**
 * 基础设备摆放选择事件
 * @param {Object} checkbox 元素
 * @param {string} desc 选中描述
 * @param {string} value 选中值
 * @param {Object} clickFunParam 自定义入参
 * @author myf 2024-05-30
 * @returns 无
 */
function baseEquipLocationCheckboxClick (checkbox, desc, value, clickFunParam) {
    const curModel = app.query('#' + clickFunParam.equipId)[0];
    if (value.includes('isLevelLayout')) {
        curModel.setAttribute('userData/isLevelLayout', '1');
    } else {
        curModel.setAttribute('userData/isLevelLayout', '0');
    }
    if (value.includes('isRoomLayout')) {
        curModel.setAttribute('userData/isRoomLayout', '1');
    } else {
        curModel.setAttribute('userData/isRoomLayout', '0');
    }
    if (value.includes('isFollowLayout')) {
        curModel.setAttribute('userData/isFollowLayout', '1');
        $('#baseEquipfollowTypeSelect').css('display', 'flex');
    } else {
        curModel.setAttribute('userData/isFollowLayout', '0');
        $('#baseEquipfollowTypeSelect').css('display', 'none');
    }
}

/**
 * 保存布局
 * @returns 无
 * @author myf 2024-05-29
 */
function saveBaseEquipLayout () {
    const baseEquipSaveArr = EquipLayoutConfig.baseEquipSaveArr.map(item=>{
        const curModel = app.query('#model' + item.id)[0];
        return {
            "equipModelId": item.equipModelId,
            "followLayout": (curModel.getAttribute('userData/isFollowLayout') === '1' ? true : false) || false,
            "followObjectId": curModel.getAttribute('userData/followObjectId') || '',
            "followType": curModel.getAttribute('userData/followType') || 0,
            "hospitalId": BindSysUsers["Sys"]["HospitalID"],
            "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
            "id": item.id.includes('baseEquip') ? '' : item.id,
            "levelLayout": (curModel.getAttribute('userData/isLevelLayout') === '1' ? true : false) || false,
            "levelObjectId": item.levelObjectId,
            "levelType": item.levelTypeId,
            "modelName": curModel.name,
            "posX": curModel.localPosition[0].toFixed(2).toString(),
            "posY": curModel.localPosition[1].toFixed(2).toString(),
            "posZ": curModel.localPosition[2].toFixed(2).toString(),
            "roomLayout": (curModel.getAttribute('userData/isRoomLayout') === '1' ? true : false) || false,
            "roomObjectId": item.roomObjectId,
            "rotateX": curModel.angles[0].toFixed(2).toString(),
            "rotateY": curModel.angles[1].toFixed(2).toString(),
            "rotateZ": curModel.angles[2].toFixed(2).toString(),
            "scaleX": curModel.scale[0].toFixed(2).toString(),
            "scaleY": curModel.scale[1].toFixed(2).toString(),
            "scaleZ": curModel.scale[2].toFixed(2).toString()
        }
    });
    $.confirm({msgtype:'info',title:$.t('common.tip'),content:$.t('layout.tip.saveLayoutData'),confirmText:$.t('common.operation.save'),cancelText:$.t('common.operation.cancel')}, ()=>{
        const paraStr = JSON.stringify(baseEquipSaveArr);
        const result = getDataByAjax(dtvpApiServ,"modelLayout/api","saveModelLayoutPage",paraStr,"","post","json","","application/json;charset=utf-8",false);
        if (result) {
            $.toast({msgtype:'info',content:$.t('layout.tip.saveSuccess'),time:1000});
            loadBaseEquipModel();
        } else {
            $.toast({msgtype:'info',content:$.t('layout.tip.saveFail'),time:1000});
        }
    });
}

/**
 * 选房间按模型布局（选模型事件）
 * @param {Object} checkbox 元素
 * @param {string} desc 选中描述
 * @param {string} value 选中值
 * @author myf 2024-05-29
 * @returns 无
 */
function layoutByModelOnRoom (checkbox, desc, value) {
    if (!value[0]) {
        return;
    }
    if (!EquipLayoutConfig.selectedRoomId) {
        triggerElementEvent($(checkbox).attr('id'), 'click');
        $.toast({msgtype:'info',content:$.t('layout.tip.selectRoomFirst'),time:1000});
        return;
    }
    // const checkboxDataStr = $(checkbox).parent().parent().parent().attr('itemdata');
    // const checkboxData = JSON.parse(checkboxDataStr);
    const checkboxData = getPageData($(checkbox).parent().parent().parent().attr('id'), 'itemdata');
    const modelData = checkboxData.find(item=>item.id === value[0]);
    if (modelData) {
        EquipLayoutConfig.z = modelData.defaultPosY ? modelData.defaultPosY - 0 : EquipLayoutConfig.z;
        if (EquipLayoutConfig.z === 99) {
            EquipLayoutConfig.z = 3;
        }
        let modelInfo = {
            id: 'baseEquip' + new Date().getTime(),
            url: modelData.modelUrl,
            name: modelData.name,
            levelObjectId: CurSencceObj.id,
        }
        clickRoomCreateModelEvent(modelInfo);
        EquipLayoutConfig.baseEquipSaveArr ? EquipLayoutConfig.baseEquipSaveArr.push({
            id: modelInfo.id,
            roomObjectId: EquipLayoutConfig.selectedRoomId,
            equipModelId: modelInfo.url,
            levelObjectId: CurSencceObj.id,
            levelTypeId: CurSencceObj.level
        }) : EquipLayoutConfig.baseEquipSaveArr = [{
            id: modelInfo.id,
            roomObjectId: EquipLayoutConfig.selectedRoomId,
            equipModelId: modelInfo.url,
            levelObjectId: CurSencceObj.id,
            levelTypeId: CurSencceObj.level
        }];
        triggerElementEvent($(checkbox).attr('id'), 'click');
    }
}

/**
 * @description 仪表部件管线系统选中事件
 * @param {Object} input 输入元素
 * @return 无
 * @authors myf 2024-05-27
 */
function meterLayoutPipeSysSelectClick (input) {
    event.stopPropagation();
    const valuekey = $(input).attr('valuekey');
    if (valuekey) {
        const valuedataStr = $(input).attr('valuedata');
        const valuedata = JSON.parse(valuedataStr);
        const pipelineTypeId = valuedata.pipelineTypeId;
        if (pipelineTypeId) {
            EquipLayoutConfig.pipelineSystemId = valuekey;
            // EquipLayoutConfig.pipelineTypeId = pipelineTypeId;
            const data = getDataByAjax(dtvpApiServ,"pipelineType/api","getPipelineType",`id=${pipelineTypeId}&hospitalId=`,"","get","json","","",false);
            EquipLayoutConfig.pipelineTypeCode = data[0].code;
        }
    } else {
        EquipLayoutConfig.pipelineTypeCode = '';
        EquipLayoutConfig.pipelineSystemId = '';
        // EquipLayoutConfig.pipelineTypeId = '';
    }
}

/**
 * @authors myf
 * @date    2024-05-16
 * @description 刷新布局信息面板数据
 * @return 无
 */
function refreshLayoutPosition (modelObj) {
    $('#layoutPositionPanel-positionX').val(modelObj.localPosition[0].toFixed(2));
    $('#layoutPositionPanel-positionY').val(modelObj.localPosition[1].toFixed(2));
    $('#layoutPositionPanel-positionZ').val(modelObj.localPosition[2].toFixed(2));
    $('#layoutPositionPanel-rotationX').val(modelObj.angles[0].toFixed(2));
    $('#layoutPositionPanel-rotationY').val(modelObj.angles[1].toFixed(2));
    $('#layoutPositionPanel-rotationZ').val(modelObj.angles[2].toFixed(2));
    $('#layoutPositionPanel-scaleX').val(modelObj.scale[0].toFixed(2))
    $('#layoutPositionPanel-scaleY').val(modelObj.scale[1].toFixed(2))
    $('#layoutPositionPanel-scaleZ').val(modelObj.scale[2].toFixed(2))
}

/**
 * @authors myf
 * @date    2024-05-09
 * @description 布局撤销
 * @return 无
 */
function layoutBackout () {
    if (!EquipLayoutConfig.layoutBackoutArr || !EquipLayoutConfig.layoutBackoutArr.length) {
        return;
    }
    const backoutObj = EquipLayoutConfig.layoutBackoutArr.pop();
    switch (backoutObj.operName) {
        case 'position': case 'angles': case 'scale': {
            backoutObj.targetObjIds.some((objId,index)=>{
                const curObj = app.query('#'+objId)[0];
                if (!curObj) {return;}
                curObj[backoutObj.operName] = backoutObj.oldValues[index];
                refreshLayoutPosition(curObj);
            });
            break;
        }
        case 'all': {
            backoutObj.targetObjIds.some((objId,index)=>{
                const curObj = app.query('#'+objId)[0];
                if (!curObj) {return;}
                curObj.position = backoutObj.oldValues[index][0];
                curObj.angles = backoutObj.oldValues[index][1];
                curObj.scale = backoutObj.oldValues[index][2];
                refreshLayoutPosition(curObj);
            });
            break;
        }
        case 'create': {
            backoutObj.targetObjIds.some((objId,index)=>{
                const curObj = app.query('#'+objId)[0];
                if (!curObj) {return;}
                curObj.destroy();
            });
            break;
        }
        default: break;
    }
    refreshLayoutBackoutBtnStatus();
    $('[name=modelOperaPanel]').remove();
}
/**
 * @authors myf
 * @date    2024-05-09
 * @description 增加布局撤销事件
 * @param {String} operName 操作名称 position-坐标, angles-角度, scale-缩放, all-所有参数
 * @param {Array} targetObjIds 模板对象id数组
 * @param {Array} oldValues 旧数据值数组
 * @return 无
 */
function addLayoutBackoutArr (operName, targetObjIds, oldValues) {

    const obj = {
        operName: operName,
        targetObjIds: targetObjIds,
        oldValues: oldValues,
    };
    EquipLayoutConfig.layoutBackoutArr ? EquipLayoutConfig.layoutBackoutArr.push(obj) : EquipLayoutConfig.layoutBackoutArr = [obj];
    refreshLayoutBackoutBtnStatus();
}
/**
 * @authors myf
 * @date    2024-05-09
 * @description 刷新布局撤销按钮状态
 * @return 无
 */
function refreshLayoutBackoutBtnStatus () {
    if (EquipLayoutConfig.layoutBackoutArr && EquipLayoutConfig.layoutBackoutArr.length) {
        if (EquipLayoutConfig.layoutBackoutArr[EquipLayoutConfig.layoutBackoutArr.length - 1].operName === 'create') {
            $('#layoutBackoutExBtn').css('background-image', `url(${ImgUrl}icon-copy.png)`);
        } else {
            $('#layoutBackoutExBtn').css('background-image', ``);
        }
        $('#layoutBackoutBtn').css('cursor','pointer');
    } else {
        $('#layoutBackoutExBtn').css('background-image', ``);
        $('#layoutBackoutBtn').css('cursor','not-allowed');
    }
}
/**
 * @authors myf
 * @date    2024-05-08
 * @description 布局模型缩放
 * @param {String} zoomMode 缩放模式 in-放大 out-缩小
 * @return 无
 */
function layoutModelZoom (zoomMode) {
    let offset = 0;
    EquipLayoutConfig.zoom = EquipLayoutConfig.zoom || 1;
    if (EquipLayoutConfig.zoom <= 0.2 && zoomMode === 'out') {
        return;
    }
    if (zoomMode === 'in') {
        offset = 0.2;
        EquipLayoutConfig.zoom += 0.2;
    } else {
        offset = -0.2;
        EquipLayoutConfig.zoom -= 0.2;
    }
    const objects = app.query('["userData/modelFlag"="layoutModel"]').objects;
    objects.forEach((obj, index)=>{
        const x = obj.scale[0]+offset;
        const y = obj.scale[1]+offset;
        const z = obj.scale[2]+offset;
        obj.scale = [x, y, z];
        if (index === objects.length - 1) {
            createLayoutPositionPanel(obj);
        }
    });
    if (EquipLayoutConfig.showPipeline) {
        $('[onclick*=showlinkedPipeline]').click();
        $('[onclick*=showlinkedPipeline]').click();
    }
}
/**
 * @authors myf
 * @date    2024-05-07
 * @description 管线跨楼层连接
 * @param {Object} radioElement 按钮
 * @return 无
 */
function pipelineOverFloorLink (radioElement) {
    event.stopPropagation();
    // $('#overFloorPipeLinkFloorSelectRadioDiv').remove();
    // const itemValueStr = $(radioElement).parent().parent().attr('valuekey');
    // const itemValue = JSON.parse(itemValueStr);

    const itemValue = getPageData($(radioElement).parent().parent().attr('id'), 'valuekey'); // myf 20250102 html挂载数据改造

    $('[id*=overFloorTopCard]').remove();
    app.query('["userData/overFloor"="true"]').style.defaultOutlineColor = null;
    app.query('["userData/overFloor"="true"]').objects.forEach(node=>{
        deletePipelineNodeModelAppend(node);
    });

    app.query('["userData/overFloor"="true"]').objects.filter(node=>{
        return itemValue.includes(node.parent.id);
    }).forEach(node=>{
        node.visible = true;
        node.style.defaultOutlineColor = 0xFF0000;
        let html = `<div id="overFloorTopCard${node.id}" style="height:2rem;line-height:2rem;color:#fff;font-size:0.8rem;background:#102b5366;">${node.parent.id}</div>`;
        const panelInfo = {panelPosition: [0,0,0],panelId:'overFloorTopCard'+node.id,panelPivot:[0.5,1],levelType:2,hasLine:false,closeable:false, panelZIndex: 2, panelClassName:`class='overFloorTopCard'`};
        createCommonTopCard(node, html, panelInfo);
        PipeLineSystemForm.showInterfaceSelect = true;
        createNodeInterfaceSelectTopcard(node);
        PipeLineSystemForm.showInterfaceSelect = false;
    });
    // app.query('["userData/overFloor"="true"]').visible = true;
    // app.query('["userData/overFloor"="true"]').style.defaultOutlineColor = 0xFF0000;
    // app.query('["userData/overFloor"="true"]').objects.forEach(node=>{
    //     let html = `<div id="overFloorTopCard${node.id}" style="height:2rem;line-height:2rem;color:#fff;font-size:0.8rem;background:#102b5366;">${node.parent.id}</div>`;
    //     const panelInfo = {panelPosition: [0,0,0],panelId:'overFloorTopCard'+node.id,panelPivot:[0.5,1],levelType:2,hasLine:false,closeable:false, panelZIndex: 2, panelClassName:`class='overFloorTopCard'`};
    //     createCommonTopCard(node, html, panelInfo);
    //     PipeLineSystemForm.showInterfaceSelect = true;
    //     createNodeInterfaceSelectTopcard(node);
    //     PipeLineSystemForm.showInterfaceSelect = false;
    // });
}
/**
 * @authors myf
 * @date    2024-05-07
 * @description 管线跨楼层标记
 * @param {Object} button 按钮
 * @return 无
 */
function pipelineOverFloorMark (button) {
    event.stopPropagation();
    const equipId = $(button).attr('equipId');
    const curModel = app.query('#'+equipId)[0];
    if (curModel.getAttribute('userData/overFloor')) {
        curModel.setAttribute('userData/overFloor','');
        $.toast({msgtype:'info',content:$.t('layout.tip.cancelMark'),time:500});
    } else {
        curModel.setAttribute('userData/overFloor','true');
        $.toast({msgtype:'info',content:$.t('layout.tip.marked'),time:500});
    }
    
}


/**
 * @authors myf
 * @date    2024-10-30
 * @description 退出布局创建模式
 * @return 无
 */
function quitLayoutCreatedMode () {
    if (EquipLayoutConfig.modelCreatedMode) {
        EquipLayoutConfig.modelCreatedMode = false;
        $('#createMouseTip').remove();
        $(document.body).css('cursor',`default`);
        initThingJsTip($.t('layout.tip.createEnd') + "!");
        $.toast({msgtype:'info',content:$.t('layout.tip.createEnd'),time:1000});
        app.off('click',null,'layoutPanelCreateModelClickWith');
        app.off('mousemove',null,'createMouseTipMousemove');
        app.off('click',null,'pipeModelGroupLayoutClick');
        app.off('click',null,'layoutModelClick');
        app.resumeEvent('click',null,'quitLayoutLeavelLevel');
        app.resumeEvent('mousemove',null,'layoutMousemove');
        if (EquipLayoutConfig.clickedRadioElement) {
            triggerElementEvent($(EquipLayoutConfig.clickedRadioElement).attr('id'), 'click');
        }
    }
}

/**
 * @authors myf
 * @date    2024-05-06
 * @description 布局复制模型到其他楼层
 * @param {Object} button 按钮
 * @return 无
 */
function layoutCopyModelToOtherFloor (button) {
    event.stopPropagation();
    quitLayoutCreatedMode();
    let modelIds = '';
    if (EquipLayoutConfig.mulSelect) {
        modelIds = $('#layoutPositionPanel').attr('modelIds');
        // layoutMulSelectMode ();
    } else {
        modelIds = $('#layoutPositionPanelEquipNo').text();
    }
    const buildingId = getSceneIdByTpye('Building');
    const curBuildingObj = app.query('#'+buildingId)[0];
    if (!curBuildingObj || curBuildingObj.type !== 'Building') {
        return;
    }
    const radioConfig = {
        divId: '',
        checkboxId: 'layoutCopyModelToOtherFloorRadio',
        data: curBuildingObj.floors.objects,
        dataDesc: 'id',
        dataValue: 'id',
        isRadio: true,
        clickFun: 'layoutCopyModelToOtherFloorRadioClick',
        levelType: 2,
        clickFunParam: modelIds
    };
    let html = `<div id="layoutCopyModelToOtherFloorRadioDiv" style="padding:0.5rem;position:absolute;background:#102b5366;">`;
    html += createNormalCheckbox(radioConfig);
    html += `</div>`;
    if ($('#layoutCopyModelToOtherFloorRadioDiv')[0]) {
        $(button).html("");
    } else {
        $(button).html(html);
    }
}
/**
 * @authors myf
 * @date    2024-05-06
 * @description 布局复制模型到其他楼层选择点击事件
 * @param {Object} button 按钮
 * @param {String} text 按钮文字
 * @param {String} value 按钮值
 * @param {String} modelIds 模型id字符串
 * @return 无
 */
function layoutCopyModelToOtherFloorRadioClick (button, text, value, modelIds) {
    const itemvalue = $(button).attr('itemvalue');
    const curFloorObj = app.query('#'+itemvalue)[0];
    setObjVisible(curFloorObj, true);
    curFloorObj.showAllRoofs(false);
    const modelIdArr = modelIds.split('^');
    const newModelIdArr = [];
    // const pipeNodes = getDataByAjax(dtvpApiServ,"pipelineNode/api","getPipelineNodePageVO",`hospitalId=${BindSysUsers["Sys"]["HospitalID"]}&buildingObjectId=${getSceneIdByTpye('Building')}&floorObjectId=${itemvalue}`,"","get","json","","",false);
    const curLinkNodes = PipeLineSystemForm.pipelineNodeList.filter(node=>{return node.id.includes('PIPE') && node.levelObjectId === itemvalue}).map(item=>{return item.id.slice(item.id.lastIndexOf('-') + 1)}).sort((a,b)=>{return a - 0 > b - 0 ? -1 : 1});
    const curWaterMeters = PipeLineSystemForm.pipelineNodeList.filter(node=>{return node.id.includes('WM') && node.levelObjectId === itemvalue}).map(item=>{return item.id.slice(item.id.lastIndexOf('-') + 1)}).sort((a,b)=>{return a - 0 > b - 0 ? -1 : 1});
    const curElecticMeters = PipeLineSystemForm.pipelineNodeList.filter(node=>{return node.id.includes('EM') && node.levelObjectId === itemvalue}).map(item=>{return item.id.slice(item.id.lastIndexOf('-') + 1)}).sort((a,b)=>{return a - 0 > b - 0 ? -1 : 1});

    let pipelineNodeLength = curLinkNodes.length ? curLinkNodes[0] - 0 : 0;
    let pipelineWMLength = curWaterMeters.length ? curWaterMeters[0] - 0 : 0;
    let pipelineEMLength = curElecticMeters.length ? curElecticMeters[0] - 0 : 0;

    if (modelIdArr.length) {
        modelIdArr.forEach(modelId=>{
            const curModelObj = app.query('#'+modelId)[0];
            if (curModelObj) {
                const prefix = curModelObj.id.slice(0, curModelObj.id.lastIndexOf('-') + 1);
                let no = pipelineNodeLength + 1;
                let curPipelineCatId = ''
                if (curModelObj.id.includes('T-WM')) {
                    no = pipelineWMLength + 1;
                    curPipelineCatId = '6';
                    pipelineWMLength++;
                } else if (curModelObj.id.includes('T-EM')) {
                    no = pipelineEMLength + 1;
                    curPipelineCatId = '7';
                    pipelineEMLength++;
                } else {
                    pipelineNodeLength++;
                }
                let equipId = prefix + no;
                equipId = equipId.replace(CurSencceObj.id, itemvalue);
                newModelIdArr.push(prefix + no);
                // const pipelineTypeStr = $($(`[id*=pipelineTypeRadio]`)[1]).attr('valuekey');
                // const pipelineType = JSON.parse(pipelineTypeStr);
                const pipelineType = getPageData($($(`[id*=pipelineTypeRadio]`)[1]).attr('id'), 'valuekey'); // myf 20250102 html挂载数据改造
                const newModelInfo = {
                    id: equipId,
                    url: curModelObj.url,
                    name: curModelObj.name,
                    levelObjectId: itemvalue,
                    modelId: curModelObj.getAttribute('userData/modelId'),
                    nodeType: curModelObj.getAttribute('userData/nodeType'),
                    color: '#00ff35',
                    curPipelineCatId: curPipelineCatId,
                    pipelineType: pipelineType,
                    equipNo: equipId,
                    localPosition: curModelObj.localPosition,
                    scale: curModelObj.scale,
                    rotation: curModelObj.angles,
                    radius: curModelObj.getAttribute('userData/radius'),
                    bendRadius: curModelObj.getAttribute('userData/bendRadius'),
                }
                layoutCreateModelObj(newModelInfo, false);
                PipeLineSystemForm.pipelineNodeList.push({
                    "id": newModelInfo.id,
                    "hospitalId": BindSysUsers["Sys"]["HospitalID"],
                    "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
                    "pipelineSystemId": "",
                    "code": "",
                    "name": newModelInfo.name,
                    "nodeType": newModelInfo.nodeType || 0, // 0:连接件 1：仪表 2：阀门
                    "fittingModelId": newModelInfo.modelId || '',
                    "buildingObjectId": getSceneIdByTpye('Building'),
                    "floorObjectId": getSceneIdByTpye('Floor'),
                    "levelObjectId": newModelInfo.levelObjectId,
                    "levelTypeId": 3,
                    "posX": newModelInfo.localPosition[0] + '',
                    "posY": newModelInfo.localPosition[1] + '',
                    "posZ": newModelInfo.localPosition[2] + '',
                    // "location": JSON.stringify(curPipeNodePosition),
                    "rotationX": newModelInfo.rotation ? newModelInfo.rotation[0] : '0',
                    "rotationY": newModelInfo.rotation ? newModelInfo.rotation[1] : '0',
                    "rotationZ": newModelInfo.rotation ? newModelInfo.rotation[2] : '0',
                    "rotationAngle": JSON.stringify(newModelInfo.rotation),
                    "installationDate": "",
                    "meterId": newModelInfo.meterId || "",
                    "status": null,
                    "remark": "",
                });
            }
        });
        addLayoutBackoutArr('create', newModelIdArr, []);
    }
    $.toast({msgtype:'info',content:$.t('layout.tip.copySuccess'),time:500});
}
/**
 * @authors myf
 * @date    2024-04-30
 * @description 布局框选按钮点击
 * @return 无
 */
function layoutBoxSelectBtnClick (button) {
    
    var candidates = app.query('["userData/modelFlag"="layoutModel"]');
    if (EquipLayoutConfig.boxSelect) {
        $.toast({msgtype:'info',content:$.t('layout.tip.endBoxSelect'),time:1000});
        app.off('mousedown',null,'layoutBoxSelectMousedown');
        app.off('mouseup',null,'layoutBoxSelectMouseup');
        candidates.draggable = true;
        candidates.style.outlineColor = null;
        app.removeControl('boxSelectControl');
        $(button).css('border','');
        EquipLayoutConfig.boxSelect = false;
        return;
    } else {
        $.toast({msgtype:'info',content:$.t('layout.tip.startBoxSelect'),time:1000});
        if (!EquipLayoutConfig.mulSelect) {
            triggerElementEvent('layoutMulSelectBtn','click');
        }
        EquipLayoutConfig.boxSelect = true;
        $(button).css('border','2px solid #fff');
        candidates.draggable = false;
        candidates.style.outlineColor = null;
        candidates.style.color = null;
    }
    const control = new THING.RectangleSelectControl(candidates, {
        // 开始框选时的回调处理
        start: function () {
            // 关闭摄像机默认交互
            app.camera.inputEnabled = false;
            // 清除候选集中的物体勾边
            candidates.style.outlineColor = null;
        },
        // 结束框选时的回调函数
        end: function () {
            // 恢复摄像机默认交互
            app.camera.inputEnabled = true;
            var objs = control.objects;
            objs.objects.forEach(obj=>{
                if (candidates.objects.includes(obj)) {
                    // setObjColor(obj, '#99FF00');
                    setDefaultOutlineColor(obj, 'yellow');
                    EquipLayoutConfig.lastSelectModelIds ? EquipLayoutConfig.lastSelectModelIds.push(obj.id) : EquipLayoutConfig.lastSelectModelIds = [obj.id];
                }
            });
            candidates.style.outlineColor = null;
        },
        // 物体被选中的回调处理
        select: function (ev) {
            if (ev.object.style.defaultOutlineColor !== '#FFFF00') {
                ev.object.style.outlineColor = 0xFF0000;
                ev.stopPropagation();  // 禁用默认选中效果
                createLayoutPositionPanel (ev.object);
            }
        },
        // 未被选中物体的回调处理
        deselect: function (ev) {
            ev.object.style.outlineColor = null;
            createLayoutPositionPanel (ev.object);
        }
    });
    app.addControl(control, 'boxSelectControl');
    app.on('mousedown',(ev)=>{
        if (ev.buttons === 1) {
            control.start();
        }
    },'layoutBoxSelectMousedown');
    app.on('mouseup',(ev)=>{
        if (ev.buttons === 1) {
            control.end();
        }
    },'layoutBoxSelectMouseup');
}

/**
 * @authors myf
 * @date    2024-04-30
 * @description 布局格式刷功能
 * @param {Object} button 按钮
 * @return 无
 */
function layoutBrushCopyLockInfo (button) {
    event.stopPropagation();
    const modelObjs = app.query('["userData/modelFlag"="layoutModel"]');
    if (EquipLayoutConfig.brushCopyMode) {
        EquipLayoutConfig.brushCopyMode = false;
        $(button).css('border','');
        $('#div3d').css('cursor',`default`);
        modelObjs.resumeEvent('click',null,'layoutModelClick');
        app.off('click','["userData/modelFlag"="layoutModel"]','brushCopy');
        $('#layoutPositionPanel-rotationX').parent().removeClass('icon-lock');
        $('#layoutPositionPanel-rotationY').parent().removeClass('icon-lock');
        $('#layoutPositionPanel-rotationZ').parent().removeClass('icon-lock');
        $('#layoutPositionPanel-rotationX').parent().addClass('icon-unlock');
        $('#layoutPositionPanel-rotationY').parent().addClass('icon-unlock');
        $('#layoutPositionPanel-rotationZ').parent().addClass('icon-unlock');
        EquipLayoutConfig.rotationXLock = false;
        EquipLayoutConfig.rotationYLock = false;
        EquipLayoutConfig.rotationZLock = false;
        return;
    }
    $('#div3d').css('cursor',`cell`);
    EquipLayoutConfig.brushCopyMode = true;
    $(button).css('border','2px solid #fff');
    modelObjs.pauseEvent('click',null,'layoutModelClick');
    $('#layoutPositionPanel-rotationX').parent().removeClass('icon-unlock');
    $('#layoutPositionPanel-rotationY').parent().removeClass('icon-unlock');
    $('#layoutPositionPanel-rotationZ').parent().removeClass('icon-unlock');
    $('#layoutPositionPanel-rotationX').parent().addClass('icon-lock');
    $('#layoutPositionPanel-rotationY').parent().addClass('icon-lock');
    $('#layoutPositionPanel-rotationZ').parent().addClass('icon-lock');
    EquipLayoutConfig.rotationXLock = true;
    EquipLayoutConfig.rotationYLock = true;
    EquipLayoutConfig.rotationZLock = true;
    app.on('click','["userData/modelFlag"="layoutModel"]',(e)=>{
        const curModel = e.pickedObject;
        const x = (EquipLayoutConfig.positionXLock ?  $('#layoutPositionPanel-positionX').val() : curModel.localPosition[0]) - 0;
        const y = (EquipLayoutConfig.positionYLock ?  $('#layoutPositionPanel-positionY').val() : curModel.localPosition[1]) - 0;
        const z = (EquipLayoutConfig.positionZLock ?  $('#layoutPositionPanel-positionZ').val() : curModel.localPosition[2]) - 0;
        const rx = (EquipLayoutConfig.rotationXLock ?  $('#layoutPositionPanel-rotationX').val() : curModel.angles[0]) - 0;
        const ry = (EquipLayoutConfig.rotationYLock ?  $('#layoutPositionPanel-rotationY').val() : curModel.angles[1]) - 0;
        const rz = (EquipLayoutConfig.rotationZLock ?  $('#layoutPositionPanel-rotationZ').val() : curModel.angles[2]) - 0;
        const sx = (EquipLayoutConfig.scaleXLock ?  $('#layoutPositionPanel-scaleX').val() : curModel.scale[0]) - 0;
        const sy = (EquipLayoutConfig.scaleYLock ?  $('#layoutPositionPanel-scaleY').val() : curModel.scale[1]) - 0;
        const sz = (EquipLayoutConfig.scaleZLock ?  $('#layoutPositionPanel-scaleZ').val() : curModel.scale[2]) - 0;
        addLayoutBackoutArr('all', [curModel.id], [[[...curModel.position], [...curModel.angles], [...curModel.scale]]]);
        curModel.position = curModel.parent.selfToWorld([x,y,z]);
        curModel.angles = [rx,ry,rz];
        curModel.scale = [sx,sy,sz];
        createLayoutPositionPanel(curModel);
        refreshPipelineNodeData(curModel.id);
    },'brushCopy');
}
/**
 * @authors myf
 * @date    2024-04-30
 * @description 布局复制功能
 * @param {Object} button 按钮
 * @return 无
 */
function layoutCopyModel (button) {
    event.stopPropagation();
    $.toast({msgtype:'info',content:$.t('layout.tip.clickAnywhereToCopy'),time:1000});
    $('#layoutPositionPanel-rotationX').parent().removeClass('icon-unlock');
    $('#layoutPositionPanel-rotationY').parent().removeClass('icon-unlock');
    $('#layoutPositionPanel-rotationZ').parent().removeClass('icon-unlock');
    $('#layoutPositionPanel-rotationX').parent().addClass('icon-lock');
    $('#layoutPositionPanel-rotationY').parent().addClass('icon-lock');
    $('#layoutPositionPanel-rotationZ').parent().addClass('icon-lock');
    EquipLayoutConfig.rotationXLock = true;
    EquipLayoutConfig.rotationYLock = true;
    EquipLayoutConfig.rotationZLock = true;
    let equipId = $(button).attr('equipId');
    const curModel = app.query('#'+equipId)[0];
    const prefix = curModel.id.slice(0, curModel.id.lastIndexOf('-') + 1);
    let no = PipeLineSystemForm.pipelineNodeLength + 1;
    let curPipelineCatId = ''
    if (curModel.id.includes('T-WM')) {
        no = PipeLineSystemForm.pipelineWMLength + 1;
        curPipelineCatId = '6';
    } else if (curModel.id.includes('T-EM')) {
        no = PipeLineSystemForm.pipelineEMLength + 1;
        curPipelineCatId = '7';
    }
    equipId = prefix + no;
    // const pipelineTypeStr = $($(`[id*=pipelineTypeRadio]`)[1]).attr('valuekey');
    // const pipelineType = JSON.parse(pipelineTypeStr);
    const pipelineType = getPageData($($(`[id*=pipelineTypeRadio]`)[1]).attr('id'), 'valuekey'); // myf 20250102 html挂载数据改造
    let modelInfo = {
        id: equipId,
        url: curModel.url,
        name: curModel.name,
        levelObjectId: CurSencceObj.id,
        // modelId: curModel.getAttribute('userData/modelId'),
        // nodeType: curModel.getAttribute('userData/nodeType'),
        // color: '#00ff35',
        // curPipelineCatId: curPipelineCatId,
        // pipelineType: pipelineType,
        // equipNo: equipId,
        // radius: curModel.getAttribute('userData/radius'),
        // bendRadius: curModel.getAttribute('userData/bendRadius'),
    }
    EquipLayoutConfig.setAttrArr.forEach(attr=>{
        modelInfo[attr] = curModel.getAttribute('userData/' + attr) || '';
    });
    modelInfo.color = '#00ff35';
    modelInfo.curPipelineCatId = curPipelineCatId;
    modelInfo.pipelineType = pipelineType;
    modelInfo.equipNo = equipId;
    clickFloorCreateModelEvent(modelInfo, null, true);
}

/**
 * @authors myf
 * @date    2024-04-26
 * @description 布局信息面板解锁
 * @return 无
 */
function layoutPositionPanelUnlock () {
    EquipLayoutConfig.positionXLock = false;
    EquipLayoutConfig.positionYLock = false;
    EquipLayoutConfig.positionZLock = false;
    EquipLayoutConfig.scaleXLock = false;
    EquipLayoutConfig.scaleYLock = false;
    EquipLayoutConfig.scaleZLock = false;
    EquipLayoutConfig.rotationXLock = false;
    EquipLayoutConfig.rotationYLock = false;
    EquipLayoutConfig.rotationZLock = false;
}

/**
 * @authors myf
 * @date    2025-03-04
 * @description 蓝图菜单按钮点击事件
 * @return 无
 */
function blueprintMenuBtnClick (element, menuKey) {
    console.log('blueprintMenuBtnClick', menuKey, CurOperateMenu.name);
    if (menuKey === 'show') {
        showBlueprintOnFloor(CurOperateMenu.name + '-');
    }
}

/**
 * @authors myf
 * @date    2024-04-26
 * @description 展示楼层设计图
 * @return 无
 */
function showBlueprintOnFloor(blueprintType = 'pipe')
{
    // myf 20250224 支持更多场景改造
    // if (!$('#layoutPositionPanel')[0]) {
    //     return;
    // };
    const floor = app.level.current; 
    if (floor.type !== 'Floor') {
        return;
    }
    console.log('blueprintMenuBtnClick', blueprintType);
    const blueprintId = floor.id + blueprintType +'Blueprint';
    let blueprint = app.query('#' + blueprintId)[0];
    if (blueprint) {
        blueprint.destroy();
        if (EquipLayoutConfig.highlight) {
            triggerElementEvent('layoutHighlightModelBtn', 'click');
        }
        return;
    }
    if (!EquipLayoutConfig.highlight) {
        triggerElementEvent('layoutHighlightModelBtn', 'click');
    }
    let viewMode2D = false;
    if (EquipLayoutConfig.viewMode2D) {
        triggerElementEvent('layoutSwitchTo2DModelBtn', 'click');
        viewMode2D = true;
    }

    app.create({
        type: 'Marker',
        id: blueprintId,
        name: 'floorBlueprint',
        parent: floor,
        localPosition: [0, 0.01, 0],
        useSpriteMaterial: false,
        url: `${ImgUrl}/layout/${blueprintType + CurSencceObj.id}.jpg`,  //'/uploads/wechat/116183/file/DT3DPlatLMM11/img/感染手术室.png',
        size: 1,
        complete: function () {

            let size = (floor._initBoxSize[0] + 0.25) / (this.image.naturalWidth / 100);

            this.size = size;
            // 平面旋转
            this.rotateX(270);
            this.rotateY(0);
            this.rotateZ(0);
            
            this.inheritStyle = false;
            this.inheritScale = false;
            this.pickable =false;
            this.visible=true;
            this.style.opacity=1;
            this.localPosition = [this.localPosition[0], 0.02, this.localPosition[2]];
            if (viewMode2D) {
                triggerElementEvent('layoutSwitchTo2DModelBtn', 'click');
            }
        }
    });
}

/**
 * @authors myf
 * @date    2024-03-26
 * @description 批量保存布局数据
 * @return 无
 */
function batchSaveLayoutData () {
    if (!EquipLayoutConfig.mulSelect) {
        $.toast({msgtype:'info',content:$.t('layout.tip.batch'),time:1000});
        return;
    }
    $.confirm({msgtype:'info',title:$.t('common.tip'),content:$.t('layout.tip.isBatchSave') + '\n' + $('#layoutPositionPanelName').text(),confirmText:$.t('common.operation.continue'),cancelText:$.t('common.operation.cancel')}, ()=>{
        const modelIds = $('#layoutPositionPanel').attr('modelIds');
        if (modelIds) {
            const data = [];
            const modelIdArr = modelIds.split('^');
            const floorObjectId = getSceneIdByTpye('Floor');
            const buildingObjectId = getSceneIdByTpye('Building');
            modelIdArr.forEach(modelId=>{
                const curModel = app.query('#'+modelId)[0];
                const localPosition = curModel.localPosition.map(pos=>{
                    return pos.toFixed(2);
                });
                let para = {
                    "hospitalId": BindSysUsers["Sys"]["HospitalID"],
                    "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
                    "levelObjectId": CurSencceObj.id,
                    "levelType": CurSencceObj.level,
                    "modelUrl": curModel.url + '/' || '',
                    "name": curModel.name || '',
                    "floorObjectId": floorObjectId,
                    "buildingObjectId": buildingObjectId,
                    "roomObjectId": curModel.getAttribute("userData/roomId") || '',
                    "posX": localPosition[0].toString(),
                    "posY": localPosition[1].toString(),
                    "posZ": localPosition[2].toString(),
                    "rotateX": curModel.angles[0].toString(),
                    "rotateY": curModel.angles[1].toString(),
                    "rotateZ": curModel.angles[2].toString(),
                    "scaleX": (curModel.scale[0] / EquipLayoutConfig.zoom).toFixed(2).toString(),
                    "scaleY": (curModel.scale[1] / EquipLayoutConfig.zoom).toFixed(2).toString(),
                    "scaleZ": (curModel.scale[2] / EquipLayoutConfig.zoom).toFixed(2).toString(),
                };
                if (EquipLayoutConfig.code === 'access') {
                    para = {
                        "id": modelId.slice(5),
                        ...para
                    }
                } else if (EquipLayoutConfig.code === 'equip') {
                    para = {
                        "equipNo": curModel.getAttribute("userData/equipNo"),
                        "modelType": 3,
                        "objectId": curModel.getAttribute("userData/equipNo"),
                        ...para
                    }
                } else if (EquipLayoutConfig.code === 'monitor') {
                    para = {
                        "id": modelId.slice(5),
                        "angleX": curModel.angles[0].toFixed(2).toString(),
                        "angleY": curModel.angles[1].toFixed(2).toString(),
                        "angleZ": curModel.angles[2].toFixed(2).toString(),
                        ...para
                    }
                } else if (EquipLayoutConfig.code === 'meter') {
                    para = {
                        "id": modelId.slice(5),
                        "rotationX": curModel.angles[0].toFixed(2).toString(),
                        "rotationY": curModel.angles[1].toFixed(2).toString(),
                        "rotationZ": curModel.angles[2].toFixed(2).toString(),
                        "hospitalAreaId": BindSysUsers["Sys"]["HospitalAreaID"],
                        "pipelineSystemId": EquipLayoutConfig.pipelineSystemId,
                        "code": "",
                        "name": "",
                        "nodeType": 1, // 0:连接件 1：仪表 2：阀门
                        "fittingModelId": curModel.getAttribute('userData/modelId') || '',
                        "levelObjectId": CurSencceObj.id,
                        "levelTypeId": CurSencceObj.level,
                        "meterId": curModel.getAttribute("userData/meterId") || '',
                        "roomObjectId": curModel.room ? curModel.room.id : '', // myf 20241105 仪表布局添加房间id
                        ...para
                    }
                }
                data.push(para);
            });
            const paraStr = JSON.stringify(data);
            if (EquipLayoutConfig.code === 'access') {
                getDataByAjax(dtvpApiServ,"entranceGuard/api","saveEntranceGuards",paraStr,"","post","json","","application/json;charset=utf-8",false);
            } else if (EquipLayoutConfig.code === 'equip') {
                getDataByAjax(dtvpApiServ,"objectMap/api","saveObjectMapList",paraStr,"","post","json","","application/json;charset=utf-8",false);
                if (EquipLayoutConfig.name === $.t('common.item.airConditioner')) {
                    const saveObj = data.map(item=>{
                        return {
                            "eqNo": item.equipNo,
                            "no": buildingstr[getSceneIdByTpye('Building')].code + '-' + getSceneIdByTpye('Floor').split('F')[1] + 'F-' + "FTS"+item.name.split('_')[1],
                        }
                    });
                    const saveObjStr = JSON.stringify(saveObj);
                    getDataByAjax(dtvpApiServ,"airconditionerEquip/api","saveAirconditionerEquips",saveObjStr,"","post","json","","application/json;charset=utf-8",false);
                }
            } else if (EquipLayoutConfig.code === 'monitor') {
                getDataByAjax(dtvpApiServ,"monitorAttach/api","saveMonitorAttachList",paraStr,"","post","json","","application/json;charset=utf-8",false);
            } else if (EquipLayoutConfig.code === 'meter') {
                savePipelineNode(data);
            }
            saveEquipPositionChange(curModel);
            $.toast({msgtype:'info',content:$.t('layout.tip.saveSuccess'),time:1000});
        }
        
    },undefined);
}

/**
 * @description 设备布局信息列表样式
 * @param {Object} datas 设备数据
 * @param {Object} widgetObjInfo 部件信息
 * @return 无
 * @authors myf 2023-10-30
 */
function equipLayoutInfoListStyle (data,widgetObjInfo) {
    app.query('["userData/modelFlag"="layoutModel"]').destroyAll();
    const widgetDataSource = widgetObjInfo.widgetDataSource;
    if (data && data.data) {
        data = data.data;
    }
    if (!data || !data.length) {
        removeLoadingMaskPanel($('#equipLayoutList'+EquipLayoutConfig.code).parent().parent().attr('id'));
        let html = ``;
        // html += `<div id="equipModelLayoutEmpty${widgetObjInfo.widgetId}" style="height:21rem;margin:0 0 1rem;display:flex;flex-direction:column;align-items:center;justify-content:center;">`;
        html += `<div id="equipModelLayoutEmpty${EquipLayoutConfig.code}" style="width:100%;height:18.5rem;margin:0 0 1rem;display:flex;flex-direction:column;align-items:center;justify-content:center;">`;
        html += `<div style="width:9rem;height:9rem;background-image:url(${ImgUrl}empty.png);background-size:100%;background-repeat: no-repeat;"></div></div>`;
        // if ($('#equipModelLayoutEmpty'+widgetObjInfo.widgetId)[0]) {
        if ($('#equipModelLayoutEmpty'+EquipLayoutConfig.code)[0]) {
            // 空盒子在
            // console.log('空盒子在');
            // $('#equipModelLayoutEmpty'+widgetObjInfo.widgetId).css('display','flex');
            // $('#equipLayoutList'+widgetObjInfo.widgetId).html('');
            $('#equipModelLayoutEmpty'+EquipLayoutConfig.code).css('display','flex');
            $('#equipLayoutList'+EquipLayoutConfig.code).html('');
        } else {
            if ($('#equipLayoutList'+EquipLayoutConfig.code)[0]) {
                // 列表在
                // console.log('列表在',widgetObjInfo);
                $('#' + widgetObjInfo.widgetPanelID).append(html);
                return;
            }
            // console.log('列表不在空盒子不在',widgetObjInfo);
            let htmlList = `<div id="equipLayoutList${EquipLayoutConfig.code}" sourceId="${widgetDataSource}" radioId="${widgetObjInfo.widgetKey}">`;
            // htmlList += `<div `;
            // htmlList += `style="width:4rem;height:1rem;line-height:1rem;text-align:center;margin:0.5rem 0;border-radius:0.25rem;color:#fff;cursor:pointer;background:#006fd2ff;" `;
            // htmlList += `onclick="pipelineMulSelectMode()">批量操作</div>`;
            // htmlList += `<div `;
            // htmlList += `style="width:4rem;height:1rem;line-height:1rem;text-align:center;margin:0.5rem 0;border-radius:0.25rem;color:#fff;cursor:pointer;background:#006fd2ff;" `;
            // htmlList += `onclick="">批量保存</div>`;
            htmlList += `</div>`;
            setTimeout(()=>{
                $('#' + widgetObjInfo.widgetPanelID).children().eq(-1).html(htmlList);
                $('#' + widgetObjInfo.widgetPanelID).children().eq(-1).addClass('eq-hidden-scroll');
                $('#' + widgetObjInfo.widgetPanelID).children().eq(-1).css('height','18.5rem');
            },0);
            $('#' + widgetObjInfo.widgetPanelID).append(html);
            // app.pauseEvent('singleclick','.Room','roomclick');
            if (CurSencceObj.type === 'Floor') {
                // createRoomImgPanel(CurSencceObj, {'fontColor':'#fff'});
                if (EquipLayoutConfig.code === 'monitor') {
                    CurSencceObj.scale = [1,0.01,1];
                }
            }
        }
        return '';
    } else {
        // console.log('有数据');
        $('#equipModelLayoutEmpty'+EquipLayoutConfig.code).css('display','none');
    }
    if (EquipLayoutConfig.code === 'access') {
        EquipLayoutConfig.accessLayoutBindDoorObjIds = [];
    } else if (EquipLayoutConfig.code === 'meter') {
        data = data.map(item=>{
            return {
                id: item.pipelineNodes.length ? item.pipelineNodes[0].id : '',
                name: item.name,
                code: item.code,
                sysExid: item.sysExid,
                modelUrl: item.modelUrl || '/api/models/3fe9da65fbba4380bec374ccd8475836/0/gltf/',
                posX: item.pipelineNodes.length ? item.pipelineNodes[0].posX : '',
                posY: item.pipelineNodes.length ? item.pipelineNodes[0].posY : '',
                posZ: item.pipelineNodes.length ? item.pipelineNodes[0].posZ : '',
                rotateX: item.pipelineNodes.length ? item.pipelineNodes[0].rotationX : '',
                rotateY: item.pipelineNodes.length ? item.pipelineNodes[0].rotationY : '',
                rotateZ: item.pipelineNodes.length ? item.pipelineNodes[0].rotationZ : '',
                levelObjectId: item.pipelineNodes.length ? item.pipelineNodes[0].levelObjectId : '',
                meterId: item.id,
            }
        });
    }
    // else if (EquipLayoutConfig.code === 'path') {
    //     pathData = data;
    //     data = data.map(item=>{return item.innerPath});
    // }

    
    let listHtml = ``;
    data.forEach(item=>{
        // myf 20240321 修改列表样式，添加设备编号、第三方编号展示
        let equipId = equipName = equipNo = sysExid = '';
        let isFreeLayout = 0;
        switch (EquipLayoutConfig.code) {
            case 'access': {
                equipId = item.id;
                equipName = item.name;
                equipNo = item.guardObjectId;
                sysExid = item.sysExid;
                break;
            }
            case 'monitor': {
                equipId = item.id;
                equipName = item.posDesc;
                equipNo = item.monitorNo;
                sysExid = item.sysExid;
                isFreeLayout = 1;
                break;
            }
            case 'equip': {
                equipId = item.equipId;
                equipName = item.equipName;
                equipNo = item.equipNo;
                sysExid = '';
                if (EquipLayoutConfig.name === '空调') {
                    // equipId = item.equipNo;
                    // equipName = item.name || '';
                    // equipNo = item.equipNo || '';
                    sysExid = item.sysExid
                }
                break;
            }
            case 'meter': {
                equipId = item.id;
                equipName = item.name;
                equipNo = item.code;
                sysExid = item.sysExid;
                isFreeLayout = 1;
                break;
            }
            case 'path': {
                equipId = item.innerPath.id;
                equipName = item.innerPath.name;
                break;
            }
            case 'information-equip': {
                equipId = item.equipId;
                equipName = item.name;
                equipNo = item.no;
                break;
            }
            case 'facility': { // myf 20250124 设施布局
                equipId = item.id;
                equipNo = item.no;
                sysExid = item.sysExid;
                break;
            }
            default: break;
        }
        let prefix = 'model';
        if (EquipLayoutConfig.code === 'path') {
            prefix = 'line';
        }
        item.equipId = equipId;
        item.equipName = equipName;
        item.equipNo = equipNo;
        item.sysExid = sysExid;
        listHtml += `<div style="position:relative;" class="equipLayoutListBorder" onclick="showModelPosition('${prefix+equipId}')" ondblclick="lookAt3DObj('${prefix+equipId}')">`;
        listHtml += `<div style="display:flex;justify-content:space-between">`;
        listHtml += `<div style="display:flex;">`;
        if (item.doorId) {
            listHtml += `<div style="width:1rem;height:1rem;margin:0.5rem;background-image:url(${ImgUrl}bind-door-icon.png);background-size:100%;background-repeat: no-repeat;cursor:pointer;"></div>`;
        } 
        listHtml += `<div style="line-height:2rem;height:2rem;color:#fff;cursor:pointer;" title="单击获取信息，双击前往位置">${equipName}</div>`;
        listHtml += `</div>`;
        listHtml += `<div style="line-height:2rem;height:2rem;color:#fff;">${equipNo}</div>`;
        listHtml += `</div>`;
        if (EquipLayoutConfig.code === 'meter') {
            listHtml += `<div style="line-height:2rem;height:2rem;color:#fff;">${item.levelObjectId}</div>`;
        }
        listHtml += `<div style="display:flex;justify-content:space-between">`;
        if (EquipLayoutConfig.code !== 'path') {
            listHtml += `<div style="line-height:2rem;height:2rem;color:#fff;">${sysExid}</div>`;
            const isReset = (item.posX && item.posY && item.posZ) && (item.posX !== '0' && item.posY !== '0' && item.posZ !== '0');
            listHtml += `<div meterId="${item.meterId}" equipId="${equipId}" sysExid="${sysExid}" name="${equipName}" equipNo="${(equipNo)}" `;
            listHtml += `style="width:4rem;height:1rem;line-height:1rem;text-align:center;margin:0.5rem 0;border-radius:0.25rem;color:#fff;cursor:pointer;background:#006fd2ff;" `;
            listHtml += `onclick="${isFreeLayout ? 'layoutPanelCreateModelClick' : 'layoutPanelCreateModelClickWithList'}(this,'${isReset ? 1 : 0}')">${isReset ? '重置' : '生成模型'}</div>`;
        } else {
            listHtml += `<div style="line-height:2rem;height:2rem;color:#fff;">${item.innerPathPosList[0].name}</div>`;
            // listHtml += `<div style="line-height:2rem;height:2rem;color:#fff;">到</div>`;
            listHtml += `<div style="line-height:2rem;height:2rem;color:#fff;">${item.innerPathPosList[item.innerPathPosList.length - 1].name}</div>`;
        }
        listHtml += `</div>`;
        listHtml += `</div>`;
        if (EquipLayoutConfig.code === 'access') {
            EquipLayoutConfig.accessLayoutBindDoorObjIds.push(item.doorObjectId);
        }
    });
    
    if ($('#equipLayoutList'+EquipLayoutConfig.code)[0]) {
        $('#equipLayoutList'+EquipLayoutConfig.code).html(listHtml);
        if (EquipLayoutConfig.code === 'path') {
            data.forEach(item=>{
                createLayoutPath(item);
            });
            removeLoadingMaskPanel($('#equipLayoutList'+EquipLayoutConfig.code).parent().parent().attr('id'));
            return;
        }
        const creatingModelData = data.filter(item=>{
            return !!item.modelUrl && item.posX && item.posX !== '0' && (item.levelObjectId === CurSencceObj.id || item.floorObjectId === CurSencceObj.id || item.buildingObjectId === CurSencceObj.id);
            // return !!item.modelUrl && item.posX && item.posX !== '0';
        }).map(item=>{
            return {
                id: item.equipId,
                url: item.modelUrl,
                localPosition: [item.posX - 0, item.posY - 0, item.posZ - 0],
                name: item.equipName,
                // name: item.sysExid || item.equipNo || item.monitorNo,
                levelObjectId: item.levelObjectId || item.floorObjectId || '',
                rotation: item.rotateX ? [item.rotateX - 0, item.rotateY - 0, item.rotateZ - 0] : [0,0,0],
                equipNo: item.equipNo,
                sysExid: item.sysExid,
                savedFlag: true
            };
        });
        // console.log('------创建模型数据-----1',creatingModelData,data);
        if (creatingModelData && creatingModelData.length) {
            creatingModelData.forEach(model=>{layoutCreateModelObj(model);});
        }
        removeLoadingMaskPanel($('#equipLayoutList'+EquipLayoutConfig.code).parent().parent().attr('id'));
        return '';
    }
    let html = `<div id="equipLayoutList${EquipLayoutConfig.code}" sourceId="${widgetDataSource}" radioId="${widgetObjInfo.widgetKey}">`;
    html += listHtml;
    html += `</div>`;
    // console.log('设备布局信息列表样式',html,$('#' + widgetObjInfo.widgetPanelID).children());
    // addLoadingMaskPanel('equipLayoutList' + EquipLayoutConfig.code);
    setTimeout(()=>{
        $('#' + widgetObjInfo.widgetPanelID).children().eq(-1).html(html);
        $('#' + widgetObjInfo.widgetPanelID).children().eq(-1).addClass('eq-hidden-scroll');
        $('#' + widgetObjInfo.widgetPanelID).children().eq(-1).css('height','18.5rem');
        removeLoadingMaskPanel($('#equipLayoutList'+EquipLayoutConfig.code).parent().parent().attr('id'));
    },0);
    if (EquipLayoutConfig.code === 'path') {
        data.forEach(item=>{
            createLayoutPath(item);
        });
        return;
    }

    const creatingModelData = data.filter(item=>{
        return !!item.modelUrl && item.posX && item.posX !== '0' && (item.levelObjectId === CurSencceObj.id || item.floorObjectId === CurSencceObj.id || item.buildingObjectId === CurSencceObj.id);
    }).map(item=>{
        return {
            id: item.equipId,
            url: item.modelUrl,
            localPosition: [item.posX - 0, item.posY - 0, item.posZ - 0],
            name: item.equipName,
            // name: item.sysExid || item.equipNo || item.monitorNo,
            levelObjectId: item.levelObjectId || item.floorObjectId || '',
            rotation: item.rotateX ? [item.rotateX - 0, item.rotateY - 0, item.rotateZ - 0] : [0,0,0],
            equipNo: item.equipNo,
            sysExid: item.sysExid,
            savedFlag: true
        };
    });
    // console.log('------创建模型数据-----2',creatingModelData,data);
    if (creatingModelData && creatingModelData.length) {
        creatingModelData.forEach(model=>{layoutCreateModelObj(model);});
    }
    // app.pauseEvent('singleclick','.Room','roomclick');
}
