/**
 * @file thingjs界面生成
 * @author 邹旋
 * @copyright DHC Mediway Technology Co., Ltd.
 * @version Version0.9.6
 * @createdate 2022-05-15
 */
//var pageDataArray = new Array();
var pageDataObj;
var pageEchartsArray = new Array();
// modify myf 2022-08-23 表单元素id数组
let pageInputArray = [];

/**********************************已核程序 需标注已核人、已核时间***************************************/



/**********************************自核程序 需标注自核人、自核时间***************************************/
/**
 * 根据参数名称获取URL请求参数值
 * @param {string} pageID 界面id
 * @returns 无
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
//Modify by zx 2022-08-03 一个页面多个界面调用不影响其它界面刷新
function pageLoad(pageID,pleveltype,plevel)
{
    // modify myf 2022-08-23 表单元素id数组清空
    pageInputArray = [];
    pageDataObj = new Object();
    $.ajax({
		type: "post",
        url: dtvpApiServ+"/page/api/pageListByOne",  //Modify by zx 2022-08-02 请求地址修改  pageListByWxy   pageListByOne
        data: JSON.stringify({pageSetId:pageID}),
        contentType: "application/json;charset=UTF-8",
		dataType: "json", // 返回的数据类型 json
		success: function (pageData) {
            if(pageData.success){
                //获取界面样式代码
                createPageCommon(pageData.data,pleveltype,plevel);
            }else{
                $.alert({title:'提示',content:pageData.msg ,confirmText:'确定'});
            }
        },
        error:function(xhr,status,error){
            $.alert({title:'提示',content:xhr ,confirmText:'确定'});
        }
	});
}
/**
 * page生成入口
 * @param {Object} pageData 界面信息对象
 * @returns {string} pageHtml 界面框架拼接的html字符串
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function createPageCommon(pageData,pleveltype,plevel)
{
    var pageHtml = "";
    //自定义样式拼接
    var styleInfo="";
    styleInfo=(pageData.pageSet.width==""||pageData.pageSet.width==undefined||pageData.pageSet.width==null)?styleInfo:styleInfo+"width:"+pageData.pageSet.width+";";
    styleInfo=(pageData.pageSet.height==""||pageData.pageSet.height==undefined||pageData.pageSet.height==null)?styleInfo:styleInfo+"height:"+pageData.pageSet.height+";";
    styleInfo=(pageData.pageSet.padding==""||pageData.pageSet.padding==undefined||pageData.pageSet.padding==null)?styleInfo:styleInfo+"padding:"+pageData.pageSet.padding+";";
    styleInfo=(pageData.pageSet.background==""||pageData.pageSet.background==undefined||pageData.pageSet.background==null)?styleInfo:styleInfo+"background:"+pageData.pageSet.background+";";
    styleInfo=(pageData.pageSet.shadow==""||pageData.pageSet.shadow==undefined||pageData.pageSet.shadow==null)?styleInfo:styleInfo+"box-shadow:"+pageData.pageSet.shadow+";";
    styleInfo=(pageData.pageSet.borderRadius==""||pageData.pageSet.borderRadius==undefined||pageData.pageSet.borderRadius==null)?styleInfo:styleInfo+"border-radius:"+pageData.pageSet.borderRadius+";";

    var styleFun = pageData.pageSet.styleFun;
    if((styleFun!="")&&(styleFun!=undefined)&&(styleFun!=null)){
        //回调函数参数打包
        var pageObj={
            "styleInfo":styleInfo,
            "pageRowID":pageData.pageSet.id,
            "pageName":pageData.name,
            "pageTitle":pageData.pageSet.title,
            "callFun":pageData.pageSet.callFun
        }
        //回调函数转化
        var func = eval(styleFun);
        pageHtml =func(pageObj);
    }else{
        pageHtml = '<div style="'+styleInfo+'" id="page'+pageData.pageSet.id+'_'+pageData.name+'"></div>'
    }
    //根据界面类型生成相关界面
    switch(pageData.pageType)
    {
        case "webview":
            $("#webViewContent").append(pageHtml);
        break;
        case "maker":
        break;
        case "uianchor":
        break;
        case "ui":
        break;
        case "2d":
            //modify by zx 2022-08-03 重新加载时需要清除面板
            if($("#page"+pageData.pageSet.id+"_"+pageData.name).length>0) $("#page"+pageData.pageSet.id+"_"+pageData.name).remove();
            if(pageData.pageSet.positionX.indexOf("-")<0)
            {
                var panelHtml = `<div id="page${pageData.pageSet.id}_${pageData.name}" style="position:absolute; left:${pageData.pageSet.positionX}; top:${pageData.pageSet.positionY};">${pageHtml}<div>`;
            }
            else
            {
                positionX = pageData.pageSet.positionX.replace("-","")
                var panelHtml = `<div id="page${pageData.pageSet.id}_${pageData.name}" style="position:absolute; right:${positionX}; top:${pageData.pageSet.positionY};">${pageHtml}<div>`;
            }
            $('#div2d').append($(panelHtml));
            //gc_panels.push($("#page"+pageData.pageSet.id+"_"+pageData.name));
            // modify myf 2022-11-01 当LevelType或OperLevel为空时，不登记处理
            if (pleveltype!=="" && plevel!=="") {
                LevelType=pleveltype
                if ((pleveltype==0)&&(plevel!="")&&(plevel!=undefined)) OperLevel=plevel
                if ((pleveltype==1)&&(plevel!="")&&(plevel!=undefined)) SenceLevel=plevel
                createarraybytype(0,"page"+pageData.pageSet.id+"_"+pageData.name);
                LevelType=0;
            }
        break;
    }
    //面板生成
    var pageID="page"+pageData.pageSet.id+"_"+pageData.name;
    createPanelCommon(pageData.pageSet.pagePanel, pageID);
    initPageData();
    // modify myf 2022-08-19 添加面板自动消失处理
    if (pageData.pageSet.survivalTime && Number.parseInt(pageData.pageSet.survivalTime) > 0) {
        setTimeout(()=>{
            $('#'+pageID).remove();
        },Number.parseInt(pageData.pageSet.survivalTime) * 1000);
    }
}
/**
 * 统一数据源信息汇总,便于统一初始化加载数据及刷新处理
 * @param {string} dataSource 数据源
 * @param {string} refreshTime 刷新时长
 * @param {Object} widgetObj 生成部件所需信息对象
 * @returns 无
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function sourceDataInsert(dataSource, refreshTime, widgetObj)
{
    //Modify by zx 2022-08-03 增加pageid节点
    if(dataSource=="") return;
    var include=false
    for (let key in pageDataObj) {
        if(key==dataSource){
            include=true;
            pageDataObj[key].widgetObjs.push(widgetObj);
            if (widgetObj.widgetType=="echarts") pageDataObj[key].echartsCode.push(widgetObj.widgetKey);
        }
    }
    if(!include)
    {
        var widgetObjs=[widgetObj];
        var echartsCode=[];
        if (widgetObj.widgetType=="echarts") echartsCode.push(widgetObj.widgetKey);
        var curElemObj={
            "sourceRefreshTime":refreshTime,
            "widgetObjs":widgetObjs,
            "echartsCode":echartsCode
        }
        pageDataObj[dataSource]=curElemObj;
    }
}
/**
 * page内部元素统一加载数据
 * @param 无
 * @returns 无
 * @author 邹旋 2022-05-15
 * Modify by zx 2022-08-09 参数放入部件输出后统一调整
 * @checkinfo zx 2022-08-02
 */
