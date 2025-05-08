/**
 * 存放只处理ICIMS的程序
 * @createdBy myf 
 * @createDate 2025-03-20
*/

/**
 * @authors myf
 * @date    2025-03-21
 * @description 业务单元进入楼宇-点位展示
 * @return 无
 */
function businessUnitEnterBuilding () {
    const data = [
        {floorObjectId: 'C5-A1-B1-F1', status: 0, statusDesc: '停', unitName: '外科诊室', roomObjectId: 'RC5-A1-B1_C5-A1-B1-F1_033', id: 'xx'},
        {floorObjectId: 'C5-A1-B1-F1', status: 0, statusDesc: '停', roomObjectId: 'RC5-A1-B1_C5-A1-B1-F1_013', id: 'xx2', typeCode: '0'},
        {floorObjectId: 'C5-A1-B1-F3', status: 1, statusDesc: '开', unitName: '产科诊室', roomObjectId: 'RC5-A1-B1_C5-A1-B1-F3_026', id: 'xxs'},
        {floorObjectId: 'C5-A1-B1-F3', status: 1, statusDesc: '开', roomObjectId: 'RC5-A1-B1_C5-A1-B1-F3_016', id: 'xxs2', typeCode: '0'},
        {floorObjectId: 'C5-A1-B1-F5', status: 2, statusDesc: '待上线', unitName: '日间手术间', roomObjectId: 'RC5-A1-B1_C5-A1-B1-F5_022', id: 'xxx'},
        {floorObjectId: 'C5-A1-B1-F4', status: 1, statusDesc: '开', roomObjectId: 'RC5-A1-B1_C5-A1-B1-F4_012', id: 'xxx2', typeCode: '0'},
        {floorObjectId: 'C5-A1-B1-F5', status: 1, statusDesc: '开', roomObjectId: 'RC5-A1-B1_C5-A1-B1-F5_012', id: 'xxx2', typeCode: '1'},
    ];
    // const data = [
    //     {floorObjectId: 'C2-B1-F1', status: 0, statusDesc: '停', unitName: '外科诊室', roomObjectId: 'RC2-B1_C2-B1-F1_006', id: 'xx'},
    //     {floorObjectId: 'C2-B1-F4', status: 1, statusDesc: '开', unitName: '产科诊室', roomObjectId: 'RC2-B1_C2-B1-F4_012', id: 'xxs'},
    //     {floorObjectId: 'C2-B1-F7', status: 2, statusDesc: '待上线', unitName: '日间手术间', roomObjectId: 'RC2-B1_C2-B1-F7_025', id: 'xxx'},
    // ];
    data.forEach(item=>{
        const roomObject = app.query('#' + item.roomObjectId)[0];
        if (roomObject) {
            if (item.typeCode === '0' || item.typeCode === '1') { // 缴费 输血
                let url = item.typeCode === '0' ? ImgUrl + 'icon-pay' : ImgUrl + 'icon-blood';
                if (item.status === 0) {
                    url += '-close.png'
                } else if (item.status === 1) {
                    url += '-open.png'
                } else if (item.status === 2) {
                    url += '.png'
                }
                const markConfig = {
                    id: item.id,
                    url: url,
                    parentObject: roomObject,
                    localPosition: [0,0,0],
                    levelType: 1
                };
                const textConfig = {};
                createCommonMarker(markConfig, textConfig);
            } else {
                app.create({
                    id: 'unitPoint' + item.roomObjectId,
                    type: 'Thing',
                    url: '/api/models/3f01171358784dd1b9f8fcfb5f05bd91/0/gltf/',
                    parent: roomObject,
                    localPosition: [0,0,0],
                    scale: [0.005, 0.005, 0.005],
                    complete: function () {
                        const curPointObj = this;
                        curPointObj.style.alwaysOnTop = true;
                        curPointObj.style.opacity = 1;
                        curPointObj.style.highlightIntensity = 1;
                        curPointObj.style.highlight = '#6ee4f9';
                        curPointObj.style.color = '#6ee4f9';
                        registerArrayByType(1, curPointObj.id, 1);
                        const markConfig = {
                            id: item.id,
                            parentObject: curPointObj,
                            localPosition: [0,0,0],
                            levelType: 1
                        };
                        let statusColor = '#fe5f5a';
                        if (item.status === 1) {
                            statusColor = '#6ee4f9';
                        } else if (item.status === 2) {
                            statusColor = '#ffb657';
                        }
                        const textConfig = {
                            text: `<div style="display:flex;"><div>${item.floorObjectId.slice(item.floorObjectId.indexOf('F') + 1)}F ${item.unitName}</div><div style="color:${statusColor};background-color:${statusColor}7f;padding:0 0.2rem;font-weight:600;">${item.statusDesc}</div></div>`,
                            fontWeight: 400
                        };
                        createCommonMarker(markConfig, textConfig);
                    }
                });
            }
            
        }
    });
}

