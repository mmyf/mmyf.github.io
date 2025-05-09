// ==UserScript==
// @name         WOD equipment compare
// @namespace    http://tampermonkey.net/
// @version      2025-03-02
// @description  用这个可以为你的仓库添加对比按钮，用来和当前身上穿戴的装备做对比，不支持非中文网址，不支持老版本浏览器，不支持徽章、口袋物品对比
// @author       myf
// @icon         https://www.google.com/s2/favicons?sz=64&domain=world-of-dungeons.org
// @grant        none
// @include         *://*.world-of-dungeons.org/wod/spiel/hero/items.php*
// @include         *://*.world-of-dungeons.org/wod/spiel/trade/trade.php*
// ==/UserScript==
/*
* 添加装备对比功能
*/
(function() {
    'use strict';
    var EquipmentsObj = {};
    var nHeroId = getHiddenInfo(document, "session_hero_id", "");
	var nPlayerId = getHiddenInfo(document, "session_player_id", "");
    GetEquipment(nHeroId, nPlayerId);
    var header = document.querySelector('tr.header');
    var itemName = header.children[2];
    var compareHeader = document.createElement('th');
    compareHeader.textContent = '对比';
    header.insertBefore(compareHeader, itemName);
    var tbody = document.querySelector('table.content_table tbody');
    var tbodyChildren = Array.from(tbody.children);
    tbodyChildren.forEach(child=>{
        var item = child.children[2];
        var compareHeaderItem = document.createElement('td');
        var btn = document.createElement('div');
        btn.textContent = '对比';
        btn.addEventListener('click', (ev)=>{
            ev.stopPropagation();
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
                    alert('勋章物品不参与对比！');
                    return;
                } else if (curItemType === '口袋') {
                    alert('口袋物品不参与对比！');
                    return;
                }
                const equipedItemIds = [];
                let hasEquiped = false;
                if (curItemType instanceof Array) {
                    curItemType.forEach(type=>{
                        const equipedItemId = EquipmentsObj[type] || '';
                        if (equipedItemId) {
                            hasEquiped = true;
                            equipedItemIds.push(equipedItemId);
                        }
                    });
                } else {
                    const equipedItemId = EquipmentsObj[curItemType] || '';
                    if (equipedItemId) {
                        hasEquiped = true;
                        equipedItemIds.push(equipedItemId);
                    }
                }
                if (!hasEquiped) {
                    alert('相同装备位置没有物品被装备！');
                    return;
                }
                var div = document.createElement('div');
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
                var content = document.createElement('div');
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
                var body = document.querySelector('body');
                body.appendChild(div);
                if (equipedItemIds.length) {
                    const curItemPromise = getEquipmentAttrsTable(curItemId);
                    const equipedItemPromises = [];
                    equipedItemIds.forEach(equipedItemId=>{
                        equipedItemPromises.push(getEquipmentAttrsTable(equipedItemId));
                    });
                    Promise.all([curItemPromise, ...equipedItemPromises]).then(([curItemObj, ...equipedItemObjs])=>{

                        // console.log('curItemTable, equipedItemTable',curItemObj, equipedItemObjs);
                        const curEquipmentBase = curItemObj.base;
                        const curEquipmentEquiped = curItemObj.equiped;
                        const curEquipmentEffect = curItemObj.effect;
                        const equipedEquipmentBase = equipedItemObjs.map(obj=>{return obj.base});
                        const equipedEquipmentEquiped = equipedItemObjs.map(obj=>{return obj.equiped});
                        const equipedEquipmentEffect = equipedItemObjs.map(obj=>{return obj.effect});
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
            });

        });
        compareHeaderItem.appendChild(btn);
        child.insertBefore(compareHeaderItem, item);
    });
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

    function getHiddenInfo(Document, InfoName, DefaultValue)
    {
        var allInputs = Document.getElementsByTagName("input");
        for (var i = 0; i < allInputs.length; ++i)
        {
            if (allInputs[i].getAttribute("type") == "hidden" &&
                allInputs[i].name == InfoName)
                return allInputs[i].value;
        }
        return DefaultValue;
    }
    function getEquipmentType (itemId) {
        var promise = new Promise(resolve=>{
            var XmlHttp = new XMLHttpRequest();
            XmlHttp.onreadystatechange = function ()
            {
                try	{
                    if (XmlHttp.readyState == 4 && XmlHttp.status == 200)
                    {
                        var Page = document.createElement("div");
                        Page.innerHTML = XmlHttp.responseText;
                        var foundElement = Array.from(Page.querySelectorAll('table.content_table td')).find(el => el.textContent.includes('装备位置'));
                        var itemType = foundElement.nextElementSibling.innerText.trim();
                        resolve(itemType);
                    }
                }
                catch (e) {alert("XMLHttpRequest.onreadystatechange(): " + e);}
            };

            var URL = location.protocol + "//" + location.host + "/wod/spiel/hero/item.php" +
                "?item_instance_id=" + itemId;

            XmlHttp.open("GET", URL, true);
            XmlHttp.send(null);
        });
        return promise;
    }

    function GetEquipment(heroID, playerID)
    {
        var XmlHttp = new XMLHttpRequest();

        XmlHttp.onreadystatechange = function ()
        {
            try	{
                if (XmlHttp.readyState == 4 && XmlHttp.status == 200)
                {
                    var Page = document.createElement("div");
                    Page.innerHTML = XmlHttp.responseText;
                    EquipmentsObj = ReadEquipment(Page, heroID, playerID);
                    // GetItem(0, heroID, playerID);
                }
            }
            catch (e) {alert("XMLHttpRequest.onreadystatechange(): " + e);}
        };

        var URL = location.protocol + "//" + location.host + "/wod/spiel/hero/items.php" +
            "?view=gear" +
            "&session_hero_id=" + heroID;

        // SetStatus(Contents.Fetch_Equipment, 0, 0);

        XmlHttp.open("GET", URL, true);
        XmlHttp.send(null);
    }

    function ReadEquipment(Document, heroID, playerID)
    {
        var allForms = Document.getElementsByTagName("form");

        for (var i = 0; i < allForms.length; ++i)
        {
            if (allForms[i].getAttribute("name") == "the_form") {
                var allTDs = allForms[i].getElementsByTagName("td");
                var equipmentsObj = {};
                var lastEquipmentPartName = '';
                for (var k = 0; k < allTDs.length; ++k) {
                    var allOptions = allTDs[k].getElementsByTagName("option");
                    var allTable = allTDs[k].getElementsByTagName("table");
                    var className = allTDs[k].className;
                    if (className === 'texttoken') {
                        equipmentsObj[allTDs[k].innerHTML] = '';
                        lastEquipmentPartName = allTDs[k].innerHTML;
                    }
                    if (allTable.length > 0 || allOptions.length == 0) continue;
                    var lastID = undefined;
                    var lastName = undefined;
                    for (var j = 0; j < allOptions.length; ++j)
                    {
                        var tmpId = allOptions[j].getAttribute("value") * -1;
                        if (tmpId > 0) lastID = tmpId;
                        if (tmpId == 0) {
                            var tmpName = allOptions[j].innerHTML;
                            if (tmpName.charAt(tmpName.length - 1) == "!") tmpName = tmpName.substr(0, tmpName.length - 1);
                            lastName = tmpName;
                        }
                    }

                    if (lastID != undefined && lastName != undefined) {
                        if (/[^\(]*\([0-9]*\/[0-9]*\)/.test(lastName)) {
                            lastName = lastName.replace(/\([0-9]*\/[0-9]*\)/g, "");
                        }
                        if (lastName.startsWith("!! ")) lastName = lastName.substring(3);
                        equipmentsObj[lastEquipmentPartName] = lastID;
                    }
                }
            }
        }
        return equipmentsObj;
    }
    const equipAttrsTableRowArr = [
        '物品名称', '特性', '所有者', '职业限制', '种族限定', '装备要求', '耐久度',
        'NPC价/全新时NPC价', '唯一性', '剩余使用次数', '每地城可使用次数', '每战斗可使用次数',
        '效果等级', '需配合何物使用', '装备位置', '物品类别(及修正值)', '可以使用该物品的技能(及修正值)',
        '设计者'
    ];
    const equipAttrParts = [
        '作用在物品持有者上的效果',
        '作用在被此物品影响的目标上的效果'
    ];
    const equipAttrEffects = [
        '物品名称', '攻击奖励', '伤害奖励', '防御奖励', '护甲奖励', '属性奖励', '对技能等级的奖励', '对技能效果的奖励',
    ];
    function getEquipmentAttrsTable (itemId) {
        var promise = new Promise(resolve=>{
            var XmlHttp = new XMLHttpRequest();
            XmlHttp.onreadystatechange = function ()
            {
                try	{
                    if (XmlHttp.readyState == 4 && XmlHttp.status == 200)
                    {
                        var curEquipPageDom = document.createElement("div");
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

            var URL = location.protocol + "//" + location.host + "/wod/spiel/hero/item.php" +
                "?item_instance_id=" + itemId;

            XmlHttp.open("GET", URL, true);
            XmlHttp.send(null);
        });
        return promise;
    }
})();