function initPageData()
{
    //遍历对象数组
    for (let key in pageDataObj) {
        if(key=="0")
        {
            for (let keyArr = 0; keyArr < pageDataObj[key].widgetObjs.length; keyArr++)
            {
                var widgetObj=pageDataObj[key].widgetObjs[keyArr];
                if(widgetObj.widgetType!="echarts")
                {
                    var dataFunc=widgetObj.dataSourceFun;
                    //var paramInfo=getSourceDataParam("1",widgetObj.widgetId,"0");
                    dataFunc=eval(dataFunc);
                    var interfaceData = dataFunc("",widgetObj["returnParam"]);
                    // if(widgetObj.dataSourceNode!="") interfaceData=interfaceData[widgetObj.dataSourceNode];
                    if(widgetObj.dataSourceNode!="") {
                        // add myf 2022-10-26
                        if (widgetObj.dataSourceNode.includes('>')) {
                            const nodes = widgetObj.dataSourceNode.split('>');
                            nodes.forEach((node)=>{
                                interfaceData=interfaceData[node];
                            });
                        } else {
                            interfaceData=interfaceData[widgetObj.dataSourceNode];
                        }
                    }
                    var widgetFun = widgetObj.styleFun;
                    widgetFun = eval(widgetFun);
                    widgetFun(interfaceData, widgetObj);
                }
                else
                {
                    var dataFunc = widgetObj.dataSourceFun;
                    dataFunc = eval(dataFunc);
                    //modify by lmm 2022-09-01
                    var chartname={}
                    chartname[widgetObj.widgetKey]=[widgetObj.widgetKey]
                    // console.log("mmmmmmmmmmmm1")
                    getInterfaceinfo("","17","","","",dataFunc,widgetObj,chartname);
                }
            }
        }
        else
        {
            //Modify by zx 2022-10-17 统一数据源下根据参数重新汇总调用数据源
            var positions=new Array();
            var newPageDataObj = new Object();
            var widgetObjs=pageDataObj[key].widgetObjs;
            for (var pis = 0; pis < widgetObjs.length; pis++)
            {
                var inFlag=false;
                for(let item of positions){
                    if(JSON.stringify(widgetObjs[item]["interfaceParam"])===JSON.stringify(widgetObjs[pis]["interfaceParam"])) inFlag=true;
                    if(inFlag){
                        newPageDataObj[item]["widgetObjs"].push(widgetObjs[pis]);
                        if (widgetObjs[pis]["widgetType"]=="echarts") newPageDataObj[item]["echartsCode"].push(widgetObjs[pis]["widgetKey"]);
                    }
                }
                if(!inFlag){
                    positions.push(pis);
                    var widgetObjsArr=[widgetObjs[pis]];
                    var echartsCode=[];
                    if (widgetObjs[pis]["widgetType"]=="echarts") echartsCode.push(widgetObjs[pis]["widgetKey"]);
                    newPageDataObj[pis]={
                        "widgetObjs":widgetObjsArr,
                        "interfaceParam":widgetObjs[pis]["interfaceParam"],
                        "echartsCode":echartsCode
                    }
                }
            }
            for (let newPis in newPageDataObj) {
                var echartsCodeInfo={};
                // Modify by zx 2022-10-22
                // for (var i=0;i<newPageDataObj[newPis].echartsCode.length;i++)
                // {
                //     echartsCodeInfo[newPageDataObj[newPis].echartsCode[i]]=newPageDataObj[newPis].echartsCode[i];
                // }
                for (var i=0;i<newPageDataObj[newPis].echartsCode.length;i++)
                {
                    var curCchartsCodes=newPageDataObj[newPis].echartsCode[i].split("^");
                    for(var j=0; j<curCchartsCodes.length; j++)
                    {
                        echartsCodeInfo[curCchartsCodes[j]]=curCchartsCodes[j];
                    }
                }
                // console.log("mmmmmmmmmmmm1",newPageDataObj[newPis],'key',key);
                getInterfaceinfo("",key,"",pageDataObj[key].sourceRefreshTime,newPageDataObj[newPis]["interfaceParam"],refreshPageData,newPageDataObj[newPis].widgetObjs,echartsCodeInfo);
            }
            //参数处理
            //var paramInfo=getSourceDataParam("1",pageDataObj[key].widgetId,"0");
            //pageDataObj[key]["returnParam"]=paramInfo;
            //根据数据源获取数据
	        //modify by lmm 2022-08-31 更改图表代码变量定义方式
            //var echartsCode={};
            //for (var i=0;i<pageDataObj[key].echartsCode.length;i++)
            //{
                // if(echartsCode!="") echartsCode=echartsCode+"^";
                // echartsCode=echartsCode+pageDataObj[key].echartsCode[i];
            //    echartsCode[pageDataObj[key].echartsCode[i]]=pageDataObj[key].echartsCode[i]   //无传递参数，暂写空
            //}
            //Modify by zx 2022-10-10 增加数据源入参处理
            // console.log("b")
            //getInterfaceinfo("",key,"",pageDataObj[key].sourceRefreshTime,pageDataObj[key].widgetObjs[0]["interfaceParam"],refreshPageData,pageDataObj[key].widgetObjs,echartsCode);
            // console.log("c")
        }
        
    }
    
}
/**
 * page内部元素统一刷新数据,供接口定义回调函数
 * @param {Object} interfaceData 统一数据源返回的数据集
 * @param {Array} widgetObjs 界面刷新所需部件信息
 * @returns 无
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function refreshPageData(interfaceData, widgetObjs)
{
    // console.log('widgetObjsssss',widgetObjs,'interfaceDataaaa',interfaceData);
    //const widgetObjs=pageDataObj[key].widgetObjs;
    //数据源刷新数据
    for (const widgetObj of widgetObjs) {
        //刷新调用
        var funStyle=eval(widgetObj.styleFun);
        // console.log('widgetObj',widgetObj,'interfaceData',interfaceData);
        var widgetObjData=interfaceData;
        var dataFunc=widgetObj.dataSourceFun;
        if(widgetObj.widgetType!="echarts"){
            if(dataFunc!="")
            {
                dataFunc=eval(dataFunc);
                dataFunc(widgetObjData,widgetObj);
            }
            else
            {
                if(widgetObj.dataSourceNode!="")
                {
                    // widgetObjData=interfaceData[widgetObj.dataSourceNode];
                    // add myf 2022-10-26
                    if (widgetObj.dataSourceNode.includes('>')) {
                        const nodes = widgetObj.dataSourceNode.split('>');
                        nodes.forEach((node)=>{
                            widgetObjData=widgetObjData[node];
                        });
                    } else {
                        widgetObjData=interfaceData[widgetObj.dataSourceNode];
                    }
                    widgetObjData=(widgetObjData==""||widgetObjData==undefined||widgetObjData==null)?"":widgetObjData;
                    if(widgetObjData=="") widgetObjData=interfaceData[parseInt(widgetObj.dataSourceNode)];
                    widgetObjData=(widgetObjData==""||widgetObjData==undefined||widgetObjData==null)?"":widgetObjData;
                }
                funStyle(widgetObjData,widgetObj);
            }
        }
        else
        {
            if(dataFunc!="")
            {
                dataFunc=eval(dataFunc);
                dataFunc(widgetObjData,widgetObj);
            }
            else
            {
                // add myf 2022-10-26 modify 2022-11-01
                let data = interfaceData;
                if (!data) return;
                if(widgetObj.dataSourceNode!=="" && widgetObj.dataSourceNode!==undefined && widgetObj.dataSourceNode!==null)
                {
                    if (widgetObj.dataSourceNode.includes('>')) {
                        const nodes = widgetObj.dataSourceNode.split('>');
                        nodes.forEach((node)=>{
                            data=data[node];
                        });
                    } else {
                        data=data[widgetObj.dataSourceNode];
                    }
                }
                var chartssetdata={};
                if (widgetObj.widgetKey.includes('^')) {
                    const widgetKeys = widgetObj.widgetKey.split('^');
                    widgetKeys.forEach((widgetKey)=>{
                        chartssetdata[widgetKey]=ChartsSet[widgetKey];
                    });
                } else {
                    chartssetdata[widgetObj.widgetKey]=ChartsSet[widgetObj.widgetKey];
                }
                getInterfaceChartsInfo(chartssetdata,data);
                initChartsDefineByDefine(data,widgetObj);
            }
            
        }
    }
}
/**
 * echarts生成统一回调生成
 * @param {Object} data 统一数据源返回的数据集
 * @param {Array} widgetObjs 界面刷新所需部件信息
 * @returns 无
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function initChartsDefineByDefine(data,widgetObj)
{
    //Modify by zx 2022-10-22 多组图表配置在同一图表中
    var echartsCodes=widgetObj.widgetKey.split("^");
    var echartsId=echartsCodes[0];
    for(var i=0; i<echartsCodes.length; i++)
    {
        EchartsObjMap[echartsCodes[i]]=widgetObj.widgetPanelID+'_echarts_'+echartsId;
    }
    EchartsObj[widgetObj.widgetPanelID+'_echarts_'+echartsId]="";
    EchartsObjOption[widgetObj.widgetPanelID+'_echarts_'+echartsId]="";

    // EchartsObjMap[widgetObj.widgetKey]=widgetObj.widgetPanelID+'_echarts_'+widgetObj.widgetKey;
    // EchartsObj[widgetObj.widgetPanelID+'_echarts_'+widgetObj.widgetKey]="";
    // EchartsObjOption[widgetObj.widgetPanelID+'_echarts_'+widgetObj.widgetKey]="";
    //modify by lmm 2022-09-20
    var parastr=""
    var widgetKey=widgetObj.widgetKey.split("^")
	for (var i=0; i<widgetKey.length; i++)
	{
        if (parastr=="")
        {
            var parastr=ChartsSet[widgetKey[i]]["para"]
        }
        else
        {
            var parastr=parastr+"^"+ChartsSet[widgetKey[i]]["para"]
        }
    }
    // console.log('parastr',parastr,'widgetKey',widgetObj.widgetKey);
    initChartsDefine(widgetObj.widgetKey,parastr);
}
/**
 * page默认生成方法
 * @param {Object} pageData 界面生成所需信息对象
 * @returns {string} pageHtml 界面框架拼接的html字符串
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function createPageStyle(pageData)
{
    var pageHtml = '<div id="page'+pageData.pageRowID+'_'+pageData.pageName+'" class="eq-panel2" style="'+pageData.styleInfo+'"><span></span><span></span><span></span><span></span>'+
            '<div><span class="eq-panel2-title-c eq-panel2-title-c-white" style="display: inline-block;padding:0.05rem 2rem;">'+pageData.pageTitle+'</span></div><div class="eq-panel2-titleborder"></div>'+
            '<div class="eq-panel2-content" id="page'+pageData.pageRowID+'_'+pageData.pageName+'_pagecontent"></div></div>';
    
    return pageHtml;
}
/**
 * page智慧护理所需界面生成方法
 * @param {Object} pageData 界面生成所需信息对象
 * @returns {string} pageHtml 界面框架拼接的html字符串
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function createZHHLPageStyle(pageData)
{
    var titleHtml='<div><div class="dhc-zhhl-webview-title"><span>'+pageData.pageTitle+'</span></div></div>'
    if(pageData.callFun!="")
    {
        titleHtml='<div><div class="dhc-zhhl-webview-title" onClick="'+pageData.callFun+'('+pageData.pageRowID+')"><span>'+pageData.pageTitle+'</span></div></div>'
    }
    var pageHtml = '<div id="page'+pageData.pageRowID+'_'+pageData.pageName+'" style="'+pageData.styleInfo+'">'+
	    titleHtml+'<div id="page'+pageData.pageRowID+'_'+pageData.pageName+'_pagecontent"></div></div>';
    return pageHtml;
}
function createZHHLListPageStyle(pageData)
{
    //Modify by zx 2022-09-02 全局变量大写
    var pageHtml='<div id="page'+pageData.pageRowID+'_'+pageData.pageName+'" class="eq-panel2" style="'+pageData.styleInfo+'">'+
        '<div style="background-image:url('+ImgUrl+'eq-nurse-list-title.png);background-repeat: no-repeat;background-position: 0.5rem center;background-size: 0.9rem 0.8rem;font-size: 0.7rem;">'+
	    '<span style="display: block;color: #49E8EE;font-weight: 700;padding-left: 1.5rem;">'+pageData.pageTitle+'</span></div><div id="page'+pageData.pageRowID+'_'+pageData.pageName+'_pagecontent"></div></div>';
    return pageHtml;
}
/**
 * page四角加粗边框界面生成方法
 * @param {Object} pageData 界面生成所需信息对象
 * @returns {string} pageHtml 界面框架拼接的html字符串
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function createQuadranglePageStyle(pageData)
{
    var pageHtml = '<div id="page'+pageData.pageRowID+'_'+pageData.pageName+'" class="eq-panel2" style="'+pageData.styleInfo+'"><span></span><span></span><span></span><span></span>'+
        '<div id="page'+pageData.pageRowID+'_'+pageData.pageName+'_pagecontent"></div></div>';
    
    return pageHtml;
}
/**
 * page内面板生成入口
 * @param {Object} pageData 面板生成所需信息对象
 * @param {string} pageID 界面id
 * @returns 无
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function createPanelCommon(panelData, pageID)
{
    //var panelRowDate = panelData.rows;
    //根据行列排序后重新组合生成二维数组
    var sameRowPanel = new Array();
    $.each(panelData, function(index, singleRowDate) {
        var rownum = parseInt(singleRowDate.rowNum);
        var colnum = parseInt(singleRowDate.colNum);
        if (!sameRowPanel[rownum-1])
        {
            sameRowPanel[rownum-1]=new Array();
            sameRowPanel[rownum-1][colnum-1]=singleRowDate
        }
        else
        {
            sameRowPanel[rownum-1][colnum-1]=singleRowDate
        }
    });
    //根据二维数据中面板信息生成面板布局
    $.each(sameRowPanel, function(m, rowPanelData){
        var floatFlag="";
        var panelHtml=""
        if (rowPanelData.length>1)
        {
            floatFlag=1;
            panelHtml = '<div style="overflow:hidden;'
        }
        else
        {
            floatFlag=0;
            panelHtml='<div style="';
        }
        panelHtml = panelHtml+' width:100%;'
        if (rowPanelData[0].height!="") panelHtml=panelHtml+'height:'+rowPanelData[0].height+';';
        panelHtml=panelHtml+'">';
        var rowPanelSourceData={};
        $.each(rowPanelData, function(n, colPanelData){
            //自定义样式拼接
            var styleInfo="height:100%;";  //高度在外层div设置
            styleInfo=(floatFlag==0)?styleInfo:styleInfo+"float:left;";
            styleInfo=(colPanelData.width==""||colPanelData.width==undefined||colPanelData.width==null)?styleInfo:styleInfo+"width:"+colPanelData.width+";";
            styleInfo=(colPanelData.padding==""||colPanelData.padding==undefined||colPanelData.padding==null)?styleInfo:styleInfo+"padding:"+colPanelData.padding+";";
            styleInfo=(colPanelData.margin==""||colPanelData.margin==undefined||colPanelData.margin==null)?styleInfo:styleInfo+"margin:"+colPanelData.margin+";";
            styleInfo=(colPanelData.background==""||colPanelData.background==undefined||colPanelData.background==null)?styleInfo:styleInfo+"background:"+colPanelData.background+";";
            styleInfo=(colPanelData.padding==""||colPanelData.padding==undefined||colPanelData.padding==null)?styleInfo:styleInfo+"border:"+colPanelData.border+";";
            styleInfo=(colPanelData.margin==""||colPanelData.margin==undefined||colPanelData.margin==null)?styleInfo:styleInfo+"boder-radius:"+colPanelData.boderRadius+";";
            styleInfo=(colPanelData.background==""||colPanelData.background==undefined||colPanelData.background==null)?styleInfo:styleInfo+"box-shadow:"+colPanelData.boxShadow+";";

            //面板参数打包
            var panelObj={
                "parentID":pageID,
                "panelStyle":styleInfo,
                "panelRowID":+colPanelData.id,
                "panelTitleStyle":colPanelData.titleStyle,
                "panelTitle":colPanelData.title,
                "callFun":colPanelData.callFun,
                "callFunPageid":colPanelData.callFunPageid
            }
            var styleFun = colPanelData.styleFun;
            if((styleFun!="")&&(styleFun!=undefined)&&(styleFun!=null)){
                //回调函数转化
                var func = eval(styleFun)
                panelHtml = panelHtml + func(panelObj)
            }else{
                panelHtml = panelHtml + createPanelDefaultStyle(panelObj);
            }
            rowPanelSourceData[colPanelData.id]=colPanelData.panelWidget;
        });
        
        panelHtml = panelHtml + '</div>';
        $("#"+pageID+"_pagecontent").append(panelHtml);
        //部件生成
        createWidgetCommon(rowPanelSourceData,pageID);
    });
}
/**
 * page内面板生成默认方法
 * @param {Object} pageData 面板生成所需信息对象
 * @returns {string} panelHtml 面板生成所需html拼接字符串
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function createPanelDefaultStyle(panelData)
{
    var titleHtml="",panelHtml="";
    if((panelData.panelTitleStyle!="")&&(panelData.panelTitleStyle!=undefined)&&(panelData.panelTitleStyle!=null)){
        var func = eval(panelData.panelTitleStyle);
        titleHtml = func(panelData);
    }
    if(titleHtml!="")
    {
        panelHtml = '<div style="'+panelData.panelStyle+'">'+titleHtml+'<div id="'+panelData.parentID+'_panel'+panelData.panelRowID+'"></div></div>';
    }
    else
    {
        panelHtml = '<div style="'+panelData.panelStyle+'" id="'+panelData.parentID+'_panel'+panelData.panelRowID+'"></div>';
    }

    return panelHtml;
}

/**
 * page内部件生成入口方法
 * @param {Array} rowPanelSourceData 每一行所有部件信息对象数组
 * @param {string} pageID 界面id
 * @returns 无
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function createWidgetCommon(rowPanelSourceData,pageID)
{
    // modify myf 2022-8-31 表单元素类型数组 2022-09-22 添加'select','mulselect' 2022-10-12 添加radio、checkbox
    const formInputType = ['input','date','time','number','select','mulselect','radio','checkbox'];
    var panelAttachedWidget = new Array();
     //面板生成后加载界面元素
    $.each(rowPanelSourceData, function (key, value){
        var widgetData=value;
        //根据行列排序后重新组合生成二维数组
        var sameRowWidget = new Array();
        //var interfaceDataInfo = new Array();
        $.each(widgetData, function(index, singleRowDate) {
            //Modify by zx 2022-08-02 字段输出改变
            if(singleRowDate.contrast)  //Modify by zx 2022-09-03 后台字段类型改变
            {
                panelAttachedWidget.push(singleRowDate);
            }
            else
            {
                var rownum = parseInt(singleRowDate.rowNum);
                var colnum = parseInt(singleRowDate.colNum);
                if (!sameRowWidget[rownum-1])
                {
                    sameRowWidget[rownum-1]=new Array();
                    sameRowWidget[rownum-1][colnum-1]=singleRowDate
                }
                else
                {
                    sameRowWidget[rownum-1][colnum-1]=singleRowDate
                }
            }
        });
        //根据二维数据中面板信息生成面板布局
        $.each(sameRowWidget, function(i, rowWidgetData){
            var floatFlag="";
            var widgetHtml=""
            var absoluteFlag=0;
            if (rowWidgetData.length>1)
            {
                floatFlag=1;
                widgetHtml = '<div style="overflow:hidden;width:100%;';
            }
            else
            {
                floatFlag=0;
                widgetHtml='<div style="width:100%;';
            }
            var widgetContentHtml="";
            $.each(rowWidgetData, function(j, singleWidgetData){
                // modify myf 2022-8-31 记录表单元素id
                if (formInputType.includes(singleWidgetData.widgetType)) {
                    pageInputArray.push(singleWidgetData.widgetKey);
                    widgetHtml='<div style="width:100%;';
                }
                if (singleWidgetData.position.indexOf("absolute")!=-1) absoluteFlag=1;
                singleWidgetData.formInputType = [...formInputType];
                widgetContentHtml = widgetContentHtml + createSingleWidget(singleWidgetData,panelAttachedWidget,rowWidgetData[0].pagePanelId,floatFlag,pageID,0);
            });
            if(absoluteFlag==1) widgetHtml=widgetHtml+'position:relative;'
            widgetHtml=widgetHtml+'">'
            widgetHtml = widgetHtml + widgetContentHtml + '</div>';
            $("#"+pageID+"_panel"+rowWidgetData[0].pagePanelId).append(widgetHtml);
        });
    });
}

/**
 * 单个部件生成方法
 * @param {Object} singleWidgetData 当前要生成部件信息对象
 * @param {Array} panelAttachedWidget 附属部件信息对象数组
 * @param {string} paneId 所处面板id
 * @param {string} floatFlag 是否浮动
 * @param {string} pageID 界面id
 * @param {string} type 0:部件生成,1:附属部件生成
 * @returns 无
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function createSingleWidget(singleWidgetData,panelAttachedWidget,paneId,floatFlag,pageID,type)
{
    //部件自定义样式拼接
    var widgetStyleInfo="";
    widgetStyleInfo=(floatFlag==0)?widgetStyleInfo:widgetStyleInfo+"float:left;";
    // modify myf 2022-8-31 2022-09-09 处理表单内容样式
    // if (singleWidgetData.formInputType.includes(singleWidgetData.widgetType)) {widgetStyleInfo += 'font-size: 0.7rem;font-weight: 400;color:#fff;display:flex;justify-content:center;align-items:center;';}
    if (singleWidgetData.widgetType==='submit') {widgetStyleInfo += 'width:100%;display:flex;justify-content:center;align-items:center;';}
    widgetStyleInfo=(singleWidgetData.width==""||singleWidgetData.width==undefined||singleWidgetData.width==null)?widgetStyleInfo:widgetStyleInfo+"width:"+singleWidgetData.width+";";
    widgetStyleInfo=(singleWidgetData.height==""||singleWidgetData.height==undefined||singleWidgetData.height==null)?widgetStyleInfo:widgetStyleInfo+"height:"+singleWidgetData.height+";";
    widgetStyleInfo=(singleWidgetData.padding==""||singleWidgetData.padding==undefined||singleWidgetData.padding==null)?widgetStyleInfo:widgetStyleInfo+"padding:"+singleWidgetData.padding+";";
    widgetStyleInfo=(singleWidgetData.margin==""||singleWidgetData.margin==undefined||singleWidgetData.margin==null)?widgetStyleInfo:widgetStyleInfo+"margin:"+singleWidgetData.margin+";";
    widgetStyleInfo=(singleWidgetData.backgroundColor==""||singleWidgetData.backgroundColor==undefined||singleWidgetData.backgroundColor==null)?widgetStyleInfo:widgetStyleInfo+"background:"+singleWidgetData.backgroundColor+";";
    widgetStyleInfo=(singleWidgetData.image==""||singleWidgetData.image==undefined||singleWidgetData.image==null)?widgetStyleInfo:widgetStyleInfo+"background:url("+ImgUrl+singleWidgetData.image+");background-repeat:no-repeat;"; //Modify by zx 2022-09-02 全局变量大写
    widgetStyleInfo=(singleWidgetData.imagePosition==""||singleWidgetData.imagePosition==undefined||singleWidgetData.imagePosition==null)?widgetStyleInfo:widgetStyleInfo+"background-position:"+singleWidgetData.imagePosition+";";
    widgetStyleInfo=(singleWidgetData.imageSize==""||singleWidgetData.imageSize==undefined||singleWidgetData.imageSize==null)?widgetStyleInfo:widgetStyleInfo+"background-size:"+singleWidgetData.imageSize+";";
    widgetStyleInfo=(singleWidgetData.border==""||singleWidgetData.border==undefined||singleWidgetData.border==null)?widgetStyleInfo:widgetStyleInfo+"border:"+singleWidgetData.border+";";
    widgetStyleInfo=(singleWidgetData.borderRadius==""||singleWidgetData.borderRadius==undefined||singleWidgetData.borderRadius==null)?widgetStyleInfo:widgetStyleInfo+"border-radius:"+singleWidgetData.borderRadius+";";
    widgetStyleInfo=(singleWidgetData.shadow==""||singleWidgetData.shadow==undefined||singleWidgetData.shadow==null)?widgetStyleInfo:widgetStyleInfo+"box-shadow:"+singleWidgetData.shadow+";";
    widgetStyleInfo=(singleWidgetData.position==""||singleWidgetData.position==undefined||singleWidgetData.position==null)?widgetStyleInfo:widgetStyleInfo+"position:"+singleWidgetData.position+";";
    
    //描述自定义样式拼接
    var descStyleInfo="";
    // modify myf 2022-8-31 2022-09-09 处理表单内容样式
    // if (singleWidgetData.formInputType.includes(singleWidgetData.widgetType)) {descStyleInfo += 'margin-right:0.4rem;font-size: 0.7rem;font-weight: 400;color:#fff;float:right;';}
    descStyleInfo=(singleWidgetData.descColor==""||singleWidgetData.descColor==undefined||singleWidgetData.descColor==null)?descStyleInfo:descStyleInfo+"color:"+singleWidgetData.descColor+";";
    descStyleInfo=(singleWidgetData.descFontSize==""||singleWidgetData.descFontSize==undefined||singleWidgetData.descFontSize==null)?descStyleInfo:descStyleInfo+"font-size:"+singleWidgetData.descFontSize+";";
    descStyleInfo=(singleWidgetData.descFontFamily==""||singleWidgetData.descFontFamily==undefined||singleWidgetData.descFontFamily==null)?descStyleInfo:descStyleInfo+"font-family:"+singleWidgetData.descFontFamily+";";
    descStyleInfo=(singleWidgetData.descPadding==""||singleWidgetData.descPadding==undefined||singleWidgetData.descPadding==null)?descStyleInfo:descStyleInfo+"padding:"+singleWidgetData.descPadding+";";
    descStyleInfo=(singleWidgetData.descMargin==""||singleWidgetData.descMargin==undefined||singleWidgetData.descMargin==null)?descStyleInfo:descStyleInfo+"margin:"+singleWidgetData.descMargin+";";
    descStyleInfo=(singleWidgetData.descWidth==""||singleWidgetData.descWidth==undefined||singleWidgetData.descWidth==null)?descStyleInfo:descStyleInfo+"width:"+singleWidgetData.descWidth+";";
    descStyleInfo=(singleWidgetData.descHeight==""||singleWidgetData.descHeight==undefined||singleWidgetData.descHeight==null)?descStyleInfo:descStyleInfo+"height:"+singleWidgetData.descHeight+";";
    descStyleInfo=(singleWidgetData.descHeight==""||singleWidgetData.descHeight==undefined||singleWidgetData.descHeight==null)?descStyleInfo:descStyleInfo+"line-height:"+singleWidgetData.descHeight+";";
    descStyleInfo=(singleWidgetData.descFontWeight==""||singleWidgetData.descFontWeight==undefined||singleWidgetData.descFontWeight==null)?descStyleInfo:descStyleInfo+"font-weight:"+singleWidgetData.descFontWeight+";";
    descStyleInfo=(singleWidgetData.descDisplay==""||singleWidgetData.descDisplay==undefined||singleWidgetData.descDisplay==null)?descStyleInfo:descStyleInfo+"display:"+singleWidgetData.descDisplay+";";
    descStyleInfo=(singleWidgetData.descBorder==""||singleWidgetData.descBorder==undefined||singleWidgetData.descBorder==null)?descStyleInfo:descStyleInfo+"border:"+singleWidgetData.descBorder+";";
    descStyleInfo=(singleWidgetData.descBorderRadius==""||singleWidgetData.descBorderRadius==undefined||singleWidgetData.descBorderRadius==null)?descStyleInfo:descStyleInfo+"border-radius:"+singleWidgetData.descBorderRadius+";";
    descStyleInfo=(singleWidgetData.descTextAlign==""||singleWidgetData.descTextAlign==undefined||singleWidgetData.descTextAlign==null)?descStyleInfo:descStyleInfo+"text-align:"+singleWidgetData.descTextAlign+";";
    descStyleInfo=(singleWidgetData.descFloat==""||singleWidgetData.descFloat==undefined||singleWidgetData.descFloat==null)?descStyleInfo:descStyleInfo+"float:"+singleWidgetData.descFloat+";";
    descStyleInfo=(singleWidgetData.descBackground==""||singleWidgetData.descBackground==undefined||singleWidgetData.descBackground==null)?descStyleInfo:descStyleInfo+"background:"+singleWidgetData.descBackground+";";
    
    //值自定义样式拼接
    var valueStyleInfo="";
    // modify myf 2022-10-12 radio、checkbox类型部件value样式打包处理
    if (singleWidgetData.widgetType === "radio" || singleWidgetData.widgetType === "checkbox") {
        valueStyleInfo = checkboxValueStyleHandle(singleWidgetData);
    } else {
        // if (singleWidgetData.formInputType.includes(singleWidgetData.widgetType)) {valueStyleInfo += 'width:80%;height:1.2rem;padding-left:0.5rem;color:#fff;border: 0.05rem solid rgba(77,152,222,0.8);background: rgba(14,53,92,0.4);border-radius: 0.1rem 0.1rem 0.1rem 0.1rem;outline:none;box-sizing:border-box;';}
        valueStyleInfo=(singleWidgetData.valueColor==""||singleWidgetData.valueColor==undefined||singleWidgetData.valueColor==null)?valueStyleInfo:valueStyleInfo+"color:"+singleWidgetData.valueColor+";";
        valueStyleInfo=(singleWidgetData.valueFontSize==""||singleWidgetData.valueFontSize==undefined||singleWidgetData.valueFontSize==null)?valueStyleInfo:valueStyleInfo+"font-size:"+singleWidgetData.valueFontSize+";";
        valueStyleInfo=(singleWidgetData.valueFontFamily==""||singleWidgetData.valueFontFamily==undefined||singleWidgetData.valueFontFamily==null)?valueStyleInfo:valueStyleInfo+"font-family:"+singleWidgetData.valueFontFamily+";";
        valueStyleInfo=(singleWidgetData.valuePadding==""||singleWidgetData.valuePadding==undefined||singleWidgetData.valuePadding==null)?valueStyleInfo:valueStyleInfo+"padding:"+singleWidgetData.valuePadding+";";
        valueStyleInfo=(singleWidgetData.valueMargin==""||singleWidgetData.valueMargin==undefined||singleWidgetData.valueMargin==null)?valueStyleInfo:valueStyleInfo+"margin:"+singleWidgetData.valueMargin+";";
        valueStyleInfo=(singleWidgetData.valueWidth==""||singleWidgetData.valueWidth==undefined||singleWidgetData.valueWidth==null)?valueStyleInfo:valueStyleInfo+"width:"+singleWidgetData.valueWidth+";";
        valueStyleInfo=(singleWidgetData.valueHeight==""||singleWidgetData.valueHeight==undefined||singleWidgetData.valueHeight==null)?valueStyleInfo:valueStyleInfo+"height:"+singleWidgetData.valueHeight+";";
        valueStyleInfo=(singleWidgetData.valueHeight==""||singleWidgetData.valueHeight==undefined||singleWidgetData.valueHeight==null)?valueStyleInfo:valueStyleInfo+"line-height:"+singleWidgetData.valueHeight+";";
        valueStyleInfo=(singleWidgetData.valueFontWeight==""||singleWidgetData.valueFontWeight==undefined||singleWidgetData.valueFontWeight==null)?valueStyleInfo:valueStyleInfo+"font-weight:"+singleWidgetData.valueFontWeight+";";
        valueStyleInfo=(singleWidgetData.valueDisplay==""||singleWidgetData.valueDisplay==undefined||singleWidgetData.valueDisplay==null)?valueStyleInfo:valueStyleInfo+"display:"+singleWidgetData.valueDisplay+";";
        valueStyleInfo=(singleWidgetData.valueBorder==""||singleWidgetData.valueBorder==undefined||singleWidgetData.valueBorder==null)?valueStyleInfo:valueStyleInfo+"border:"+singleWidgetData.valueBorder+";";
        valueStyleInfo=(singleWidgetData.valueBorderRadius==""||singleWidgetData.valueBorderRadius==undefined||singleWidgetData.valueBorderRadius==null)?valueStyleInfo:valueStyleInfo+"border-radius:"+singleWidgetData.valueBorderRadius+";";
        valueStyleInfo=(singleWidgetData.valueTextAlign==""||singleWidgetData.valueTextAlign==undefined||singleWidgetData.valueTextAlign==null)?valueStyleInfo:valueStyleInfo+"text-align:"+singleWidgetData.valueTextAlign+";";
        valueStyleInfo=(singleWidgetData.valueFloat==""||singleWidgetData.valueFloat==undefined||singleWidgetData.valueFloat==null)?valueStyleInfo:valueStyleInfo+"float:"+singleWidgetData.valueFloat+";";
        if(singleWidgetData.valueBackground.indexOf("png")>0)
        {
            valueStyleInfo=valueStyleInfo+"background:url("+ImgUrl+singleWidgetData.valueBackground+");background-repeat:no-repeat;"; //Modify by zx 2022-09-02 全局变量大写
        }
        else
        {
            valueStyleInfo=(singleWidgetData.valueBackground==""||singleWidgetData.valueBackground==undefined||singleWidgetData.valueBackground==null)?valueStyleInfo:valueStyleInfo+"background:"+singleWidgetData.valueBackground+";";
        }
    }
    
    
    //标记自定义样式拼接
    var markStyleInfo="";
    markStyleInfo=(singleWidgetData.markColor==""||singleWidgetData.markColor==undefined||singleWidgetData.markColor==null)?markStyleInfo:markStyleInfo+"color:"+singleWidgetData.markColor+";";
    markStyleInfo=(singleWidgetData.markFontSize==""||singleWidgetData.markFontSize==undefined||singleWidgetData.markFontSize==null)?markStyleInfo:markStyleInfo+"font-size:"+singleWidgetData.markFontSize+";";
    markStyleInfo=(singleWidgetData.markFontFamily==""||singleWidgetData.markFontFamily==undefined||singleWidgetData.markFontFamily==null)?markStyleInfo:markStyleInfo+"font-family:"+singleWidgetData.markFontFamily+";";
    markStyleInfo=(singleWidgetData.markPadding==""||singleWidgetData.markPadding==undefined||singleWidgetData.markPadding==null)?markStyleInfo:markStyleInfo+"padding:"+singleWidgetData.markPadding+";";
    markStyleInfo=(singleWidgetData.markMargin==""||singleWidgetData.markMargin==undefined||singleWidgetData.markMargin==null)?markStyleInfo:markStyleInfo+"margin:"+singleWidgetData.markMargin+";";
    markStyleInfo=(singleWidgetData.markWidth==""||singleWidgetData.markWidth==undefined||singleWidgetData.markWidth==null)?markStyleInfo:markStyleInfo+"width:"+singleWidgetData.markWidth+";";
    markStyleInfo=(singleWidgetData.markHeight==""||singleWidgetData.markHeight==undefined||singleWidgetData.markHeight==null)?markStyleInfo:markStyleInfo+"height:"+singleWidgetData.markHeight+";";
    markStyleInfo=(singleWidgetData.markHeight==""||singleWidgetData.markHeight==undefined||singleWidgetData.markHeight==null)?markStyleInfo:markStyleInfo+"line-height:"+singleWidgetData.markHeight+";";
    markStyleInfo=(singleWidgetData.markFontWeight==""||singleWidgetData.markFontWeight==undefined||singleWidgetData.markFontWeight==null)?markStyleInfo:markStyleInfo+"font-weight:"+singleWidgetData.markFontWeight+";";
    markStyleInfo=(singleWidgetData.markDisplay==""||singleWidgetData.markDisplay==undefined||singleWidgetData.markDisplay==null)?markStyleInfo:markStyleInfo+"display:"+singleWidgetData.markDisplay+";";
    markStyleInfo=(singleWidgetData.markBorder==""||singleWidgetData.markBorder==undefined||singleWidgetData.markBorder==null)?markStyleInfo:markStyleInfo+"border:"+singleWidgetData.markBorder+";";
    markStyleInfo=(singleWidgetData.markBorderRadius==""||singleWidgetData.markBorderRadius==undefined||singleWidgetData.markBorderRadius==null)?markStyleInfo:markStyleInfo+"border-radius:"+singleWidgetData.markBorderRadius+";";
    markStyleInfo=(singleWidgetData.markTextAlign==""||singleWidgetData.markTextAlign==undefined||singleWidgetData.markTextAlign==null)?markStyleInfo:markStyleInfo+"text-align:"+singleWidgetData.markTextAlign+";";
    markStyleInfo=(singleWidgetData.markFloat==""||singleWidgetData.markFloat==undefined||singleWidgetData.markFloat==null)?markStyleInfo:markStyleInfo+"float:"+singleWidgetData.markFloat+";";
    markStyleInfo=(singleWidgetData.markBackground==""||singleWidgetData.markBackground==undefined||singleWidgetData.markBackground==null)?markStyleInfo:markStyleInfo+"background:"+singleWidgetData.markBackground+";";
    
    //Modify by zx 2022-08-09 参数打包处理
    var returnParam=paramPackage(singleWidgetData.dataSourceParam,"0");
    //Modify by zx 2022-10-10 参数打包处理
    var clickParam=paramPackage(singleWidgetData.dataSourceParam,"1");
    //Modify by zx 2022-10-10 参数打包处理
    var interfaceParam=paramPackage(singleWidgetData.dataSourceParam,"2");
    //参数打包
    var widgetObj={
        "widgetPanelID":pageID+"_panel"+paneId,
        "widgetId":singleWidgetData.id,
        "widgetType":singleWidgetData.widgetType,
        "widgetDataSource":singleWidgetData.dataSource,
        "dataSourceNode":singleWidgetData.dataSourceNode,
        "widgetRefreshTime":singleWidgetData.refreshTime,
        "widgetStyle":widgetStyleInfo,
        "descStyle":descStyleInfo,
        "valueStyle":valueStyleInfo,
        "mark":singleWidgetData.mark,
        "markStyle":markStyleInfo,
        "widgetDesc":singleWidgetData.widgetDesc,
        "widgetDescKey":singleWidgetData.widgetDescKey,
        "widgetKey":singleWidgetData.widgetKey,
        "valueParentStyle":(singleWidgetData.valueParentStyle==""||singleWidgetData.valueParentStyle==undefined||singleWidgetData.valueParentStyle==null)?"":singleWidgetData.valueParentStyle.replace("${imgUrl}",ImgUrl),  //Modify by zx 2022-09-02 全局变量大写
        "descParentStyle":(singleWidgetData.descParentStyle==""||singleWidgetData.descParentStyle==undefined||singleWidgetData.descParentStyle==null)?"":singleWidgetData.descParentStyle.replace("${imgUrl}",ImgUrl),  //Modify by zx 2022-09-02 全局变量大写
        "styleFun":singleWidgetData.styleFun,
        "numberPlateLength":singleWidgetData.numberPlateLength,
        "clickCallFun":singleWidgetData.callFun,
        "dataSourceFun":singleWidgetData.dataSourceFun,
        "callFunPageId":singleWidgetData.callFunPageid,
        "contentInOrder":singleWidgetData.contentInOrder,
        "widgetCondition":singleWidgetData.condition,
        "returnParam":returnParam,  //Modify by zx 2022-08-09 增加参数打包处理
        "clickParam":clickParam,   //Modify by zx 2022-10-16 增加参数打包处理
        "interfaceParam":interfaceParam,  //Modify by zx 2022-10-10 增加参数打包处理
        "dataSourceParam":singleWidgetData.dataSourceParam  //Modify by zx 2022-10-19 刷新数据重新获取参数
    }
    var widgetHtml="";
    //处理关联部件
    //Modify by zx 2022-08-02 后台数据打包改动
    if((type==0)&&(singleWidgetData.pcontrast.length>0))
    {
        var divStyle=widgetObj.widgetStyle;
        widgetObj.widgetStyle="";
        widgetHtml=createWidgetByType(singleWidgetData.dataSource,singleWidgetData.refreshTime,widgetObj);
        var contrastInfo=singleWidgetData.pcontrast;
        for (var con=0;con<contrastInfo.length;con++)
        {
            for (var att=0;att<panelAttachedWidget.length;att++)
            {
                var attWidgetHtml="";
                //id一致才处理
                if(contrastInfo[con].contrastWidgetId==panelAttachedWidget[att].id)
                {
                    panelAttachedWidget[att]["formInputType"]=[];  //Modify by zx 2022-09-03 造成‘includes’未定义报错
                    attWidgetHtml=createSingleWidget(panelAttachedWidget[att],panelAttachedWidget,paneId,floatFlag,pageID,1);
                }
                //根据位置拼装
                if(contrastInfo[con].position=="0")
                {
                    widgetHtml=attWidgetHtml+widgetHtml;
                }
                else
                {
                    widgetHtml=widgetHtml+attWidgetHtml;
                }
            }
        }
        widgetHtml = '<div style="'+divStyle+'">'+widgetHtml+'</div>';
    }
    else
    {
        widgetHtml=createWidgetByType(singleWidgetData.dataSource,singleWidgetData.refreshTime,widgetObj);
    }
    return widgetHtml;
}
/**
 * 返回page部件生成所需html拼接字符串
 * @param {string} dataSource 数据源
 * @param {string} refrashTime 刷新时长
 * @param {Object} widgetObj 生成部件所需信息对象
 * @returns {string} widgetByTypeHtml 部件生成所需html拼接字符串
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function createWidgetByType(dataSource,refrashTime,widgetObj)
{
    var widgetByTypeHtml="";
    var styleFun=widgetObj.styleFun;
    switch (widgetObj.widgetType)
    {
        case "echarts":
            //图表
            //Modify by zx 2022-10-22
            var echartsId=widgetObj.widgetKey.split("^")[0];
            widgetByTypeHtml = '<div style="'+widgetObj.widgetStyle+'" ><div style="width:100%;height:100%;" id="'+widgetObj.widgetPanelID+'_echarts_'+echartsId+'" class="eq-echarts-define"></div></div>';  //Modify by zx 2022-08-30 增加样式 用于识别样式窗口缩放时自适应
            sourceDataInsert(dataSource,refrashTime,widgetObj);
        break;
        case "numberplate":
            //号码牌
        break;
        case "list":
            //列表
            widgetByTypeHtml = createWidgetList(dataSource,refrashTime,widgetObj);
        break;
        case "bulk":
            //块状
        break;
        case "timeline":
            //时间轴
        break;
        case "text":
            //文本
            if((styleFun!="")&&(styleFun!=undefined)&&(styleFun!=null)){
                //回调函数转化
                var func = eval(styleFun)
                widgetByTypeHtml = func("",widgetObj);
            }else{
                widgetByTypeHtml = createWidgetDefaultStyle("",widgetObj);
            }
            sourceDataInsert(dataSource,refrashTime,widgetObj);
        break;
        // modify myf 2022-08-17 添加部件类型input
        case "input":
            // 输入框
            if((styleFun!="")&&(styleFun!=undefined)&&(styleFun!=null)){
                //回调函数转化
                var func = eval(styleFun)
                widgetByTypeHtml = func("",widgetObj);
            }else{
                widgetByTypeHtml = createWidgetInputStyle(widgetObj,"text");
            }
            break;
        // modify myf 2022-08-31 添加部件类型number\date\time
        case "number":
            // 数字输入框
            if((styleFun!="")&&(styleFun!=undefined)&&(styleFun!=null)){
                //回调函数转化
                var func = eval(styleFun)
                widgetByTypeHtml = func("",widgetObj);
            }else{
                widgetByTypeHtml = createWidgetInputStyle(widgetObj,"number");
            }
            break;
        case "date":
            // 日期输入框
            if((styleFun!="")&&(styleFun!=undefined)&&(styleFun!=null)){
                //回调函数转化
                var func = eval(styleFun)
                widgetByTypeHtml = func("",widgetObj);
            }else{
                widgetByTypeHtml = createWidgetInputStyle(widgetObj,"date");
            }
            break;
        case "time":
            // 时间输入框
            if((styleFun!="")&&(styleFun!=undefined)&&(styleFun!=null)){
                //回调函数转化
                var func = eval(styleFun)
                widgetByTypeHtml = func("",widgetObj);
            }else{
                widgetByTypeHtml = createWidgetInputStyle(widgetObj,"time");
            }
            break;
        // modify myf 2022-09-09 添加部件类型select 2022-09-22 mulselect
        case "select": case "mulselect":
            widgetByTypeHtml = createWidgetSelectStyle("",widgetObj,widgetObj.widgetType);
            break;
        // modify myf 2022-10-12 添加部件类型radio、checkbox 2022-10-12
        case "radio": case "checkbox":
            widgetByTypeHtml = createWidgetCheckboxStyle("",widgetObj,widgetObj.widgetType);
            break;
        // modify myf 2022-08-23 添加部件类型submit
        case "submit":
            // 获取所有input等表单元素的value

            if((styleFun!="")&&(styleFun!=undefined)&&(styleFun!=null)){
                //回调函数转化
                var func = eval(styleFun)
                widgetByTypeHtml = func("",widgetObj);
            }else{
                widgetByTypeHtml = createWidgetSubmit(widgetObj);
            }
            break;
        default:
            widgetByTypeHtml='<div id="defaultwidget'+widgetObj.widgetId+'"></div>'
            sourceDataInsert(dataSource,refrashTime,widgetObj);
        break;
    }
    return widgetByTypeHtml;
}
/**
 * 部件生成默认方法
 * @param {string} interfaceData 接口返回显示数据
 * @param {Object} widgetObj 生成部件所需信息对象
 * @returns {string} widgetHtml 部件生成所需html拼接字符串
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function createWidgetDefaultStyle(interfaceData, widgetObj)
{
    var widgetHtml = '<div style="'+widgetObj.widgetStyle+'"><span style="'+widgetObj.descStyle+'" id="'+widgetObj.widgetDescKey+'"';
    if(widgetObj.callFunPageId!="")
    {
        widgetHtml = widgetHtml + ' onclick="defaultOnClick(&quot;'+widgetObj.callFunPageId+'&quot;)"';
    }
    else if(widgetObj.clickCallFun!="")
    {
        widgetHtml = widgetHtml + ' onclick="'+widgetObj.clickCallFun+'(this)"';
    }
    widgetHtml = widgetHtml + '>'+widgetObj.widgetDesc+'</span><span style="'+widgetObj.valueStyle+'">'+widgetObj.widgetKey+'</span></div>';
    return widgetHtml;
    
}
/**
 * 部件生成选择器方法
 * @param {string} interfaceData 接口返回显示数据
 * @param {Object} widgetObj 生成部件所需信息对象
 * @param {Object} widgetType 生成部件类型 2022-09-22
 * @returns {string} widgetHtml 部件生成所需html拼接字符串
 * @author myf 2022-09-01
 */