/**
 * @authors myf
 * @date    2025-03-21
 * @description 点击楼宇树按钮后进入楼宇场景
 * @return 无
 */
function businessUnitTreeBuildingBtn () {
    // const building = app.query('#C2-B1')[0];
    const building = app.query('#C5-A1-B1')[0];
    changeToSence = building;
    const promise = waitLevelChange(building);
    promise.then(()=>{
        expandFloor(building.id, 1);
        setTimeout(()=>{
            businessUnitEnterBuilding();
        }, 500);
        
    });
}

/**
 * @authors myf
 * @date    2025-03-24
 * @description 点击楼宇树按钮后进入楼层场景
 * @return 无
 */
function businessUnitTreeFloorBtn () {
    const floor = app.query('#C5-A1-B1-F2')[0];
    // const floor = app.query('#C2-B1-F1')[0];
    changeToSence = floor;
    const promise = waitLevelChange(floor);
    promise.then(()=>{
        // const promise = getInterfaceData(dtvpApiServ + "/eqAssetCat/api/getEqAssetCatTree", {code: '', description: ''});
        // promise.then(result=>{
        //     const roomData = result.data;
        // });
        // const roomData = [{
        //     roomName: "内科诊室01",
        //     roomObjectId: "RC5-A1-B1_C5-A1-B1-F2_754",
        //     // roomObjectId: "RC2-B1_C2-B1-F1_006",
        //     areaType: "门诊区",
        //     areaId: "area_001",
        //     areaName: "内科门诊区",
        //     businessUnitId: "bu_001",
        //     businessUnitName: "门诊部",
        //     departmentId: "dept_001",
        //     departmentName: "内科",
        //     openTime: "08:00-17:30",
        //     roomTypeCode: "clinic",
        //     roomTypeDesc: "诊室",
        //     roomStatusCode: "1",
        //     roomStatusDesc: "空闲"
        // },{
        //     roomName: "内科诊室01",
        //     roomObjectId: "RC5-A1-B1_C5-A1-B1-F2_074",
        //     // roomObjectId: "RC2-B1_C2-B1-F1_006",
        //     areaType: "门诊区",
        //     areaId: "area_001",
        //     areaName: "内科门诊区",
        //     businessUnitId: "bu_001",
        //     businessUnitName: "门诊部",
        //     departmentId: "dept_001",
        //     departmentName: "内科",
        //     openTime: "08:00-17:30",
        //     roomTypeCode: "clinic",
        //     roomTypeDesc: "诊室",
        //     roomStatusCode: "1",
        //     roomStatusDesc: "空闲"
        // },{
        //     roomName: "内科诊室01",
        //     roomObjectId: "RC5-A1-B1_C5-A1-B1-F2_093",
        //     // roomObjectId: "RC2-B1_C2-B1-F1_006",
        //     areaType: "门诊区",
        //     areaId: "area_001",
        //     areaName: "内科门诊区",
        //     businessUnitId: "bu_001",
        //     businessUnitName: "门诊部",
        //     departmentId: "dept_001",
        //     departmentName: "内科",
        //     openTime: "08:00-17:30",
        //     roomTypeCode: "clinic",
        //     roomTypeDesc: "诊室",
        //     roomStatusCode: "1",
        //     roomStatusDesc: "空闲"
        // },{
        //     roomName: "内科诊室01",
        //     roomObjectId: "RC5-A1-B1_C5-A1-B1-F2_094",
        //     // roomObjectId: "RC2-B1_C2-B1-F1_006",
        //     areaType: "门诊区",
        //     areaId: "area_001",
        //     areaName: "内科门诊区",
        //     businessUnitId: "bu_001",
        //     businessUnitName: "门诊部",
        //     departmentId: "dept_001",
        //     departmentName: "内科",
        //     openTime: "08:00-17:30",
        //     roomTypeCode: "clinic",
        //     roomTypeDesc: "诊室",
        //     roomStatusCode: "1",
        //     roomStatusDesc: "空闲"
        // },{
        //     roomName: "内科诊室01",
        //     roomObjectId: "RC5-A1-B1_C5-A1-B1-F2_095",
        //     // roomObjectId: "RC2-B1_C2-B1-F1_006",
        //     areaType: "门诊区",
        //     areaId: "area_001",
        //     areaName: "内科门诊区",
        //     businessUnitId: "bu_001",
        //     businessUnitName: "门诊部",
        //     departmentId: "dept_001",
        //     departmentName: "内科",
        //     openTime: "08:00-17:30",
        //     roomTypeCode: "clinic",
        //     roomTypeDesc: "诊室",
        //     roomStatusCode: "1",
        //     roomStatusDesc: "空闲"
        // },{
        //     roomName: "内科诊室01",
        //     roomObjectId: "RC5-A1-B1_C5-A1-B1-F2_096",
        //     // roomObjectId: "RC2-B1_C2-B1-F1_006",
        //     areaType: "门诊区",
        //     areaId: "area_001",
        //     areaName: "内科门诊区",
        //     businessUnitId: "bu_001",
        //     businessUnitName: "门诊部",
        //     departmentId: "dept_001",
        //     departmentName: "内科",
        //     openTime: "08:00-17:30",
        //     roomTypeCode: "clinic",
        //     roomTypeDesc: "诊室",
        //     roomStatusCode: "1",
        //     roomStatusDesc: "空闲"
        // }, {
        //     roomName: "放射科检查室01",
        //     roomObjectId: "RC5-A1-B1_C5-A1-B1-F2_748",
        //     areaType: "检查区",
        //     areaId: "area_002",
        //     areaName: "放射科检查区",
        //     businessUnitId: "bu_002",
        //     businessUnitName: "医技科",
        //     departmentId: "dept_002",
        //     departmentName: "放射科",
        //     openTime: "09:00-16:00",
        //     roomTypeCode: "check",
        //     roomTypeDesc: "检查室",
        //     roomStatusCode: "2",
        //     roomStatusDesc: "开放"
        // },{
        //     roomName: "放射科检查室02",
        //     roomObjectId: "RC5-A1-B1_C5-A1-B1-F2_752",
        //     areaType: "检查区",
        //     areaId: "area_002",
        //     areaName: "放射科检查区",
        //     businessUnitId: "bu_002",
        //     businessUnitName: "医技科",
        //     departmentId: "dept_002",
        //     departmentName: "放射科",
        //     openTime: "09:00-16:00",
        //     roomTypeCode: "check",
        //     roomTypeDesc: "检查室",
        //     roomStatusCode: "2",
        //     roomStatusDesc: "开放"
        // }, {
        //     roomName: "理疗室01",
        //     roomObjectId: "RC5-A1-B1_C5-A1-B1-F2_755",
        //     areaType: "治疗区",
        //     areaId: "area_003",
        //     areaName: "康复治疗区",
        //     businessUnitId: "bu_003",
        //     businessUnitName: "康复中心",
        //     departmentId: "dept_003",
        //     departmentName: "康复科",
        //     openTime: "08:30-17:00",
        //     roomTypeCode: "trss",
        //     roomTypeDesc: "治疗室",
        //     roomStatusCode: "3",
        //     roomStatusDesc: "关闭"
        // }, {
        //     roomName: "理疗室02",
        //     roomObjectId: "RC5-A1-B1_C5-A1-B1-F2_761",
        //     areaType: "治疗区",
        //     areaId: "area_003",
        //     areaName: "康复治疗区",
        //     businessUnitId: "bu_003",
        //     businessUnitName: "康复中心",
        //     departmentId: "dept_003",
        //     departmentName: "康复科",
        //     openTime: "08:30-17:00",
        //     roomTypeCode: "trss",
        //     roomTypeDesc: "治疗室",
        //     roomStatusCode: "3",
        //     roomStatusDesc: "关闭"
        // }, {
        //     roomName: "理疗室03",
        //     roomObjectId: "RC5-A1-B1_C5-A1-B1-F2_793",
        //     areaType: "治疗区",
        //     areaId: "area_003",
        //     areaName: "康复治疗区",
        //     businessUnitId: "bu_003",
        //     businessUnitName: "康复中心",
        //     departmentId: "dept_003",
        //     departmentName: "康复科",
        //     openTime: "08:30-17:00",
        //     roomTypeCode: "trss",
        //     roomTypeDesc: "治疗室",
        //     roomStatusCode: "3",
        //     roomStatusDesc: "关闭"
        // }];
        // const departmentColors = ['#FF6B6B',  // 红色
        //     '#4ECDC4',  // 青色
        //     '#45B7D1',  // 蓝色
        //     '#96CEB4',  // 绿色
        //     '#FFEEAD',  // 米黄
        //     '#D4A5A5',  // 粉色
        //     '#9B59B6',  // 紫色
        //     '#3498DB'   // 深蓝
        // ];

        /*
        roomData和departmentColors从注释的结构修改为现在的结构，需要对数据处理为三个对象数组。1.按区域areaId分组，对象包含区域id、区域名称、区域颜色（每个区域分配一个）、房间数组[房间对象id]、中心房间areaObjectId。2.业务单元（即科室）useDeptId数组，包含科室id、科室名称。3.按房间类型分组，包含房间类型unitType、房间类型描述unitTypeDesc、
        */
        const roomData = 
        [{
            "buildingUnitId": "0b8d8c9e209e4d00a9e7fe19cf679b97",
            "hospitalId": "7",
            "hospitalName": "东华医为智慧医院",
            "floorIndex": "3",
            "floorId": "6415b7cc1d84ce6a260dea09d19c9d9a",
            "floorObjectId": "C5-A1-B1-F2",
            "areaType": 1,
            "areaId": "58e549d488f7b3f8f215ebc5b814c55e",
            "useDeptId": "a88ff74c12594a7b87def3b8180e6a93",
            "unitType": "",
            "status": 99,
            "roomObjectId": "RC5-A1-B1_C5-A1-B1-F2_046",
            "posX": "63.89",
            "posY": "0.00",
            "posZ": "80.94",
            "floorNo": "2F",
            "buildingId": "325c39655ee963308797829dc0a06662",
            "hospitalAreaId": "",
            "buildingDesc": "门诊楼",
            "buildingObjectId": "C5-A1-B1",
            "areaCode": "DXYQ-MZEC（ZHWK）",
            "areaObjectId": "RC5-A1-B1_C5-A1-B1-F2_096",
            "areaDesc": "综合外科诊区",
            "areaTypeDesc": null,
            "unitTypeDesc": "",
            "useDeptName": "介入血管外科门诊"
        }];
        const departmentColors = {
            "0": "#88ff55",
            "1": "#E95353",
            "2": "#F9882A",
            "3": "#F8D800",
            "4": "#28C76F",
            "5": "#0396FF",
            "6": "#9F44D3",
            "7": "#FA016D",
            "8": "#B3315F",
            "9": "#32CCBC",
            "10": "#00EAFF",
            "11": "#7367F0",
            "12": "#F067B4",
            "13": "#1D6FA3"
        };
        const deptColorMap = new Map();
        let colorIndex = 0;
        const typeMap = new Map();
        const deptMap = new Map();
        roomData.forEach(room => {
            const curRoomData = JSON.parse(JSON.stringify(room));
            const roomTypeCode = curRoomData.roomTypeCode;
            if (!typeMap.has(roomTypeCode)) {
                typeMap.set(roomTypeCode, {
                    label: curRoomData.roomTypeDesc,
                    code: roomTypeCode,
                    onClick: 'showBusinessFloorRoomText',
                });
            }
            const curRoomObj = app.query('#' + curRoomData.roomObjectId)[0];
            if (!deptColorMap.has(curRoomData.departmentId)) {
                deptColorMap.set(curRoomData.departmentId, {color: departmentColors[colorIndex % departmentColors.length], departmentName: curRoomData.departmentName, departmentId: curRoomData.departmentId, departRoomObjId: curRoomData.roomObjectId});
                colorIndex++;
                deptMap.set(curRoomData.departmentId, {departmentId: curRoomData.departmentId, roomObjects: [curRoomObj]});
            } else {
                const curDeptMap = deptMap.get(curRoomData.departmentId);
                curDeptMap.roomObjects.push(curRoomObj);
            }
            curRoomData.departmentColor = deptColorMap.get(curRoomData.departmentId);
            
            // curRoomObj.setAttribute('userData/roomTypeCode', room.roomTypeCode);
            curRoomObj.setAttribute('userData/deptColor', curRoomData.departmentColor.color); // 修改这行，访问 color 属性
            curRoomObj.setAttribute('userData/roomTypeCode', curRoomData.roomTypeCode);
            // curRoomObj.userData.roomTypeCode = roomTypeCode;
        });
        const roomTypeData = Array.from(typeMap.values());
        const unitData = Array.from(deptColorMap.values());
        const deptData = Array.from(deptMap.values());
        console.log('roomTypeData',roomTypeData);
        createFloorRoomSelectPanel(roomTypeData, unitData, deptData);
    });
}

