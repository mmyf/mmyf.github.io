// ==UserScript==
// @name         WoD仓库耗材一键入库
// @namespace    http://tampermonkey.net/
// @version      1.0
// @version      1.1 修改逻辑，极大提升处理速度
// @description  WoD仓库耗材一键入库
// @author       Your Name
// @match        *://*/wod/spiel/hero/items.php*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_log
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    /**
     * 创建一键入库按钮
     */
    function createQuickStoreButton() {
        const applyButton = document.querySelector('input[name="ok"][value="应用改动"]');
        if (!applyButton) return;

        const quickStoreButton = document.createElement('button');
        quickStoreButton.textContent = '耗材一键入库';
        quickStoreButton.className = 'quick-action-btn';
        quickStoreButton.style.marginLeft = '10px';
        quickStoreButton.addEventListener('click', function(e) {
            e.preventDefault();
            storeConsumableItems();
        });

        applyButton.insertAdjacentElement('afterend', quickStoreButton);
    }

    /**
     * 批量入库耗材
     */
    async function storeConsumableItems() {
        const statusDiv = document.createElement('div');
        statusDiv.style.position = 'fixed';
        statusDiv.style.top = '50%';
        statusDiv.style.left = '50%';
        statusDiv.style.transform = 'translate(-50%, -50%)';
        statusDiv.style.padding = '20px';
        statusDiv.style.background = 'rgba(0,0,0,0.8)';
        statusDiv.style.color = 'white';
        statusDiv.style.borderRadius = '5px';
        statusDiv.style.zIndex = '10000';
        document.body.appendChild(statusDiv);

        statusDiv.textContent = '正在扫描物品...';

        try {
            // 只获取第一个 tbody 下的所有 tr
            const tbody = document.querySelector('table.content_table tbody');
            if (!tbody) {
                throw new Error('未找到物品表格');
            }
            
            const items = tbody.querySelectorAll('tr');
            let consumableCount = 0;
            
            for (const row of items) {
                // 跳过表头和分组行
                if (row.classList.contains('Titel') || 
                    row.querySelector('th') || 
                    row.classList.contains('item_group')) {
                    continue;
                }

                // 获取物品名称的 td 元素
                const itemNameTd = row.querySelector('td a[href*="item.php"]')?.parentElement;
                if (!itemNameTd) continue;

                // 判断物品名称后是否有 (x/y) 格式
                const textContent = itemNameTd.textContent.trim();
                const hasUsagePattern = /\(\d+\/\d+\)$/.test(textContent);
                if (!hasUsagePattern) continue;

                // 设置位置为团队仓库
                const select = row.querySelector('select[name^="EquipItem["]');
                const checkbox = row.querySelector('input[type="checkbox"]');
                
                if (select && checkbox) {
                    // 寻找团队仓库选项
                    const option = Array.from(select.options).find(opt => 
                        opt.value === 'go_group_2' || opt.textContent.includes('团队仓库')
                    );

                    if (option) {
                        select.value = option.value;
                        checkbox.checked = true;
                        consumableCount++;
                    }
                }

                statusDiv.textContent = `已处理 ${consumableCount} 个耗材...`;
            }

            if (consumableCount > 0) {
                statusDiv.innerHTML = `<div>找到 ${consumableCount} 个耗材并设置到团队仓库</div>`;

                // 3秒后自动隐藏提示
                setTimeout(() => {
                    statusDiv.remove();
                }, 3000);

                // 自动点击"应用改动"按钮
                const applyButton = document.querySelector('input[name="ok"][value="应用改动"]');
                if (applyButton) {
                    applyButton.click();
                }
            } else {
                statusDiv.textContent = '未找到需要入库的耗材';
                setTimeout(() => {
                    statusDiv.remove();
                }, 2000);
            }

        } catch (error) {
            console.error('处理耗材时出错:', error);
            statusDiv.textContent = '处理过程中出错，请重试';
            setTimeout(() => {
                statusDiv.remove();
            }, 2000);
        }
    }

    // 初始化
    function initialize() {
        if (window.location.href.includes('items.php')) {
            createQuickStoreButton();
        }
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