// 09-02
function createWidgetSelectStyle(interfaceData, widgetObj, widgetType)
{
    if (!interfaceData) {
        interfaceData = getInterfaceinfo("",widgetObj.widgetDataSource,"","",widgetObj.interfaceParam,"","","");  //Modify by zx 2022-10-18参数处理
    }
    // modify myf 2022-10-12 处理对象数组
    if (!Array.isArray(interfaceData)) {
        interfaceData = Object.values(interfaceData);
    }
    // modify myf 2022-09-22 多选处理
    const isMul = (widgetType === 'mulselect');
    const sourceNodes = widgetObj.dataSourceNode.split('^'); // 'valueDesc^valueKey'
    const descParentStyle = widgetObj.descParentStyle || "width:30%;";
    const valueParentStyle = widgetObj.valueParentStyle || "width:70%;";
    var widgetHtml = '<div style="'+widgetObj.widgetStyle+'" class="page-set-form-desc-panel"><div style="'+descParentStyle+'"><lable style="'+widgetObj.descStyle+'" class="page-set-form-desc-label" id="'+widgetObj.widgetDescKey+'"';
    if(widgetObj.callFunPageId!="")
    {
        widgetHtml = widgetHtml + ' onclick="defaultOnClick(&quot;'+widgetObj.callFunPageId+'&quot;)"';
    }
    else if(widgetObj.clickCallFun!="")
    { 
        widgetHtml = widgetHtml + ' onclick="'+widgetObj.clickCallFun+'(this)"';
    }
    widgetHtml = widgetHtml + '>'+widgetObj.widgetDesc+' </lable></div><div style="'+valueParentStyle+'">';
    //Modify by zx 2022-10-16 增加参数处理;
    widgetHtml = widgetHtml + createNormalOptions("",widgetObj.widgetKey,interfaceData,sourceNodes[0],sourceNodes[1],isMul,widgetObj.valueStyle,widgetObj.clickCallFun,widgetObj.mark) +'</div></div>';
    
    return widgetHtml;
}
/**
 * 部件生成单选框、复选框方法
 * @param {string} interfaceData 接口返回显示数据
 * @param {Object} widgetObj 生成部件所需信息对象
 * @param {Object} widgetType 生成部件类型
 * @returns {string} widgetHtml 部件生成所需html拼接字符串
 * @author myf 2022-10-12
 */
