 /**
 * 创建下拉选项通用函数
 * @param {string} parentElementId 父元素ID
 * @param {string} selectId 选择器ID
 * @param {Array} optionData option数据
 * @param {String} optionText option文本内容对应Data属性
 * @param {String} optionValue option值对应Data属性
 * @param {Boolean} isMultiple 是否多选(默认false)
 * @param {String} selectStyle select样式
 * @returns {String} html select的html串，用于没有父元素的时候
 * @author 缪一帆 2022-07-01
 * @modify myf 2022-07-28 修改单选处理，添加多选处理
 * @checkinfo myf 2022-08-02
 * @info myf 2022-09-02
 * 获取选中对应文本 $(selectId).val();
 * 获取选中对应值 $(selectId).attr('valueKey');
 */
  function createNormalOptions(parentElementId, selectId, optionData, optionText, optionValue, isMultiple=false, selectStyle="") {
    if (!selectId || !optionData || !optionText || !optionValue) throw new Error("参数为空!");

    if (isMultiple) { // 多选处理
        // modify myf 2022-09-02 重写单选选择器
        let html = `<div style="position: relative;width:100%;height:100%;"><div id="${selectId}TagBox" class="page-set-form-mulselect-tagbox">`;
        html += `<div id="${selectId}TagBoxMore" class="page-set-form-mulselect-tagbox-more">···</div>`;
        html += `</div><input id="${selectId}" class="page-set-form-mulselect-input" style="${selectStyle}" placeholder="请输入条件" value="" `;
        html += `onfocus="showSelectOptions('${selectId}Options')" onblur="removeSelectOptions('${selectId}Options')" oninput='selectSearchInputFunc("${selectId}",`;
        html += `${JSON.stringify(optionData).replace(new RegExp(/( )/g),"")}`;
        html += `,"${optionText}","${optionValue}","mul")' autocomplete="new-password"/>`;
        html += `<span style="user-select: none;position: absolute;right: 0.75rem;top: 50%;transform:translateY(-50%);color:#949494;">&or;</span></div>`;
        html += `<div style="position: relative;width:100%;"><ul id="${selectId}Options" class="page-set-form-select-options" style="display: none;">`;
        html += selectSearchInputFunc(selectId,optionData,optionText,optionValue,'mul');
        html += `</ul><div id="${selectId}MoreTagBox" class="page-set-form-mulselect-more-tagbox" style="display: none;"></div><div>`;
        if (parentElementId) {
            $('#'+parentElementId).append(html);
            return;
        } else {
            return html;
        }
    }

    // modify myf 2022-09-02 重写单选选择器
    let html = `<div style="position: relative;width:100%;height:100%;"><input id="${selectId}" class="page-set-form-select-input" style="${selectStyle}" placeholder="请输入条件" value="" `;
    html += `onfocus="showSelectOptions('${selectId}Options')" onblur="removeSelectOptions('${selectId}Options')" oninput='selectSearchInputFunc("${selectId}",`;
    html += `${JSON.stringify(optionData).replace(new RegExp(/( )/g),"")}`;
    html += `,"${optionText}","${optionValue}")' autocomplete="new-password"/>`;
    html += `<span style="user-select: none;position: absolute;right: 0.75rem;top: 50%;transform:translateY(-50%);color:#fff;">&or;</span></div>`;
    html += `<div style="position: relative;width:100%;"><ul id="${selectId}Options" class="page-set-form-select-options" style="display: none;">`;
    html += selectSearchInputFunc(selectId,optionData,optionText,optionValue);
    html += `</ul><div>`;
    if (parentElementId) {
        $('#'+parentElementId).append(html);
    } else {
        return html;
    }
}
// createNormalOptions选中取值
function selectOptionClick(e,input) {
    input.value = e.innerHTML;
    $(input).attr('valueKey',$(e).attr('valueKey'));
}
// createNormalOptions选中取值
function selectMulOptionClick(e,input) {
    input.onblur = null; // 暂时移除失焦事件，以免点击后面板消失
    let desc = $(input).attr('valueDesc') || '[]';
    let key = $(input).attr('valueKey') || '[]';
    let tagNum = $(input).attr('tagNum');
    desc = JSON.parse(desc);
    key = JSON.parse(key);
    const len = key.length;
    let tagWidth = 6;
    let isShowTag = true;
    const tagBox = document.getElementById(input.id + 'TagBox');
    if (len && !tagNum) { // 确定最大标签容纳数量，只在第二次创建时运行，第一次标签必定显示，若容器空间不足以容纳一个标签，请扩大容器
        const tagThis = document.getElementById(input.id + 'Tag' + key[0]); // 获取第一个标签用于计算
        tagWidth += Number.parseInt(Math.ceil(tagThis.clientWidth));
        tagNum = Math.floor((tagBox.parentElement.clientWidth * 0.6) / tagWidth);
        $(input).attr('tagNum', tagNum);
    }
    if (key.includes($(e).attr('valueKey'))) { // 选项已选时，移除标签
        const tag = document.getElementById(input.id + 'Tag' + $(e).attr('valueKey'));
        tag.remove();
        desc.splice(desc.indexOf(e.innerHTML),1);
        key.splice(key.indexOf($(e).attr('valueKey')),1);
        $(e).removeClass('page-set-form-select-option-checked');
        if (tagNum < len) { // 展示在input中的标签
            key.forEach((item, index)=>{
                if (index >= tagNum) {
                    return;
                }
                const tagItem = document.getElementById(input.id + 'Tag' + item);
                tagItem.style.display = 'inline-flex';
            });
        }
        if (len - 1 <= tagNum) { // 标签数量在容纳数量内时，不展示“···”标签
            $('#' + input.id + 'TagBoxMore').css('display','none');
        }
        moreTagBoxRefresh(input); // 刷新更多标签面板
    } else { // 选择未选择时处理
        if (tagNum < len + 1) { // 标签数量多于容纳数量时
            isShowTag = false;
            $('#' + input.id + 'TagBoxMore').css('display','block');
            if (!$._data($('#testTagBoxMore').get(0), 'events')) { // 只在没有事件时绑定一次
                $('#' + input.id + 'TagBoxMore').on('click', ()=>{ // 更多“···”点击事件
                    const moreTagBox = document.getElementById(input.id + 'MoreTagBox');
                    moreTagBox.style.display = 'flex';
                    moreTagBox.style.flexWrap = 'wrap';
                    moreTagBox.onmouseleave = ()=>{
                        moreTagBox.style.display = 'none';
                    };
                    moreTagBoxRefresh(input);
                });
            }
            // $('#' + input.id + 'TagBoxMore').off('click');
            
        }
        const tag = document.createElement('div');
        tag.id = input.id + 'Tag' + $(e).attr('valueKey');
        tag.innerText = e.innerHTML;
        tag.className = 'page-set-form-mulselect-tag';
        if (!isShowTag) tag.style.display = 'none'; // 容器外标签隐藏
        const span = document.createElement('span');
        span.innerText = '×';
        span.style.color = '#949494';
        span.onclick = ()=>{ // 点击标签中关闭“X”按钮事件
            const tagDivc = document.getElementById(input.id + 'Tag' + $(e).attr('valueKey'));
            const tagBox = document.getElementById(input.id + 'TagBox');
            if (tagDivc) tagDivc.remove();
            let desc = $(input).attr('valueDesc') || '[]';
            let key = $(input).attr('valueKey') || '[]';
            desc = JSON.parse(desc);
            key = JSON.parse(key);
            const len = key.length;
            desc.splice(desc.indexOf(e.innerHTML),1);
            key.splice(key.indexOf($(e).attr('valueKey')),1);
            $(input).attr('valueDesc', JSON.stringify(desc));
            $(input).attr('valueKey', JSON.stringify(key));
            const tagNum = Number.parseInt($(input).attr('tagNum'));
            $(e).removeClass('page-set-form-select-option-checked');
            if (tagNum < len) {
                key.forEach((item, index)=>{
                    if (index >= tagNum) {
                        return;
                    }
                    const tagItem = document.getElementById(input.id + 'Tag' + item);
                    tagItem.style.display = 'inline-flex';
                });
            }
            if (len - 1 <= tagNum) {
                $('#' + input.id + 'TagBoxMore').css('display','none');
            }
            $(input).css('padding-left',tagBox.clientWidth + 4 + 'px'); // 同步移动input位置
            moreTagBoxRefresh(input);
        };
        tag.appendChild(span);
        tagBox.appendChild(tag);
        desc.push(e.innerHTML);
        key.push($(e).attr('valueKey'));
        $(e).addClass('page-set-form-select-option-checked'); // 添加选中样式
    }
    $(input).attr('valueDesc', JSON.stringify(desc));
    $(input).attr('valueKey', JSON.stringify(key));
    $(input).css('padding-left',tagBox.clientWidth + 4 + 'px');
    setTimeout(()=>{ // 处理后添加获得焦点事件
        $(input).focus();
        input.onblur = ()=>{
            removeSelectOptions(input.id+'Options');
        }
    },0);
    function moreTagBoxRefresh (input) {// 更多标签面板刷新函数  
        const moreTagBox = document.getElementById(input.id + 'MoreTagBox');
        moreTagBox.innerHTML = '';
        let desc = $(input).attr('valueDesc') || '[]';
        let key = $(input).attr('valueKey') || '[]';
        desc = JSON.parse(desc);
        key = JSON.parse(key);
        const tagNum = Number.parseInt($(input).attr('tagNum'));
        const len = key.length;
        if (tagNum < len) {
            key.forEach((item, index)=>{
                if (index >= tagNum) { // 只选取未显示的标签
                    const tagItem = document.getElementById(input.id + 'Tag' + item);
                    const tagMore = tagItem.cloneNode(true);
                    tagMore.style.display = 'inline-flex';
                    tagMore.style.width = '40%';
                    tagMore.style.margin = '.5rem';
                    tagMore.childNodes[1].onclick = ()=>{ // 更多面板中标签事件等同于input中标签事件
                        tagMore.remove();
                        tagItem.childNodes[1].click();
                    };
                    moreTagBox.appendChild(tagMore);
                }
            });
        }
    }
    
    // console.log('valueKey',$(input).attr('valueKey'));
}
// createNormalOptions弹出选项面板
function showSelectOptions(optionsId) {
    const options = document.getElementById(optionsId);
    options.style.display = 'block';
}
// createNormalOptions消除选项面板
function removeSelectOptions(optionsId) {
    const options = document.getElementById(optionsId);
    options.style.display = 'none';
}
// createNormalOptions查找
function selectSearchInputFunc(selectId,optionData,optionText,optionValue,type='single') {
    const options = document.getElementById(selectId+'Options');
    const input = document.getElementById(selectId);
    let html = '';
    let res;
    let selectFunc;
    if (!Array.isArray(optionData)) {
        res = JSON.parse(optionData);
    } else {
        res = [...optionData];
    }
    if (input) {
        res = res.filter((item)=>{
            return item[optionText].includes(input.value);
        });
    }
    if (type==='mul') {
        selectFunc = 'selectMulOptionClick';
    } else {
        selectFunc = 'selectOptionClick';
        html += `<li class="page-set-form-select-option" valueKey="" onmousedown="selectOptionClick(this,${selectId})" ontouchstart="selectOptionClick(this,${selectId})">(空)</li>`;
    }
    // html += `<li class="page-set-form-select-option" valueKey="" onmousedown="${selectFunc}(this,${selectId})" ontouchstart="${selectFunc}(this,${selectId})">(空)</li>`;
    res.forEach((item)=>{
        html += `<li id="${selectId + 'Option' + item[optionValue]}" class="page-set-form-select-option" valueKey="${item[optionValue]}" onmousedown="${selectFunc}(this,${selectId})" ontouchstart="${selectFunc}(this,${selectId})">${item[optionText]}</li>`;
    });
    if (options) {
        options.innerHTML = html;
    } else {
        return html;
    }
    
}


