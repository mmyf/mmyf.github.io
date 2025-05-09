/**
 * @author myf 2024-03-21
 * @description 创建房间悬浮文字
 * @param {Object} floor 楼层obj
 * @param {Object} fontConfig 文字配置信息
 * @param {string} code 房间类型代码
 * @return 无
*/
function createRoomText (floor, fontConfig, code) {
    if (!floor || floor.type !== 'Floor') {
        return;
    }
    var buildid=floor.parent.id;
    var para = {
        hospitalId: BindSysUsers["Sys"]["HospitalID"],
        buildObjectId: buildid,
    };
    var buildStyleData = getDataByAjax(dtvpApiServ,"buildingStyleConf/api","getBuildingStyleConfs",para,"","get","json","","application/json;charset=utf-8");
    if (JSON.stringify(buildStyleData)=="[]")   {return;}
    var angles = JSON.parse(buildStyleData[0]["showRoomAngles"]);
    var angleY = Math.abs(angles[1]);

    // 获取指定code的房间
    const targetRooms = floor.rooms.filter(room => {
        const roomObj = app.query('#' + room.id)[0];
        return roomObj && roomObj.userData && roomObj.userData.code === code;
    });

    targetRooms.forEach(function(room) {
        var roomSize = room.size;
        var roomDis = roomSize[0];
        if ((angleY=="90")||(angleY=="270"))
        {
            var roomDis = roomSize[2];
        }
        else if ((angleY=="0")||(angleY=="180"))
        {
            var roomDis = roomSize[0];
        }
        var roomdesc = roomlocmap[room.id+"_Desc"];
        var locdesc = roomlocmap[room.id+"_Loc"];
        if (roomdesc==undefined) {var roomdesc="";}
        if (locdesc==undefined) {var locdesc="";}
        //Add By DJ 2023-03-29增加是否存在判断处理
        const textRegionId = room.id + "TextRegionImg";
        let textRegion = app.query("#" + textRegionId)[0];
        const fontColor = fontConfig.fontColor || '#ffffff'; // myf 20241219 颜色不生效
        if (textRegion) {
            // 如果已存在，则显示并更新颜色
            textRegion.visible = true;
            textRegion.style.fontColor = fontColor;
            return;
        }

        // 创建新的文字
        textRegion = app.create({
            type: 'TextRegion',
            id: room.id+"TextRegionImg",
            name: "roomTextRegion",
            parent: room,// 设置父物体
            localPosition: [0, room.parent.height, 0], // 父物体坐标系下相对位置
            text: roomdesc,
            style: {
                fontColor: fontColor, // myf 20241219 颜色不生效
                fontSize: 110, // 文本字号大小
                fontFamily :'黑体',
                //draggable:true,
                dropShadow:false,
                renderOrder:-1,
                alwaysOnTop:true,
                textLineWidth:440,
                //dropShadowColor:"#175e93"
            },
            scale:[0.1,0.1,0.1],
            angles:angles,
            inheritStyle:false,
            complete: function () {
                this.style.opacity=0.85
                this.visible=true
                this.style.fontColor = fontColor;
            }
        });

        registerArrayByType(1,room.id+"TextRegionImg",1);
        if (fontConfig.hasOwnProperty("roomarea"))
        {
            if (room.area>fontConfig["roomarea"][0]["area"])
            {
                textRegion.style.textLineWidth=fontConfig["roomarea"][0]["textLineWidth"]
                textRegion.style.fontSize=fontConfig["roomarea"][0]["fontSize"]
            }
            else if (room.area<fontConfig["roomarea"][1]["area"])
            {
                textRegion.style.textLineWidth=fontConfig["roomarea"][1]["textLineWidth"]
                textRegion.style.fontSize=fontConfig["roomarea"][1]["fontSize"]
            }
            else{
                textRegion.style.fontSize=fontConfig["roomarea"][2]["fontSize"]
            }
        }
        else
        {
            if (roomDis>5)
            {
                textRegion.style.textLineWidth=440
                textRegion.style.fontSize=140
                
            }
            else if (roomDis<3)
            {
                textRegion.style.textLineWidth=250   //300
                textRegion.style.fontSize=95   //110
                
            }
            else
            {
                textRegion.style.fontSize=120
            }
        }
    })
}

/**
 * @author myf 2024-03-21
 * @description 根据code隐藏房间悬浮文字
 * @param {string} code 房间类型代码
 * @return 无
*/
function hideRoomText (code) {
    const rooms = app.query('["userData/code"="' + code + '"]');
    rooms.forEach(room => {
        const textRegion = app.query('#' + room.id + 'TextRegionImg')[0];
        if (textRegion) {
            textRegion.visible = false;
        }
    });
}

// 根据code查询房间方法 app.query('["userData/code"="code"]')
// 依据room.deptId判定房间属于哪个科室
// 房间科室决定房间悬浮文字颜色

class Panel {
    constructor({ text = "默认文字", color = "#00FFFF", time = "08:30~17:30" }) {
        this.text = text;
        this.color = color;
        this.time = time;
    }

    render(container) {
        // 创建面板容器
        const panel = document.createElement("div");
        panel.style.display = "flex";
        panel.style.flexDirection = "column";
        panel.style.alignItems = "center";
        panel.style.backgroundColor = "#1E1E1E";
        panel.style.borderRadius = "8px";
        panel.style.padding = "10px";
        panel.style.width = "150px";

        // 创建时间文本
        const timeText = document.createElement("div");
        timeText.textContent = this.time;
        timeText.style.color = this.color;
        timeText.style.fontSize = "14px";
        timeText.style.marginBottom = "5px";
        panel.appendChild(timeText);

        // 创建主文字
        const mainText = document.createElement("div");
        mainText.textContent = this.text;
        mainText.style.color = this.color;
        mainText.style.fontSize = "16px";
        mainText.style.fontWeight = "bold";
        panel.appendChild(mainText);

        // 创建设置图标
        const settingsIcon = document.createElement("div");
        settingsIcon.textContent = "⚙️";
        settingsIcon.style.color = this.color;
        settingsIcon.style.fontSize = "16px";
        settingsIcon.style.marginTop = "5px";
        panel.appendChild(settingsIcon);

        // 添加到指定容器
        container.appendChild(panel);
    }
}

// 使用示例
// const panel = new Panel({ text: "耳科门诊", color: "#00FFFF", time: "08:30~17:30" });
// panel.render(document.body);