function createWidgetCheckboxStyle(interfaceData, widgetObj, widgetType)
{
    if (!interfaceData) {
        interfaceData = getInterfaceinfo("",widgetObj.widgetDataSource,"","","","","","");
    }
    if (!Array.isArray(interfaceData)) {
        interfaceData = Object.values(interfaceData);
    }
    const isMul = !(widgetType === 'checkbox');
    const sourceNodes = widgetObj.dataSourceNode.split('^'); // 'valueDesc^valueKey'
    const descParentStyle = widgetObj.descParentStyle || "width:30%;";
    const valueParentStyle = widgetObj.valueParentStyle || "width:70%;display:flex;flex-wrap:wrap;";

    var widgetHtml = '<div style="'+widgetObj.widgetStyle+'" class="page-set-form-desc-panel"><div style="'+descParentStyle+'"><lable style="'+widgetObj.descStyle+'" class="page-set-form-desc-label" id="'+widgetObj.widgetDescKey+'"';
    if(widgetObj.callFunPageId!="")
    {
        widgetHtml = widgetHtml + ' onclick="defaultOnClick(&quot;'+widgetObj.callFunPageId+'&quot;)"';
    }
    let classes = ["",""];
    if (widgetObj.valueStyle!="") {
        const styles = widgetObj.valueStyle.split('^'); // unchecked^checked checked样式是附加，不是替换unchecked 
        const styleUnchecked = ".page-set-checkbox-uncheck" + widgetObj.widgetKey + "{" + styles[0] + "}";
        const styleChecked = ".page-set-checkbox-check" + widgetObj.widgetKey + "{" + styles[1] + "}";
        const styleEle = document.createElement('style');
        styleEle.tyle = "text/css";
        styleEle.innerHTML = styleUnchecked + styleChecked;
        document.getElementsByTagName('HEAD').item(0).appendChild(styleEle);
        classes = ["page-set-checkbox-uncheck" + widgetObj.widgetKey ,"page-set-checkbox-check" + widgetObj.widgetKey ];
    }
    const checkboxContent = createNormalCheckbox("",widgetObj.widgetKey,interfaceData,sourceNodes[0],sourceNodes[1],classes[0],classes[1],isMul,widgetObj.clickCallFun);
    widgetHtml = widgetHtml + '>'+widgetObj.widgetDesc+' </lable></div><div style="'+valueParentStyle+'">';
    widgetHtml = widgetHtml + checkboxContent +'</div></div>';
    
    return widgetHtml;
}
/**
 * 提交点击事件处理
 * @param {Object} btn 提交按钮 （自动传入）
 * @param {String} func 点击事件名
 * @returns 无 自定义
 * @author myf 2022-09-22 2022-10-12
 */
