const treeStructure = {
    textKey: 'desc',
    idKey: 'id',
    parentKey: 'parentId',
    types: [
        {
            type: '1',
            textStyle: 'color: red;',
            textStyleFunction: 'getTextStyle',
        },
        {
            type: '2',
            prefixIcon: 'list.png',
            textStyle: 'color: red;',
            buttons: [
                { sort: 1, icon: 'edit.png', onClick: 'editFolder' },
                { sort: 2, icon: 'delete.png', onClick: 'deleteFolder', isShowKey: 'isDelete' },
                { sort: 3, icon: 'delete.png', onClick: 'deleteFolder', textKey: 'count' }
            ],
        }
    ],
    getChildrenData: 'getChildrenData'
};

const createData = [
    { id: '1', parentId: '', sort: 1, type: '1', desc: '医疗管理域' },
    { id: '2', parentId: '', sort: 2, type: '1', desc: '医疗服务域' },
    { id: '3', parentId: '2', sort: 3, type: '2', desc: '门诊', count: 12253 },
    { id: '4', parentId: '2', sort: 4, type: '2', desc: '急诊', count: 132 },
    { id: '5', parentId: '2', sort: 5, type: '2', desc: '住院', count: 2311 },
    { id: '6', parentId: '1', sort: 6, type: '2', desc: '临床科研业务域' },
    { id: '7', parentId: '1', sort: 7, type: '2', desc: '临床教学业务域' },
];

function buildTree(data, parentId = '') {
    const treeContainer = document.getElementById('treeContainer');
    treeContainer.innerHTML = '';
    const rootNodes = data.filter(item => item[treeStructure.parentKey] === parentId);
    rootNodes.sort((a, b) => a.sort - b.sort);
    rootNodes.forEach(node => {
        const nodeElement = createTreeNode(node);
        treeContainer.appendChild(nodeElement);
        const children = data.filter(item => item[treeStructure.parentKey] === node[treeStructure.idKey]);
        if (children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'tree-node-children';
            children.forEach(child => {
                childrenContainer.appendChild(createTreeNode(child));
            });
            nodeElement.appendChild(childrenContainer);
        }
    });
}

function createTreeNode(node) {
    const nodeElement = document.createElement('div');
    nodeElement.className = 'tree-node';
    const nodeHeader = document.createElement('div');
    nodeHeader.className = 'tree-node-header';
    const expandIcon = document.createElement('span');
    expandIcon.textContent = '+';
    expandIcon.onclick = () => toggleNode(nodeElement);
    nodeHeader.appendChild(expandIcon);
    const nodeText = document.createElement('span');
    nodeText.textContent = node[treeStructure.textKey];
    nodeText.style = treeStructure.types.find(type => type.type === node.type)?.textStyle || '';
    nodeHeader.appendChild(nodeText);
    const nodeButtons = document.createElement('div');
    nodeButtons.className = 'tree-node-buttons';
    const typeConfig = treeStructure.types.find(type => type.type === node.type);
    if (typeConfig?.buttons) {
        typeConfig.buttons.forEach(buttonConfig => {
            if (!buttonConfig.isShowKey || node[buttonConfig.isShowKey]) {
                const button = document.createElement('button');
                button.textContent = buttonConfig.textKey ? node[buttonConfig.textKey] : '';
                button.onclick = () => window[buttonConfig.onClick](node);
                nodeButtons.appendChild(button);
            }
        });
    }
    nodeHeader.appendChild(nodeButtons);
    nodeElement.appendChild(nodeHeader);
    return nodeElement;
}

function toggleNode(nodeElement) {
    nodeElement.classList.toggle('expanded');
    const expandIcon = nodeElement.querySelector('.tree-node-header span');
    expandIcon.textContent = nodeElement.classList.contains('expanded') ? '-' : '+';

    if (nodeElement.classList.contains('expanded')) {
        const nodeId = nodeElement.querySelector('.tree-node-header span:nth-child(2)').textContent;
        const childrenData = window[treeStructure.getChildrenData](nodeId);
        if (childrenData) {
            const childrenContainer = nodeElement.querySelector('.tree-node-children');
            childrenContainer.innerHTML = '';
            childrenData.forEach(child => {
                childrenContainer.appendChild(createTreeNode(child));
            });
        }
    }
}

function expandAll() {
    const nodes = document.querySelectorAll('.tree-node');
    nodes.forEach(node => {
        node.classList.add('expanded');
        const expandIcon = node.querySelector('.tree-node-header span');
        expandIcon.textContent = '-';
    });
}

function collapseAll() {
    const nodes = document.querySelectorAll('.tree-node');
    nodes.forEach(node => {
        node.classList.remove('expanded');
        const expandIcon = node.querySelector('.tree-node-header span');
        expandIcon.textContent = '+';
    });
}

function searchTree() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const nodes = document.querySelectorAll('.tree-node');
    nodes.forEach(node => {
        const nodeText = node.querySelector('.tree-node-header span:nth-child(2)').textContent.toLowerCase();
        if (nodeText.includes(searchText)) {
            node.style.display = 'block';
        } else {
            node.style.display = 'none';
        }
    });
}

buildTree(createData);

function editFolder(node) {
    console.log('Edit Folder:', node);
}

function deleteFolder(node) {
    console.log('Delete Folder:', node);
}

function getChildrenData(nodeId) {
    // 模拟动态加载子节点数据
    return createData.filter(item => item.parentId === nodeId);
}