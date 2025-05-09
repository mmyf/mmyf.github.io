// ==UserScript==
// @name         WoD仓库管理
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  仓库管理：将仓库物品快速上架到市场，快速整理物品（设置物品位置），支持多套整理方案
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

    // 添加样式
    GM_addStyle(`
        .market-config-panel {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #f5f5f5;
            border: 2px solid #333;
            padding: 20px;
            z-index: 9999;
            width: 80%;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            display: none;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
        .market-config-close {
            position: absolute;
            right: 10px;
            top: 10px;
            cursor: pointer;
            font-weight: bold;
            font-size: 18px;
        }
        .market-config-content {
            margin-top: 10px;
            max-height: 300px; /* Fixed height for config items */
            overflow-y: auto; /* Enable scrolling */
            border: 1px solid #ddd;
            padding: 10px;
            background-color: #fff;
            border-radius: 3px;
        }
        .config-item {
            display: flex;
            margin-bottom: 10px;
            align-items: center;
        }
        .config-item input, .config-item select {
            margin-right: 10px;
        }
        .config-item button {
            margin-left: 10px;
        }
        .action-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }
        .action-buttons button {
            padding: 5px 10px;
            cursor: pointer;
        }
        .quick-sell-button {
            background-color: #f0f0f0;
            color: #333;
            border: 1px solid #ccc;
            padding: 5px 10px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 14px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 3px;
        }
        .quick-sell-button:hover {
            background-color: #e0e0e0;
        }
        .config-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 10px;
        }
        .config-button {
            position: fixed;
            top: 10px;
            right: 10px;
            background-color: #f0f0f0;
            color: #333;
            border: 1px solid #ccc;
            padding: 8px 12px;
            text-align: center;
            text-decoration: none;
            font-size: 14px;
            cursor: pointer;
            border-radius: 3px;
            z-index: 9998;
        }
        .config-button:hover {
            background-color: #e0e0e0;
        }

        /* 新增样式 */
        .item-search {
            width: 100%;
            padding: 8px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 3px;
            font-size: 14px;
        }

        .item-suggestions {
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid #ddd;
            display: none;
            position: absolute;
            background: white;
            width: 50%;
            z-index: 10000;
        }

        .item-suggestion {
            padding: 8px;
            cursor: pointer;
        }

        .item-suggestion:hover {
            background-color: #f0f0f0;
        }

        .config-column {
            min-width: 120px;
        }

        .quick-config-input {
            width: 60px;
            padding: 2px 5px;
            text-align: center;
        }

        .save-price-button {
            background-color: #f0f0f0;
            color: #333;
            border: 1px solid #ccc;
            padding: 3px 6px;
            margin-left: 5px;
            cursor: pointer;
            border-radius: 2px;
            font-size: 12px;
        }

        .save-price-button:hover {
            background-color: #e0e0e0;
        }

        .search-wrapper {
            position: relative;
            margin-bottom: 20px;
        }

        /* 新增行内价格配置样式 */
        .price-config-row {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        }

        .price-input {
            width: 60px;
            padding: 3px 5px;
            margin-right: 5px;
            text-align: center;
            border: 1px solid #ccc;
            border-radius: 3px;
        }

        .price-save-btn {
            padding: 3px 8px;
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
        }

        .price-save-btn:hover {
            background-color: #e0e0e0;
        }

        .sell-btn {
            width: 100%;
            padding: 5px;
            margin-top: 3px;
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 3px;
            cursor: pointer;
        }

        .sell-btn:hover {
            background-color: #e0e0e0;
        }

        .operation-column {
            min-width: 120px;
        }

        /* 选项卡样式 */
        .tab-container {
            display: flex;
            border-bottom: 1px solid #ccc;
            margin-bottom: 15px;
        }
        .tab {
            padding: 8px 15px;
            cursor: pointer;
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            border-bottom: none;
            margin-right: 5px;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
        }
        .tab.active {
            background-color: #fff;
            border-bottom: 1px solid #fff;
            margin-bottom: -1px;
            font-weight: bold;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }

        /* 物品整理样式 */
        .org-config-item {
            display: flex;
            margin-bottom: 10px;
            align-items: center;
            justify-content: space-between;
        }
        .org-config-item input {
            width: 60%;
            padding: 5px;
        }
        .org-config-item select {
            width: 25%;
            padding: 5px;
        }
        .btn-organize {
            padding: 5px 10px;
            margin-left: 5px;
            cursor: pointer;
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 3px;
        }
        .btn-organize:hover {
            background-color: #e0e0e0;
        }
        .location-stats {
            font-size: 12px;
            color: #666;
            margin-top: 10px;
            padding: 10px;
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 3px;
        }

        /* 配置单样式 */
        .profile-manager {
            display: flex;
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 5px;
            align-items: center;
        }
        .profile-selector {
            flex-grow: 1;
            padding: 5px;
            margin-right: 10px;
            border: 1px solid #ccc;
            border-radius: 3px;
        }
        .profile-button {
            padding: 5px 8px;
            margin-left: 5px;
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
        }
        .profile-button:hover {
            background-color: #e0e0e0;
        }
        .profile-name-dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border: 2px solid #333;
            border-radius: 5px;
            box-shadow: 0 0 15px rgba(0,0,0,0.3);
            z-index: 10001;
            width: 300px;
        }
        .profile-name-dialog input {
            width: 100%;
            margin-bottom: 15px;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 3px;
        }
        .profile-name-dialog-buttons {
            display: flex;
            justify-content: flex-end;
        }
        .profile-name-dialog-buttons button {
            margin-left: 10px;
            padding: 5px 15px;
            border: 1px solid #ccc;
            border-radius: 3px;
            cursor: pointer;
        }
        .profile-name-dialog-buttons .confirm-button {
            background-color: #4CAF50;
            color: white;
            border-color: #43A047;
        }
        .quick-actions {
            display: inline-flex;
            align-items: center;
            margin-left: 10px;
            gap: 5px;
        }
        
        .quick-profile-select {
            padding: 5px;
            min-width: 150px;
            border: 1px solid #ccc;
            border-radius: 3px;
        }
        
        .quick-action-btn {
            padding: 5px 10px;
            border: 1px solid #ccc;
            border-radius: 3px;
            cursor: pointer;
            background-color: #f0f0f0;
        }
        
        .quick-action-btn:hover {
            background-color: #e0e0e0;
        }
    `);

    // 存储和获取物品配置
    let itemConfigs = GM_getValue('itemConfigs', {});

    // 新的整理配置数据结构
    let organizeProfiles = GM_getValue('organizeProfiles', {
        activeProfileId: 'default',
        profiles: {
            default: {
                name: '默认配置',
                items: []
            }
        }
    });

    // 存储物品位置配置 - 兼容旧版本
    let itemLocationConfigs = GM_getValue('itemLocationConfigs', []);
    
    // 如果有旧数据，迁移到新格式
    if (itemLocationConfigs.length > 0 && (!organizeProfiles.profiles || !organizeProfiles.profiles.default || !organizeProfiles.profiles.default.items)) {
        organizeProfiles = {
            activeProfileId: 'default',
            profiles: {
                default: {
                    name: '默认配置',
                    items: itemLocationConfigs
                }
            }
        };
        GM_setValue('organizeProfiles', organizeProfiles);
        log('已将旧的整理配置数据迁移到新格式');
    }

    // 存储当前页面的物品列表
    let currentPageItems = [];

    // 调试日志函数
    function log(message) {
        GM_log('[WoD仓库管理] ' + message);
    }

    log('脚本已加载');

    // 创建配置按钮
    function createConfigButton() {
        log('创建配置按钮');
        // 查找"应用改动"按钮
        const applyButton = document.querySelector('input[name="ok"][value="应用改动"]');

        if (applyButton) {
            log('找到"应用改动"按钮，在其后添加配置按钮');

            // 创建容器
            const container = document.createElement('div');
            container.style.display = 'inline-flex';
            container.style.alignItems = 'center';
            container.style.marginLeft = '10px';

            // 创建配置按钮
            const configButton = document.createElement('button');
            configButton.className = 'quick-sell-button'; // 使用已有的样式
            configButton.textContent = '快速上架配置';
            configButton.style.marginLeft = '10px'; // 添加一些间距
            configButton.addEventListener('click', function (e) {
                e.preventDefault(); // 防止表单提交
                showConfigPanel();
            });

            // 将按钮插入到"应用改动"按钮后面
            // applyButton.insertAdjacentElement('afterend', configButton);
            // log('配置按钮已添加到"应用改动"按钮后面');
            // 创建快速操作组
            const quickActions = document.createElement('div');
            quickActions.className = 'quick-actions';

            // 创建配置单选择器
            const profileSelect = document.createElement('select');
            profileSelect.className = 'quick-profile-select';
            // 填充配置单选项
            Object.keys(organizeProfiles.profiles).forEach(profileId => {
                const profile = organizeProfiles.profiles[profileId];
                const option = document.createElement('option');
                option.value = profileId;
                option.textContent = profile.name;
                profileSelect.appendChild(option);
            });

            // 创建快速上架按钮
            // const quickSellBtn = document.createElement('button');
            // quickSellBtn.className = 'quick-action-btn';
            // quickSellBtn.textContent = '一键上架';
            // quickSellBtn.addEventListener('click', function(e) {
            //     e.preventDefault();
            //     const profileId = profileSelect.value;
            //     quickSellWithProfile(profileId);
            // });

            // 创建快速入库按钮
            const quickOrganizeBtn = document.createElement('button');
            quickOrganizeBtn.className = 'quick-action-btn';
            quickOrganizeBtn.textContent = '一键入库';
            quickOrganizeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const profileId = profileSelect.value;
                quickOrganizeWithProfile(profileId);
            });

            // 组装元素
            quickActions.appendChild(profileSelect);
            // quickActions.appendChild(quickSellBtn);
            quickActions.appendChild(quickOrganizeBtn);

            container.appendChild(configButton);
            container.appendChild(quickActions);

            applyButton.insertAdjacentElement('afterend', container);
            log('配置按钮和快速操作组已添加');
        
        } else {
            log('未找到"应用改动"按钮，添加到页面右上角');
            // 如果找不到"应用改动"按钮，回退到原来的实现方式
            // const configButton = document.createElement('button');
            // configButton.className = 'config-button';
            // configButton.textContent = '快速上架配置';
            // configButton.addEventListener('click', showConfigPanel);
            // document.body.appendChild(configButton);
            // log('配置按钮已添加到页面右上角');
        }
    }

    // 添加新函数:使用指定配置单执行一键上架
    function quickSellWithProfile(profileId) {
        if (!profileId || !organizeProfiles.profiles[profileId]) {
            alert('请选择有效的配置单');
            return;
        }
        batchSellConfiguredItems(profileId);
    }

    // 添加新函数:使用指定配置单执行一键入库
    function quickOrganizeWithProfile(profileId) {
        if (!profileId || !organizeProfiles.profiles[profileId]) {
            alert('请选择有效的配置单');
            return;
        }
        batchOrganizeItems(profileId);
    }

    // 创建配置界面
    function createConfigPanel() {
        log('创建配置面板');
        // 检查是否已存在面板
        let panel = document.getElementById('marketConfigPanel');
        if (panel) {
            log('配置面板已存在，将被移除');
            panel.remove();
        }

        panel = document.createElement('div');
        panel.className = 'market-config-panel';
        panel.id = 'marketConfigPanel';

        // 添加可拖动样式
        panel.style.cursor = 'move';
        panel.style.position = 'fixed';

        panel.innerHTML = `
            <div class="config-header" id="configDragHandle">
            <h2>仓库管理配置</h2>
            <span class="market-config-close" id="closeConfigPanel">&times;</span>
            </div>
            
            <!-- 全局过滤功能 -->
            <div style="margin-bottom: 15px; display: flex; align-items: center;">
                <label for="globalItemFilter" style="margin-right: 10px; font-weight: bold;">物品名称过滤:</label>
                <input type="text" id="globalItemFilter" placeholder="输入物品名称关键词" style="flex-grow: 1; padding: 5px;">
                <button id="clearGlobalFilter" style="margin-left: 5px; padding: 5px 8px;">清除</button>
            </div>
            
            <!-- 选项卡导航 -->
            <div class="tab-container">
            <div class="tab active" data-tab="market-tab">快速上架</div>
            <div class="tab" data-tab="organize-tab">物品整理</div>
            </div>
            
            <!-- 快速上架选项卡内容 -->
            <div class="tab-content active" id="market-tab">
            <div class="market-config-content" id="configContent">
                <!-- 配置项将在这里动态生成 -->
            </div>
            <div class="action-buttons">
                <button id="addConfigItem">添加配置项</button>
                <button id="importFromPage" style="background-color: #4a86e8; color: white;">从当前页面导入</button>
                <button id="importExportConfig">导入/导出配置</button>
                <button id="saveConfig">保存配置</button>
            </div>
            
            <!-- 快速维护区域 - 上架价格 -->
            <div style="margin-top: 15px; padding: 10px; background-color: #f5f5f5; border: 1px solid #ddd; border-radius: 5px;">
                <h3 style="margin-top: 0; border-bottom: 1px solid #ccc; padding-bottom: 5px;">快速维护</h3>
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="margin-right: 10px;">批量设置价格:</span>
                <input type="number" id="bulkPriceInput" min="1" style="width: 100px; padding: 5px;" placeholder="输入价格">
                <button id="applyBulkPrice" style="margin-left: 10px; padding: 5px 10px;">应用到所有物品</button>
                </div>
                <div style="font-size: 12px; color: #666;">
                注：对于耗材物品，这里设置的是单价，上架时会根据使用次数自动计算最终价格
                </div>
            </div>
            
            <div style="margin-top: 15px; text-align: center;">
                <button id="batchSellItems" style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                一键上架所有配置物品
                </button>
                <div id="batchSellStatus" style="margin-top: 10px; font-size: 14px;"></div>
            </div>
            </div>
            
            <!-- 物品整理选项卡内容 -->
            <div class="tab-content" id="organize-tab">
            <div class="profile-manager">
                <select id="profileSelector" class="profile-selector"></select>
                <button id="newProfileBtn" class="profile-button">新建配置</button>
                <button id="renameProfileBtn" class="profile-button">重命名</button>
                <button id="deleteProfileBtn" class="profile-button">删除</button>
            </div>
            
            <!-- 位置过滤功能 -->
            <div style="margin: 10px 0; padding: 8px; background-color: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 4px; display: flex; align-items: center;">
                <label style="margin-right: 10px; font-weight: bold;">按位置过滤:</label>
                <select id="locationFilter" style="flex-grow: 1; padding: 5px;">
                    <option value="">全部位置</option>
                    <option value="go_lager">仓库</option>
                    <option value="go_group">宝库</option>
                    <option value="go_group_2">团队仓库</option>
                    <option value="go_keller">贮藏室</option>
                    <option value="go_tasche">口袋</option>
                </select>
                <button id="clearLocationFilter" style="margin-left: 5px; padding: 5px 8px;">清除</button>
            </div>
            
            <div class="market-config-content" id="orgConfigContent">
                <!-- 物品整理配置将在这里动态生成 -->
            </div>
            <div class="action-buttons">
                <button id="addOrgConfigItem">添加整理配置</button>
                <button id="importOrgFromPage" style="background-color: #4a86e8; color: white;">从当前页面导入</button>
                <button id="saveOrgConfig">保存整理配置</button>
            </div>
            
            <!-- 快速维护区域 - 物品位置 -->
            <div style="margin-top: 15px; padding: 10px; background-color: #f5f5f5; border: 1px solid #ddd; border-radius: 5px;">
                <h3 style="margin-top: 0; border-bottom: 1px solid #ccc; padding-bottom: 5px;">快速维护</h3>
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="margin-right: 10px;">批量设置位置:</span>
                <select id="bulkLocationSelect" style="padding: 5px;">
                    <option value="">请选择位置</option>
                    <option value="go_lager">仓库</option>
                    <option value="go_group">宝库</option>
                    <option value="go_group_2">团队仓库</option>
                    <option value="go_keller">贮藏室</option>
                    <option value="go_tasche">口袋</option>
                </select>
                <button id="applyBulkLocation" style="margin-left: 10px; padding: 5px 10px;">应用到所有物品</button>
                </div>
            </div>
            
            <div style="margin-top: 15px; text-align: center;">
                <button id="batchOrganizeItems" style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                一键整理所有配置物品
                </button>
                <div id="organizeStatus" style="margin-top: 10px; font-size: 14px;"></div>
            </div>
            <div class="location-stats" id="locationStats">
                <!-- 物品位置统计信息将显示在这里 -->
            </div>
            </div>
            
            <div style="margin-top: 15px; display: none;" id="importExportArea">
            <div style="background-color: #f8f8f8; padding: 10px; border: 1px solid #ddd; margin-bottom: 10px; border-radius: 4px;">
                <h3 style="margin-top: 0; color: #333;">导入/导出说明</h3>
                <p><strong>导出配置：</strong>下方文本框显示了当前的配置数据，您可以全选（Ctrl+A）并复制（Ctrl+C）保存到其他地方。</p>
                <p><strong>导入配置：</strong>将之前导出的配置数据粘贴到下方文本框中，然后点击"确认导入"按钮。</p>
            </div>
            <textarea id="configTextarea" style="width: 100%; height: 150px; font-family: monospace;"></textarea>
            <div style="margin-top: 10px;">
                <button id="confirmImport">确认导入</button>
                <button id="cancelImportExport">取消</button>
            </div>
            </div>
        `;

        document.body.appendChild(panel);
        log('配置面板已添加到页面');

        // 实现拖拽功能
        makeDraggable(panel, document.getElementById('configDragHandle'));

        // 添加事件监听器
        document.getElementById('closeConfigPanel').addEventListener('click', () => {
            document.getElementById('marketConfigPanel').style.display = 'none';
        });

        // 添加全局物品名称过滤事件处理
        document.getElementById('globalItemFilter').addEventListener('input', function() {
            filterItemsByName(this.value);
        });
        
        document.getElementById('clearGlobalFilter').addEventListener('click', function() {
            document.getElementById('globalItemFilter').value = '';
            filterItemsByName('');
        });
        
        // 添加位置过滤事件处理
        document.getElementById('locationFilter').addEventListener('change', function() {
            filterItemsByLocation(this.value);
        });
        
        document.getElementById('clearLocationFilter').addEventListener('click', function() {
            document.getElementById('locationFilter').value = '';
            filterItemsByLocation('');
        });

        document.getElementById('addConfigItem').addEventListener('click', addConfigItem);
        document.getElementById('importExportConfig').addEventListener('click', showImportExportArea);
        document.getElementById('saveConfig').addEventListener('click', saveConfig);
        document.getElementById('confirmImport').addEventListener('click', importConfig);
        document.getElementById('cancelImportExport').addEventListener('click', hideImportExportArea);

        // 添加批量上架按钮事件
        document.getElementById('batchSellItems').addEventListener('click', function () {
            const statusDiv = document.getElementById('batchSellStatus');
            statusDiv.textContent = '准备批量上架物品...';
            statusDiv.style.color = 'blue';

            // 延迟执行，让状态显示出来
            setTimeout(() => {
                batchSellConfiguredItems();
            }, 100);
        });

        // 选项卡切换事件
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                // 移除所有选项卡的active类
                tabs.forEach(t => t.classList.remove('active'));
                // 给当前选项卡添加active类
                this.classList.add('active');

                // 隐藏所有内容
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });

                // 显示当前选项卡对应的内容
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');

                // 如果是物品整理选项卡，加载物品位置统计信息
                if (tabId === 'organize-tab') {
                    updateLocationStatistics();
                }
            });
        });

        // 物品整理选项卡的事件监听器
        document.getElementById('addOrgConfigItem').addEventListener('click', addOrganizeConfigItem);
        document.getElementById('saveOrgConfig').addEventListener('click', saveOrganizeConfig);
        document.getElementById('batchOrganizeItems').addEventListener('click', batchOrganizeItems);
        document.getElementById('importOrgFromPage').addEventListener('click', importOrganizeItemsFromPage);

        // 配置单相关事件监听器
        document.getElementById('profileSelector').addEventListener('change', switchProfile);
        document.getElementById('newProfileBtn').addEventListener('click', createNewProfile);
        document.getElementById('renameProfileBtn').addEventListener('click', renameProfile);
        document.getElementById('deleteProfileBtn').addEventListener('click', deleteProfile);

        // 添加新的快速维护功能事件监听器
        document.getElementById('applyBulkPrice').addEventListener('click', function() {
            const price = parseInt(document.getElementById('bulkPriceInput').value);
            bulkSetItemPrices(price);
        });

        document.getElementById('applyBulkLocation').addEventListener('click', function() {
            const location = document.getElementById('bulkLocationSelect').value;
            bulkSetItemLocations(location);
        });

        // 加载已存在的配置
        loadConfigItems();
        loadOrganizeConfigItems();

        // 初次加载物品位置统计
        updateLocationStatistics();

        // 添加新的事件监听器
        document.getElementById('importFromPage').addEventListener('click', importItemsFromCurrentPage);

        // 初始化配置单选择器
        initProfileSelector();
    }

    // 添加使元素可拖动的函数
    function makeDraggable(element, handle = element) {
        let offsetX = 0, offsetY = 0;
        let isDragging = false;

        // 鼠标按下时开始拖拽
        handle.addEventListener('mousedown', function (e) {
            // 如果点击的是关闭按钮，不触发拖拽
            if (e.target.id === 'closeConfigPanel') return;

            isDragging = true;

            // 计算鼠标指针在元素内的偏移量
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            // 添加一些视觉反馈
            element.style.opacity = '0.9';
            element.style.boxShadow = '0 0 15px rgba(0,0,0,0.6)';

            // 防止文本选择
            e.preventDefault();
        });

        // 鼠标移动时拖拽元素
        document.addEventListener('mousemove', function (e) {
            if (!isDragging) return;

            // 计算新位置
            element.style.left = (e.clientX - offsetX) + 'px';
            element.style.top = (e.clientY - offsetY) + 'px';

            // 移动时取消transform居中定位
            element.style.transform = 'none';
        });

        // 鼠标释放时停止拖拽
        document.addEventListener('mouseup', function () {
            if (!isDragging) return;

            isDragging = false;
            element.style.opacity = '1';
            element.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';

            // 确保面板不会被拖到屏幕外
            const rect = element.getBoundingClientRect();
            if (rect.left < 0) element.style.left = '0px';
            if (rect.top < 0) element.style.top = '0px';
            if (rect.right > window.innerWidth) element.style.left = (window.innerWidth - rect.width) + 'px';
            if (rect.bottom > window.innerHeight) element.style.top = (window.innerHeight - rect.height) + 'px';
        });
    }

    // 显示配置面板
    function showConfigPanel() {
        log('显示配置面板');
        const panel = document.getElementById('marketConfigPanel');
        if (!panel) {
            log('配置面板不存在，创建新的');
            createConfigPanel();
        } else {
            // 重新获取最新的物品配置数据
            itemConfigs = GM_getValue('itemConfigs', {});
            log(`从存储中重新加载了 ${Object.keys(itemConfigs).length} 个配置项`);

            // 重新加载配置项到面板
            loadConfigItems();
        }

        const configPanel = document.getElementById('marketConfigPanel');
        if (configPanel) {
            configPanel.style.display = 'block';
            log('配置面板已设置为显示');
        } else {
            log('错误：无法找到配置面板元素');
            alert('无法显示配置面板，请检查控制台日志');
        }
    }

    // 加载配置项
    function loadConfigItems() {
        log('加载配置项');
        const configContent = document.getElementById('configContent');
        if (!configContent) {
            log('错误：无法找到configContent元素');
            return;
        }

        configContent.innerHTML = '';

        log(`加载 ${Object.keys(itemConfigs).length} 个配置项`);
        Object.keys(itemConfigs).forEach(itemName => {
            const price = itemConfigs[itemName];
            addConfigItemToPanel(itemName, price);
        });

        // // 如果没有配置项，默认添加一个空的
        // if (Object.keys(itemConfigs).length === 0) {
        //     log('没有现有配置，添加空配置项');
        //     addConfigItem();
        // }
    }

    // 添加解析物品名称和使用次数的函数
    function parseItemNameAndUsage(fullItemName) {
        // 匹配形如 "小瓶冒泡的粉色液体 (4/15)" 的格式
        const match = fullItemName.match(/(.*?)\s*\((\d+)\/(\d+)\)$/);

        if (match) {
            return {
                baseName: match[1].trim(), // 基础物品名称
                remainingUses: parseInt(match[2]), // 剩余使用次数
                maxUses: parseInt(match[3]), // 最大使用次数
                isConsumable: true // 是耗材
            };
        }

        // 不是耗材，返回原名称
        return {
            baseName: fullItemName,
            remainingUses: 0,
            maxUses: 0,
            isConsumable: false
        };
    }

    // 计算最终价格
    function calculateFinalPrice(itemName, unitPrice) {
        const itemInfo = parseItemNameAndUsage(itemName);

        if (itemInfo.isConsumable && itemInfo.remainingUses > 0) {
            // 耗材按剩余次数计算价格
            return Math.round(unitPrice * itemInfo.remainingUses);
        }

        // 非耗材直接使用设置的价格
        return unitPrice;
    }

    // 添加配置项到面板 - 修改以支持单价配置
    function addConfigItemToPanel(itemName = '', price = '') {
        log(`添加配置项到面板: ${itemName} - ${price}`);
        const configContent = document.getElementById('configContent');
        if (!configContent) {
            log('错误：无法找到configContent元素');
            return;
        }

        // 解析物品信息
        const itemInfo = parseItemNameAndUsage(itemName);
        const baseName = itemInfo.baseName;
        const isConsumable = itemInfo.isConsumable;

        const configItem = document.createElement('div');
        configItem.className = 'config-item';

        // 为耗材类物品显示单价输入框和说明
        if (isConsumable) {
            configItem.innerHTML = `
                <input type="text" class="item-name" placeholder="物品名称" value="${baseName}" style="width: 45%;">
                <input type="number" class="item-price" placeholder="单价" value="${price}" min="1" style="width: 20%;">
                <span style="margin-left: 5px; font-size: 12px; color: #666;">(耗材单价)</span>
                <button class="remove-item">删除</button>
            `;
        } else {
            configItem.innerHTML = `
                <input type="text" class="item-name" placeholder="物品名称" value="${itemName}" style="width: 50%;">
                <input type="number" class="item-price" placeholder="价格" value="${price}" min="1" style="width: 30%;">
                <button class="remove-item">删除</button>
            `;
        }

        configContent.appendChild(configItem);

        // 添加删除按钮事件监听器
        configItem.querySelector('.remove-item').addEventListener('click', function () {
            configItem.remove();
        });
    }

    // 添加配置项
    function addConfigItem() {
        log('添加新的空配置项');
        addConfigItemToPanel();
    }

    // 保存配置 - 修改为保存基础物品名和单价
    function saveConfig() {
        log('保存配置');
        const configItems = document.querySelectorAll('.config-item');
        const newConfigs = {};
        const invalidItems = [];

        log(`处理 ${configItems.length} 个配置项`);
        configItems.forEach((item, index) => {
            const itemName = item.querySelector('.item-name').value.trim();
            const itemPrice = parseInt(item.querySelector('.item-price').value);

            if (itemName && !isNaN(itemPrice) && itemPrice > 0) {
                // 无论是否是耗材，都保存基础物品名称
                const itemInfo = parseItemNameAndUsage(itemName);
                const baseName = itemInfo.baseName;

                newConfigs[baseName] = itemPrice;
                log(`保存配置项 #${index + 1}: ${baseName} = ${itemPrice} (单价)`);
            } else {
                log(`跳过无效配置项 #${index + 1}: ${itemName} = ${itemPrice}`);
                // 记录无效的配置项
                invalidItems.push({
                    index: index + 1,
                    name: itemName || '(空)',
                    price: isNaN(itemPrice) ? '(无效)' : itemPrice
                });
            }
        });

        itemConfigs = newConfigs;
        GM_setValue('itemConfigs', itemConfigs);
        log(`保存了 ${Object.keys(itemConfigs).length} 个配置项到存储`);

        // 构建提示消息
        let message = `配置已保存！共保存了 ${Object.keys(itemConfigs).length} 个有效配置项。`;

        // 添加无效配置项的提示
        if (invalidItems.length > 0) {
            message += `\n\n以下 ${invalidItems.length} 个配置项未被保存（物品名为空或价格无效）：`;
            invalidItems.forEach(item => {
                message += `\n${item.index}. "${item.name}" - 价格: ${item.price}`;
            });
        }

        alert(message);

        // 更新表格中的每行配置数据
        updateTableRowConfigurations();

        // 不再关闭面板
        // document.getElementById('marketConfigPanel').style.display = 'none';
    }

    // 更新表格中的每行配置数据
    function updateTableRowConfigurations() {
        log('更新表格每行的配置数据');
        const targetTable = document.querySelector('#main_content > div > form > div:nth-child(26) > table') ||
            document.querySelector('#main_content table');

        if (!targetTable) {
            log('未找到目标表格，无法更新行配置');
            return;
        }

        // 获取所有行
        const allRows = targetTable.querySelectorAll('tr');
        log(`找到 ${allRows.length} 行，准备更新配置`);

        let updatedRows = 0;

        for (let i = 0; i < allRows.length; i++) {
            const row = allRows[i];

            // 跳过表头行和分组行
            if (row.classList.contains('Titel') ||
                row.querySelector('th') ||
                row.classList.contains('item_group') ||
                isGroupHeaderRow(row)) {
                continue;
            }

            // 获取当前行的物品名称
            const cells = row.querySelectorAll('td');
            if (cells.length < 2) continue;

            const itemNameCell = cells[1]; // 通常第二个单元格是物品名
            if (!itemNameCell) continue;

            const fullItemName = itemNameCell.textContent.trim();
            if (!fullItemName) continue;

            // 解析物品名和使用次数
            const itemInfo = parseItemNameAndUsage(fullItemName);
            const baseName = itemInfo.baseName;
            const isConsumable = itemInfo.isConsumable;
            const unitPrice = itemConfigs[baseName] || '';

            // 找到操作列
            const operationCell = row.querySelector('.operation-column');
            if (!operationCell) continue;

            // 更新价格输入框
            const priceInput = operationCell.querySelector('.price-input');
            if (priceInput) {
                if (unitPrice) {
                    // 计算最终价格
                    const finalPrice = calculateFinalPrice(fullItemName, unitPrice);
                    priceInput.value = finalPrice;
                } else {
                    priceInput.value = '';
                }
            }

            // 更新上架按钮文本
            const sellButton = operationCell.querySelector('.sell-btn');
            if (sellButton) {
                if (unitPrice) {
                    const finalPrice = calculateFinalPrice(fullItemName, unitPrice);
                    if (isConsumable) {
                        sellButton.textContent = `上架 (${finalPrice}金，单价${unitPrice})`;
                    } else {
                        sellButton.textContent = `上架 (${finalPrice}金)`;
                    }
                } else {
                    sellButton.textContent = '快速上架';
                }
            }

            updatedRows++;
        }

        log(`已更新 ${updatedRows} 行的配置数据`);
    }

    // 显示导入/导出区域 - 更新为同时处理导入和导出
    function showImportExportArea() {
        log('显示导入/导出区域');
        document.getElementById('importExportArea').style.display = 'block';

        // 在文本框中显示当前配置以便导出
        document.getElementById('configTextarea').value = JSON.stringify(itemConfigs, null, 2);
    }

    // 导入配置
    function importConfig() {
        log('导入配置');
        try {
            const configText = document.getElementById('configTextarea').value;
            log(`尝试解析JSON: ${configText.substring(0, 100)}${configText.length > 100 ? '...' : ''}`);

            const importedConfig = JSON.parse(configText);

            if (typeof importedConfig !== 'object') {
                throw new Error('无效的配置格式');
            }

            log(`成功解析配置，包含 ${Object.keys(importedConfig).length} 个项目`);
            itemConfigs = importedConfig;
            GM_setValue('itemConfigs', itemConfigs);
            loadConfigItems();
            hideImportExportArea();
            alert('配置导入成功！');
        } catch (error) {
            log(`配置导入失败: ${error.message}`);
            alert('配置导入失败: ' + error.message);
        }
    }

    // 隐藏导入导出区域
    function hideImportExportArea() {
        log('隐藏导入导出区域');
        document.getElementById('importExportArea').style.display = 'none';
    }

    // 判断是否为分组折叠行
    function isGroupHeaderRow(row) {
        // 主要特征: 检查是否有item_group类
        if (row.classList.contains('item_group')) {
            log('检测到item_group类的分组折叠行');
            return true;
        }

        // 其他可能的分组行特征
        // 特征1: 包含折叠/展开控件或链接
        const hasExpandControl = row.querySelector('a[href*="expand"]') ||
            row.querySelector('a[href*="collapse"]') ||
            row.querySelector('img[src*="expand"]') ||
            row.querySelector('img[src*="collapse"]');

        if (hasExpandControl) {
            log('检测到包含展开/折叠控件的分组行');
            return true;
        }

        // 特征2: 通常包含rowspan或colspan属性的单元格
        const hasMergedCells = Array.from(row.querySelectorAll('td')).some(cell =>
            cell.hasAttribute('rowspan') || cell.hasAttribute('colspan')
        );

        if (hasMergedCells) {
            log('检测到包含合并单元格的分组行');
            return true;
        }

        return false;
    }

    // 修改批量上架配置的物品函数 - 考虑耗材的最终价格计算
    function batchSellConfiguredItems() {
        log('开始批量上架配置的物品');
        const statusDiv = document.getElementById('batchSellStatus');
        // const statusDiv = document.getElementById('batchSellStatus') || document.createElement('div');

        // 使用传入的配置单
        // const selectedProfile = profileId && organizeProfiles.profiles[profileId];
        // const useConfigPanel = !profileId;

        const itemConfigs = GM_getValue('itemConfigs', {});
        // if (selectedProfile) {
        //     // 将整理配置转换为上架配置格式
        //     itemConfigs = {};
        //     selectedProfile.items.forEach(item => {
        //         if (item.itemName && item.price) {
        //             itemConfigs[item.itemName] = item.price;
        //         }
        //     });
        // } else {
        //     // 使用原有配置
        //     itemConfigs = GM_getValue('itemConfigs', {});
        // }

        // 查找仓库表格
        const targetTable = document.querySelector('#main_content > div > form > div:nth-child(26) > table') ||
            document.querySelector('#main_content table');

        if (!targetTable) {
            log('错误：未找到物品表格');
            statusDiv.textContent = '错误：未找到物品表格';
            statusDiv.style.color = 'red';
            return;
        }

        // 查找表单元素
        const theForm = document.querySelector('form[name="the_form"]');
        if (!theForm) {
            log('错误：未找到表单元素');
            statusDiv.textContent = '错误：未找到表单元素';
            statusDiv.style.color = 'red';
            return;
        }

        // 查找应用改动按钮
        const applyButton = document.querySelector('input[name="ok"][value="应用改动"]');
        if (!applyButton) {
            log('错误：未找到应用改动按钮');
            statusDiv.textContent = '错误：未找到应用改动按钮';
            statusDiv.style.color = 'red';
            return;
        }

        // 获取所有物品行
        const allRows = targetTable.querySelectorAll('tr');
        let foundItems = 0;

        // 查找并更新市集列中的价格输入框
        for (let i = 0; i < allRows.length; i++) {
            const row = allRows[i];

            // 跳过表头行和分组行
            if (row.classList.contains('Titel') ||
                row.querySelector('th') ||
                row.classList.contains('item_group') ||
                isGroupHeaderRow(row)) {
                continue;
            }

            // 获取物品名
            const cells = row.querySelectorAll('td');
            if (cells.length < 2) continue;

            const itemNameCell = cells[1]; // 通常第二个单元格是物品名
            if (!itemNameCell) continue;

            const fullItemName = itemNameCell.textContent.trim();
            if (!fullItemName) continue;

            // 解析物品名和使用次数
            const itemInfo = parseItemNameAndUsage(fullItemName);
            const baseName = itemInfo.baseName;

            // 检查是否有配置单价
            if (itemConfigs[baseName]) {
                const unitPrice = itemConfigs[baseName];
                // 计算最终价格
                const finalPrice = calculateFinalPrice(fullItemName, unitPrice);

                // 查找市集列的输入框
                // 通常市集列是"地点"列之后，尝试多种可能的定位方式
                let marketInput = null;

                // 尝试方法1：查找含有"市集"或"市场"表头对应的列
                const headerRow = targetTable.querySelector('tr.Titel, tr:has(th)');
                if (headerRow) {
                    const headers = headerRow.querySelectorAll('th');
                    let marketColIndex = -1;

                    for (let j = 0; j < headers.length; j++) {
                        const headerText = headers[j].textContent.trim().toLowerCase();
                        if (headerText.includes('市集') ||
                            headerText.includes('市场') ||
                            headerText.includes('market') ||
                            headerText.includes('商店') ||
                            headerText.includes('shop')) {
                            marketColIndex = j;
                            break;
                        }
                    }

                    if (marketColIndex >= 0 && marketColIndex < cells.length) {
                        marketInput = cells[marketColIndex].querySelector('input[type="text"], input[type="number"]');
                        log(`通过表头找到"市集"列，索引: ${marketColIndex}`);
                    }
                }

                // ...使用相同的市集输入框查找逻辑
                if (!marketInput) {
                    const inputs = row.querySelectorAll('input[type="text"], input[type="number"]');

                    for (let j = 0; j < inputs.length; j++) {
                        const input = inputs[j];
                        if (input.name && (
                            input.name.includes('price') ||
                            input.name.includes('market') ||
                            input.name.includes('shop'))) {
                            marketInput = input;
                            log(`通过输入框名称找到市集输入框: ${input.name}`);
                            break;
                        }

                        if (input.clientWidth < 100 &&
                            !input.name.includes('checkbox') &&
                            input.type !== 'checkbox') {
                            marketInput = input;
                            log(`通过输入框特征找到可能的市集输入框`);
                        }
                    }
                }

                if (!marketInput) {
                    const possibleMarketCells = Array.from(cells).slice(2);
                    for (const cell of possibleMarketCells) {
                        const input = cell.querySelector('input[type="text"], input[type="number"]');
                        if (input && !input.disabled) {
                            marketInput = input;
                            log(`在后续单元格中找到可能的市集输入框`);
                            break;
                        }
                    }
                }

                if (marketInput) {
                    // 设置最终价格
                    marketInput.value = finalPrice;
                    log(`为物品 "${fullItemName}" 设置市集价格: ${finalPrice} (基于单价${unitPrice})`);
                    foundItems++;
                } else {
                    log(`未找到物品 "${fullItemName}" 的市集输入框`);
                }
            }
        }

        // 显示找到的物品数量
        if (foundItems === 0) {
            log('未找到已配置价格的物品或未能设置任何价格');
            statusDiv.textContent = '未能设置任何物品价格，请检查表格结构或先在配置中设置物品价格';
            statusDiv.style.color = 'orange';
            return;
        }

        // 更新状态提示
        statusDiv.textContent = `已为 ${foundItems} 个物品设置市集价格，已准备就绪，请手动点击"应用改动"按钮`;
        statusDiv.style.color = 'green';

        // 添加提示
        const successNotice = document.createElement('div');
        successNotice.textContent = `已为 ${foundItems} 个物品设置了市集价格，请点击页面上的"应用改动"按钮完成操作`;
        successNotice.style.position = 'fixed';
        successNotice.style.top = '50%';
        successNotice.style.left = '50%';
        successNotice.style.transform = 'translate(-50%, -50%)';
        successNotice.style.backgroundColor = 'rgba(0, 128, 0, 0.9)';
        successNotice.style.color = 'white';
        successNotice.style.padding = '15px 20px';
        successNotice.style.borderRadius = '5px';
        successNotice.style.zIndex = '10000';
        successNotice.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
        document.body.appendChild(successNotice);

        // 关闭配置面板
        const configPanel = document.getElementById('marketConfigPanel');
        if (configPanel) {
            configPanel.style.display = 'none';
        }

        // 添加一个关闭提示的按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭提示';
        closeButton.style.marginTop = '10px';
        closeButton.style.padding = '5px 10px';
        closeButton.style.cursor = 'pointer';
        successNotice.appendChild(closeButton);

        closeButton.addEventListener('click', function () {
            successNotice.remove();
        });

        // 添加一个帮助文本，解释如何确认操作成功
        const helpText = document.createElement('div');
        helpText.style.marginTop = '10px';
        helpText.style.fontSize = '12px';
        helpText.innerHTML = '请检查表格中市集列的价格是否已正确设置，<br>对于耗材物品，价格已根据剩余使用次数自动计算。<br>请点击"应用改动"按钮完成上架操作。';
        successNotice.appendChild(helpText);

        // 30秒后自动移除提示
        setTimeout(() => {
            if (document.body.contains(successNotice)) {
                successNotice.remove();
            }
        }, 30000);
    }

    // 在仓库页面添加快速上架按钮和配置列
    function addSellButtonsToGroupCellar() {
        log('收集页面上的物品');

        // 查找物品表格
        const contentTable = document.querySelector('table.content_table') ||
            document.querySelector('#main_content table');

        if (!contentTable) {
            log('未找到物品表格，脚本不执行');
            return;
        }

        // 清空当前页面物品列表
        currentPageItems = [];

        // 获取所有行
        const rows = contentTable.querySelectorAll('tr');
        log(`在表格中找到 ${rows.length} 行`);

        // 处理每一行，收集物品名称
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            // 跳过表头行和分组行
            if (row.classList.contains('Titel') ||
                row.querySelector('th') ||
                row.classList.contains('item_group') ||
                isGroupHeaderRow(row)) {
                continue;
            }

            // 尝试获取物品名称
            const cells = row.querySelectorAll('td');
            if (cells.length < 2) continue;

            const itemNameCell = cells[1]; // 通常第二个单元格是物品名
            if (!itemNameCell) continue;

            const itemName = itemNameCell.textContent.trim();
            if (!itemName) continue;

            // 添加到当前页面物品列表
            currentPageItems.push(itemName);
        }

        log(`共收集了 ${currentPageItems.length} 个物品名称`);
    }

    // 初始化函数
    function initialize() {
        log('初始化脚本');

        // 检查是否在物品页面
        const currentUrl = window.location.href;
        log(`当前URL: ${currentUrl}`);

        if (!currentUrl.includes('items.php')) {
            log('不是物品页面，脚本不执行');
            return;
        }

        // 创建配置按钮
        createConfigButton();

        // 在仓库页面添加快速上架按钮
        addSellButtonsToGroupCellar();

        // 注册菜单命令
        GM_registerMenuCommand('仓库管理配置', showConfigPanel);
        log('初始化完成');
    }

    // 等待页面加载完成后执行初始化
    if (document.readyState === 'loading') {
        log('页面正在加载，等待DOMContentLoaded事件');
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        log('页面已加载，立即初始化');
        initialize();
    }

    // 从当前页面导入物品
    function importItemsFromCurrentPage() {
        log('从当前页面导入物品');

        // 查找物品表格
        const contentTable = document.querySelector('table.content_table') ||
            document.querySelector('#main_content table');

        if (!contentTable) {
            log('未找到物品表格');
            alert('无法找到物品表格，导入失败。');
            return;
        }

        // 用于存储基础物品名称的集合，避免重复导入
        const baseItemNames = new Set();

        // 收集所有物品的基础名称（去重）
        const rows = contentTable.querySelectorAll('tr');
        log(`找到 ${rows.length} 行`);

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            // 跳过表头行和分组行
            if (row.classList.contains('Titel') ||
                row.querySelector('th') ||
                row.classList.contains('item_group') ||
                isGroupHeaderRow(row)) {
                continue;
            }

            // 尝试获取物品名称
            const cells = row.querySelectorAll('td');
            if (cells.length < 2) continue;

            const itemNameCell = cells[1]; // 通常第二个单元格是物品名
            if (!itemNameCell) continue;

            const fullItemName = itemNameCell.textContent.trim();
            if (!fullItemName) continue;

            // 解析物品名和使用次数，只保留基础名称
            const itemInfo = parseItemNameAndUsage(fullItemName);
            const baseName = itemInfo.baseName;

            // 添加到集合中（自动去重）
            baseItemNames.add(baseName);
        }

        log(`收集到 ${baseItemNames.size} 个不同的基础物品`);

        // 确认是否要导入
        if (!confirm(`是否导入页面中的 ${baseItemNames.size} 个不同物品到配置？`)) {
            return;
        }

        // 获取已存在的物品配置
        const existingItems = new Set(Object.keys(itemConfigs));
        let importedCount = 0;

        // 处理每个物品
        baseItemNames.forEach(baseName => {
            // 如果物品还未配置，添加到配置面板
            if (!existingItems.has(baseName)) {
                // 默认价格为空，让用户填写
                addConfigItemToPanel(baseName, '');
                importedCount++;
            }
        });

        alert(`成功导入 ${importedCount} 个新物品到配置面板。\n${baseItemNames.size - importedCount} 个物品已存在于配置中。`);
    }

    /**
     * 获取仓库内所有物品的当前存放位置
     * 
     * @returns {Object} 包含物品ID和对应存放位置的对象
     */
    function getItemLocations() {
        const items = {};

        // 获取仓库表格
        const warehouseTable = document.querySelector('table.content_table');

        if (!warehouseTable) {
            console.warn('未找到仓库表格 (table.content_table)');
            return items;
        }

        // 查找仓库表格内的所有行，包括普通物品行和分组行
        const allRows = warehouseTable.querySelectorAll('tr');
        let groupCounter = 1000000; // 为分组行生成虚拟ID

        // 处理所有行
        allRows.forEach(row => {
            // 检查是否是分组行
            const isGroupRow = row.classList.contains('item_group');

            if (isGroupRow) {
                // 处理分组行
                const nameElement = row.querySelector('a');
                if (!nameElement) return;

                const name = nameElement.textContent;
                const selectElement = row.querySelector('select');
                if (!selectElement) return;

                // 获取当前选择的位置
                let locationValue = "0";  // 默认值
                let locationName = "未分类";

                if (selectElement.selectedIndex > 0) {
                    const selectedOption = selectElement.options[selectElement.selectedIndex];
                    locationValue = selectedOption.value;
                    locationName = selectedOption.textContent;
                }

                // 为分组行生成虚拟ID
                const groupId = `group_${groupCounter++}`;

                // 存储分组信息
                items[groupId] = {
                    id: groupId,
                    name: name,
                    locationValue: locationValue,
                    locationName: locationName,
                    element: selectElement,
                    isGroup: true
                };
            } else {
                // 处理普通物品行
                const select = row.querySelector('select[name^="EquipItem["]');
                if (!select) return; // 跳过没有选择框的行

                // 从name属性中提取物品ID
                const nameMatch = select.name.match(/EquipItem\[(\d+)\]/);
                if (!nameMatch) return;

                const itemId = nameMatch[1];

                // 获取物品名称
                let itemName = '';
                const linkElement = row.querySelector('a');
                if (linkElement) {
                    itemName = linkElement.textContent;
                }

                // 获取当前选择的位置
                const selectedOption = select.options[select.selectedIndex];
                const locationValue = selectedOption.value;
                const locationName = selectedOption.textContent;

                // 存储信息
                items[itemId] = {
                    id: itemId,
                    name: itemName,
                    locationValue: locationValue,
                    locationName: locationName,
                    element: select,
                    isGroup: false
                };
            }
        });

        console.log('已获取仓库物品位置信息:', items);
        return items;
    }

    /**
 * 设置指定名称的仓库物品的存放位置
 * 
 * @param {string} itemName - 物品名称
 * @param {string} targetLocation - 目标位置值("go_lager"=仓库, "go_group"=宝库, "go_group_2"=团队仓库, "go_keller"=贮藏室)
 * @returns {number} 成功设置的物品数量
 */
    function setItemLocations(itemName, targetLocation) {
        console.log(`开始设置名称为 "${itemName}" 的物品位置为 ${targetLocation}`);

        // 获取位置名称映射
        const locationNames = {
            'go_lager': '仓库',
            '-go_lager': '仓库',
            'go_group': '宝库',
            'go_group_2': '团队仓库',
            'go_keller': '贮藏室',
            'go_tasche': '口袋'
        };

        // 位置值的同义词映射（处理带负号和不带负号的情况）
        const locationSynonyms = {
            'go_lager': ['-go_lager', 'go_lager'],
            '-go_lager': ['-go_lager', 'go_lager']
        };

        // 获取目标位置的显示名称
        const targetLocationName = locationNames[targetLocation] || targetLocation;

        // 获取仓库物品当前位置
        const items = getItemLocations();
        console.log(`获取到 ${Object.keys(items).length} 个仓库物品`);

        // 查找可能的分组及其物品
        const groupItems = {};
        for (const item of Object.values(items)) {
            if (item.isGroup && item.name.includes(itemName)) {
                // 如果是匹配名称的分组，记录它
                console.log(`找到匹配分组: ${item.name}`);
                groupItems[item.id] = item;
            }
        }

        let changedCount = 0;

        // 处理每个物品
        Object.values(items).forEach(item => {
            // 检查物品名称是否匹配
            if (item.name === itemName) {
                console.log(`找到匹配的物品 ID: ${item.id}, 名称: "${item.name}", 当前位置: ${item.locationName}`);

                // 检查物品是否已经在目标位置或等效位置
                const synonyms = locationSynonyms[targetLocation] || [targetLocation];
                if (synonyms.includes(item.locationValue)) {
                    console.log(`物品已经在目标位置 ${targetLocationName}，跳过`);
                    return;
                }

                // 查找匹配的选项
                let optionFound = false;

                console.log(`物品 "${item.name}" 的选择框有 ${item.element.options.length} 个选项`);
                for (let i = 0; i < item.element.options.length; i++) {
                    const option = item.element.options[i];
                    console.log(`- 选项 ${i}: 值=${option.value}, 文本=${option.textContent}`);

                    // 检查选项值是否匹配目标位置或其同义词，或者检查文本是否匹配
                    if (synonyms.includes(option.value) || option.textContent.trim() === targetLocationName) {
                        console.log(`找到匹配的选项，索引: ${i}, 值: ${option.value}, 文本: ${option.textContent}`);
                        item.element.selectedIndex = i;
                        optionFound = true;

                        // 找到并勾选对应的复选框
                        const row = item.element.closest('tr');
                        if (row) {
                            // 只有非分组物品才需要查找复选框
                            if (!item.isGroup) {
                                const checkboxName = `doEquipItem[${item.id}]`;
                                const checkbox = document.querySelector(`input[name="${checkboxName}"]`);
                                if (checkbox) {
                                    checkbox.checked = true;
                                    changedCount++;
                                    console.log(`物品 "${item.name}" (ID: ${item.id}) 从 ${item.locationName} 变更为 ${option.textContent}`);
                                } else {
                                    console.warn(`未找到物品 "${item.name}" 对应的复选框 ${checkboxName}`);

                                    // 尝试找到任何相关复选框
                                    const allCheckboxes = row.querySelectorAll('input[type="checkbox"]');
                                    if (allCheckboxes.length > 0) {
                                        console.log(`行中发现 ${allCheckboxes.length} 个复选框，尝试使用第一个`);
                                        allCheckboxes[0].checked = true;
                                        changedCount++;
                                    }
                                }
                            } else {
                                // 分组行直接计数，不需要查找复选框
                                changedCount++;
                                console.log(`分组 "${item.name}" (ID: ${item.id}) 从 ${item.locationName} 变更为 ${option.textContent}`);
                            }
                        }
                        break;
                    }
                }

                if (!optionFound) {
                    console.warn(`物品 "${item.name}" 没有匹配的 ${targetLocationName} 选项`);
                }
            }
        });

        // 如果找到了物品但没有找到对应分组，尝试查找可能的分组并设置
        if (changedCount > 0 && Object.keys(groupItems).length > 0) {
            for (const groupItem of Object.values(groupItems)) {
                // 查找匹配的选项
                for (let i = 0; i < groupItem.element.options.length; i++) {
                    const option = groupItem.element.options[i];

                    // 检查选项值是否匹配目标位置
                    if (option.value === targetLocation || option.textContent.trim() === targetLocationName) {
                        console.log(`为分组 "${groupItem.name}" 设置位置为 ${targetLocationName}`);
                        groupItem.element.selectedIndex = i;
                        break;
                    }
                }
            }
        }

        if (changedCount > 0) {
            console.log(`共设置了 ${changedCount} 个名为 "${itemName}" 的物品位置为 ${targetLocationName}，请手动点击"应用改动"按钮保存更改`);
        } else {
            console.log(`未能设置任何名为 "${itemName}" 的物品位置为 ${targetLocationName}`);
        }

        return changedCount;
    }

    /**
     * 更新物品位置统计信息
     */
    function updateLocationStatistics() {
        const items = getItemLocations();
        const stats = {};

        // 统计各位置的物品数量
        Object.values(items).forEach(item => {
            if (!stats[item.locationName]) {
                stats[item.locationName] = {
                    count: 0,
                    items: []
                };
            }

            stats[item.locationName].count++;
            stats[item.locationName].items.push(item.name);
        });

        // 更新统计信息显示
        const statsDiv = document.getElementById('locationStats');
        if (statsDiv) {
            let html = '<h3>当前物品位置统计</h3>';

            // 按数量排序
            const sortedLocations = Object.keys(stats).sort((a, b) => stats[b].count - stats[a].count);

            html += '<ul>';
            sortedLocations.forEach(location => {
                html += `<li><strong>${location}</strong>: ${stats[location].count}个物品</li>`;
            });
            html += '</ul>';

            statsDiv.innerHTML = html;
        }
    }

    /**
     * 添加物品整理配置项
     */
    function addOrganizeConfigItem(itemName = '', location = 'go_lager') {
        const configContent = document.getElementById('orgConfigContent');
        if (!configContent) return;

        const configItem = document.createElement('div');
        configItem.className = 'org-config-item';

        configItem.innerHTML = `
            <input type="text" class="org-item-name" placeholder="物品名称" value="${itemName}">
            <select class="org-item-location">
                <option value="go_lager" ${location === 'go_lager' ? 'selected' : ''}>仓库</option>
                <option value="go_group" ${location === 'go_group' ? 'selected' : ''}>宝库</option>
                <option value="go_group_2" ${location === 'go_group_2' ? 'selected' : ''}>团队仓库</option>
                <option value="go_keller" ${location === 'go_keller' ? 'selected' : ''}>贮藏室</option>
                <option value="go_tasche" ${location === 'go_tasche' ? 'selected' : ''}>口袋</option>
            </select>
            <button class="btn-organize">整理</button>
            <button class="remove-item">删除</button>
        `;

        configContent.appendChild(configItem);

        // 添加单个物品整理功能
        configItem.querySelector('.btn-organize').addEventListener('click', function () {
            const itemName = configItem.querySelector('.org-item-name').value;
            const location = configItem.querySelector('.org-item-location').value;

            if (!itemName) {
                alert('请输入物品名称');
                return;
            }

            const count = setItemLocations(itemName, location);
            if (count > 0) {
                alert(`已将 ${count} 个"${itemName}"整理到${getLocationDisplayName(location)}，请点击"应用改动"按钮保存更改`);
            } else {
                alert(`未找到名为"${itemName}"的物品，或物品已在指定位置`);
            }
        });

        // 添加删除按钮事件
        configItem.querySelector('.remove-item').addEventListener('click', function () {
            configItem.remove();
        });
    }

    /**
     * 批量整理配置的物品
     */
    function batchOrganizeItems(profileId = null) {
        const statusDiv = document.getElementById('organizeStatus') || document.createElement('div');
        statusDiv.textContent = '开始批量整理物品...';
        statusDiv.style.color = 'blue';

        setTimeout(() => {
            let configItems;
            if (profileId && organizeProfiles.profiles[profileId]) {
                // 使用传入的配置单
                configItems = organizeProfiles.profiles[profileId].items.map(item => {
                    // querySelector: () => ({
                    //     'org-item-name': { value: item.itemName },
                    //     'org-item-location': { value: item.location }
                    // })[className]
                    return {
                        'org-item-name': item.itemName,
                        'org-item-location': item.location
                    };
                });
            } else {
                // 使用配置面板中的配置
                configItems = document.querySelectorAll('.org-config-item');
            }

            let totalChanged = 0;
            let processedItems = [];

            // 处理每个配置项
            configItems.forEach(item => {
                const getConfigValue = (className) => {
                    if (profileId) {
                        return item[className];
                    } else {
                        return item.querySelector(`.${className}`).value;
                    }
                };

                const itemName = getConfigValue('org-item-name');
                const location = getConfigValue('org-item-location');

                if (itemName) {
                    const count = setItemLocations(itemName, location);
                    if (count > 0) {
                        totalChanged += count;
                        processedItems.push(`${count}个"${itemName}"整理到${getLocationDisplayName(location)}`);
                    }
                }
            });

            if (totalChanged > 0) {
                statusDiv.innerHTML = `共整理了 ${totalChanged} 个物品，请点击"应用改动"按钮保存更改<br>` +
                    `<small>${processedItems.join('<br>')}</small>`;
                statusDiv.style.color = 'green';
            } else {
                statusDiv.textContent = '未找到需要整理的物品，或所有物品都已在指定位置';
                statusDiv.style.color = 'orange';
            }

            // 更新统计信息
            updateLocationStatistics();

            // 关闭配置面板
            document.getElementById('marketConfigPanel') && (document.getElementById('marketConfigPanel').style.display = 'none');

            // 显示成功提示
            if (totalChanged > 0) {
                // const applyButton = document.querySelector('input[name="ok"][value="应用改动"]');
                // const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
                // applyButton.dispatchEvent(clickEvent);
                triggerSubmitButton();
                showOrganizeSuccessMessage(totalChanged, processedItems);
            }
        }, 100);
    }

    function triggerSubmitButton() {
        const applyButton = document.querySelector('input[name="ok"][value="应用改动"]');
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        applyButton.dispatchEvent(clickEvent);
    }

    /**
     * 显示整理成功消息
     */
    function showOrganizeSuccessMessage(totalCount, items) {
        const successNotice = document.createElement('div');
        successNotice.innerHTML = `
            <strong>已整理 ${totalCount} 个物品</strong>
            <div style="margin-top: 10px; max-height: 200px; overflow-y: auto;">
                <ul style="margin: 0; padding-left: 20px;">
                    ${items.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
        // <div style="margin-top: 15px;">请点击"应用改动"按钮保存更改</div>

        successNotice.style.position = 'fixed';
        successNotice.style.top = '50%';
        successNotice.style.left = '50%';
        successNotice.style.transform = 'translate(-50%, -50%)';
        successNotice.style.backgroundColor = 'rgba(0, 128, 0, 0.9)';
        successNotice.style.color = 'white';
        successNotice.style.padding = '15px 20px';
        successNotice.style.borderRadius = '5px';
        successNotice.style.zIndex = '10000';
        successNotice.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
        document.body.appendChild(successNotice);

        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭提示';
        closeButton.style.marginTop = '10px';
        closeButton.style.padding = '5px 10px';
        closeButton.style.cursor = 'pointer';
        successNotice.appendChild(closeButton);

        closeButton.addEventListener('click', function () {
            successNotice.remove();
        });

        // 30秒后自动移除
        setTimeout(() => {
            if (document.body.contains(successNotice)) {
                successNotice.remove();
            }
        }, 30000);
    }

    /**
     * 获取位置显示名称
     */
    function getLocationDisplayName(locationValue) {
        const locationNames = {
            'go_lager': '仓库',
            '-go_lager': '仓库',
            'go_group': '宝库',
            'go_group_2': '团队仓库',
            'go_keller': '贮藏室',
            'go_tasche': '口袋'
        };

        return locationNames[locationValue] || locationValue;
    }

    /**
     * 保存物品整理配置
     */
    function saveOrganizeConfig() {
        const configItems = document.querySelectorAll('.org-config-item');
        const newItems = [];

        configItems.forEach(item => {
            const itemName = item.querySelector('.org-item-name').value;
            const location = item.querySelector('.org-item-location').value;

            if (itemName) {
                newItems.push({
                    itemName: itemName,
                    location: location
                });
            }
        });

        // 获取当前活动配置单
        const activeProfileId = organizeProfiles.activeProfileId;
        
        // 更新当前配置单的物品列表
        if (organizeProfiles.profiles[activeProfileId]) {
            organizeProfiles.profiles[activeProfileId].items = newItems;
            
            // 保存整体配置
            GM_setValue('organizeProfiles', organizeProfiles);
            
            alert(`整理配置 "${organizeProfiles.profiles[activeProfileId].name}" 已保存！共 ${newItems.length} 个配置项。`);
        } else {
            alert('保存失败：找不到当前配置单');
        }
    }

    /**
     * 加载物品整理配置
     */
    function loadOrganizeConfigItems() {
        const configContent = document.getElementById('orgConfigContent');
        if (!configContent) return;

        configContent.innerHTML = '';

        // 获取当前活动配置单
        const activeProfileId = organizeProfiles.activeProfileId;
        const activeProfile = organizeProfiles.profiles[activeProfileId];
        
        if (!activeProfile) {
            log('错误：未找到活动配置单');
            return;
        }

        const items = activeProfile.items || [];

        if (items.length > 0) {
            items.forEach(config => {
                addOrganizeConfigItem(config.itemName, config.location);
            });
        } else {
            // 默认添加一个空配置项
            // addOrganizeConfigItem();
        }
    }

    /**
     * 从当前页面导入物品到整理配置
     */
    function importOrganizeItemsFromPage() {
        // 查找物品表格
        const contentTable = document.querySelector('table.content_table') ||
            document.querySelector('#main_content table');

        if (!contentTable) {
            alert('无法找到物品表格，导入失败。');
            return;
        }

        // 用于存储基础物品名称的集合，避免重复导入
        const baseItemNames = new Set();

        // 收集物品
        const rows = contentTable.querySelectorAll('tr');

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            // 跳过表头行和分组行
            if (row.classList.contains('Titel') ||
                row.querySelector('th') ||
                row.classList.contains('item_group') ||
                isGroupHeaderRow(row)) {
                continue;
            }

            // 尝试获取物品名称
            const cells = row.querySelectorAll('td');
            if (cells.length < 2) continue;

            const itemNameCell = cells[1]; // 通常第二个单元格是物品名
            if (!itemNameCell) continue;

            const fullItemName = itemNameCell.textContent.trim();
            if (!fullItemName) continue;

            // 解析物品名和使用次数，只保留基础名称
            const itemInfo = parseItemNameAndUsage(fullItemName);
            const baseName = itemInfo.baseName;

            // 添加到集合中（自动去重）
            baseItemNames.add(baseName);
        }

        // 确认是否要导入
        if (!confirm(`是否导入页面中的 ${baseItemNames.size} 个不同物品到当前整理配置？`)) {
            return;
        }

        // 获取当前配置单的物品列表
        const activeProfileId = organizeProfiles.activeProfileId;
        const activeProfile = organizeProfiles.profiles[activeProfileId];
        
        if (!activeProfile) {
            alert('导入失败：找不到当前配置单');
            return;
        }
        
        const existingItems = new Set((activeProfile.items || []).map(item => item.itemName));
        let importedCount = 0;

        // 处理每个物品
        baseItemNames.forEach(baseName => {
            if (!existingItems.has(baseName)) {
                // 默认整理到仓库
                addOrganizeConfigItem(baseName, 'go_lager');
                importedCount++;
            }
        });

        alert(`成功导入 ${importedCount} 个新物品到整理配置 "${activeProfile.name}"。\n${baseItemNames.size - importedCount} 个物品已存在于配置中。`);
    }

    /**
     * 初始化配置单选择器
     */
    function initProfileSelector() {
        const selector = document.getElementById('profileSelector');
        if (!selector) return;

        selector.innerHTML = '';

        // 添加所有配置单选项
        Object.keys(organizeProfiles.profiles).forEach(profileId => {
            const profile = organizeProfiles.profiles[profileId];
            const option = document.createElement('option');
            option.value = profileId;
            option.textContent = profile.name;
            option.selected = profileId === organizeProfiles.activeProfileId;
            selector.appendChild(option);
        });
    }

    /**
     * 切换到选择的配置单
     */
    function switchProfile() {
        const selector = document.getElementById('profileSelector');
        if (!selector) return;

        const profileId = selector.value;
        if (profileId && organizeProfiles.profiles[profileId]) {
            organizeProfiles.activeProfileId = profileId;
            GM_setValue('organizeProfiles', organizeProfiles);
            
            // 重新加载配置项
            loadOrganizeConfigItems();
            log(`切换到配置单: ${organizeProfiles.profiles[profileId].name}`);
        }
    }

    /**
     * 创建新的配置单
     */
    function createNewProfile() {
        showProfileNameDialog('创建新配置单', '', (newName) => {
            if (!newName) return;

            const newId = 'profile_' + Date.now();
            
            // 添加新配置
            organizeProfiles.profiles[newId] = {
                name: newName,
                items: []
            };
            
            // 切换到新配置
            organizeProfiles.activeProfileId = newId;
            
            // 保存并更新界面
            GM_setValue('organizeProfiles', organizeProfiles);
            initProfileSelector();
            loadOrganizeConfigItems();
            
            log(`创建了新配置单: ${newName}`);
        });
    }

    /**
     * 重命名当前配置单
     */
    function renameProfile() {
        const currentProfileId = organizeProfiles.activeProfileId;
        const currentProfile = organizeProfiles.profiles[currentProfileId];
        
        if (!currentProfile) return;
        
        // 不允许重命名默认配置
        if (currentProfileId === 'default') {
            alert('默认配置不能重命名');
            return;
        }

        showProfileNameDialog('重命名配置单', currentProfile.name, (newName) => {
            if (!newName) return;
            
            // 更新配置名称
            organizeProfiles.profiles[currentProfileId].name = newName;
            
            // 保存并更新界面
            GM_setValue('organizeProfiles', organizeProfiles);
            initProfileSelector();
            
            log(`重命名配置单为: ${newName}`);
        });
    }

    /**
     * 删除当前配置单
     */
    function deleteProfile() {
        const currentProfileId = organizeProfiles.activeProfileId;
        
        // 不允许删除默认配置
        if (currentProfileId === 'default') {
            alert('默认配置不能删除');
            return;
        }

        if (!confirm(`确定要删除配置单"${organizeProfiles.profiles[currentProfileId].name}"吗？`)) {
            return;
        }

        // 删除当前配置
        delete organizeProfiles.profiles[currentProfileId];
        
        // 切换到默认配置
        organizeProfiles.activeProfileId = 'default';
        
        // 保存并更新界面
        GM_setValue('organizeProfiles', organizeProfiles);
        initProfileSelector();
        loadOrganizeConfigItems();
        
        log('已删除配置单并切换到默认配置');
    }

    /**
     * 显示配置单名称输入对话框
     * @param {string} title 对话框标题
     * @param {string} defaultName 默认名称
     * @param {Function} callback 确认后的回调函数
     */
    function showProfileNameDialog(title, defaultName, callback) {
        // 检查是否已存在对话框
        let dialog = document.getElementById('profileNameDialog');
        if (dialog) {
            dialog.remove();
        }
        
        // 创建对话框
        dialog = document.createElement('div');
        dialog.id = 'profileNameDialog';
        dialog.className = 'profile-name-dialog';
        
        dialog.innerHTML = `
            <h3>${title}</h3>
            <input type="text" id="profileNameInput" placeholder="输入配置单名称" value="${defaultName}">
            <div class="profile-name-dialog-buttons">
                <button id="cancelProfileName">取消</button>
                <button id="confirmProfileName" class="confirm-button">确定</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 获取输入框焦点
        const input = document.getElementById('profileNameInput');
        input.focus();
        input.select();
        
        // 添加按钮事件
        document.getElementById('confirmProfileName').addEventListener('click', () => {
            const name = input.value.trim();
            dialog.remove();
            callback(name);
        });
        
        document.getElementById('cancelProfileName').addEventListener('click', () => {
            dialog.remove();
        });
        
        // 添加回车键确认
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const name = input.value.trim();
                dialog.remove();
                callback(name);
            }
        });
    }

    /**
     * 批量设置物品价格
     * @param {number} price - 要设置的价格
     */
    function bulkSetItemPrices(price) {
        if (isNaN(price) || price <= 0) {
            alert('请输入有效的价格（大于0的数字）');
            return;
        }

        const configItems = document.querySelectorAll('.config-item');
        if (configItems.length === 0) {
            alert('没有找到可设置价格的物品');
            return;
        }

        let updatedCount = 0;
        configItems.forEach(item => {
            // 只处理当前可见（已过滤）的物品
            if (item.style.display !== 'none') {
                const priceInput = item.querySelector('.item-price');
                if (priceInput) {
                    priceInput.value = price;
                    updatedCount++;
                }
            }
        });

        alert(`已为${updatedCount}个可见物品的单价设置价格为 ${price} 金币`);
    }

    /**
     * 批量设置物品位置
     * @param {string} location - 要设置的位置值
     */
    function bulkSetItemLocations(location) {
        if (!location) {
            alert('请选择有效的位置');
            return;
        }

        const configItems = document.querySelectorAll('.org-config-item');
        if (configItems.length === 0) {
            alert('没有找到可设置位置的物品');
            return;
        }

        let updatedCount = 0;
        configItems.forEach(item => {
            // 只处理当前可见（已过滤）的物品
            if (item.style.display !== 'none') {
                const locationSelect = item.querySelector('.org-item-location');
                if (locationSelect) {
                    locationSelect.value = location;
                    updatedCount++;
                }
            }
        });

        alert(`已为${updatedCount}个可见物品设置位置为 ${getLocationDisplayName(location)}`);
    }

    /**
     * 根据物品名称过滤配置项
     * @param {string} query - 过滤关键词
     */
    function filterItemsByName(query) {
        // 转换为小写以便不区分大小写
        query = query.toLowerCase();
        log(`根据关键词 "${query}" 过滤物品`);
        
        // 获取当前激活的选项卡
        const activeTab = document.querySelector('.tab.active').getAttribute('data-tab');
        
        if (activeTab === 'market-tab') {
            // 过滤快速上架物品
            const configItems = document.querySelectorAll('#configContent .config-item');
            let visibleCount = 0;
            
            configItems.forEach(item => {
                const itemNameElem = item.querySelector('.item-name');
                if (!itemNameElem) return;
                
                const itemName = itemNameElem.value.toLowerCase();
                
                if (query === '' || itemName.includes(query)) {
                    item.style.display = '';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });
            
            log(`快速上架选项卡: 显示了 ${visibleCount} 个匹配的物品，隐藏了 ${configItems.length - visibleCount} 个不匹配的物品`);
        } else if (activeTab === 'organize-tab') {
            // 过滤物品整理物品
            const orgConfigItems = document.querySelectorAll('#orgConfigContent .org-config-item');
            let visibleCount = 0;
            
            orgConfigItems.forEach(item => {
                const itemNameElem = item.querySelector('.org-item-name');
                if (!itemNameElem) return;
                
                const itemName = itemNameElem.value.toLowerCase();
                
                // 同时考虑名称过滤和位置过滤（如果有）
                const locationFilter = document.getElementById('locationFilter').value;
                const locationElem = item.querySelector('.org-item-location');
                const location = locationElem ? locationElem.value : '';
                
                const matchesName = query === '' || itemName.includes(query);
                const matchesLocation = locationFilter === '' || location === locationFilter;
                
                if (matchesName && matchesLocation) {
                    item.style.display = '';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });
            
            log(`物品整理选项卡: 显示了 ${visibleCount} 个匹配的物品，隐藏了 ${orgConfigItems.length - visibleCount} 个不匹配的物品`);
        }
    }

    /**
     * 根据位置过滤物品整理配置项
     * @param {string} location - 过滤的位置值
     */
    function filterItemsByLocation(location) {
        log(`根据位置 "${location}" 过滤物品整理配置`);
        
        const orgConfigItems = document.querySelectorAll('#orgConfigContent .org-config-item');
        let visibleCount = 0;
        
        // 获取名称过滤值（如果有）
        const nameFilter = document.getElementById('globalItemFilter').value.toLowerCase();
        
        orgConfigItems.forEach(item => {
            const locationElem = item.querySelector('.org-item-location');
            if (!locationElem) return;
            
            const itemLocation = locationElem.value;
            const itemNameElem = item.querySelector('.org-item-name');
            const itemName = itemNameElem ? itemNameElem.value.toLowerCase() : '';
            
            const matchesLocation = location === '' || itemLocation === location;
            const matchesName = nameFilter === '' || itemName.includes(nameFilter);
            
            if (matchesLocation && matchesName) {
                item.style.display = '';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });
        
        log(`物品整理选项卡: 显示了 ${visibleCount} 个匹配的物品，隐藏了 ${orgConfigItems.length - visibleCount} 个不匹配的物品`);
    }

    // 修改选项卡切换事件以保持过滤状态
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabs = document.querySelectorAll('.tab');
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
    
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
    
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
    
                // 在切换选项卡时，重新应用当前的过滤条件
                const nameFilter = document.getElementById('globalItemFilter').value;
                if (nameFilter) {
                    filterItemsByName(nameFilter);
                }
                
                // 如果切换到物品整理选项卡，还需应用位置过滤
                if (tabId === 'organize-tab') {
                    updateLocationStatistics();
                    const locationFilter = document.getElementById('locationFilter').value;
                    if (locationFilter) {
                        filterItemsByLocation(locationFilter);
                    }
                }
            });
        });
    });

})();