function submitBaseClick (btn, func='') {
    const inputs = JSON.parse($(btn).attr('itemData')); // 一、获取表单元素id数组

    const res = inputs.map((input)=>{ // 二、遍历数组取值
        return {id:input,desc:$('#'+input).attr('valueDesc') || $('#'+input).val(),value:$('#'+input).attr('valueKey') || $('#'+input).val()};
    });
    if (func) {
        const clickFun = eval(func);
        clickFun(res);
    }
}
function submitTestClick (data) {
    console.log('提交测试',data);
}
/**
 * 部件生成输入框方法
 * @param {Object} widgetObj 生成部件所需信息对象
 * @returns {string} widgetHtml 部件生成所需html拼接字符串
 * @author myf 2022-08-17
 */
function createWidgetInputStyle(widgetObj,type)
{
    const descParentStyle = widgetObj.descParentStyle || "width:30%;";
    const valueParentStyle = widgetObj.valueParentStyle || "width:70%;";
    var widgetHtml = '<div style="'+widgetObj.widgetStyle+'" class="page-set-form-desc-panel"><div style="'+descParentStyle+'"><lable style="'+widgetObj.descStyle+'" class="page-set-form-desc-label" id="'+widgetObj.widgetDescKey+'"';
    if(widgetObj.callFunPageId!="")
    {
        widgetHtml = widgetHtml + ' onclick="defaultOnClick(&quot;'+widgetObj.callFunPageId+'&quot;)"';
    }
    else if(widgetObj.clickCallFun!="")
    { 
        widgetHtml = widgetHtml + ' onclick="'+widgetObj.clickCallFun+'(this)"';
    }
    // modify myf 2022-08-31 更多表单元素
    switch(type) {
        //Modify by zx 2022-10-18 通过mark增加默认值
        default: widgetHtml = widgetHtml + '>'+widgetObj.widgetDesc+' </lable></div><div style="'+valueParentStyle+'"><input id="'+widgetObj.widgetKey+'" style="'+widgetObj.valueStyle+'" class="page-set-form-default-input" type="'+type+'" placeholder="请输入" value="'+widgetObj.mark+'"/></div></div>';break;
        case 'date': widgetHtml = widgetHtml + '>'+widgetObj.widgetDesc+' </lable></div><div style="'+valueParentStyle+'"><input id="'+widgetObj.widgetKey+'" style="'+widgetObj.valueStyle+'" class="page-set-form-date-input" type="date" placeholder="请选择日期" oninput="dateChange(this)" /></div></div>';break;
        case 'time': widgetHtml = widgetHtml + '>'+widgetObj.widgetDesc+' </lable></div><div style="'+valueParentStyle+'"><input id="'+widgetObj.widgetKey+'" style="'+widgetObj.valueStyle+'" class="page-set-form-date-input" type="time" placeholder="请选择时间" oninput="dateChange(this)" /></div></div>';break;
    }
    return widgetHtml;
     
}

function dateChange (input) {
    let {value:value} = input;
    if (value.length > 0) {
        input.classList.add("page-set-form-date-input-selected");
    } else {
        input.classList.remove("page-set-form-date-input-selected");
    }
}
/**
 * 部件生成按钮（表单）方法
 * @param {Object} widgetObj 生成部件所需信息对象
 * @returns {string} widgetHtml 部件生成所需html拼接字符串
 * @author myf 2022-08-23
 */
function createWidgetSubmit(widgetObj)
{
    if (!widgetObj.descStyle) {
        widgetObj.descStyle = 'width:3rem;height:1.3rem;color:#fff;border: none;border-radius: 0.15rem 0.15rem 0.15rem 0.15rem;background: #217ED6;outline:none;cursor:pointer';
    }
    var widgetHtml = `<div style='`+widgetObj.widgetStyle+`'><button style='`+widgetObj.descStyle+`' id='`+widgetObj.widgetKey+`' itemData='`+JSON.stringify(pageInputArray).replace(new RegExp(/( )/g),"")+`'`;
    if(widgetObj.clickCallFun!="")
    {
        widgetHtml = widgetHtml + ' onclick="submitBaseClick(this,'+widgetObj.clickCallFun+')"';
    } else {
        widgetHtml = widgetHtml + ' onclick="submitBaseClick(this)"';
    }
    widgetHtml = widgetHtml + '>'+widgetObj.widgetDesc+' </button></div>';
    return widgetHtml;
}
function defaultOnClick(id)
{
    alert(id)
}
/**
 * 列表生成方法
 * @param {string} dataSource 数据源
 * @param {string} refrashTime 刷新时长
 * @param {Object} widgetObj 生成部件所需信息对象
 * @returns {string} listHtml 部件列表所需html拼接字符串
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function createWidgetList(dataSource,refrashTime,widgetObj)
{
    var widgetListData;
    $.ajax({
		type: "post",
        url: dtvpApiServ+"/page/api/getPanelList",  //Modify by zx 2022-08-02 请求地址修改
        data: JSON.stringify({hospitalId:"",panelWidgetId:widgetObj.widgetId,panelListId:""}),
        contentType: "application/json;charset=UTF-8",
        async:false,
		dataType: "json", // 返回的数据类型 json
		success: function (listData) {
            if(listData.success){
                //获取界面样式代码
                widgetListData=listData.data[0];
            }else{
                $.alert({title:'提示',content:listData.msg ,confirmText:'确定'});
            }
        },
        error:function(xhr,status,error){
            $.alert({title:'提示',content:xhr ,confirmText:'确定'});
        }
	});
    //列表样式处理
    var listStyleInfo=""
    listStyleInfo=(widgetListData.listFontSize==""||widgetListData.listFontSize==undefined||widgetListData.listFontSize==null)?listStyleInfo:listStyleInfo+"font-size:"+widgetListData.listFontSize+";";
    listStyleInfo=(widgetListData.listFontFamily==""||widgetListData.listFontFamily==undefined||widgetListData.listFontFamily==null)?listStyleInfo:listStyleInfo+"font-family:"+widgetListData.listFontFamily+";";
    listStyleInfo=(widgetListData.height==""||widgetListData.height==undefined||widgetListData.height==null)?listStyleInfo:listStyleInfo+"height:"+widgetListData.height+";";
    listStyleInfo=(widgetListData.width==""||widgetListData.width==undefined||widgetListData.width==null)?listStyleInfo:listStyleInfo+"width:"+widgetListData.width+";";
    listStyleInfo=(widgetListData.padding==""||widgetListData.padding==undefined||widgetListData.padding==null)?listStyleInfo:listStyleInfo+"padding:"+widgetListData.padding+";";
    listStyleInfo=(widgetListData.margin==""||widgetListData.margin==undefined||widgetListData.margin==null)?listStyleInfo:listStyleInfo+"margin:"+widgetListData.margin+";";
    listStyleInfo=(widgetListData.border==""||widgetListData.border==undefined||widgetListData.border==null)?listStyleInfo:listStyleInfo+"border:"+widgetListData.border+";";
    listStyleInfo=(widgetListData.shadow==""||widgetListData.shadow==undefined||widgetListData.shadow==null)?listStyleInfo:listStyleInfo+"box-shadow:"+widgetListData.shadow+";";
    
    //标题行样式处理
    var headStyleInfo ="";
    headStyleInfo=(widgetListData.headColor==""||widgetListData.headColor==undefined||widgetListData.headColor==null)?headStyleInfo:headStyleInfo+"color:"+widgetListData.headColor+";";
    headStyleInfo=(widgetListData.headFontSize==""||widgetListData.headFontSize==undefined||widgetListData.headFontSize==null)?headStyleInfo:headStyleInfo+"font-size:"+widgetListData.headFontSize+";";
    headStyleInfo=(widgetListData.headFontWeight==""||widgetListData.headFontWeight==undefined||widgetListData.headFontWeight==null)?headStyleInfo:headStyleInfo+"font-weight:"+widgetListData.headFontWeight+";";
    headStyleInfo=(widgetListData.headBackground==""||widgetListData.headBackground==undefined||widgetListData.headBackground==null)?headStyleInfo:headStyleInfo+"background:"+widgetListData.headBackground+";";
    headStyleInfo=(widgetListData.headHeight==""||widgetListData.headHeight==undefined||widgetListData.headHeight==null)?headStyleInfo:headStyleInfo+"height:"+widgetListData.headHeight+";";
    headStyleInfo=(widgetListData.headOtherStyle==""||widgetListData.headOtherStyle==undefined||widgetListData.headOtherStyle==null)?headStyleInfo:headStyleInfo+widgetListData.headOtherStyle+";";

    //奇数行样式处理
    var oddStyleInfo ="";
    oddStyleInfo=(widgetListData.listHeight==""||widgetListData.listHeight==undefined||widgetListData.listHeight==null)?oddStyleInfo:oddStyleInfo+"line-height:"+widgetListData.listHeight+";";
    oddStyleInfo=(widgetListData.listHeight==""||widgetListData.listHeight==undefined||widgetListData.listHeight==null)?oddStyleInfo:oddStyleInfo+"height:"+widgetListData.listHeight+";";
    oddStyleInfo=(widgetListData.listOddColor==""||widgetListData.listOddColor==undefined||widgetListData.listOddColor==null)?oddStyleInfo:oddStyleInfo+"color:"+widgetListData.listOddColor+";";
    oddStyleInfo=(widgetListData.listOddBackground==""||widgetListData.listOddBackground==undefined||widgetListData.listOddBackground==null)?oddStyleInfo:oddStyleInfo+"background-color:"+widgetListData.listOddBackground+";";
    oddStyleInfo=(widgetListData.listOddOtherStyle==""||widgetListData.listOddOtherStyle==undefined||widgetListData.listOddOtherStyle==null)?oddStyleInfo:oddStyleInfo+widgetListData.listOddOtherStyle+";";

    //偶数行样式处理
    var evenStyleInfo ="";
    evenStyleInfo=(widgetListData.listHeight==""||widgetListData.listHeight==undefined||widgetListData.listHeight==null)?evenStyleInfo:evenStyleInfo+"line-height:"+widgetListData.listHeight+";";
    evenStyleInfo=(widgetListData.listHeight==""||widgetListData.listHeight==undefined||widgetListData.listHeight==null)?evenStyleInfo:evenStyleInfo+"height:"+widgetListData.listHeight+";";
    evenStyleInfo=(widgetListData.listEvenColor==""||widgetListData.listEvenColor==undefined||widgetListData.listEvenColor==null)?evenStyleInfo:evenStyleInfo+"color:"+widgetListData.listEvenColor+";";
    evenStyleInfo=(widgetListData.listEvenBackground==""||widgetListData.listEvenBackground==undefined||widgetListData.listEvenBackground==null)?evenStyleInfo:evenStyleInfo+"background-color:"+widgetListData.listEvenBackground+";";
    evenStyleInfo=(widgetListData.listOddOtherStyle==""||widgetListData.listOddOtherStyle==undefined||widgetListData.listOddOtherStyle==null)?evenStyleInfo:evenStyleInfo+widgetListData.listEvenOtherStyle+";";

    var listItemInfo=widgetListData.item;
    var itemStyleArr = new Array();
    for(var itemNum=0; itemNum<listItemInfo.length; itemNum++)
    {
        var arrIndex = parseInt(listItemInfo[itemNum].itemSort);
        var singleItemStyle="";
        singleItemStyle=(listItemInfo[itemNum].width==""||listItemInfo[itemNum].width==undefined||listItemInfo[itemNum].width==null)?singleItemStyle:singleItemStyle+"width:"+listItemInfo[itemNum].width+";";
        singleItemStyle=(widgetListData.listHeight==""||widgetListData.listHeight==undefined||widgetListData.listHeight==null)?singleItemStyle:singleItemStyle+"line-height:"+widgetListData.listHeight+";";
        singleItemStyle=(listItemInfo[itemNum].hidden==""||listItemInfo[itemNum].hidden==undefined||listItemInfo[itemNum].hidden==null)?singleItemStyle:singleItemStyle+"display:"+listItemInfo[itemNum].hidden+";";
        singleItemStyle=(listItemInfo[itemNum].fontColor==""||listItemInfo[itemNum].fontColor==undefined||listItemInfo[itemNum].fontColor==null)?singleItemStyle:singleItemStyle+"color:"+listItemInfo[itemNum].fontColor+";";
        singleItemStyle=(listItemInfo[itemNum].fontSize==""||listItemInfo[itemNum].fontSize==undefined||listItemInfo[itemNum].fontSize==null)?singleItemStyle:singleItemStyle+"font-size:"+listItemInfo[itemNum].fontSize+";";
        singleItemStyle=(listItemInfo[itemNum].margin==""||listItemInfo[itemNum].margin==undefined||listItemInfo[itemNum].margin==null)?singleItemStyle:singleItemStyle+"margin:"+listItemInfo[itemNum].margin+";";
        singleItemStyle=(listItemInfo[itemNum].padding==""||listItemInfo[itemNum].padding==undefined||listItemInfo[itemNum].padding==null)?singleItemStyle:singleItemStyle+"padding:"+listItemInfo[itemNum].padding+";";
        singleItemStyle=(listItemInfo[itemNum].fontWeight==""||listItemInfo[itemNum].fontWeight==undefined||listItemInfo[itemNum].fontWeight==null)?singleItemStyle:singleItemStyle+"font-weight:"+listItemInfo[itemNum].fontWeight+";";
        singleItemStyle=(listItemInfo[itemNum].textAlign==""||listItemInfo[itemNum].textAlign==undefined||listItemInfo[itemNum].textAlign==null)?singleItemStyle:singleItemStyle+"text-align:"+listItemInfo[itemNum].textAlign+";";
        singleItemStyle=(listItemInfo[itemNum].background==""||listItemInfo[itemNum].background==undefined||listItemInfo[itemNum].background==null)?singleItemStyle:singleItemStyle+"background-color:"+listItemInfo[itemNum].background+";";
        var itemInfoOjb={
            "styles":singleItemStyle,
            "listTitle":listItemInfo[itemNum].listTitle,
            "key":listItemInfo[itemNum].listKey,
            "clickFun":listItemInfo[itemNum].itemCallFun
        }
        itemStyleArr[arrIndex-1]=itemInfoOjb;
    }
    
    //参数打包
    var listItemObj={
        "id":widgetListData.id,
        "widgetPanelID":widgetObj.widgetPanelID,
        "widgetId":widgetObj.widgetId,
        "styleFun":widgetListData.listStyleFun,
        "dataSourceNode":widgetObj.dataSourceNode,
        "widgetKey":widgetObj.widgetKey,
        "widgetStyle":widgetObj.widgetStyle,
        "itemStyles":itemStyleArr,
        "headStyleFun":widgetListData.headStyleFun,
        "headStyle":headStyleInfo,
        "listStyle":listStyleInfo,
        "oddStyleInfo":oddStyleInfo,
        "evenStyleInfo":evenStyleInfo,
        "widgetDataSource":widgetObj.widgetDataSource,
        "widgetRefreshTime":widgetObj.widgetRefreshTime,
        "headViewFlag":widgetListData.headViewFlag,
        "listDateNode":widgetListData.totalValue,
        "clickFun":widgetListData.listCallFun,
        "dataSourceFun":widgetObj.dataSourceFun,
        "widgetCondition":widgetObj.widgetCondition,
        "returnParam":widgetObj.returnParam,  //Modify by zx 2022-08-09 增加参数打包处理
        "clickParam":widgetObj.clickParam,  //Modify by zx 2022-10-16 增加参数打包处理
        "interfaceParam":widgetObj.interfaceParam,  //Modify by zx 2022-10-10 增加参数打包处理
        "dataSourceParam":widgetObj.dataSourceParam  //Modify by zx 2022-10-19 刷新数据重新获取参数
    }
    sourceDataInsert(dataSource,refrashTime,listItemObj);
    var listHtml = "";
    listHtml = style_table_base("", listItemObj)
    if((widgetListData.listStyleFun!="")&&(widgetListData.listStyleFun!=undefined)&&(widgetListData.listStyleFun!=null)){
        var func = eval(widgetListData.listStyleFun);
        listHtml = func("", listItemObj);
    }else{
        return;
    }
    var titleHtml="";
    //列表标题样式
    if(widgetListData.title!="")
    {
        var titleWidgetObj={
            "widgetPanelID":widgetObj.widgetPanelID,
            "widgetType":"text",
            "widgetDataSource":"",
            "widgetRefreshTime":"",
            "widgetStyle":widgetObj.markStyle,
            "descStyle":widgetObj.descStyle,
            "valueStyle":widgetObj.valueStyle,
            "markStyle":widgetObj.markStyle,
            "widgetDesc":widgetListData.title,
            "widgetDescKey":"",
            "widgetKey":widgetObj.widgetKey,
            "valueParentStyle":"",
            "createType":0
        }
        var styleFun=widgetListData.headStyleFun;
        //标题生成
        if((styleFun!="")&&(styleFun!=undefined)&&(styleFun!=null)){
            //回调函数转化
            var func = eval(styleFun);
            titleHtml = func("", titleWidgetObj);
        }else{
            //titleHtml = createWidgetDefaultStyle("",titleWidgetObj);
        }
    }
    return titleHtml + listHtml;
}

/**
 * 智慧护理面板标题生成
 * @param {Object} panelData 面板信息对象
 * @returns {string} titleHtml 标题html字符串信息
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function createZHHLPanelTitle(panelData)
{
    var string=panelData.panelTitle.toString(); //部分int需要转为string
     var len = 0;  //字节数作为控制参数
     for(var i = 0;i < string.length; i++){
        if(string.charCodeAt(i) > 255) //如果是汉字，则字符串长度加2
        {
        	len+=2;
        }
        else  //数字或字母长度加1
        {
        	len++;
        }
     }
    var widthValue=len*0.3+4.2;
    var titleHtml = '<div class="dhc-zhhl-panel-title-point"';
    if(panelData.callFun!="")
    {
        titleHtml = titleHtml + ' onclick="'+panelData.callFun+'()"';
    }
    titleHtml=titleHtml+'><div class="dhc-zhhl-panel-title-left"></div><div class="dhc-zhhl-panel-title-desc">'+panelData.panelTitle+'</div>'+
            '<div class="dhc-zhhl-panel-title-right" style="width: -moz-calc(100% - '+widthValue+'rem);width: -webkit-calc(100% - '+widthValue+'rem);width: calc(100% - '+widthValue+'rem);left:'+widthValue+'rem;"></div></div>';
        
    return titleHtml;
}
/**
 * 设备管理面板标题生成
 * @param {Object} panelData 面板信息对象
 * @returns {string} titleHtml 标题html字符串信息
 * @author 邹旋 2022-08-01
 * @checkinfo zx 2022-08-02
 */