/**
 * @authors myf
 * @date    2025-03-24
 * @description 展示业务楼层区域
 * @params {Boolean} checked 选中状态
 * @return 无
 */
function showBusinessFloorArea (checked) {
    if (checked) {
        const areaLayoutData = getDataByAjax(dtvpApiServ,"innerPoiArea/api","getInnerPoiArea",`hospitalId=${BindSysUsers["Sys"]["HospitalID"]}&floorObjectId=${getSceneIdByTpye('Floor')}`,"","get","json","","",false);
        areaLayoutData.forEach(data=>{
            const areaDatas = data.areaVertices;
            const areaId = data.objectId;
            const areaPoints = areaDatas.map(item=>{
                return [item.posX - 0, item.posY - 0, item.posZ - 0];
            }).map(item=>{
                const localPosition = CurSencceObj.selfToWorld(item);
                return localPosition;
            });
            app.create({
                id: areaId,
                type: 'PolygonRegion',
                points: areaPoints,  // 传入世界坐标系下点坐标
                parent: CurSencceObj,
                style: {
                    regionColor: '#0bd2f4',  // 区域颜色
                    lineColor: '#0bd2f4',  // 边框颜色
                    regionOpacity: 0.5,  // 不透明度 (默认是 0.5 半透明)
                },
                complete: function () {
                    const html = createArrowLabel(item.description);
                    const panelInfo = {panelPosition: [0,1,0], panelId: '',panelPivot:[0.5,1],levelType:1,isDestroyParent:false,hasLine:false,closeable:false,clickFunc:'',clickFuncParam: ''};
                    createCommonTopCard(item.roomObj, html, panelInfo);
                    registerArrayByType(1, this.id, 1);
                }
            });
        });
        
    } else {
        app.query('.PolygonRegion').destroyAll();
    }
    
}

