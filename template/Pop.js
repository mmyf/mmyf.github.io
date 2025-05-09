 /**
 * 创建气泡通用函数
 * @param {string} parentElementId 父元素ID
 * @param {string} popId 气泡ID
 * @param {String} popHtml 气泡内容
 * @param {String} popShowWay 展示气泡方式
 * @param {String} popShowDirection 气泡出现方向
 * @returns {String} html html串，用于没有父元素的时候
 * @author 缪一帆 2022-10-24
 */
function createPopPanel (parentElementId,popId,popHtml,popShowWay) {

}

/**
 * @create DJ 2022
 * @description 调用ajxa实现后台数据交互
 * @param {String} vserverurl 调用服务器地址
 * @param {String} vwebcls 类名
 * @param {String} interfacename 方法名
 * @param {JSON} para 入参 json格式字符串
 * @param {JSON}  vcallinfo 回调信息
 * @Modify By DJ 2023-03-10 接口加载效率优化
 * @Modify myf 20231025 添加入参headers
 * @Modify by zx 2023-12-13 存在父级id,表示走代理访问,父级为代理地址
*/
function getDataByInterFaceAjax(vserverurl,vwebcls,interfacename,para,vcallinfo,headers, proxyUrl = "", isAsync)
{
    //Modify by zx 2023-10-25 增加token处理
    let interfaceServiceToken = {}
    if ((vcallinfo["callkey"]=="")||(vcallinfo["callkey"]==undefined))
    {
        var InterFaceParaEnCode=vcallinfo["para_encode"]
        var InterfaceParaFormat=vcallinfo["para_format"]
        var InterFaceRequestType=vcallinfo["request_type"]
        var InterFaceContentType=vcallinfo["content_type"]
    }
    else
    {
        // var InterFaceParaEnCode=InterfaceSetInfo[vcallinfo["callkey"]]["InterfaceSetInfo"]["para_encode"]
        // var InterfaceParaFormat=InterfaceSetInfo[vcallinfo["callkey"]]["InterfaceSetInfo"]["para_format"]
        // var InterFaceRequestType=InterfaceSetInfo[vcallinfo["callkey"]]["InterfaceSetInfo"]["request_type"]

        var sInterfaceSetInfoObj=JSON.parse(window.localStorage.getItem("InterfaceSetInfo"))
        var InterFaceParaEnCode=sInterfaceSetInfoObj[vcallinfo["callkey"]]["InterfaceSetInfo"]["para_encode"]
        var InterfaceParaFormat=sInterfaceSetInfoObj[vcallinfo["callkey"]]["InterfaceSetInfo"]["para_format"]
        var InterFaceRequestType=sInterfaceSetInfoObj[vcallinfo["callkey"]]["InterfaceSetInfo"]["request_type"]
        var InterFaceContentType=sInterfaceSetInfoObj[vcallinfo["callkey"]]["InterfaceSetInfo"]["content_type"]
        //Modify by zx 2023-10-25 token处理
        interfaceServiceToken = sInterfaceSetInfoObj[vcallinfo["callkey"]]["InterfaceSetInfo"]["InterfaceServiceInfo"]["interfaceServiceToken"];
    }
    var JSONPara={}
    var returndata={}
    //参数加密
    if ((InterFaceParaEnCode!="")&&(InterFaceParaEnCode!=undefined))
    {
        var EnCodeFun=InterFaceParaEnCode.split(",")
        for (var i=0;i<EnCodeFun.length;i++)
        {
            if (EnCodeFun[i]!="paraJsonObjToStr")
            {
                var exefun=EnCodeFun[i]+"(`"+para+"`)"
                para=eval(exefun)
            }
        }
    }
    if ((InterfaceParaFormat!="")&&(InterfaceParaFormat!=undefined)&&(InterfaceParaFormat!="JSONObj"))
    {
        //modify by lmm 2022-12-27
        if ((InterFaceRequestType=="get")&&((vwebcls=="DHCDT3D/RestQueryServ")||(vwebcls=="dtvpproxy/dataserver/api")||(vwebcls=="dtvptest/dataserver/api")))
        {
            var vurl=vserverurl+"/"+vwebcls+"/"+interfacename+"/"+para
            //Modify by zx 2023-12-13 存在父级id,表示走代理访问,父级为代理地址
            if(proxyUrl){
                proxyUrl = proxyUrl +"/"+interfacename+"/"+para;
            }
        }
        else
        {
            var vurl=vserverurl+"/"+vwebcls+"/"+interfacename+"?"+para
            //Modify by zx 2023-12-13 存在父级id,表示走代理访问,父级为代理地址
            if(proxyUrl){
                proxyUrl = proxyUrl +"/"+interfacename+"?"+para;
            }
        }
    }
    else
    {
        var vurl=vserverurl+"/"+vwebcls+"/"+interfacename
        //Modify by zx 2023-12-13 存在父级id,表示走代理访问,父级为代理地址
        if(proxyUrl){
            proxyUrl = proxyUrl +"/"+interfacename;
        }
		if (InterFaceParaEnCode.indexOf("paraJsonObjToStr")!=-1)
		{
			para=JSON.stringify(para);
		}
        JSONPara={"data":para}
    }
    if ((vcallinfo["callkey"]=="")||(vcallinfo["callkey"]==undefined))
    {
        var gInterfaceDataStr=vurl+JSON.stringify(JSONPara)
    }
    else
    {
        var interfacepara=strReplace(JSON.stringify(vcallinfo["interfacepara"]),"\"","<")
        var callfunpara=strReplace(JSON.stringify(vcallinfo["callpara"]),"\"","<")
        var gInterfaceDataStr=vcallinfo["callkey"]+interfacename+interfacepara+vcallinfo["callfun"]+callfunpara+"_ReturnData"
    }

    var asyncFlag= (typeof isAsync !== 'undefined' && isAsync != null) ? isAsync :false; // Modify by zx 2024-02-28 未传递异步处理标志参数时默认为同步
    if (gInterfaceData.hasOwnProperty(gInterfaceDataStr)) {asyncFlag=true;}

    //Modify by zx 2023-10-25 判断token无效
    let tokenFlag = false;  //默认不存在token
    let accessToken = "";
    let accessTokenName = "";  //Modify by zx 2023-12-15 增加token传递参数名处理
    if((interfaceServiceToken) && (!$.isEmptyObject(interfaceServiceToken))){
        
        //检测token是否超期
        const outTimmeFlag = isServiceTokenExpire(interfaceServiceToken);
        //超期后重新获取token
        if(outTimmeFlag){
            //Modify by zx 2024-06-24 参数处理
            var param="id=" + interfaceServiceToken.id
            const newInterfaceServiceToken = getDataByAjax(dtvpApiServ,"interfaceServiceToken/api","getServiceToken",param,"","get","json","","application/json;charset=utf-8");;
           // Modify by zx 2023-12-15 token信息改变后修改localStorage
            var curInterfaceSetInfoObj=JSON.parse(window.localStorage.getItem("InterfaceSetInfo"))
            curInterfaceSetInfoObj[vcallinfo["callkey"]]["InterfaceSetInfo"]["InterfaceServiceInfo"]["interfaceServiceToken"] = newInterfaceServiceToken;
            window.localStorage.setItem("InterfaceSetInfo", JSON.stringify(curInterfaceSetInfoObj));
            accessToken = newInterfaceServiceToken.accessToken;
            accessTokenName = newInterfaceServiceToken.accessTokenName;
            tokenFlag = true; //有有效token
        } else {
            accessToken = interfaceServiceToken.accessToken;
            accessTokenName = interfaceServiceToken.accessTokenName;
            tokenFlag = true; //有有效token
        }
    }

    var execuajax={
            type: InterFaceRequestType,
            url: vurl,
            async:asyncFlag,
            //contentType: "application/json;charset=UTF-8", 
            success: function (data) {
                if (data.success==false)
                {
                    $.alert({title:'错误',content:"错误代码:["+data.code+"],错误描述:"+data.msg ,confirmText:'确定'});
                    return
                }
                if ((vcallinfo["callkey"]=="")||(vcallinfo["callkey"]==undefined))
                {
                    var outputdata=data
                }
                else
                {
                    var outputdata=getoutputdata(data,vcallinfo)
                }
                returndata=outputdata;
                // Modify by zx 2024-02-29 首次加载
                var firstFlag = false;
                if(!gInterfaceData[gInterfaceDataStr]){
                    firstFlag = true;
                }
                
                //返回值是否发生变化
                if (JSON.stringify(gInterfaceData[gInterfaceDataStr])!=JSON.stringify(outputdata)) {gInterfaceData[gInterfaceDataStr]=outputdata;}
                if (asyncFlag==false)
                {
                    //图表设置及数据处理
                    // Modify by zx 2023-07-04 不需要在请求数据集时加载图表设置
                    /*if ((vcallinfo["chartname"]!="")&&(vcallinfo["chartname"]!=undefined))
                    {
                        // var Argpara='{"ChartsNameStr":"'+vcallinfo["chartname"]+'","ChartsPars":"'+vcallinfo["chartname"]+'","rem2px":"'+rem2px+'"}'
                        // var curChartsSet=getdatabyajaxpost2(ServerUrl,webcls,"GetMethodNameByJson",{"ClassName":"web.DHCEQ.Plat.CTChartsDefineNew","MethodName":"GetChartsInfo","Arg":Argpara},"")
                        var chartname=vcallinfo["chartname"]
                        var parainfo={"chartsNameStr":chartname,"rem2px":rem2px}
                        var parainfo=JSON.stringify(parainfo)
                        var curChartsSet=getDataByAjax(dtvpApiServ,"chartDefineSet/api","getChartsInfo",parainfo,"","post","json","","application/json;charset=utf-8")
                        getInterfaceChartsInfo(curChartsSet,returndata)
                    }*/
                    //回调函数处理
                    if ((vcallinfo["callfun"]!=undefined)&&(vcallinfo["callfun"]!=""))
                    {
                        vcallinfo["callfun"](outputdata,vcallinfo["callpara"])
                    }
                    else
                    {
                        returndata=outputdata
                    }
                } else {
                    //Modify by zx 2024-02-29 首次加载时异步请求调用回调
                    if(firstFlag){
                        if ((vcallinfo["callfun"]!=undefined)&&(vcallinfo["callfun"]!=""))
                        {
                            vcallinfo["callfun"](outputdata,vcallinfo["callpara"])
                        }
                    }
                }
            },
            dataType: "json",
            error:function(xhr,status,error){
                console.log(xhr);
            }
        };
	if ((InterFaceContentType!="")&&(InterFaceContentType!=undefined))
	{
		execuajax=jQuery.extend(execuajax,{"contentType":InterFaceContentType});
	}
    execuajax=jQuery.extend(execuajax,JSONPara);
    //Modify by zx 2023-12-13 headers未定义时初始化
    if(!headers){
        headers={};
    }
    headers["Access-Token"] = Token;
    //Modify by zx 2023-12-13 避免headers被清除
    if(tokenFlag) {
        headers["eq-access-token-param"] = accessTokenName;
        headers[accessTokenName] = accessToken;
    }
    if(proxyUrl){
        //Modify by zx 2023-12-13 获取代理地址
        execuajax.url = proxyUrl;
        headers["eq-redirect-url"] = vurl;
    }
    // myf 20231025 添加入参headers
    if (headers) {
        execuajax.headers = headers;
    }
    if (gInterfaceData.hasOwnProperty(gInterfaceDataStr))
    {
        $.ajax(execuajax);
        //Modify by zx 2023-07-04 加载数据源时不需要加载图表设置数据
        //回调函数处理
        if ((vcallinfo["callfun"]!=undefined)&&(vcallinfo["callfun"]!=""))
        {
            vcallinfo["callfun"](gInterfaceData[gInterfaceDataStr],vcallinfo["callpara"])
        }
        else
        {
            return gInterfaceData[gInterfaceDataStr]
        }
        return
    }
    $.ajax(execuajax)
    return returndata
}