function createPanelTitle(panelData)
{
    var string=panelData.panelTitle.toString(); //部分int需要转为string
     var len = 0;  //字节数作为控制参数
     for(var i = 0;i < string.length; i++){
        if(string.charCodeAt(i) > 255) //如果是汉字，则字符串长度加2
        {
        	len+=2;
        }
        else  //数字或字母长度加1
        {
        	len++;
        }
     }
    var widthValue=len*0.5+2.8;
    var titleHtml = '<div class="dhc-panel-title-point"';
    if(panelData.callFun!="")
    {
        titleHtml = titleHtml + ' onclick="'+panelData.callFun+'(&quot;'+panelData.callFunPageid+'&quot;)"';
    }
    titleHtml=titleHtml+'><div class="dhc-panel-title-left"></div><div class="dhc-panel-title-desc">'+panelData.panelTitle+'</div>'+
            '<div class="dhc-panel-title-right" style="width: -moz-calc(100% - '+widthValue+'rem);width: -webkit-calc(100% - '+widthValue+'rem);width: calc(100% - '+widthValue+'rem);left:'+widthValue+'rem;"></div></div>';
        
    return titleHtml;
}


/**
 * 列表元素生成方法
 * @param {string} interfaceData 接口返回显示数据
 * @param {Object} listItemObj 生成列表元素所需信息对象
 * @returns {string} listHtml 部件列表元素所需html字符串信息
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function style_table_base(interfaceData, listItemObj)
{
    // modify myf 2022-08-22 避免空数组等情况被隐式转换，导致查询结果为空时列表依然显示上次结果不变
    if(interfaceData==="")
    {
        var tableHeadHtml="";
        if(listItemObj.headViewFlag=="Y")
        {
            var liHtml='<li>'
            for(var itemNum=0; itemNum<listItemObj.itemStyles.length; itemNum++)
            {
                var itemInfo=listItemObj.itemStyles[itemNum];
                liHtml = liHtml+'<span style="display:inline-block;text-overflow: ellipsis;white-space: nowrap;'+itemInfo.styles+listItemObj.headStyle+'">'+itemInfo.listTitle+'</span>';
            }
            liHtml = liHtml+'</li>'

            tableHeadHtml='<div style="overflow:auto;margin-top:0.5rem;"><ul style="list-style-type:none;overflow:hidden;padding:0;margin:0;'+ listItemObj.listStyle+
                '" id="'+listItemObj.widgetPanelID+'_ul'+listItemObj.id+'_head">'+liHtml+'</ul></div>';
        }
        var listHtml=tableHeadHtml+'<div style="overflow:auto;'+listItemObj.widgetStyle+'" class="eq-scrollbar-hidden"><ul style="list-style-type:none;overflow:hidden;padding:0;margin:0;'+listItemObj.listStyle+'" id="'+listItemObj.widgetPanelID+'_ul'+listItemObj.id+'"></ul></div>';

        return listHtml;
    }
    else
    {
        //列表刷新
        //刷新时无数据直接退出
        //先清空界面数据
        if(listItemObj.listDateNode!="") interfaceData=interfaceData[listItemObj.listDateNode];
        //Modify by zx 2022-10-18 非数组改为数组
        $("#"+listItemObj.widgetPanelID+"_ul"+listItemObj.id).empty();
        var liHtml="";
        $.each(interfaceData, function(index, itemData){
            if((index%2)===0){//判定条件余数为0时为偶数
                liHtml = liHtml+'<li style="'+listItemObj.evenStyleInfo+'" index="'+index+'"'
            }else{
                liHtml = liHtml+'<li style="'+listItemObj.oddStyleInfo+'" index="'+index+'"'
            }
            if(listItemObj.clickFun!="")
            {
                liHtml = liHtml+' onclick="'+listItemObj.clickFun+'(this)" itemData='+JSON.stringify(itemData).replace(new RegExp(/( )/g),"")+'>'
            }
            else
            {
                liHtml = liHtml+'>'
            }
            for(var itemNum=0; itemNum<listItemObj.itemStyles.length; itemNum++)
            {
                var itemInfo=listItemObj.itemStyles[itemNum];
                var value=itemData[itemInfo.key];
                value=(value==""||value==undefined||value==null)?"":value;
                for (const condition of listItemObj.widgetCondition)
                {
                    if((condition.limitsValue==itemInfo.key)&&((condition.conditionValue=="")||(condition.conditionValue==itemData[condition.widgetKey]))) //Modify by zx 2022-07-22
                    {
                       value='<span style="'+condition.limitsStyle+'">'+value+'</span>';
                    }
                }
                //Modify by zx 2022-07-28 列元素增加点击事件及处理点击冒泡
                liHtml = liHtml+'<span style="display:inline-block;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;'+itemInfo.styles+'" id="'+itemInfo.key+index+'"';
                if(itemInfo.clickFun!="") liHtml = liHtml+' onclick="'+itemInfo.clickFun+'(this);event.stopPropagation()" itemInfo='+JSON.stringify(itemData).replace(new RegExp(/( )/g),"")+'';
                liHtml = liHtml+' >'+value+'</span>'
            }
            liHtml = liHtml+'</li>'
        });
        //填充界面数据
        $("#"+listItemObj.widgetPanelID+"_ul"+listItemObj.id).append(liHtml);
        if(isArray(interfaceData)) $("#"+listItemObj.widgetPanelID+'_'+listItemObj.widgetKey).text(interfaceData.length);
    }
}

/**
 * 方块生成处理
 * @param {String} type 部件布局方式
 * @param {String} divStyle 部件div样式
 * @param {String} desc 部件描述
 * @param {String} descStyle 部件描述样式
 * @param {String} descParentStyle 部件描述父级样式
 * @param {String} value 部件值
 * @param {String} valueStyle 部件值样式
 * @param {String} valueParentStyle 部件值父级样式
 * @param {String} mark 部件标记(用于单位等信息)
 * @param {String} markStyle 部件标记样式
 * @param {String} descKeyId 部件描述id
 * @param {String} valueKeyId 部件值id
 * @param {String} markId 部件标记id
 * @param {String} callFun 部件点击事件
 * @param {String} listData 部件接口数据信息
 * @return {String} blockHtml 生成方块html字符串
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function style_block_common(type,divStyle,desc,descStyle,descParentStyle,value,valueStyle,valueParentStyle,mark,markStyle,descKeyId,valueKeyId,markId,callFun,listData)
{
    var descHtml="",valueHtml="",markHtml="";
    if (descStyle!="") descHtml='<span style="'+descStyle+'" id="'+descKeyId+'">'+desc+'</span>';
    if (valueStyle!="") valueHtml='<span style="'+valueStyle+'" id="'+valueKeyId+'">'+value+'</span>';
    if (markStyle!="") markHtml='<span style="'+markStyle+'" id="'+markId+'">'+mark+'</span>';
    var blockHtml="";
    switch(type)
    {
        case "1":
            if (descParentStyle!="") descHtml='<div style="'+descParentStyle+'">'+descHtml+'</div>';
            if (valueParentStyle!="") valueHtml='<div style="'+valueParentStyle+'">'+valueHtml+markHtml+'</div>';
            blockHtml=descHtml+valueHtml;
        break;
        case "2":
            if (descParentStyle!="") descHtml='<div style="'+descParentStyle+'">'+descHtml+'</div>';
            if (valueParentStyle!="") valueHtml='<div style="'+valueParentStyle+'">'+valueHtml+markHtml+'</div>';
            blockHtml=valueHtml+descHtml;
        break;
        case "3":
            if (descParentStyle!="") descHtml='<div style="'+descParentStyle+'">'+descHtml+'</div>';
            if (valueParentStyle!="") valueHtml='<div style="'+valueParentStyle+'">'+descHtml+valueHtml+markHtml+'</div>';
            blockHtml=valueHtml;
        break;
        case "4":
            blockHtml=valueHtml+descHtml;
        break;
        case "5":
            if (descParentStyle!="") descHtml='<div style="'+descParentStyle+'">'+descHtml+markHtml+'</div>';
            if (valueParentStyle!="") valueHtml='<div style="'+valueParentStyle+'">'+valueHtml+'</div>';
            blockHtml=valueHtml+descHtml;
        break;
    }
    var parentDiv="";
    if (divStyle!="") parentDiv='<div style="'+divStyle+'"';
    if (callFun!="")
    {
        listData=JSON.stringify(listData);
        if(parentDiv!="")
        {
            parentDiv=parentDiv+` onclick="`+callFun+`(this)" listData='`+listData+`'`;
        }
        else
        {
            parentDiv=`<div onclick="`+callFun+`(this)" listData='`+listData+`'`;
        }
    }
    if(parentDiv!="") blockHtml=parentDiv+'>'+blockHtml+'</div>';

    return blockHtml;
}

/**
 * 号码牌生成
 * @param {Object} interfaceData 接口数据
 * @param {Object} widgetObj 部件数据
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function style_numberPlate(interfaceData, widgetObj)
{
    if((interfaceData==undefined)||(JSON.stringify(interfaceData)=="{}")) return;
    var numberPlateLength=parseInt(widgetObj.numberPlateLength)
    var numberPlateHtml="";
    if (interfaceData=="")
    {
        numberPlateHtml='<div style="'+widgetObj.widgetStyle+'" id="'+widgetObj.widgetPanelID+'_'+widgetObj.widgetKey+widgetObj.widgetId+'">';
        for (var i=0;i<numberPlateLength;i++)
        {
            numberPlateHtml=numberPlateHtml+'<span style="'+widgetObj.valueStyle+widgetObj.valueParentStyle+'">0</span>';
        }
        return numberPlateHtml=numberPlateHtml+'</div>';
    }
    else
    {
        $("#"+widgetObj.widgetPanelID+'_'+widgetObj.widgetKey+widgetObj.widgetId).empty();
        //add myf 2022-10-25 是对象的时候再取值
        if (interfaceData instanceof Object) {
            interfaceData = interfaceData[widgetObj.widgetDescKey];
        } 
        interfaceData=interfaceData.toString().split("");
        for (var i=0;i<numberPlateLength;i++)
        {
            var value=0;
            if(numberPlateLength-i<=interfaceData.length) value=interfaceData[(interfaceData.length+i)-numberPlateLength];
            numberPlateHtml=numberPlateHtml+'<span style="'+widgetObj.valueStyle+widgetObj.valueParentStyle+'">'+value+'</span>';
        }
        $("#"+widgetObj.widgetPanelID+'_'+widgetObj.widgetKey+widgetObj.widgetId).append(numberPlateHtml);
    }
}

/**
 * 方块生成
 * @param {Object} interfaceData 接口数据
 * @param {Object} widgetObj 部件数据
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function style_block_base(interfaceData, widgetObj)
{
    if((interfaceData==undefined)||(JSON.stringify(interfaceData)=="{}")) return;
    widgetObj.valueParentStyle=templateValue(widgetObj.valueParentStyle,ImgUrl); //Modify by zx 2022-10-18 图片替换
    var blockHtml="";
    if (interfaceData=="")
    {
        var desc="";
        desc = widgetObj.widgetDesc
        desc=(desc==""||desc==undefined||desc==null)?"":desc;
        //Modify by zx 2022-10-16 点击参数处理
        var listData="";
        if(!jQuery.isEmptyObject(widgetObj.clickParam)) listData=widgetObj.clickParam;
        blockHtml=style_block_common(widgetObj.contentInOrder,widgetObj.widgetStyle,desc,widgetObj.descStyle,widgetObj.descParentStyle,"",widgetObj.valueStyle,widgetObj.valueParentStyle,"",widgetObj.markStyle,widgetObj.widgetDescKey+widgetObj.widgetId,widgetObj.widgetKey+widgetObj.widgetId,widgetObj.mark+widgetObj.widgetId,widgetObj.clickCallFun,listData);
        return blockHtml;
    }else{
        var desc="",value="",mark="";
        desc = widgetObj.widgetDesc
        if(desc=="") desc = interfaceData[widgetObj.widgetDescKey];
        value = interfaceData[widgetObj.widgetKey];
        //if (widgetObj.mark!="") mark=interfaceData[widgetObj.mark];
        //mark=(mark==""||mark==undefined||mark==null)?widgetObj.mark:mark;
        $("#"+widgetObj.widgetDescKey+widgetObj.widgetId).text(desc);
        $("#"+widgetObj.widgetKey+widgetObj.widgetId).text(value);
        if (widgetObj.mark!="") 
        {
            mark=interfaceData[widgetObj.mark];
            mark=(mark==""||mark==undefined||mark==null)?widgetObj.mark:mark;
            $("#"+widgetObj.mark+widgetObj.widgetId).text(mark);
        }
       if (widgetObj.clickCallFun!="")
       {
           $("#"+widgetObj.widgetKey+widgetObj.widgetId).parent().parent().attr("listdata",JSON.stringify(interfaceData))
       }
    }
}

/**
 * 方块枚举生成
 * @param {Object} interfaceData 接口数据
 * @param {Object} widgetObj 部件数据
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function style_block_enum(interfaceData, widgetObj)
{
    if((interfaceData==undefined)||(JSON.stringify(interfaceData)=="{}")) return;
    widgetObj.descParentStyle=templateValue(widgetObj.descParentStyle,ImgUrl); //Modify by zx 2022-10-18 图片替换
    var enumHtml="";
    if (interfaceData=="")
    {
        enumHtml='<div style="'+widgetObj.widgetStyle+'">';
        var descHtml='<span style="'+widgetObj.descStyle+'">'+widgetObj.widgetDesc+'</span>';
        if((widgetObj.descParentStyle!="")&&(widgetObj.descParentStyle!=null)) enumHtml=enumHtml+'<div style="'+widgetObj.descParentStyle+'">'+descHtml+'</div><div id="'+widgetObj.widgetPanelID+'_'+widgetObj.widgetKey+widgetObj.widgetId+'" style="'+widgetObj.valueParentStyle+'"></div></div>';
        else enumHtml=enumHtml+descHtml+'<div id="'+widgetObj.widgetPanelID+'_'+widgetObj.widgetKey+widgetObj.widgetId+'" style="'+widgetObj.valueParentStyle+'"></div></div>';
        return enumHtml;
    }else{
        $("#"+widgetObj.widgetPanelID+'_'+widgetObj.widgetKey+widgetObj.widgetId).empty();
        var enumListHtml="";
        for (var curNum=0;curNum<interfaceData.length;curNum++)
        {
            var listData=interfaceData[curNum];
            if ((widgetObj.widgetDescKey!="")&&(widgetObj.widgetDesc.indexOf(listData[widgetObj.widgetDescKey])==-1)) continue;
            var value=listData[widgetObj.widgetKey];
            enumListHtml=enumListHtml+style_block_common(widgetObj.contentInOrder,"","","","",value,widgetObj.valueStyle,"","","","","","","","");
        }
        $("#"+widgetObj.widgetPanelID+'_'+widgetObj.widgetKey+widgetObj.widgetId).append(enumListHtml);
    }
}

/**
 * 方块列表生成
 * @param {Object} interfaceData 接口数据
 * @param {Object} widgetObj 部件数据
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function style_block_list(interfaceData, widgetObj)
{
    if((interfaceData==undefined)||(JSON.stringify(interfaceData)=="{}")) return;
    var blockHtml="";
    if (interfaceData=="")
    {
        blockHtml='<div id="'+widgetObj.widgetPanelID+'_'+widgetObj.widgetKey+widgetObj.widgetId+'" style="overflow:hidden;"></div>';
        return blockHtml;
    }else{
        //特殊处理
        var blockListHtml="";
        $("#"+widgetObj.widgetPanelID+'_'+widgetObj.widgetKey+widgetObj.widgetId).empty();
        if(isArray(interfaceData))
        {
            for (var curNum=0;curNum<interfaceData.length;curNum++)
            {
                var listData=interfaceData[curNum];
                var desc,value,mark="";
                if (widgetObj.widgetDescKey!="") desc=listData[widgetObj.widgetDescKey];
                if (widgetObj.widgetKey!="") value=listData[widgetObj.widgetKey];
                if (widgetObj.mark!="") mark=listData[widgetObj.mark];
                var widgetStyle=widgetObj.widgetStyle+"float:left;"
                widgetStyle=templateStyle(widgetStyle, listData);
                blockListHtml=blockListHtml+style_block_common(widgetObj.contentInOrder,widgetStyle,desc,widgetObj.descStyle,widgetObj.descParentStyle,value,widgetObj.valueStyle,widgetObj.valueParentStyle,mark,widgetObj.markStyle,"","","",widgetObj.clickCallFun,listData);
            }
            $("#"+widgetObj.widgetPanelID+'_'+widgetObj.widgetKey+widgetObj.widgetId).append(blockListHtml);
        }
        else if(isObject(interfaceData))
        {
            if(isString(interfaceData[widgetObj.widgetKey]))
            {
                var dataDetail=interfaceData[widgetObj.widgetKey];
                if(dataDetail=="") dataDetail="无";  //Modify by zx 2022-10-18
                dataDetail = dataDetail.split(",");
                for (var i=0; i<dataDetail.length;i++)
                {
                    queueHtml=style_block_common(widgetObj.contentInOrder,"","","","",dataDetail[i],widgetObj.valueStyle,"","","","","","","","","","","");
                    $("#"+widgetObj.widgetPanelID+'_'+widgetObj.widgetKey+widgetObj.widgetId).append(queueHtml);
                }
            }
            else
            {
                for (let key in interfaceData) 
                {
                    var listData=interfaceData[key];
                    var desc,value,mark="";
                    if (widgetObj.widgetDescKey!="") desc=listData[widgetObj.widgetDescKey];
                    if (widgetObj.widgetKey!="") value=listData[widgetObj.widgetKey];
                    if (widgetObj.mark!="") mark=listData[widgetObj.mark];
                    var widgetStyle=widgetObj.widgetStyle+"float:left;";
                    var valueStyle=templateStyle(widgetObj.valueStyle, listData);
                    blockListHtml=blockListHtml+style_block_common(widgetObj.contentInOrder,widgetStyle,desc,widgetObj.descStyle,widgetObj.descParentStyle,value,valueStyle,widgetObj.valueParentStyle,mark,widgetObj.markStyle,"","","",widgetObj.clickCallFun,listData);
                }
                $("#"+widgetObj.widgetPanelID+'_'+widgetObj.widgetKey+widgetObj.widgetId).append(blockListHtml);
            }
        }
        // else if(isString(interfaceData[widgetObj.widgetKey]))
        // {
        //     var dataDetail=interfaceData[widgetObj.widgetKey];
        //     dataDetail = dataDetail.split(",");
        //     for (var i=0; i<dataDetail.length;i++)
        //     {
        //         queueHtml=style_block_common(widgetObj.contentInOrder,"","","","",dataDetail[i],widgetObj.valueStyle,"","","","","","","","","","","");
        //         $("#"+widgetObj.widgetPanelID+'_'+widgetObj.widgetKey+widgetObj.widgetId).append(queueHtml);
        //     }
        // }
    }
}
/**
 * 判断数据是否是数组
 * @param {Object} obj 数据对象
 * @returns {bool}  是否是数组 
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function isArray(obj)
{
    return (typeof obj=='object')&&obj.constructor==Array;
}
/**
 * 判断数据是否是对象
 * @param {Object} obj 数据对象
 * @returns {bool}  是否是对象
 * @author 邹旋 2022-05-15
 */
