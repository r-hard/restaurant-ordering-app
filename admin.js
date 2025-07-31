// 管理员页面JavaScript功能
let orders = JSON.parse(localStorage.getItem('restaurantOrders')) || [];
let requests = JSON.parse(localStorage.getItem('restaurantRequests')) || [];

document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

function initializeAdmin() {
    updateStats();
    displayOrders();
    updateRequestsStats();
}

function updateStats() {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalItems = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('total-revenue').textContent = `¥${totalRevenue}`;
    document.getElementById('total-items').textContent = totalItems;
}

function updateRequestsStats() {
    const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'processing').length;
    const totalRequests = requests.length;

    document.getElementById('pending-requests').textContent = pendingRequests;
    document.getElementById('total-requests').textContent = totalRequests;
}

function displayOrders() {
    const container = document.getElementById('orders-container');
    
    if (orders.length === 0) {
        container.innerHTML = '<div class="no-orders">暂无订单</div>';
        return;
    }

    const ordersHTML = orders.map((order, index) => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-id">订单 #${String(index + 1).padStart(4, '0')}</div>
                <div class="order-time">${order.time}</div>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <div class="item-info">
                            <span class="item-name">${item.name}</span>
                            <span class="item-quantity">×${item.quantity}</span>
                        </div>
                        <div class="item-price">¥${item.price * item.quantity}</div>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <div class="order-total">总计：¥${order.total}</div>
                <div class="order-status status-completed">已完成</div>
            </div>
        </div>
    `).join('');

    container.innerHTML = ordersHTML;
}

function goBack() {
    window.location.href = 'index.html';
}

function clearAllOrders() {
    if (orders.length === 0) {
        showMessage('暂无订单需要清空', 'error');
        return;
    }

    if (confirm('确定要清空所有订单吗？此操作不可恢复。')) {
        orders = [];
        localStorage.setItem('restaurantOrders', JSON.stringify(orders));
        updateStats();
        displayOrders();
        showMessage('所有订单已清空', 'success');
    }
}

function clearAllRequests() {
    if (requests.length === 0) {
        showMessage('暂无要求需要清空', 'error');
        return;
    }

    if (confirm('确定要清空所有要求吗？此操作不可恢复。')) {
        requests = [];
        localStorage.setItem('restaurantRequests', JSON.stringify(requests));
        updateRequestsStats();
        if (document.getElementById('requests-section').style.display !== 'none') {
            displayRequests();
        }
        showMessage('所有要求已清空', 'success');
    }
}

function showMessage(message, type = 'success') {
    const messageElement = document.getElementById(type + '-message');
    messageElement.textContent = message;
    messageElement.classList.add('show');
    
    setTimeout(() => {
        messageElement.classList.remove('show');
    }, 3000);
}

// 标签页切换
function switchTab(tab) {
    const tabs = document.querySelectorAll('.admin-tab');
    const ordersSection = document.getElementById('orders-section');
    const requestsSection = document.getElementById('requests-section');

    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'orders') {
        tabs[0].classList.add('active');
        ordersSection.style.display = 'block';
        requestsSection.style.display = 'none';
        displayOrders();
    } else if (tab === 'requests') {
        tabs[1].classList.add('active');
        ordersSection.style.display = 'none';
        requestsSection.style.display = 'block';
        displayRequests();
    }
}

// 要求过滤
function filterRequests(filter) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    displayRequests(filter);
}

// 显示要求列表
function displayRequests(filter = 'all') {
    const container = document.getElementById('requests-container');
    
    let filteredRequests = requests;
    if (filter === 'pending') {
        filteredRequests = requests.filter(r => r.status === 'pending');
    } else if (filter === 'processing') {
        filteredRequests = requests.filter(r => r.status === 'processing');
    } else if (filter === 'completed') {
        filteredRequests = requests.filter(r => r.status === 'completed');
    } else if (filter === 'urgent') {
        filteredRequests = requests.filter(r => r.priority === 'urgent');
    }

    if (filteredRequests.length === 0) {
        container.innerHTML = '<div class="no-requests">暂无要求</div>';
        return;
    }

    const requestsHTML = filteredRequests.map(request => `
        <div class="request-card ${request.priority} ${request.status}">
            <div class="request-header">
                <div class="request-id">要求 #${String(request.id).padStart(4, '0')}</div>
                <div class="request-priority ${request.priority}">${request.priority === 'urgent' ? '🔥 加急' : '普通'}</div>
            </div>
            <div class="request-info">
                <div class="request-author">
                    <strong>顾客：</strong>${request.author}
                    ${request.contact ? `<span>(${request.contact})</span>` : ''}
                </div>
                <div class="request-type">
                    <strong>类型：</strong>${getRequestTypeDisplay(request.type)}
                </div>
                <div class="request-description">
                    <strong>要求：</strong>${request.description}
                </div>
                <div class="request-meta">
                    <span class="request-time">提交时间：${request.timestamp}</span>
                    <span class="request-estimated">预计完成：${request.estimatedTime}</span>
                </div>
            </div>
            <div class="request-actions">
                <select class="status-select" onchange="updateRequestStatus(${request.id}, this.value)">
                    <option value="pending" ${request.status === 'pending' ? 'selected' : ''}>待处理</option>
                    <option value="processing" ${request.status === 'processing' ? 'selected' : ''}>制作中</option>
                    <option value="completed" ${request.status === 'completed' ? 'selected' : ''}>已完成</option>
                    <option value="cancelled" ${request.status === 'cancelled' ? 'selected' : ''}>已取消</option>
                </select>
                <button class="action-btn complete-btn" onclick="markRequestComplete(${request.id})" 
                        ${request.status === 'completed' ? 'disabled' : ''}>
                    完成
                </button>
                <button class="action-btn delete-btn" onclick="deleteRequest(${request.id})">删除</button>
            </div>
        </div>
    `).join('');

    container.innerHTML = requestsHTML;
}

function getRequestTypeDisplay(type) {
    const typeMap = {
        'custom-food': '定制菜品',
        'modify-food': '菜品调整',
        'special-need': '特殊需求',
        'other': '其他要求'
    };
    return typeMap[type] || type;
}

function updateRequestStatus(id, status) {
    const request = requests.find(r => r.id === id);
    if (request) {
        request.status = status;
        request.updatedAt = new Date().toLocaleString('zh-CN');
        localStorage.setItem('restaurantRequests', JSON.stringify(requests));
        updateRequestsStats();
        showMessage('要求状态已更新', 'success');
    }
}

function markRequestComplete(id) {
    updateRequestStatus(id, 'completed');
    displayRequests();
}

function deleteRequest(id) {
    if (confirm('确定要删除这个要求吗？此操作不可恢复。')) {
        requests = requests.filter(r => r.id !== id);
        localStorage.setItem('restaurantRequests', JSON.stringify(requests));
        updateRequestsStats();
        displayRequests();
        showMessage('要求已删除', 'success');
    }
}

// 定期刷新显示（如果多个管理员页面同时打开）
setInterval(() => {
    const latestOrders = JSON.parse(localStorage.getItem('restaurantOrders')) || [];
    const latestRequests = JSON.parse(localStorage.getItem('restaurantRequests')) || [];
    
    if (JSON.stringify(latestOrders) !== JSON.stringify(orders)) {
        orders = latestOrders;
        updateStats();
        displayOrders();
    }
    
    if (JSON.stringify(latestRequests) !== JSON.stringify(requests)) {
        requests = latestRequests;
        updateRequestsStats();
        if (document.getElementById('requests-section').style.display !== 'none') {
            displayRequests();
        }
    }
}, 5000);