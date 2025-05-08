// 出参：房间名称、房间3d对象id、房间区域类型、房间区域id、房间区域名称、房间所属业务单元id、房间所属业务单元名称、房间所属科室id、房间所属科室名称、诊区开放时间（例如08：00-17：30）、房间类型code、房间类型描述（诊室、检查室、治疗室等）、房间状态code、房间状态描述（空闲、开放、关闭）
// 出参格式： [{…}]

// 科室颜色数组
const departmentColors = [
  '#FF6B6B',  // 红色
  '#4ECDC4',  // 青色
  '#45B7D1',  // 蓝色
  '#96CEB4',  // 绿色
  '#FFEEAD',  // 米黄
  '#D4A5A5',  // 粉色
  '#9B59B6',  // 紫色
  '#3498DB'   // 深蓝
];

// 科室颜色分配函数
const assignDepartmentColors = (rooms) => {
  const deptColorMap = new Map();
  let colorIndex = 0;

  rooms.forEach(room => {
    if (!deptColorMap.has(room.departmentId)) {
      deptColorMap.set(room.departmentId, departmentColors[colorIndex % departmentColors.length]);
      colorIndex++;
    }
    room.departmentColor = deptColorMap.get(room.departmentId);
  });
  
  return rooms;
};

export const roomData = assignDepartmentColors([
  {
    roomName: "内科诊室01",
    room3dId: "3d_room_001",
    areaType: "门诊区",
    areaId: "area_001",
    areaName: "内科门诊区",
    businessUnitId: "bu_001",
    businessUnitName: "门诊部",
    departmentId: "dept_001",
    departmentName: "内科",
    openTime: "08:00-17:30",
    roomTypeCode: "001",
    roomTypeDesc: "诊室",
    roomStatusCode: "1",
    roomStatusDesc: "空闲"
  },
  {
    roomName: "放射科检查室02",
    room3dId: "3d_room_002",
    areaType: "检查区",
    areaId: "area_002",
    areaName: "放射科检查区",
    businessUnitId: "bu_002",
    businessUnitName: "医技科",
    departmentId: "dept_002",
    departmentName: "放射科",
    openTime: "09:00-16:00",
    roomTypeCode: "002",
    roomTypeDesc: "检查室",
    roomStatusCode: "2",
    roomStatusDesc: "开放"
  },
  {
    roomName: "理疗室03",
    room3dId: "3d_room_003",
    areaType: "治疗区",
    areaId: "area_003",
    areaName: "康复治疗区",
    businessUnitId: "bu_003",
    businessUnitName: "康复中心",
    departmentId: "dept_003",
    departmentName: "康复科",
    openTime: "08:30-17:00",
    roomTypeCode: "003",
    roomTypeDesc: "治疗室",
    roomStatusCode: "3",
    roomStatusDesc: "关闭"
  }
]);

// 将数据中的roomTypeDesc、roomTypeCode按下面格式整理，写出整理程序，相同的只记录一条数据
// [
//     { label: '诊室', code: 'clinic', onClick: 'handleRoomTypeClick', fontColor: '#6ee4f9' },
//     { label: '检查室', code: 'examine', onClick: 'handleRoomTypeClick', fontColor: '#ff0' },
//     { label: '治疗室', code: 'treatment', onClick: 'handleRoomTypeClick', fontColor: '#ffb657' }
// ]

// 整理房间类型数据
export const roomTypes = (() => {
  const typeMap = new Map();
  
  roomData.forEach(room => {
    if (!typeMap.has(room.roomTypeCode)) {
      let code = room.roomTypeCode;
      typeMap.set(room.roomTypeCode, {
        label: room.roomTypeDesc,
        code: code,
        onClick: 'handleRoomTypeClick',
        fontColor: room.roomTypeCode === '001' ? '#6ee4f9' : 
                  room.roomTypeCode === '002' ? '#ff0' : '#ffb657'
      });
    }
  });

  return Array.from(typeMap.values());
})();