function isObject(obj)
{
    return Object.prototype.toString.call(obj) === '[object Object]'
}
/**
 * 判断数据是否是字符串
 * @param {String} str 数据对象
 * @returns {bool}  是否是字符串
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function isString(str)
{
    return (typeof str=='string')&&str.constructor==String;
}
/**
 * 模板替换方法,用户通过数据找到对象图标,需要替换部分{key},key需要是数字,适用列表
 * @param {String} styleStr 样式字符串
 * @param {Array} widgetData 列表数据集
 * @returns {String}}  result 替换后的字符串
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function templateStyle(styleStr, widgetData)
{
    var result=styleStr;
    styleStr.replace(/{([^}]+)}/g,
    function (m, i) {
        result=styleStr.replace(m,widgetData[i]);
    });
    return result;
}
/**
 * 模板替换方法,用户通过数据找到对象图标,需要替换部分{ImgUrl},适用字符串
 * @param {String} styleStr 样式字符串
 * @param {String} value 需要替换的内容
 * @returns {String}}  result 替换后的字符串
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function templateValue(styleStr, value)
{
    var result=styleStr;
    styleStr.replace(/{([^}]+)}/g,
    function (m, i) {
        result=styleStr.replace(m,value);
    });
    return result;
}
/**
 * 参数打包处理
 * @param {Object} paramObj 参数后台配置数据对象
 * @returns {Object} paramObjResult 参数打包完后数据对象
 * @author 邹旋 2022-08-09
 * @checkinfo zx 2022-08-09
 */
function paramPackage(paramData,paramType)
{
    var paramObjResult=new Object();
    var value="";
    for(var i=0;i<paramData.length;i++)
    {
        //Modify by zx 2022-10-10 参数类型调整
        if(paramData[i].sourceParamType!=paramType) continue;
        if(paramData[i].valueType=="0"){
            value=paramData[i].valueKey;
        }else if(paramData[i].valueType=="1"){
            value=eval(paramData[i].valueKey);
        }else if(paramData[i].valueType=="2"){
            value=$("#"+paramData[i].valueKey).val();
        }else if(paramData[i].valueType=="9"){
            value=eval(paramData[i].valueKey);
        }
        value=(value==""||value==undefined||value==null)?"":value;
        paramObjResult[paramData[i].interfaceParamKey]=value;
    }

    return paramObjResult;
}

/**
 * page内部元素参数获取完成后统一初始化
 * @param {String} sourceType 元素类型 面板 0; 部件 1;
 * @param {String} sourceId 元素数据id
 * @param {String} sourceParamType 参数出入类型 
 * @returns {Object} paramResult 参数打包数据对象
 * @author 邹旋 2022-08-09
 * @checkinfo zx 2022-08-09
 */
function getDataSourceParams(sourceType, sourceId, sourceParamType)
{
    //Modify by zouxuan 2022-07-21  获取参数改为异步加载处理
    var paramResult=new Object();
    $.ajax({
        type: "post",
        url: dtvpApiServ+"/page/api/getDataSourceParams",   //Modify by zx 2022-08-02 请求地址修改
        data: JSON.stringify({sourceType:sourceType,sourceId:sourceId,sourceParamType:sourceParamType}),
        contentType: "application/json;charset=UTF-8",
        dataType: "json", // 返回的数据类型 json
        success: function (listData) {
            if(listData.success){
                //获取界面样式代码
                var paramData=listData.data;
                //Modify by zx 2022-10-10 参数类型调整
                paramResult=paramPackage(paramData,"0");
            }else{
                $.alert({title:'提示',content:listData.msg ,confirmText:'确定'});
            }
        },
        error:function(xhr,status,error){
            $.alert({title:'提示',content:xhr ,confirmText:'确定'});
        }
    });
}

/**********************************未核程序***************************************/


/**********************************后期停用程序***************************************/
/**
 * 智慧护理带图标方块处理
 * @param {Object} interfaceData 接口返回数据
 * @param {Object} widgetObj 面板信息对象
 * @returns 无
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function createBlockListWithImg(interfaceData, widgetObj)
{
    if((interfaceData==undefined)||(JSON.stringify(interfaceData)=="{}")) return;
    var blockHtml="";
    if (interfaceData=="")
    {
        blockHtml='<div id="'+widgetObj.widgetPanelID+'_'+widgetObj.widgetKey+widgetObj.widgetId+'" style="overflow:hidden;"></div>';
        return blockHtml;
    }else{
        var blockListHtml="";
        $("#"+widgetObj.widgetPanelID+'_'+widgetObj.widgetKey+widgetObj.widgetId).empty();
        for (var curNum=0;curNum<interfaceData.length;curNum++)
        {
            var listData=interfaceData[curNum];
            var desc,value,mark="";
            if (widgetObj.widgetDescKey!="") desc=listData[widgetObj.widgetDescKey];
            if (widgetObj.widgetKey!="") value=listData[widgetObj.widgetKey];
            if (widgetObj.mark!="") mark=listData[widgetObj.mark];
            var widgetStyle=getImgUrl(listData.type)+widgetObj.widgetStyle+"float:left;";
            blockListHtml=blockListHtml+style_block_common(widgetObj.contentInOrder,widgetStyle,desc,widgetObj.descStyle,widgetObj.descParentStyle,value,widgetObj.valueStyle,widgetObj.valueParentStyle,mark,widgetObj.markStyle,widgetObj.widgetDescKey+widgetObj.widgetId,widgetObj.widgetKey+widgetObj.widgetId,widgetObj.mark+widgetObj.widgetId,"","");
        }
        $("#"+widgetObj.widgetPanelID+'_'+widgetObj.widgetKey+widgetObj.widgetId).append(blockListHtml);
    }
}
/**
 * 智慧护理带图标方块获取图片
 * @param {String} type 图标命名字段信息
 * @returns {String} 背景样式
 * @author 邹旋 2022-05-15
 * @checkinfo zx 2022-08-02
 */
function getImgUrl(type)
{
    return 'background:url('+ImgUrl+'environment_'+type+'.png);background-repeat: no-repeat;';  //Modify by zx 2022-09-02 全局变量大写
}
/**
 * radio、checkbox类型部件样式打包
 * @param {Object} singleWidgetData 部件信息
 * @returns {String} 打包后的样式
 * @author myf 2022-10-12
 */