/**
 * @authors myf
 * @date    2025-03-24
 * @description 展示业务楼层自助机和窗口
 * @params {Boolean} checked 选中状态
 * @params {string} code 选项编码
 * @return 无
 */
function showBusinessFloorSelfServiceAndWindows (checked, code) {
    // console.log('showSelfServiceAndWindows', checked, code);
    if (!checked) {
        $(`[id*=functionPoint${code}]`).css('display', 'none');
        return;
    } else if ($(`[id*=functionPoint${code}]`)[0]) {
        $(`[id*=functionPoint${code}]`).css('display', 'block');
        return;
    }
    let data = [
        {posX: '1', posY: '0', posZ: '1', name: '挂号窗口', code: 'window', codeDesc: '窗口', imgUrl: 'icon-pay-place-open.png', roomObjectId: 'RC5-A1-B1_C5-A1-B1-F2_067'},
        {posX: '14', posY: '0', posZ: '5', name: '报到自助机', code: 'register', codeDesc: '自助机', imgUrl: 'icon-report-open.png', roomObjectId: 'RC5-A1-B1_C5-A1-B1-F2_010'},
        {posX: '6', posY: '0', posZ: '15', name: '打印自助机', code: 'print', codeDesc: '自助机', imgUrl: 'icon-register-open.png', roomObjectId: 'RC5-A1-B1_C5-A1-B1-F2_022'},
    ];
    data = data.filter(item=>{return item.code === code});
    // const floor = app.query('#C5-A1-B1-F2')[0];
    
    data.forEach((item, index)=>{
        const roomObj = app.query('#' + item.roomObjectId)[0];
        const markConfig = {
            id: 'functionPoint' + item.code + index,
            url: ImgUrl + item.imgUrl,
            parentObject: roomObj,
            localPosition: [0, 0, 0],
            levelType: 1
        };
        const textConfig = {
            text: item.name,
        };
        createCommonMarker(markConfig, textConfig);
    });
}

