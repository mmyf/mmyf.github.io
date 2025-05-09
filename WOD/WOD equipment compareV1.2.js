// ==UserScript==
// @name         WOD equipment compare
// @namespace    http://tampermonkey.net/
// @version      v1.2
// @description  用这个可以为你的仓库添加对比按钮，用来和当前身上穿戴的装备做对比，不支持非中文网址，不支持老版本浏览器
// @author       myf
// @icon         https://www.google.com/s2/favicons?sz=64&domain=world-of-dungeons.org
// @grant        none
// @include         *://*.world-of-dungeons.org/wod/spiel/hero/items.php*
// @include         *://*.world-of-dungeons.org/wod/spiel/trade/trade.php*
// ==/UserScript==

/**
 * WOD装备对比脚本
 * 功能：为仓库物品添加对比按钮,可与当前装备的物品进行属性对比
 * 使用：双击物品行的"对比"按钮即可
 * 作者：myf
 * 版本：v1.2
 */
(function() {
    'use strict';
    
    // 装备属性表格行名称数组
    const equipAttrsTableRowArr = [
        '物品名称', '特性', '所有者', '职业限制', '种族限定', '装备要求', '耐久度',
        'NPC价/全新时NPC价', '唯一性', '剩余使用次数', '每地城可使用次数', '每战斗可使用次数',
        '效果等级', '需配合何物使用', '装备位置', '物品类别(及修正值)', '可以使用该物品的技能(及修正值)',
        '设计者'
    ];

    // 装备属性分类
    const equipAttrParts = [
        '作用在物品持有者上的效果',
        '作用在被此物品影响的目标上的效果'
    ];

    // 装备效果属性列表
    const equipAttrEffects = [
        '物品名称', '攻击奖励', '伤害奖励', '防御奖励', '护甲奖励', '属性奖励', '对技能等级的奖励', '对技能效果的奖励',
    ];
    
    let EquipmentsObj = {};
    const nHeroId = getHiddenInfo(document, "session_hero_id", "");
    const nPlayerId = getHiddenInfo(document, "session_player_id", "");
    GetEquipment(nHeroId, nPlayerId);
    const header = document.querySelector('tr.header');
    const itemName = header.children[2];
    const compareHeader = document.createElement('th');
    compareHeader.textContent = '对比';
    header.insertBefore(compareHeader, itemName);
    const tbody = document.querySelector('table.content_table tbody');
    const tbodyChildren = Array.from(tbody.children);
    let loading = false;
    tbodyChildren.forEach(child=>{
        const item = child.children[2];
        const compareHeaderItem = document.createElement('td');
        const btn = document.createElement('div');
        btn.textContent = '对比';
        btn.style = `
            cursor: pointer;
            user-select: none;
        `;
        btn.addEventListener('dblclick', (ev)=>{
            ev.stopPropagation();
            if(loading) {
                createNonModalDialog('正在加载物品信息！请稍等');
                return;
            }
            loading = true;
            let href = btn.parentElement.previousElementSibling.children[1].href;
            // console.log('ssss', href.slice(href.indexOf('item_instance_id=') + 17, href.indexOf('&')));
            const curItemId = href.slice(href.indexOf('item_instance_id=') + 17, href.indexOf('&'));

            const promise = getEquipmentType(curItemId);
            promise.then(curItemType=>{
                if (curItemType === '单手') {
                    curItemType = ['右手', '左手', '双手'];
                } else if (curItemType === '右手') {
                    curItemType = ['右手', '双手'];
                } else if (curItemType === '左手') {
                    curItemType = ['左手', '双手'];
                } else if (curItemType === '双手') {
                    curItemType = ['双手', '左手', '右手'];
                } else if (curItemType === '戒指') {
                    curItemType = ['戒指 #1', '戒指 #2', '戒指 #3', '戒指 #4', '戒指 #5'];
                } else if (curItemType === '勋章') {
                    const 勋章数量 = Object.keys(EquipmentsObj).reduce((count, name) => count + (name.startsWith('勋章') ? 1 : 0), 0);
                    curItemType = Array.from({length: 勋章数量}, (v, k) => '勋章 #'+k);
                } else if (curItemType === '口袋') {
                    // alert('口袋物品不参与对比！');
                    // return;
                    const 口袋数量 = Object.keys(EquipmentsObj).reduce((count, name) => count + (name.startsWith('口袋') ? 1 : 0), 0);
                    curItemType = Array.from({length: 口袋数量}, (v, k) => '口袋 #'+k);
                }
                const equipedItemIds = [];
                let hasEquiped = false;
                if (curItemType instanceof Array) {
                    curItemType.forEach(type=>{
                        const equipedItemId = EquipmentsObj[type]?.id || '';
                        if (equipedItemId) {
                            hasEquiped = true;
                            equipedItemIds.push(equipedItemId);
                        }
                    });
                } else {
                    const equipedItemId = EquipmentsObj[curItemType]?.id || '';
                    if (equipedItemId) {
                        hasEquiped = true;
                        equipedItemIds.push(equipedItemId);
                    }
                }
                console.log('curItemId, equipedItemIds', curItemId, equipedItemIds, EquipmentsObj);
                if (!hasEquiped) {
                    alert('相同装备位置没有物品被装备！');
                    return;
                }
                const div = document.createElement('div');
                div.style.position = 'fixed';
                div.style.top = '0';
                div.style.left = '0';
                div.style.width = '100%';
                div.style.height = '100%';
                div.style.backgroundColor = '#AAAAAA9f';
                div.style.zIndex = 99999;
                div.addEventListener('click', (ev)=>{
                    ev.stopPropagation();
                    div.remove();
                });
                div.addEventListener('wheel', (ev)=>{ev.stopPropagation();});
                const content = document.createElement('div');
                content.style.position = 'absolute';
                content.style.top = '50%';
                content.style.left = '50%';
                // content.style.width = '90%';
                content.style.height = '80%';
                content.style.transform = 'translate(-50%, -50%)';
                content.style.backgroundColor = '#fff';
                content.style.display = 'flex';
                content.style.flexDirection = 'column';
                content.style.alignItems = 'center';
                content.style.overflow = 'auto';
                content.addEventListener('click', (ev)=>{ev.stopPropagation();});
                // content.addEventListener('wheel', (ev)=>{ev.stopPropagation();});
                content.innerText = '请稍等！';
                div.appendChild(content);
                const body = document.querySelector('body');
                body.appendChild(div);
                if (equipedItemIds.length) {
                    const curItemPromise = getEquipmentAttrsTable(curItemId);
                    const equipedItemPromises = [];
                    equipedItemIds.forEach(equipedItemId=>{
                        equipedItemPromises.push(getEquipmentAttrsTable(equipedItemId));
                    });
                    Promise.all([curItemPromise, ...equipedItemPromises]).then(([curItemObj, ...equipedItemObjs])=>{

                        let 物品类别相同的已装备道具 = [];
                        const indexOf装备位置 = equipAttrsTableRowArr.findIndex(i => i === '装备位置');
                        const 选择的装备位置 = curItemObj.base[indexOf装备位置].innerHTML.trim();
                        if (选择的装备位置 !== '口袋') {
                            物品类别相同的已装备道具 = equipedItemObjs;
                        } else {
                            const indexOf物品类别 = equipAttrsTableRowArr.findIndex(i => i === '物品类别(及修正值)');
                            const 选择的装备类别 = extractLinks(curItemObj.base[indexOf物品类别].innerHTML).map(i => i.value);

                            物品类别相同的已装备道具 = equipedItemObjs.filter(i => {
                                const type = extractLinks(i.base[indexOf物品类别].innerHTML).map(i => i.value);
                                return 选择的装备类别.some(item => type.includes(item));
                            });
                        }

                        // console.log('curItemTable, equipedItemTable',curItemObj, equipedItemObjs);
                        const curEquipmentBase = curItemObj.base;
                        const curEquipmentEquiped = curItemObj.equiped;
                        const curEquipmentEffect = curItemObj.effect;
                        const equipedEquipmentBase = 物品类别相同的已装备道具.map(obj=>{return obj.base});
                        const equipedEquipmentEquiped = 物品类别相同的已装备道具.map(obj=>{return obj.equiped});
                        const equipedEquipmentEffect = 物品类别相同的已装备道具.map(obj=>{return obj.effect});
                        const newTableElement = document.createElement('table');
                        newTableElement.className = 'content_table';
                        const newTableBody = document.createElement('tbody');

                        fillTable (newTableBody, equipAttrsTableRowArr, curEquipmentBase, equipedEquipmentBase);
                        const titleMain = document.createElement('h2');
                        titleMain.innerText = '物品信息';
                        newTableElement.appendChild(newTableBody);

                        const titleEquiped = document.createElement('h2');
                        titleEquiped.innerText = '作用在物品持有者上的效果';
                        const newTableElementEquiped = document.createElement('table');
                        newTableElementEquiped.className = 'content_table';
                        const newTableBodyEquiped = document.createElement('tbody');
                        fillTable (newTableBodyEquiped, equipAttrEffects, curEquipmentEquiped, equipedEquipmentEquiped);
                        newTableElementEquiped.appendChild(newTableBodyEquiped);

                        const titleEffect = document.createElement('h2');
                        titleEffect.innerText = '作用在被此物品影响的目标上的效果';
                        const newTableElementEffect = document.createElement('table');
                        newTableElementEffect.className = 'content_table';
                        const newTableBodyEffect = document.createElement('tbody');
                        fillTable (newTableBodyEffect, equipAttrEffects, curEquipmentEffect, equipedEquipmentEffect);
                        newTableElementEffect.appendChild(newTableBodyEffect);
                        content.innerText = '';
                        content.appendChild(titleMain);
                        content.appendChild(newTableElement);
                        content.appendChild(titleEquiped);
                        content.appendChild(newTableElementEquiped);
                        content.appendChild(titleEffect);
                        content.appendChild(newTableElementEffect);

                    });
                }
            }).finally(() => loading = false);

        });
        compareHeaderItem.appendChild(btn);
        child.insertBefore(compareHeaderItem, item);
    });

    /**
     * 创建非模态对话框
     * @param {string} content - 对话框显示内容
     */
    function createNonModalDialog(content) {
        // 创建 <dialog> 元素
        const dialog = document.createElement("dialog");

        // 设置内容
        dialog.innerHTML = `
            <div style="padding: 20px; border-radius: 5px;">
                <p>${content}</p>
                <button id="closeDialog">关闭</button>
            </div>
        `;

        // 关闭按钮事件
        dialog.querySelector("#closeDialog").addEventListener("click", () => {
            dialog.close(); // 关闭对话框
            dialog.remove(); // 移除元素
        });

        // 添加到页面
        document.body.appendChild(dialog);

        // 显示非模态对话框
        dialog.showModal();
    }

    /**
     * 从HTML字符串中提取链接信息
     * @param {string} htmlString - 包含链接的HTML字符串
     * @returns {Array<{href: string, value: string}>} 链接信息数组
     */
    function extractLinks(htmlString) {
        const matches = [...htmlString.matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)];
        return matches.map(match => ({
            href: match[1],
            value: match[2]
        }));
    }

    /**
     * 填充对比表格
     * @param {HTMLElement} tableBody - 表格body元素
     * @param {string[]} rowNameArr - 行名称数组
     * @param {HTMLElement[]} col1Data - 第一列数据
     * @param {HTMLElement[][]} col2Datas - 其他列数据
     */
    function fillTable (tableBody, rowNameArr, col1Data, col2Datas) {
        rowNameArr.forEach((rowName, index)=>{
            const newRow = document.createElement('tr');
            const classNum = index % 2;
            newRow.className = 'row' + classNum;
            const newRowName = document.createElement('td');
            newRowName.innerText = rowName;
            newRow.appendChild(newRowName);
            if (col1Data[index]) {
                newRow.appendChild(col1Data[index]);
            } else {
                const newRowValue = document.createElement('td');
                newRowValue.innerText = '-';
                newRow.appendChild(newRowValue);
            }
            col2Datas.forEach(col2Data=>{
                if (col2Data[index]) {
                    newRow.appendChild(col2Data[index]);
                } else {
                    const newRowValue = document.createElement('td');
                    newRowValue.innerText = '-';
                    newRow.appendChild(newRowValue);
                }
            });
            tableBody.appendChild(newRow);
        });
    }

    /**
     * 获取隐藏的表单信息
     * @param {Document} Document - 文档对象
     * @param {string} InfoName - 信息名称
     * @param {string} DefaultValue - 默认值
     * @returns {string} 信息值
     */
    function getHiddenInfo(Document, InfoName, DefaultValue) {
        const allInputs = Document.getElementsByTagName("input");
        for (let i = 0; i < allInputs.length; ++i) {
            if (allInputs[i].getAttribute("type") === "hidden" && 
                allInputs[i].name === InfoName) {
                return allInputs[i].value;
            }
        }
        return DefaultValue;
    }

    /**
     * 获取装备类型
     * @param {string} itemId - 装备ID
     * @returns {Promise<string>} 装备类型
     */
    function getEquipmentType(itemId) {
        return new Promise(resolve => {
            const XmlHttp = new XMLHttpRequest();
            XmlHttp.timeout = 3000; // 设置超时时间为3秒
            XmlHttp.onreadystatechange = function ()
            {
                try	{
                    if (XmlHttp.readyState == 4 && XmlHttp.status == 200)
                    {
                        const Page = document.createElement("div");
                        Page.innerHTML = XmlHttp.responseText;
                        const foundElement = Array.from(Page.querySelectorAll('table.content_table td')).find(el => el.textContent.includes('装备位置'));
                        const itemType = foundElement.nextElementSibling.innerText.trim();
                        resolve(itemType);
                    }
                }
                catch (e) {alert("XMLHttpRequest.onreadystatechange(): " + e);}
            };
            XmlHttp.ontimeout = function () {
                alert("请求超时，请稍后重试！");
            };
            const URL = location.protocol + "//" + location.host + "/wod/spiel/hero/item.php" +
                "?item_instance_id=" + itemId;

            XmlHttp.open("GET", URL, true);
            XmlHttp.send(null);
        });
    }

    /**
     * 获取角色当前装备信息
     * @param {string} heroID - 角色ID
     * @param {string} playerID - 玩家ID 
     */
    function GetEquipment(heroID, playerID) {
        const XmlHttp = new XMLHttpRequest();
        XmlHttp.timeout = 3000; // 设置超时时间为3秒
        XmlHttp.onreadystatechange = function ()
        {
            try	{
                if (XmlHttp.readyState == 4 && XmlHttp.status == 200)
                {
                    const Page = document.createElement("div");
                    Page.innerHTML = XmlHttp.responseText;
                    EquipmentsObj = ReadEquipment(Page, heroID, playerID);
                    // GetItem(0, heroID, playerID);
                }
            }
            catch (e) {alert("XMLHttpRequest.onreadystatechange(): " + e);}
        };
        XmlHttp.ontimeout = function () {
            alert("请求超时，请稍后重试！");
        };
        const URL = location.protocol + "//" + location.host + "/wod/spiel/hero/items.php" +
            "?view=gear" +
            "&session_hero_id=" + heroID;

        // SetStatus(Contents.Fetch_Equipment, 0, 0);

        XmlHttp.open("GET", URL, true);
        XmlHttp.send(null);
    }

    /**
     * 解析装备信息
     * @param {Document} Document - 文档对象
     * @param {string} heroID - 角色ID
     * @param {string} playerID - 玩家ID
     * @returns {Object} 装备信息对象
     */
    function ReadEquipment(Document, heroID, playerID) {
        const allForms = Document.getElementsByTagName("form");
        const equipmentsObj = {};

        for (let i = 0; i < allForms.length; ++i) {
            if (allForms[i].getAttribute("name") === "the_form") {
                const allTDs = allForms[i].getElementsByTagName("td");
                let lastEquipmentPartName = '';

                for (let k = 0; k < allTDs.length; ++k) {
                    const allOptions = allTDs[k].getElementsByTagName("option");
                    const allTable = allTDs[k].getElementsByTagName("table");
                    const className = allTDs[k].className;

                    if (className === 'texttoken') {
                        equipmentsObj[allTDs[k].innerHTML] = {};
                        lastEquipmentPartName = allTDs[k].innerHTML;
                    }
                    if (allTable.length > 0 || allOptions.length === 0) continue;

                    const lastEquipment = {};

                    for (let j = 0; j < allOptions.length; ++j) {
                        const option = allOptions[j];
                        const tmpId = option.getAttribute("value") * -1;

                        if (tmpId > 0) lastEquipment.id = tmpId;
                        if (tmpId === 0) {
                            lastEquipment.name = option.innerHTML.replace(/\([0-9]*\/[0-9]*\)/g, "").replace(/^!! /, "");
                        }

                        for (const attr of option.attributes) {
                            if (attr.name !== "value") {
                                lastEquipment[attr.name] = attr.value;
                            }
                        }
                    }

                    if (Object.keys(lastEquipment).length > 0) {
                        equipmentsObj[lastEquipmentPartName] = lastEquipment;
                    }
                }
            }
        }
        return equipmentsObj;
    }

    /**
     * 获取装备属性表格数据
     * @param {string} itemId - 装备ID
     * @returns {Promise<{base: HTMLElement[], equiped: HTMLElement[], effect: HTMLElement[]}>} 装备属性数据
     */
    function getEquipmentAttrsTable(itemId) {
        return new Promise(resolve => {
            const XmlHttp = new XMLHttpRequest();
            XmlHttp.timeout = 3000; // 设置超时时间为3秒
            XmlHttp.onreadystatechange = function ()
            {
                try	{
                    if (XmlHttp.readyState == 4 && XmlHttp.status == 200)
                    {
                        const curEquipPageDom = document.createElement("div");
                        curEquipPageDom.innerHTML = XmlHttp.responseText;

                        const tableItemElements = [];
                        const tableItems = Array.from(curEquipPageDom.querySelectorAll('table.content_table td'));
                        equipAttrsTableRowArr.forEach(equipAttrsTableRowName=>{
                            const curTableItem = tableItems.find(td=>{
                                const curTableItemName = td.innerText.trim().replace(/[\r|\n|\t]/g, "");
                                return curTableItemName === equipAttrsTableRowName;
                            });
                            if (curTableItem) {
                                tableItemElements.push(curTableItem.nextElementSibling);
                            } else {
                                const newTableItmeElement = document.createElement('td');
                                newTableItmeElement.innerText = '-';
                                if (equipAttrsTableRowName === '物品名称') {
                                    newTableItmeElement.innerText = curEquipPageDom.querySelector('h1').innerText;
                                }
                                tableItemElements.push(newTableItmeElement);
                            }
                        });
                        const equipedTableItemElements = [];
                        const effectTableItemElements = [];
                        const equipedEelements = [];
                        const effectEelements = [];
                        const linkDiv = curEquipPageDom.querySelector('#link');
                        let flag = '';
                        Array.from(linkDiv.children).forEach(child=>{
                            if (child.innerText === '作用在物品持有者上的效果') {
                                flag = 'equiped';
                            } else if (child.innerText === '作用在被此物品影响的目标上的效果') {
                                flag = 'effect';
                            }
                            if (flag === 'equiped') {
                                equipedEelements.push(child);
                            } else if (flag === 'effect') {
                                effectEelements.push(child);
                            }
                        });
                        equipAttrEffects.forEach(equipAttrEffect=>{
                            const curEffectElement = effectEelements.find(h3=>{return h3.innerText.trim().replace(/[\r|\n|\t]/g, "") === equipAttrEffect;});
                            const curEquipedElement = equipedEelements.find(h3=>{return h3.innerText.trim().replace(/[\r|\n|\t]/g, "") === equipAttrEffect;});

                            const newTableItmeElement = document.createElement('td');
                            if (curEquipedElement) {
                                if (curEquipedElement.nextElementSibling.className === 'content_table') {
                                    newTableItmeElement.appendChild(curEquipedElement.nextElementSibling);
                                } else {
                                    newTableItmeElement.appendChild(curEquipedElement.nextElementSibling.nextElementSibling);
                                }
                            } else {
                                newTableItmeElement.innerText = '-';
                                if (equipAttrEffect === '物品名称') {
                                    newTableItmeElement.innerText = curEquipPageDom.querySelector('h1').innerText;
                                }
                            }
                            equipedTableItemElements.push(newTableItmeElement);

                            const newTableItmeElementEffect = document.createElement('td');
                            if (curEffectElement) {
                                if (curEffectElement.nextElementSibling.className === 'content_table') {
                                    newTableItmeElementEffect.appendChild(curEffectElement.nextElementSibling);
                                } else {
                                    newTableItmeElementEffect.appendChild(curEffectElement.nextElementSibling.nextElementSibling);
                                }
                            } else {
                                newTableItmeElementEffect.innerText = '-';
                                if (equipAttrEffect === '物品名称') {
                                    newTableItmeElementEffect.innerText = curEquipPageDom.querySelector('h1').innerText;
                                }
                            }
                            effectTableItemElements.push(newTableItmeElementEffect);
                        });


                        resolve({
                            base: tableItemElements,
                            equiped: equipedTableItemElements,
                            effect: effectTableItemElements,
                        });
                    }
                }
                catch (e) {alert("XMLHttpRequest.onreadystatechange(): " + e);}
            };
            XmlHttp.ontimeout = function () {
                alert("请求超时，请稍后重试！");
            };
            const URL = location.protocol + "//" + location.host + "/wod/spiel/hero/item.php" +
                "?item_instance_id=" + itemId;

            XmlHttp.open("GET", URL, true);
            XmlHttp.send(null);
        });
    }
})();