getInterfaceinfo=function(vhospid,vdatasourceid,vdatasourcecode,vrefreshtime,vinterfaceparavalue,vcallfun,vcallfunpara,vchartname,interfaceLevelType,interfaceLevelID,headers, callerId = "", isAsync)
{
    //Modify by zx 2024-01-11 记录刷新的接口
    if((callerId !== "")&&(!PageRefreshInterface[callerId])){
        PageRefreshInterface[callerId] = new Array();
    }
    //console.log("getInterfaceinfo",vhospid,vdatasourceid,vdatasourcecode,vrefreshtime,vinterfaceparavalue,vcallfun,vcallfunpara,vchartname,interfaceLevelType,interfaceLevelID,headers)
    // console.log('vcallfunpara',vcallfunpara);
    var Interfacekey=vdatasourcecode
    // if ((vdatasourceid!="")&&(vdatasourceid!=undefined)) {Interfacekey=InterfaceSetInfo["IDMap"][vdatasourceid];}
    var sInterfaceSetInfoObj=JSON.parse(window.localStorage.getItem("InterfaceSetInfo"))
    //console.log("sInterfaceSetInfoObj",sInterfaceSetInfoObj)
    if ((vdatasourceid!="")&&(vdatasourceid!=undefined)) {Interfacekey=sInterfaceSetInfoObj["IDMap"][vdatasourceid];}
    if ((Interfacekey=="")||(Interfacekey==undefined))
    {
        var InterfaceInfo=getInterface(vhospid,vdatasourceid,vdatasourcecode)
        if (InterfaceInfo==0) {return;}
        //Interfacekey=InterfaceSetInfo["IDMap"][vdatasourceid]
        Interfacekey=sInterfaceSetInfoObj["IDMap"][vdatasourceid]
    }
    //if (!InterfaceSetInfo.hasOwnProperty(Interfacekey))
    if (!sInterfaceSetInfoObj.hasOwnProperty(Interfacekey))
    {
        var InterfaceInfo=getInterface(vhospid,vdatasourceid,vdatasourcecode)
        if (InterfaceInfo==0) {return;}
    }
    //Modify by zx 2024-05-23 处理数据权限参数
    if(!headers){
        headers={};
    }
    headers["interfaceCode"] = Interfacekey;
    //var InterfaceDataSource=InterfaceSetInfo[Interfacekey]
    var InterfaceDataSource=sInterfaceSetInfoObj[Interfacekey]
    var InterfaceSetOutPut=InterfaceDataSource["InterfaceSetOutPut"]
    var InterfaceSet=InterfaceDataSource["InterfaceSetInfo"] 
    var InterFaceDataNode=InterfaceDataSource["node"]
    var InterFaceDataFilterInfo=InterfaceDataSource["filter"]

    var InterfaceService=InterfaceSet["InterfaceServiceInfo"]
    var InterfaceSetPara=InterfaceSet["InterfaceSetParaInfo"]    
    var InterfaceSetDataSourceMap=InterfaceSet["InterfaceSetDataSourceMap"]
    var InterFaceWebCls=InterfaceService["service_path"]+InterfaceSet["class_path"]
    var InterFaceMethod=InterfaceSet["method"]
    var InterFaceDataEnCode=InterfaceSet["data_encode"]
    var InterfaceParaFormat=InterfaceSet["para_format"]
    var InterfaceParaEnCode=InterfaceSet["para_encode"]
    var InterfaceParaSplit=InterfaceSet["para_split"]
    var InterfaceExitCmd=InterfaceSet["exit_cmd"]
    var InterAjaxGetPost=InterfaceSet["request_type"]

    var InterfaceReturnData={}
    var InterTransType=InterfaceService["interface_mode"]
    
    var InterfaceServerIP=InterfaceService["server_ip"]
    var InterFacePort=InterFaceHttpPort=InterfaceService["server_http_port"]
    var InterFaceHttpsPort=InterfaceService["server_https_port"]
    //add by lmm 2022-09-29 begin
    var InterfaceInnerServerIP=InterfaceService["server_inner_ip"]
    var InterFaceInnerHttpPort=InterfaceService["server_inner_http_port"]
    var InterFaceInnerHttpsPort=InterfaceService["server_inner_https_port"]
    //add by lmm 2022-09-29 end
    
    var InterFaceDataShowInfo=""
    var InterFaceRecordType=""      //JSON,MJSON,Array
    var ServerWebSocket="ws://"+InterfaceServerIP+":"+InterFacePort+InterfaceService["service_path"]     //Modify By DJ 2022-08-09 增加端口

    //Modify by zx 2023-12-13 存在父级id,表示走代理访问,父级为代理地址
    var parentId = InterfaceService["parent_id"];
    var parentServiceObj = "";
    var proxyUrl = "";
    if(parentId){
        //Modify by zx 2023-12-13 获取代理地址
        var para="&id="+parentId;
        parentServiceObj = getDataByAjax(dtvpApiServ,"interfaceService/api","selectById",para,"","get","json","","application/json;charset=utf-8");
        proxyUrl = Protocol + parentServiceObj.serverIp + ":" + parentServiceObj.serverHttpPort + "/" + parentServiceObj.servicePath + InterfaceSet["class_path"];
    }
    //add by lmm 2022-09-29 begin
    //modify by lmm 2023-05-08 全局变量首字母大写
    if (IsInner==true)
    {
        var InterfaceServerIP=InterfaceInnerServerIP
        if(ishttps)
        {
            var InterFacePort=InterFaceInnerHttpsPort
            ServerWebSocket="wss://"+InterfaceServerIP+":"+InterFacePort+InterfaceService["service_path"]
            //Modify by zx 2023-12-13 获取代理地址
            if(parentServiceObj) {
                var serverInnerIp = (parentServiceObj.serverInnerIp) ? parentServiceObj.serverInnerIp : parentServiceObj.serverIp;
                var serverInnerHttpsPort = (parentServiceObj.serverInnerHttpsPort) ? parentServiceObj.serverInnerHttpsPort : parentServiceObj.serverHttpsPort;
                proxyUrl = Protocol + serverInnerIp + ":" + serverInnerHttpsPort + "/" + parentServiceObj.servicePath + InterfaceSet["class_path"];
            } 
        }
        else
        {
            var InterFacePort=InterFaceInnerHttpPort
            //Modify by zx 2023-12-13 获取代理地址
            if(parentServiceObj) {
                var serverInnerIp = (parentServiceObj.serverInnerIp) ? parentServiceObj.serverInnerIp : parentServiceObj.serverIp;
                var serverInnerHttpPort = (parentServiceObj.serverInnerHttpPort) ? parentServiceObj.serverInnerHttpPort : parentServiceObj.serverHttpPort;
                proxyUrl = Protocol + serverInnerIp + ":" + serverInnerHttpPort + "/" + parentServiceObj.servicePath + InterfaceSet["class_path"];
            } 
        }
    }
    else
    {
        if(ishttps)
        {
            var InterFacePort=InterFaceHttpsPort
            //modify by lmm 2023-12-27 区别mqtt与websoket服务地址
            if ((InterTransType=="ActiveMQ")||(InterTransType=="ActiveMQCMD"))
            {
                ServerWebSocket="wss://"+InterfaceServerIP+":"+InterFacePort+InterfaceService["service_path"]
            }
            else
            {
                ServerWebSocket="wss://"+InterfaceServerIP+":"+InterFacePort
            }
            
            
            //Modify by zx 2023-12-13 获取代理地址
            if(parentServiceObj) {
                proxyUrl = Protocol + parentServiceObj.serverIp + ":" + parentServiceObj.serverHttpsPort + "/" + parentServiceObj.servicePath + InterfaceSet["class_path"];
            } 
        }
    }
    // if (ishttps)
    // {
    //     InterFacePort=InterFaceHttpsPort
    //     ServerWebSocket="wss://"+InterfaceServerIP+":"+InterFacePort
    // }

    //add by lmm 2022-09-29 end
    var InterFaceServerUrl=Protocol+InterfaceServerIP+":"+InterFacePort
    
    var InterFaceJsonStrPara=""         //JSON字符串格式
    var InterFaceStrPara=""       //字符串格式
    var InterFaceJsonPara={}        //JSON对象
    var InterfaceSetParaCount=InterfaceSetPara.length       //接口参数数量
    var auth_user_key=InterfaceService["auth_user_key"]
    var auth_user_name=InterfaceService["auth_user_name"]
    var auth_password_key=InterfaceService["auth_password_key"]
    var auth_password=InterfaceService["auth_password"]
    var auth_token_key=InterfaceService["auth_token_key"]
    var auth_token_value=InterfaceService["auth_token_value"]
    var auth_other_info=InterfaceService["auth_other_info"]
    var sys_code=InterfaceService["sys_code"]    //add by lmm 2022-09-19    //modify by lmm 2023-02-07 字段system_name改为sys_code
    var is_inner_api=InterfaceService["is_inner_api"]    //modify by lmm 2023-02-07 增加字段 is_inner_api
    if (is_inner_api) {var sys_code="Sys";}
    /*
    

    */
    if ((auth_user_key!="")&&(auth_user_key!=undefined))    {InterfaceSetPara.push({"is_node":"","parent_node":"","name":auth_user_key,"value_type":"text","value_default":auth_user_name,"value_only":"","is_required":"Y"});}
    if ((auth_password_key!="")&&(auth_password_key!=undefined))    {InterfaceSetPara.push({"is_node":"","parent_node":"","name":auth_password_key,"value_type":"text","value_default":auth_password,"value_only":"","is_required":"Y"});}
    var auth=window.btoa(auth_user_name+":"+auth_password)
    //add by lmm 2023-05-13 接口配置有医院入参标记
    var hasHospitalFlag=0
    if (InterfaceSetPara.length>0)
    {
        for (var ParaID=0; ParaID<InterfaceSetPara.length; ParaID++)
        {
            var OneInterFacePara=InterfaceSetPara[ParaID]
            var CurInterFaceParaValue=OneInterFacePara["value_default"]
			var InterFaceParaType=OneInterFacePara["value_type"]
			if (InterFaceParaType=="json") {CurInterFaceParaValue=jQuery.parseJSON(CurInterFaceParaValue)}
            if (vinterfaceparavalue.hasOwnProperty(OneInterFacePara["name"])) {CurInterFaceParaValue=vinterfaceparavalue[OneInterFacePara["name"]];}
            //add by lmm 2022-09-19 begin
            //modify by lmm 2022-10-11
            if ((CurInterFaceParaValue!="")&&(typeof(CurInterFaceParaValue)=="string"))
            {
                if ((BindSysUsers[sys_code])&&(BindSysUsers[sys_code][CurInterFaceParaValue]!=undefined))
                {
                    var CurInterFaceParaValue=CurInterFaceParaValue.replace(CurInterFaceParaValue,BindSysUsers[sys_code][CurInterFaceParaValue])
                }
            }
            //add by lmm 2022-09-19 end
            //参数类型校验
            var InterFaceParaType=OneInterFacePara["value_type"]
            if ((InterTransType=="ActiveMQ")||(InterTransType=="ActiveMQCMD"))
            {
                if (ParaID<InterfaceSetParaCount)
                {
                    //(1)字符串格式
                    if (InterFaceStrPara!="") {InterFaceStrPara=InterFaceStrPara+InterfaceParaSplit;}
                    if (OneInterFacePara["value_only"]=="Y")
                    {
                        InterFaceStrPara=InterFaceStrPara+CurInterFaceParaValue
                    }
                    else
                    {
                        InterFaceStrPara=InterFaceStrPara+OneInterFacePara["name"]+"="+CurInterFaceParaValue

                    }
                    //add by lmm 2023-05-13 无医院入参，进行添加
                    if (hasHospitalFlag==0){var hasHospitalFlag=checkHospData(OneInterFacePara["name"],sys_code);}
                    if ((ParaID==InterfaceSetPara.length-1)&&(hasHospitalFlag==0)&&(sys_code=="Sys"))
                    {
                        //modify by lmm 2024-01-04 更改入参拼接方式
                        if (InterFaceStrPara.indexOf("hospId")=="-1")
                        {
                            var InterFaceStrPara=InterFaceStrPara+InterfaceParaSplit+"hospId="+BindSysUsers["Sys"]["HospitalID"]
                        }
                        if (InterFaceStrPara.indexOf("hospitalId")=="-1")
                        {
                            var InterFaceStrPara=InterFaceStrPara+InterfaceParaSplit+"hospitalId="+BindSysUsers["Sys"]["HospitalID"]    //modify by lmm 2024-02-26 去&
                        }
                        if (InterFaceStrPara.indexOf("hospitalAreaId")=="-1")
                        {
                            var InterFaceStrPara=InterFaceStrPara+InterfaceParaSplit+"hospitalAreaId="+BindSysUsers["Sys"]["HospitalAreaID"]
                        }
                        // InterFaceStrPara=InterFaceStrPara+InterfaceParaSplit+"hospId="+BindSysUsers["Sys"]["HospitalID"]
                        // InterFaceStrPara=InterFaceStrPara+InterfaceParaSplit+"hospitalId="+BindSysUsers["Sys"]["HospitalID"]
                        // InterFaceStrPara=InterFaceStrPara+InterfaceParaSplit+"hospitalAreaId="+BindSysUsers["Sys"]["HospitalAreaID"]    //add by lmm 2023-12-04 分院区入参
                    }
                }
            }
            else
            {
                //(1)字符串格式
                if (InterFaceStrPara!="") {InterFaceStrPara=InterFaceStrPara+InterfaceParaSplit;}
                if (OneInterFacePara["value_only"]=="Y")
                {
                    InterFaceStrPara=InterFaceStrPara+CurInterFaceParaValue
                }
                else
                {
                    InterFaceStrPara=InterFaceStrPara+OneInterFacePara["name"]+"="+CurInterFaceParaValue

                }
                    //add by lmm 2023-05-13 无医院入参，进行添加
		            if (hasHospitalFlag==0){var hasHospitalFlag=checkHospData(OneInterFacePara["name"],sys_code);}
                    if ((ParaID==InterfaceSetPara.length-1)&&(hasHospitalFlag==0)&&(sys_code=="Sys"))
                    {
                        //modify by lmm 2024-01-04 更改入参拼接方式
                        if (InterFaceStrPara.indexOf("hospId")=="-1")
                        {
                            var InterFaceStrPara=InterFaceStrPara+InterfaceParaSplit+"hospId="+BindSysUsers["Sys"]["HospitalID"]
                        }
                        if (InterFaceStrPara.indexOf("hospitalId")=="-1")
                        {
                            var InterFaceStrPara=InterFaceStrPara+InterfaceParaSplit+"hospitalId="+BindSysUsers["Sys"]["HospitalID"]   //modify by lmm 2024-02-26 去&
                        }
                        if (InterFaceStrPara.indexOf("hospitalAreaId")=="-1")
                        {
                            var InterFaceStrPara=InterFaceStrPara+InterfaceParaSplit+"hospitalAreaId="+BindSysUsers["Sys"]["HospitalAreaID"]
                        }

                        // InterFaceStrPara=InterFaceStrPara+InterfaceParaSplit+"hospId="+BindSysUsers["Sys"]["HospitalID"]
                        // InterFaceStrPara=InterFaceStrPara+InterfaceParaSplit+"hospitalId="+BindSysUsers["Sys"]["HospitalID"]
                        // InterFaceStrPara=InterFaceStrPara+InterfaceParaSplit+"hospitalAreaId="+BindSysUsers["Sys"]["HospitalAreaID"]    //add by lmm 2023-12-04 分院区入参
                    }
            }
            //(2)JSON字符串格式
            if (InterFaceJsonStrPara!="") {InterFaceJsonStrPara=InterFaceJsonStrPara+',';}
            InterFaceJsonStrPara=InterFaceJsonStrPara+'"'+OneInterFacePara["name"]+'":"'+CurInterFaceParaValue+'"'
            //add by lmm 2023-05-13 无医院入参，进行添加
	        if ((ParaID==InterfaceSetPara.length-1)&&(hasHospitalFlag==0)&&(sys_code=="Sys"))
            {

                //modify by lmm 2024-01-04 更改入参拼接方式
                if (InterFaceJsonStrPara.indexOf("hospId")=="-1")
                {
                    InterFaceJsonStrPara=InterFaceJsonStrPara+','+'"hospId":"'+BindSysUsers["Sys"]["HospitalID"]+'"'
                }
                if (InterFaceJsonStrPara.indexOf("hospitalId")=="-1")
                {
                    InterFaceJsonStrPara=InterFaceJsonStrPara+','+'"hospitalId":"'+BindSysUsers["Sys"]["HospitalID"]+'"'
                }
                if (InterFaceStrPara.indexOf("hospitalAreaId")=="-1")
                {
                    InterFaceJsonStrPara=InterFaceJsonStrPara+','+'"hospitalAreaId":"'+BindSysUsers["Sys"]["HospitalAreaID"]+'"'   //add by lmm 2023-12-04 分院区入参
                }              
                // InterFaceJsonStrPara=InterFaceJsonStrPara+','+'"hospId":"'+BindSysUsers["Sys"]["HospitalID"]+'"'
                // InterFaceJsonStrPara=InterFaceJsonStrPara+','+'"hospitalId":"'+BindSysUsers["Sys"]["HospitalID"]+'"'
                // InterFaceJsonStrPara=InterFaceJsonStrPara+','+'"hospitalAreaId":"'+BindSysUsers["Sys"]["HospitalAreaID"]+'"'   //add by lmm 2023-12-04 分院区入参
            }
            //(3)JSON对象
            InterFaceJsonPara[OneInterFacePara["name"]]=CurInterFaceParaValue
	         //add by lmm 2023-05-13 无医院入参，进行添加
            if ((ParaID==InterfaceSetPara.length-1)&&(hasHospitalFlag==0)&&(sys_code=="Sys"))
            {
                //modify by lmm 2024-01-04 更改入参拼接方式
                if (!InterFaceJsonPara["hospId"]) {InterFaceJsonPara["hospId"]=BindSysUsers["Sys"]["HospitalID"];}
                if (!InterFaceJsonPara["hospitalId"]) {InterFaceJsonPara["hospitalId"]=BindSysUsers["Sys"]["HospitalID"];}
                if (!InterFaceJsonPara["hospitalAreaId"]) {InterFaceJsonPara["hospitalAreaId"]=BindSysUsers["Sys"]["HospitalAreaID"];}
                // InterFaceJsonPara["hospId"]=BindSysUsers["Sys"]["HospitalID"]
                // InterFaceJsonPara["hospitalId"]=BindSysUsers["Sys"]["HospitalID"]
                // InterFaceJsonPara["hospitalAreaId"]=BindSysUsers["Sys"]["HospitalAreaID"]   //add by lmm 2023-12-04 分院区入参

                // InterFaceJsonPara["hospId"]=BindSysUsers["Sys"]["HospitalID"]
                // InterFaceJsonPara["hospitalId"]=BindSysUsers["Sys"]["HospitalID"]
                // InterFaceJsonPara["hospitalAreaId"]=BindSysUsers["Sys"]["HospitalAreaID"]   //add by lmm 2023-12-04 分院区入参
            }
        }
        if (InterFaceJsonStrPara!="") {InterFaceJsonStrPara='{'+InterFaceJsonStrPara+'}';}
    }
    var InterfacePara=""
    if (InterfaceParaFormat=="String") {InterfacePara=InterFaceStrPara;}
    if (InterfaceParaFormat=="JSONStr") {InterfacePara=InterFaceJsonStrPara;}
    if (InterfaceParaFormat=="JSONObj") {InterfacePara=InterFaceJsonPara;}
    
    //modify by lmm 2022-09-20
    if ((vchartname!="")&&(vchartname!=undefined)&&(InterfaceParaFormat=="JSONStr"))
    {
        var vchartname=transParaByDatasource(vchartname,InterfacePara)
    }
    var vcallinfo={"callkey":Interfacekey,"interfacepara":vinterfaceparavalue,"callfun":vcallfun,"callpara":vcallfunpara,"chartname":vchartname,"interfacestrpara":InterFaceStrPara}
    //Modify by zx 2024-01-05 接口调试数据增加接口配置判断
    var serviceDebugFalg = InterfaceService["is_debug"];
    var interfaceDebugFalg = InterfaceSet["interface_is_debug"];
    if(((serviceDebugFalg)||(interfaceDebugFalg))&&((InterTransType=="AJAX")||(InterTransType=="WebService"))){
        // Modify by zx 2024-01-09 同步需返回数据
        const debugDataRes = getInterfaceDebugData(InterfacePara, vcallinfo, InterfaceDataSource["interface_set_id"]);
        return debugDataRes;
    }
    if (InterTransType=="AJAX")     //Ajax调用
    {
        //Modify by zx 2023-12-13 存在父级id,表示走代理访问,父级为代理地址
        InterfaceReturnData=getDataByInterFaceAjax(InterFaceServerUrl,InterFaceWebCls,InterFaceMethod,InterfacePara,vcallinfo,headers, proxyUrl, isAsync);  // Modify by zx 2024-02-28 增加是否异步请求参数
    }
    else if (InterTransType=="WebSocket")       //WebSocket调用
    {
        if ((vrefreshtime=="")||(vrefreshtime==undefined)) {vrefreshtime=60;}
        // //刷新频率
        createWebSocket2(Interfacekey,ServerWebSocket,InterFaceWebCls,InterFaceMethod,InterfacePara,vrefreshtime,vcallinfo)
    }
    else if (InterTransType=="WebService")      //WebService调用
    {
        InterfaceReturnData=getDataByWebService(InterFaceServerUrl,InterFaceWebCls,InterFaceMethod,InterfacePara,vcallinfo,auth)
    }
    else if (InterTransType=="ActiveMQ")        //ActiveMQ调用
    {
        var UserName=InterFaceJsonPara["UserName"]
        var PassWord=InterFaceJsonPara["PassWord"]
        var CurMQTT=new MQTT(ServerWebSocket)
        MQTTQueue[Interfacekey]=CurMQTT
        var newinterfacepara=strReplace(JSON.stringify(vinterfaceparavalue),"\"","<")
        var callfunpara=strReplace(JSON.stringify(vcallfunpara),"\"","<") // modify by dj 2022-11-03 回调入参不同时也会调用
        gInterfaceData[Interfacekey+InterFaceMethod+newinterfacepara+vcallfun+callfunpara+"_ReturnData"]="" // modify by dj 2022-11-03 回调入参不同时也会调用
        var InterTopics=InterFaceMethod
        if (InterfaceParaFormat=="String") {InterTopics=InterFaceMethod+InterfacePara;}
        if ((MQTTQueue[Interfacekey].stompClient!=null)&&(MQTTQueue[Interfacekey].stompClient.connected))
        {
            MQTTQueue[Interfacekey].successCallback(InterTopics,vcallinfo)
        }
        else
        {
            MQTTQueue[Interfacekey].connect(UserName, PassWord, InterTopics,vcallinfo)
        }
    }
    else if (InterTransType=="ActiveMQCMD")        //ActiveMQCMD调用
    {
        var UserName=InterFaceJsonPara["UserName"]
        var PassWord=InterFaceJsonPara["PassWord"]
        var newinterfacepara=strReplace(JSON.stringify(vinterfaceparavalue),"\"","<")
        var callfunpara=strReplace(JSON.stringify(vcallfunpara),"\"","<") // modify by dj 2022-11-03 回调入参不同时也会调用
        gInterfaceData[Interfacekey+InterFaceMethod+newinterfacepara+vcallfun+callfunpara+"_ReturnData"]="" // modify by dj 2022-11-03 回调入参不同时也会调用
        var InterTopics=InterFaceMethod
        if (InterfaceParaFormat=="String") {InterTopics=InterFaceMethod+InterfacePara;}
        //MQTTQueue[Interfacekey] =activeMQTTByCMD(ServerWebSocket,UserName,PassWord,InterTopics,vcallinfo)
        activeMQTTByCMD(ServerWebSocket,UserName,PassWord,InterTopics,vcallinfo,interfaceLevelType,interfaceLevelID)
    }
    //定时刷新处理
    if ((vrefreshtime!="")&&(vrefreshtime!=undefined)&&(vrefreshtime>0))
    {
        if ((InterTransType=="AJAX")||(InterTransType=="WebService"))
        {        
            if (InterfaceRefresh[Interfacekey]==undefined)
            {
                InterfaceRefresh[Interfacekey]={"freshstart":1}
                var widgetPanelID=""
                for (var key in vcallfunpara)
                {
                    if (vcallfunpara[key].hasOwnProperty("widgetPanelID"))
                    {
                        widgetPanelID=vcallfunpara[key]["widgetPanelID"]
                        var curpageid=widgetPanelID.split("_")[0]
                        if (!InterfaceRefresh[Interfacekey].hasOwnProperty(curpageid))
                        {
                            InterfaceRefresh[Interfacekey][curpageid]={"interfacepara":vinterfaceparavalue,"callfun":vcallfun,"callfunpara":vcallfunpara,"chartname":vchartname}
                            //Modify by zx 2024-01-11 定时刷新机制调整
                            /*
                            setInterval(function () {
                                var finterfacepara=InterfaceRefresh[Interfacekey][curpageid]["interfacepara"]
                                var fcallfun=InterfaceRefresh[Interfacekey][curpageid]["callfun"]
                                var fcallfunpara=InterfaceRefresh[Interfacekey][curpageid]["callfunpara"]
                                var fchartname=InterfaceRefresh[Interfacekey][curpageid]["chartname"]
                                getInterfaceinfo(vhospid,vdatasourceid,vdatasourcecode,vrefreshtime,finterfacepara,fcallfun,fcallfunpara,fchartname);
                            }, vrefreshtime*1000);
                            */
                            //定时器实例化
                            let interfaceTimer = new commonTimer(() => {
                                    // 定时器对象实例化回调函数传递
                                    var finterfacepara=InterfaceRefresh[Interfacekey][curpageid]["interfacepara"]
                                    var fcallfun=InterfaceRefresh[Interfacekey][curpageid]["callfun"]
                                    var fcallfunpara=InterfaceRefresh[Interfacekey][curpageid]["callfunpara"]
                                    var fchartname=InterfaceRefresh[Interfacekey][curpageid]["chartname"]
                                    getInterfaceinfo(vhospid,vdatasourceid,vdatasourcecode,vrefreshtime,finterfacepara,fcallfun,fcallfunpara,fchartname);
                                }, 
                                vrefreshtime*1000 //定时器对象实例化后执行间隔时长
                            );
                            interfaceTimer.run();
                            //Modify by zx 2024-01-11 记录刷新的接口
                            if(callerId !== ""){
                                const refreshObj = {"interfaceType":InterTransType, "callerId":callerId, "interfacePart":interfaceTimer};
                                if(PageRefreshInterface[callerId].indexOf(refreshObj) === -1) {PageRefreshInterface[callerId].push(refreshObj);}
                            }
                        }
                    }
                }
                if (widgetPanelID=="")
                {
                    //Modify by zx 2024-01-11 定时刷新机制调整
                    /*
                    setInterval(function () {
                        getInterfaceinfo(vhospid,vdatasourceid,vdatasourcecode,vrefreshtime,vinterfaceparavalue,vcallfun,vcallfunpara,vchartname);
                    }, vrefreshtime*1000);
                    */
                    //定时器实例化
                    let interfaceTimer = new commonTimer(() => {
                            // 定时器对象实例化回调函数传递
                            getInterfaceinfo(vhospid,vdatasourceid,vdatasourcecode,vrefreshtime,vinterfaceparavalue,vcallfun,vcallfunpara,vchartname);
                        }, 
                        vrefreshtime*1000 //定时器对象实例化后执行间隔时长
                    );
                    interfaceTimer.run();
                    //Modify by zx 2023-09-11 记录刷新的接口
                    if(callerId !== ""){
                        const refreshObj = {"interfaceType":InterTransType, "callerId":callerId, "interfacePart":interfaceTimer};
                        if(PageRefreshInterface[callerId].indexOf(refreshObj) === -1) {PageRefreshInterface[callerId].push(refreshObj);}
                    }
                }
            }
            else
            {
                var widgetPanelID=""
                for (var key in vcallfunpara)
                {
                    if (vcallfunpara[key].hasOwnProperty("widgetPanelID"))
                    {
                        widgetPanelID=vcallfunpara[key]["widgetPanelID"]
                        var curpageid=widgetPanelID.split("_")[0]
                        if (InterfaceRefresh[Interfacekey].hasOwnProperty(curpageid))
                        {
                            InterfaceRefresh[Interfacekey][curpageid]={"interfacepara":vinterfaceparavalue,"callfun":vcallfun,"callfunpara":vcallfunpara,"chartname":vchartname}
                        }
                        else
                        {
                            InterfaceRefresh[Interfacekey][curpageid]={"interfacepara":vinterfaceparavalue,"callfun":vcallfun,"callfunpara":vcallfunpara,"chartname":vchartname}
                            //Modify by zx 2024-01-11 定时刷新机制调整
                            /*
                            setInterval(function () {
                                var finterfacepara=InterfaceRefresh[Interfacekey][curpageid]["interfacepara"]
                                var fcallfun=InterfaceRefresh[Interfacekey][curpageid]["callfun"]
                                var fcallfunpara=InterfaceRefresh[Interfacekey][curpageid]["callfunpara"]
                                var fchartname=InterfaceRefresh[Interfacekey][curpageid]["chartname"]
                                getInterfaceinfo(vhospid,vdatasourceid,vdatasourcecode,vrefreshtime,finterfacepara,fcallfun,fcallfunpara,fchartname);
                            }, vrefreshtime*1000);
                            */
                            //定时器实例化
                            let interfaceTimer = new commonTimer(() => {
                                    // 定时器对象实例化回调函数传递
                                    var finterfacepara=InterfaceRefresh[Interfacekey][curpageid]["interfacepara"]
                                    var fcallfun=InterfaceRefresh[Interfacekey][curpageid]["callfun"]
                                    var fcallfunpara=InterfaceRefresh[Interfacekey][curpageid]["callfunpara"]
                                    var fchartname=InterfaceRefresh[Interfacekey][curpageid]["chartname"]
                                    getInterfaceinfo(vhospid,vdatasourceid,vdatasourcecode,vrefreshtime,finterfacepara,fcallfun,fcallfunpara,fchartname);
                                },
                                vrefreshtime*1000 //定时器对象实例化后执行间隔时长
                            );
                            interfaceTimer.run();
                            //Modify by zx 2023-09-11 记录刷新的接口
                            if(callerId !== ""){
                                const refreshObj = {"interfaceType":InterTransType, "callerId":callerId, "interfacePart":interfaceTimer};
                                if(PageRefreshInterface[callerId].indexOf(refreshObj) === -1) {PageRefreshInterface[callerId].push(refreshObj);}
                            }
                        }
                    }
                }
            }
        }
    }

    return InterfaceReturnData
}