/**
 * @authors myf
 * @date    2025-03-21
 * @description 创建楼层房间选择面板
 * @param {Array} roomTypeData 房间类型数据
 * @param {Array} deptData 科室数据
 * @return void
 */
function createFloorRoomSelectPanel (roomTypeData, unitData, deptData) {
    const container = document.createElement('div');
    container.id = 'businessFloorRoomSelect';
    container.style.position = 'absolute';
    container.style.top = '5.5rem';
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%)';
    container.style.display = 'flex';
    container.style.color = '#fff';

    // 配置数据
    const optionsConfig = [
        { 
            label: '科室&区域',
            code: 'dept',
            checked: true,
            onClick: 'showBusinessFloorDeptAndArea',
            params: deptData
        },
        { 
            label: '业务单元',
            code: 'businessUnit',
            onClick: 'showBusinessFloorBusinessUnit',
            params: unitData,
            checked: true
        },
        { 
            label: '房间',
            code: 'room',
            hasChildren: true,
            onClick: '',
            checked: true,
            children: roomTypeData.map(item => ({...item, checked: true}))
        },
        { 
            label: '房间分区', 
            code: 'roomPart',
            onClick: 'showBusinessFloorArea',
            checked: true
        },
        { 
            label: '功能位置',
            code: 'function',
            hasChildren: true,
            onClick: '',
            checked: true,
            children: [
                { label: '报到自助机', code: 'register', onClick: 'showBusinessFloorSelfServiceAndWindows', checked: true },
                { label: '打印自助机', code: 'print', onClick: 'showBusinessFloorSelfServiceAndWindows', checked: true },
                { label: '窗口', code: 'window', onClick: 'showBusinessFloorSelfServiceAndWindows', checked: true }
            ]
        }
    ];

    optionsConfig.forEach(config => {
        const item = createCheckboxItem(config);
        container.appendChild(item);
    });
    const div2d = document.querySelector('#div2d');
    div2d.append(container);
    registerArrayByType(0, 'businessFloorRoomSelect', 1);
}