function checkboxValueStyleHandle (singleWidgetData) {
    let valueStyleInfoUnchecked = "";
    let valueStyleInfoChecked = "";
    const valueColors = singleWidgetData.valueColor.split('^');
    if (valueColors[0]) valueStyleInfoUnchecked += `color:${valueColors[0]};`;
    if (valueColors[1]) valueStyleInfoChecked += `color:${valueColors[1]};`;
    const valueFontSize = singleWidgetData.valueFontSize.split('^');
    if (valueFontSize[0]) valueStyleInfoUnchecked += `font-size:${valueFontSize[0]};`;
    if (valueFontSize[1]) valueStyleInfoChecked += `font-size:${valueFontSize[1]};`;
    const valueFontFamily = singleWidgetData.valueFontFamily.split('^');
    if (valueFontFamily[0]) valueStyleInfoUnchecked += `font-family:${valueFontFamily[0]};`;
    if (valueFontFamily[1]) valueStyleInfoChecked += `font-family:${valueFontFamily[1]};`;
    const valuePadding = singleWidgetData.valuePadding.split('^');
    if (valuePadding[0]) valueStyleInfoUnchecked += `padding:${valuePadding[0]};`;
    if (valuePadding[1]) valueStyleInfoChecked += `padding:${valuePadding[1]};`;
    const valueMargin = singleWidgetData.valueMargin.split('^');
    if (valueMargin[0]) valueStyleInfoUnchecked += `margin:${valueMargin[0]};`;
    if (valueMargin[1]) valueStyleInfoChecked += `margin:${valueMargin[1]};`;
    const valueWidth = singleWidgetData.valueWidth.split('^');
    if (valueWidth[0]) valueStyleInfoUnchecked += `width:${valueWidth[0]};`;
    if (valueWidth[1]) valueStyleInfoChecked += `width:${valueWidth[1]};`;
    const valueHeight = singleWidgetData.valueHeight.split('^');
    if (valueHeight[0]) valueStyleInfoUnchecked += `height:${valueHeight[0]};`;
    if (valueHeight[1]) valueStyleInfoChecked += `height:${valueHeight[1]};`;
    if (valueHeight[0]) valueStyleInfoUnchecked += `line-height:${valueHeight[0]};`;
    if (valueHeight[1]) valueStyleInfoChecked += `line-height:${valueHeight[1]};`;
    const valueFontWeight = singleWidgetData.valueFontWeight.split('^');
    if (valueFontWeight[0]) valueStyleInfoUnchecked += `font-family:${valueFontWeight[0]};`;
    if (valueFontWeight[1]) valueStyleInfoChecked += `font-family:${valueFontWeight[1]};`;
    const valueDisplay = singleWidgetData.valueDisplay.split('^');
    if (valueDisplay[0]) valueStyleInfoUnchecked += `display:${valueDisplay[0]};`;
    if (valueDisplay[1]) valueStyleInfoChecked += `display:${valueDisplay[1]};`;
    const valueBorder = singleWidgetData.valueBorder.split('^');
    if (valueBorder[0]) valueStyleInfoUnchecked += `border:${valueBorder[0]};`;
    if (valueBorder[1]) valueStyleInfoChecked += `border:${valueBorder[1]};`;
    const valueBorderRadius = singleWidgetData.valueBorderRadius.split('^');
    if (valueBorderRadius[0]) valueStyleInfoUnchecked += `border-radius:${valueBorderRadius[0]};`;
    if (valueBorderRadius[1]) valueStyleInfoChecked += `border-radius:${valueBorderRadius[1]};`;
    const valueTextAlign = singleWidgetData.valueTextAlign.split('^');
    if (valueTextAlign[0]) valueStyleInfoUnchecked += `text-align:${valueTextAlign[0]};`;
    if (valueTextAlign[1]) valueStyleInfoChecked += `text-align:${valueTextAlign[1]};`;
    const valueFloat = singleWidgetData.valueFloat.split('^');
    if (valueFloat[0]) valueStyleInfoUnchecked += `float:${valueFloat[0]};`;
    if (valueFloat[1]) valueStyleInfoChecked += `float:${valueFloat[1]};`;
    const valueBackground = singleWidgetData.valueBackground.split('^');
    if (valueBackground[0]) {
        if(valueBackground[0].indexOf("png")>0)
        {
            valueStyleInfoUnchecked += "background:url("+ImgUrl+valueBackground[0]+");background-repeat:no-repeat;"; //Modify by zx 2022-09-02 全局变量大写
        }
        else
        {
            valueStyleInfoUnchecked += "background:"+valueBackground[0]+";";
        }
    }
    if (valueBackground[1]) {
        if(valueBackground[1].indexOf("png")>0)
        {
            valueStyleInfoChecked += "background:url("+ImgUrl+valueBackground[1]+");background-repeat:no-repeat;"; //Modify by zx 2022-09-02 全局变量大写
        }
        else
        {
            valueStyleInfoChecked += "background:"+valueBackground[1]+";";
        }
    }
    return valueStyleInfoUnchecked || valueStyleInfoChecked ? valueStyleInfoUnchecked + "^" + valueStyleInfoChecked : "";
}
/**
 * @author 缪一帆 2022-07-01 modify myf 2022-11-01 从BaseCommon搬迁至此
 * 创建单/多选通用函数
 * @param {string} divId div容器元素ID
 * @param {string} checkboxId checkboxId
 * @param {Array<Object>} data 绑定的数据
 * @param {String} dataDesc 绑定的数据中对应的文本内容属性
 * @param {String} dataValue 绑定的数据中对应的值属性
 * @param {String} css 选项样式名
 * @param {String} cssChecked 选项选中样式名
 * @param {Boolean} isRadio 是否是单选,false为多选
 * @param {String} clickFun 点击事件 入参(p1,p2)为 (选项元素本身,当前选中值)
 * @returns {String} divHtml 返回html串时(flag为true)提供
 * @modify myf 2022-10-11 重写提供给页面配置html串
 * @info 取值 $(divId).attr('valueDesc') || $(divId).attr('valueKey')
 */
 function createNormalCheckbox(divId, checkboxId, data, dataDesc, dataValue, css, cssChecked, isRadio, clickFun='') {
    if (!checkboxId ||!data || !dataDesc || !dataValue) throw new Error("createNormalCheckbox参数为空!");
    let flag = true;
    if (divId) flag = false;
    const radioArr = [];
    const radioParaData = [];
    if (!css) css = 'space-info-search-main-input-checkbox-item';
    if (!cssChecked) cssChecked = 'space-info-search-main-input-checkbox-item-check';
    data.forEach((item, index) => {
        radioParaData.push({
            radioCss: css,
            radioCssChecked: cssChecked,
            radioId: checkboxId + index,
            radioText: item[dataDesc],
            radioValue: item[dataValue],
            radioClickFun: clickFun,
        });
        radioArr.push(checkboxId + index);
    });
    let divHtml = `<div id="${checkboxId}" style="width:100%;display:flex;flex-wrap:wrap;">`;
    radioParaData.forEach((item) => {
        divHtml += `<div id="${item.radioId}" class="${item.radioCss}" group='${JSON.stringify(radioArr).replace(new RegExp(/( )/g),"")}' uncheckedCss="${item.radioCss}" checkedCss="${item.radioCssChecked}" itemValue="${item.radioValue}" clickFun="${item.radioClickFun}" onclick="clickCheckboxDefault(this,${isRadio})">${item.radioText}</div>`;
    });
    divHtml += '</div>'
    // function getCheckedArr () { // 获取已选中value数组
    //     const checkedArr = [];
    //     radioArr.forEach((item) => {
    //         if ($('#'+item).hasClass(cssChecked)) {
    //             checkedArr.push($('#'+item).attr('itemValue'));
    //         }
    //     });
    //     return checkedArr;
    // }
    if (!flag) {
        $('#'+divId).append(divHtml);
    } else {
        return divHtml;
    }
}
/**
 * @author myf 2022-10-11 modify 2022-11-01 注释添加说明
 * 内部函数 单/多选通用函数选项点击事件处理（仅供createNormalCheckbox调用）
 * 将被选值赋给checkbox容器，以便于取值
 * 处理自定义点击事件，入参为（被点击元素，当前选中描述，当前选中值）
 * @param {Object} ele 选项元素
 * @param {Boolean} isRadio 是否是单选,false为多选
 * @returns 无
 */
///2022-10-29?? 缪一帆 其他不调用，仅供内部函数调用。注释添加说明 函数名核实
function clickCheckboxDefault (ele,isRadio) {
    const curClass = $(ele).attr('class');
    const checkedClass = $(ele).attr('checkedCss');
    const uncheckedClass = $(ele).attr('uncheckedCss');
    const group = JSON.parse($(ele).attr('group'));
    const res = [];
    const resDesc = [];
    if (isRadio) {
        group.forEach((item)=>{
            $('#'+item).attr('class',uncheckedClass);
        });
    }
    if (curClass.includes(checkedClass)) {
        $(ele).attr('class',uncheckedClass);
    } else {
        $(ele).addClass(checkedClass);
    }
    if (isRadio) {
        res.push($(ele).attr('itemValue'));
        resDesc.push($(ele).text());
    } else {
        group.forEach((item)=>{
            if ($('#'+item).hasClass(checkedClass)) {
                res.push($('#'+item).attr('itemValue'));
                resDesc.push($('#'+item).text());
            }
        });
    }
    $(ele).parent().attr('valueDesc',JSON.stringify(resDesc));
    $(ele).parent().attr('valueKey',JSON.stringify(res));
    const clickFunStr = $(ele).attr('clickFun');
    if (clickFunStr) {
        const clickFun = eval(clickFunStr);
        clickFun(ele, resDesc, res);
    }
}
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
 * 单选获取选中对应文本 $(selectId).val(); || $(selectId).attr('valueDesc');
 * 单选获取选中对应值 $(selectId).attr('valueKey');
 * @info myf 2022-09-20
 * 多选获取选中对应文本 $(selectId).attr('valueDesc');
 * 多选获取选中对应值 $(selectId).attr('valueKey');
 */
  function createNormalOptions(parentElementId, selectId, optionData, optionText, optionValue, isMultiple=false, selectStyle="",clickCallFun,defaultFlag) {
    if (!selectId || !optionData || !optionText || !optionValue) throw new Error("参数为空!");
    // const parentElement = document.getElementById(parentElementId);
    // if (!parentElement) throw new Error('parentElement not found!');
    var valueKey="";
    var valueDesc="";
    if(defaultFlag=="Y"){
        valueKey=optionData[0][optionValue];
        valueDesc=optionData[0][optionText];
    }
    if (isMultiple) { // 多选处理
        // modify myf 2022-09-20 重写多选选择器
        let html = `<div style="position: relative;width:100%;height:100%;"><div id="${selectId}TagBox" class="page-set-form-mulselect-tagbox">`;
        html += `<div id="${selectId}TagBoxMore" class="page-set-form-mulselect-tagbox-more">···</div>`;
        html += `</div><input id="${selectId}" class="page-set-form-mulselect-input" style="${selectStyle}" placeholder="请输入条件" value="" `;
        html += `onfocus="showSelectOptions('${selectId}Options')" onblur="removeSelectOptions('${selectId}Options')" oninput='selectSearchInputFunc("${selectId}",`;
        html += `${JSON.stringify(optionData).replace(new RegExp(/( )/g),"")}`;
        html += `,"${optionText}","${optionValue}","mul","${clickCallFun}")' autocomplete="new-password"/>`;  //Modify by zx 2022-10-16 增加选择后回调函数
        html += `<span style="user-select: none;position: absolute;right: 0.75rem;top: 50%;transform:translateY(-50%);color:#949494;">&or;</span></div>`;
        html += `<div style="position: relative;width:100%;"><ul id="${selectId}Options" class="page-set-form-select-options" style="display: none;">`;
        html += selectSearchInputFunc(selectId,optionData,optionText,optionValue,'mul',clickCallFun);  //Modify by zx 2022-10-16 增加选择后回调函数
        html += `</ul><div id="${selectId}MoreTagBox" class="page-set-form-mulselect-more-tagbox" style="display: none;"></div></div>`;
        if (parentElementId) {
            $('#'+parentElementId).append(html);
            return;
        } else {
            return html;
        }
    }

    // modify myf 2022-09-02 重写单选选择器
    let html = `<div style="position: relative;width:100%;height:100%;"><input id="${selectId}" class="page-set-form-select-input" style="${selectStyle}" placeholder="请输入条件" `;
    html += `onfocus="showSelectOptions('${selectId}Options')" onblur="removeSelectOptions('${selectId}Options')" oninput='selectSearchInputFunc("${selectId}",`;
    html += `${JSON.stringify(optionData).replace(new RegExp(/( )/g),"")}`;
    html += `,"${optionText}","${optionValue}","","${clickCallFun}")' autocomplete="new-password"`;  //Modify by zx 2022-10-16 增加选择后回调函数
    if(defaultFlag=="Y"){
        html += ` valueKey="${valueKey}" value="${valueDesc}" valueDesc="${valueDesc}"`; 
    }
    html += `/>`;
    html += `<span style="user-select: none;position: absolute;right: 0.75rem;top: 50%;transform:translateY(-50%);color:#fff;">&or;</span></div>`;
    html += `<div style="position: relative;width:100%;"><ul id="${selectId}Options" class="page-set-form-select-options" style="display: none;">`;
    html += selectSearchInputFunc(selectId,optionData,optionText,optionValue,'',clickCallFun);   //Modify by zx 2022-10-16 增加选择后回调函数
    html += `</ul></div>`;
    if (parentElementId) {
        $('#'+parentElementId).append(html);
    } else {
        return html;
    }
}
// createNormalOptions选中取值
function selectOptionClick(e,input,clickCallFun) {
    // modify myf 2022-11-01 处理空选项
    input.value = e.innerHTML === '(空)' ? '' : e.innerHTML;
    $(input).attr('valueKey',$(e).attr('valueKey') || '');
    $(input).attr('valueDesc',e.innerHTML === '(空)' ? '' : e.innerHTML);
    if (clickCallFun) {
        const clickFun = eval(clickCallFun);
        clickFun();
    }
    // console.log('valueKey',$(input).attr('valueKey'));
}
// createNormalOptions多选选中取值
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
            $('#' + input.id + 'TagBoxMore').css('display','flex');
            if (!$._data($('#' + input.id + 'TagBoxMore').get(0), 'events')) { // 只在没有事件时绑定一次
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
                    tagMore.style.width = '35%';
                    tagMore.style.margin = '.2rem';
                    tagMore.childNodes[1].onclick = ()=>{ // 更多面板中标签事件等同于input中标签事件
                        tagMore.remove();
                        tagItem.childNodes[1].click();
                    };
                    moreTagBox.appendChild(tagMore);
                }
            });
        }
    }
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
//Modify by zx 2022-10-16 增加选中后回调函数
function selectSearchInputFunc(selectId,optionData,optionText,optionValue,type='single',clickCallFun) {
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
        //Modify by zx 2022-10-16 增加选中后回调函数
        html += `<li id="${selectId + 'Option' + item[optionValue]}" class="page-set-form-select-option" valueKey="${item[optionValue]}" onmousedown="${selectFunc}(this,${selectId},${clickCallFun})" ontouchstart="${selectFunc}(this,${selectId},${clickCallFun})">${item[optionText]}</li>`;
    });
    if (options) {
        options.innerHTML = html;
    } else {
        return html;
    }
    
}
/**********************************待定不用程序***************************************/


/**********************************明确不用程序***************************************/