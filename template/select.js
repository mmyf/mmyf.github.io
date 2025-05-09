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