/**
 * @authors myf
 * @date    2025-03-24
 * @description 显示/隐藏科室区域房间天花板颜色
 * @param {Boolean} checked 选中状态
 * @param {String} code 编码
 * @param {Array} deptData 部门数据
 */
function showBusinessFloorDeptAndArea(checked, code, deptData) {
    if (!deptData || !Array.isArray(deptData)) return;
    
    deptData.forEach(dept => {
        if (!dept.roomObjects || !dept.departmentId) return;
        
        dept.roomObjects.forEach(room => {
            if (!room) return;
            
            // 查找房间的天花板
            const ceilings = room.query('.Ceiling');
            if (!ceilings || ceilings.length === 0) return;

            if (checked) {
                // 显示天花板并设置对应科室的颜色
                ceilings.forEach(ceiling => {
                    ceiling.visible = true;
                    const deptColor = room.getAttribute('userData/deptColor');
                    if (deptColor) {
                        ceiling.style.color = deptColor;
                        ceiling.style.opacity = 0.5; // 设置半透明效果
                        ceiling.style.transparent = true;
                    }
                });
            } else {
                // 隐藏天花板
                ceilings.forEach(ceiling => {
                    ceiling.visible = false;
                });
            }
        });
    });
}

function showBusinessFloorDeptAndArea (checked, code, deptData) {
    
}

/**
 * 创建复选框项
 * @param {Object} config - 复选框配置项
 * @param {string} config.label - 显示文本
 * @param {boolean} [config.hasChildren] - 是否有子项
 * @param {string[]} [config.children] - 子项列表
 * @param {string} [config.onClick] - 点击事件处理函数名称
 * @return {HTMLElement} 复选框容器元素
 */
function createCheckboxItem(config) {
    const wrapper = document.createElement('div');
    wrapper.style.margin = '0 0.5rem';
    wrapper.style.position = 'relative';

    // 创建主复选框和标签
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.style.marginRight = '8px';
    
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(config.label));
    label.style.cursor = 'pointer';

    // 为主复选框添加点击事件
    if (config.onClick) {
        checkbox.addEventListener('change', function() {
            // 执行配置的点击事件，传入选中状态和可选的参数
            window[config.onClick]?.(this.checked, config.code, config.params);
        });
    }

    // 处理带子项的复选框
    if (config.hasChildren) {
        const dropdown = createDropdownIcon();
        wrapper.appendChild(dropdown);

        const subItemsContainer = createSubItemsContainer(config.children);
        wrapper.appendChild(subItemsContainer);
        wrapper.style.margin = '0 1rem 0 0.5rem';

        // 下拉图标点击事件
        dropdown.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            subItemsContainer.style.display = 
                subItemsContainer.style.display === 'block' ? 'none' : 'block';
        });

        checkbox.addEventListener('change', function() {
            const subCheckboxes = subItemsContainer.querySelectorAll('input[type="checkbox"]');
            const isChecked = this.checked;
            subCheckboxes.forEach((cb, index) => {
                cb.checked = isChecked;
                // 触发子项事件
                const childConfig = config.children[index];
                if (childConfig.onClick) {
                    window[childConfig.onClick]?.(isChecked, childConfig.code);
                }
            });
        });

        // 为所有子复选框添加change事件
        const subCheckboxes = subItemsContainer.querySelectorAll('input[type="checkbox"]');
        subCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                updateParentCheckbox(checkbox, subItemsContainer);
            });
        });
    }
    checkbox.checked = config.checked; // 设置默认选中状态
    
    // 如果有子项且默认选中,需要触发一次 change 事件
    if (config.checked && config.onClick) {
        window[config.onClick]?.(true, config.code, config.params);
    }

    wrapper.insertBefore(label, wrapper.firstChild);
    return wrapper;
}

/**
 * 更新父复选框状态
 * @param {HTMLInputElement} parentCheckbox - 父复选框
 * @param {HTMLElement} subItemsContainer - 子项容器
 */
function updateParentCheckbox(parentCheckbox, subItemsContainer) {
    const subCheckboxes = subItemsContainer.querySelectorAll('input[type="checkbox"]');
    const checkedCount = Array.from(subCheckboxes).filter(cb => cb.checked).length;
    
    if (checkedCount === 0) {
        parentCheckbox.checked = false;
    } else if (checkedCount === subCheckboxes.length) {
        parentCheckbox.checked = true;
    } else {
        parentCheckbox.checked = false;
    }
}

/**
 * 创建下拉图标
 * @return {HTMLElement} 下拉图标元素
 */
function createDropdownIcon() {
    const icon = document.createElement('span');
    icon.innerHTML = ' ▼';
    icon.style.color = '#fff';
    icon.style.marginLeft = '8px';
    icon.style.cursor = 'pointer';
    icon.style.position = 'absolute';
    icon.style.right = '-1rem';  // 调整右侧位置
    icon.style.top = '0px';      // 微调垂直位置
    return icon;
}

/**
 * 创建子项容器
 * @param {Object[]} children - 子项对象列表
 * @param {string} children[].label - 子项显示文本
 * @param {string} children[].code - 子项代码
 * @param {string} children[].onClick - 子项点击事件处理函数名称
 * @return {HTMLElement} 子项容器元素
 */
function createSubItemsContainer(children) {
    const container = document.createElement('div');
    container.style.display = 'none';
    container.style.position = 'absolute';
    container.style.width = '5rem';
    container.style.padding = '0.5rem';
    container.style.borderRadius = '0.5rem';
    container.style.background = 'linear-gradient( 90deg, rgba(28,71,135,0.75) 0%, rgba(1,43,106,0.9) 100%)';
    container.style.left = '0';     // 添加左对齐
    container.style.top = '1.5rem'; // 调整下拉菜单的垂直位置
    container.style.zIndex = '100'; // 添加层级确保显示在最上层

    children.forEach(child => {
        const subWrapper = document.createElement('div');
        subWrapper.style.margin = '3px 0';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.marginRight = '8px';
        checkbox.checked = child.checked; // 设置子项的默认选中状态
        
        // 如果默认选中,需要触发一次点击事件
        if (child.checked && child.onClick) {
            window[child.onClick]?.(true, child.code);
        }
        if (child.onClick) {
            checkbox.addEventListener('change', function() {
                window[child.onClick]?.(this.checked, child.code);
            });
        }
        
        const label = document.createElement('label');
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(child.label));
        label.style.cursor = 'pointer';
        
        subWrapper.appendChild(label);
        container.appendChild(subWrapper);
    });

    return container;
}

/**
 * 展示部门面板
 * @param {boolean} checked 是否选中
 * @param {string} code 编码
 * @param {Array} deptData 科室数据
 */
function showBusinessFloorBusinessUnit(checked, code, deptData) {
    // 移除已有的面板
    $('[id*=businessFloorDepartment]').remove();
    
    if (!checked) return;
    // const floor = app.query('#C5-A1-B1-F2')[0];
    deptData.forEach((dept, index) => {
        const panelHtml = createBusinessFloorDeptPanel({
            text: dept.departmentName,
            color: dept.color,
            time: "08:30~17:30" // 这里可以根据实际需求传入时间
        });
        const roomObj = app.query('#' + dept.departRoomObjId)[0];
        const panelInfo = {panelPosition: [0,1,0], panelId: 'businessFloorDepartment',panelPivot:[0.5,1],levelType:1,isDestroyParent:false,hasLine:false,closeable:false,clickFunc:'',clickFuncParam: ''};
        createCommonTopCard(roomObj, panelHtml, panelInfo);
    });
}

function icimsUnitTreeSwitchBtnClick (element) {
    if (event.target.className !== 'highlight') {
        const clickedElement = $(element).find('.highlight');
        clickedElement.removeClass('highlight');
        clickedElement.css('color', '#6ee4f9');
        clickedElement.css('background', 'linear-gradient(90deg, #29479D 0%, #012E6A 100%)');
        $(event.target).addClass('highlight');
        $(event.target).css('color', '#fff');
        $(event.target).css('background', 'linear-gradient(90deg, rgb(57, 89, 203), rgb(22, 88, 181) 100%)');
        if ($(event.target).attr('id').includes('organizationUnit')) { // 组织单元
            $('[data-role=root][id*=ICIMS-hospital-home]').children().eq(0).children().eq(-2).children().eq(0).css('display', 'block');
            $('[data-role=root][id*=ICIMS-hospital-home]').children().eq(0).children().eq(-1).children().eq(0).css('display', 'none');
        } else {
            $('[data-role=root][id*=ICIMS-hospital-home]').children().eq(0).children().eq(-1).children().eq(0).css('display', 'block');
            $('[data-role=root][id*=ICIMS-hospital-home]').children().eq(0).children().eq(-2).children().eq(0).css('display', 'none');
        }
    }
}

/**
 * 创建箭头面板的 HTML 字符串
 * @param {string} text - 面板显示的文本
 * @param {Object} options - 配置项
 * @param {string} [options.textColor='#ff0'] - 文字颜色
 * @param {string} [options.backgroundColor='#1c4787'] - 背景颜色
 * @param {string} [options.arrowDirection='bottom'] - 箭头方向：top/right/bottom/left
 * @return {string} 面板的 HTML 字符串
 */
function createArrowLabel(text, options = {}) {
    const {
        textColor = '#ff0',
        backgroundColor = '#1c4787',
        arrowDirection = 'bottom'
    } = options;

    // 箭头样式配置
    const arrowStyles = {
        bottom: `bottom: -0.5rem;left: 50%;transform: translateX(-50%);border-left: 0.5rem solid transparent;
            border-right: 0.5rem solid transparent;border-top: 0.5rem solid ${backgroundColor};`,
        top: `top: -0.5rem;left: 50%;transform: translateX(-50%);border-left: 0.5rem solid transparent;
            border-right: 0.5rem solid transparent;border-bottom: 0.5rem solid ${backgroundColor};`,
        left: `left: -0.5rem;top: 50%;transform: translateY(-50%);border-top: 0.5rem solid transparent;
            border-bottom: 0.5rem solid transparent;border-right: 0.5rem solid ${backgroundColor};`,
        right: `right: -0.5rem;top: 50%;transform: translateY(-50%);border-top: 0.5rem solid transparent;
            border-bottom: 0.5rem solid transparent;border-left: 0.5rem solid ${backgroundColor};`
    };

    return `<div style="position: absolute;background-color: ${backgroundColor};color: ${textColor};padding: 0.5rem 1rem;
            border-radius: 0.5rem;font-size: 1rem;font-weight: bold;box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);display: flex;
            align-items: center;justify-content: center;white-space: nowrap;">
            ${text}
            <div style="position: absolute;width: 0;height: 0;${arrowStyles[arrowDirection]}"></div></div>`;
}

/**
 * @author myf 2024-03-21
 * @description 根据code隐藏房间悬浮文字
 * @param {string} code 房间类型代码
 * @return 无
*/
function hideRoomText (code) {
    const rooms = app.query('["userData/roomTypeCode"="' + code + '"]');
    rooms.forEach(room => {
        const textRegion = app.query('#' + room.id + 'TextRegionImg')[0];
        if (textRegion) {
            textRegion.visible = false;
        }
    });
}

function showBusinessFloorRoomText (checked, code) {
    const rooms = app.query(`["userData/roomTypeCode"="${code}"]`);
    console.log('showBusinessFloorRoomText',checked, rooms, code);
    if (checked && rooms.length > 0) {
        createRoomText(CurSencceObj, {}, code);
    } else {
        hideRoomText(code);
    }
}

function handleRoomGroupClick(checked) {
    if (!checked) {
        ['clinic', 'examine', 'treatment'].forEach(code => {
            hideRoomText(code);
        });
    }
}

function createBusinessFloorDeptPanel({ text = "默认文字", color = "#00FFFF", time = "08:30~17:30" }) {
    return `<div style="display: flex;flex-direction: column;align-items: center;background-color: transparent;">
            <div style="height: 1rem;line-height: 1rem;color: ${color};font-size: 14px;font-weight: bold;">${time}</div>
            <div style="display: flex;align-items:center;height: 1rem;line-height: 1rem;"><div style="color: ${color};font-size: 16px;font-weight: bold;">${text}</div>
            <div style="color: ${color};font-size: 16px;animation: rotate 2s linear infinite;">⚙️</div></div>
            <div style="height: 1rem;line-height: 1rem;color: ${color};font-size: 22px;font-weight: bold;">∨</div>
        </div> `;
        // <style>
        //     @keyframes rotate {
        //         from {
        //             transform: rotate(0deg);
        //         }
        //         to {
        //             transform: rotate(360deg);
        //         }
        //     }
        // </style>`;
}