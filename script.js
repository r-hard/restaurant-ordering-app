let cart = [];
let currentCategory = 'main';
let reviews = [];
let currentReviewId = 0;

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadRequests();
});

function initializeApp() {
    setupCategoryFilters();
    setupCartOverlay();
    updateCartDisplay();
    initializeMenuItems();
    loadReviews();
}

function initializeMenuItems() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.add('hidden');
        item.classList.remove('visible');
    });
    // Show the empty state initially
    document.getElementById('no-category-selected').style.display = 'block';
}

function setupCategoryFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentCategory = this.dataset.category;
            filterMenuItems();
        });
    });
    
  // Don't set default category initially, let user choose
    currentCategory = null;
    filterMenuItems();
}

function filterMenuItems() {
    const menuItems = document.querySelectorAll('.menu-item');
    const emptyState = document.getElementById('no-category-selected');
    
    if (currentCategory === null || currentCategory === undefined) {
        // Show empty state when no category is selected
        menuItems.forEach(item => {
            item.classList.add('hidden');
            item.classList.remove('visible');
        });
        emptyState.style.display = 'block';
        return;
    }
    
    // Hide empty state and show filtered items
    emptyState.style.display = 'none';
    
    menuItems.forEach(item => {
        if (item.dataset.category === currentCategory) {
            item.classList.remove('hidden');
            item.classList.add('visible');
            // Add animation for new items
            item.style.animation = 'fadeIn 0.3s ease-in-out';
        } else {
            item.classList.remove('visible');
            item.classList.add('hidden');
        }
    });
}

function setupCartOverlay() {
    const cartOverlay = document.getElementById('cart-overlay');
    
    cartOverlay.addEventListener('click', function(e) {
        if (e.target === cartOverlay) {
            toggleCart();
        }
    });
}

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    showAddToCartFeedback();
}

function showAddToCartFeedback() {
    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.style.transform = 'scale(1.1)';
    cartIcon.style.background = 'rgba(0, 122, 255, 0.2)';
    
    setTimeout(() => {
        cartIcon.style.transform = 'scale(1)';
        cartIcon.style.background = 'transparent';
    }, 150);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

function updateQuantity(index, change) {
    const item = cart[index];
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(index);
    } else {
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">购物车为空</p>';
        totalPrice.textContent = '¥0';
        return;
    }
    
    let cartHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">¥${item.price} × ${item.quantity}</div>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${index})">删除</button>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = cartHTML;
    totalPrice.textContent = `¥${total}`;
}

function toggleCart() {
    const cartOverlay = document.getElementById('cart-overlay');
    cartOverlay.classList.toggle('active');
    
    if (cartOverlay.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

function checkout() {
    if (cart.length === 0) {
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderDetails = cart.map(item => `${item.name} × ${item.quantity}`).join(', ');
    
    console.log('订单详情:', orderDetails);
    console.log('总金额:', total);
    
    // 保存订单到本地存储
    saveOrder(cart, total);
    
    cart = [];
    updateCartDisplay();
    toggleCart();
    
    showSuccessMessage();
    
    // 延迟跳转到管理员页面
    setTimeout(() => {
        window.location.href = 'admin.html';
    }, 1500);
}

function saveOrder(items, total) {
    const orders = JSON.parse(localStorage.getItem('restaurantOrders')) || [];
    
    const newOrder = {
        id: Date.now(),
        items: items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        total: total,
        time: new Date().toLocaleString('zh-CN')
    };
    
    orders.push(newOrder);
    localStorage.setItem('restaurantOrders', JSON.stringify(orders));
}

function showSuccessMessage() {
    const successMessage = document.getElementById('success-message');
    successMessage.style.display = 'block';
    
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 2000);
}

document.addEventListener('touchstart', function() {
}, { passive: true });

document.addEventListener('touchmove', function(e) {
    const cartOverlay = document.getElementById('cart-overlay');
    if (cartOverlay.classList.contains('active')) {
        e.preventDefault();
    }
}, { passive: false });

window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        const cartOverlay = document.getElementById('cart-overlay');
        if (cartOverlay.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        }
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const cartOverlay = document.getElementById('cart-overlay');
        if (cartOverlay.classList.contains('active')) {
            toggleCart();
        }
    }
});

function goToAuth() {
    window.location.href = 'auth.html';
}

function goToAdmin() {
    window.location.href = 'admin.html';
}

function setupSwipeGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const cartOverlay = document.getElementById('cart-overlay');
        const swipeThreshold = 50;
        const verticalThreshold = 100;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        if (cartOverlay.classList.contains('active')) {
            if (deltaX > swipeThreshold && Math.abs(deltaY) < verticalThreshold) {
                toggleCart();
            }
        }
    }
}

setupSwipeGestures();

// 要求模态框事件设置
let requestsModalEventsSetup = false;

function setupRequestsModalEvents() {
    if (requestsModalEventsSetup) return;
    
    const overlay = document.getElementById('requests-overlay');
    
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeRequestsModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeRequestsModal();
        }
    });
    
    requestsModalEventsSetup = true;
}

// 评论功能数据管理
function loadReviews() {
    const savedReviews = localStorage.getItem('restaurantReviews');
    if (savedReviews) {
        reviews = JSON.parse(savedReviews);
        currentReviewId = Math.max(...reviews.map(r => r.id), 0);
    } else {
        // 添加示例评论
        addSampleReviews();
    }
}

function addSampleReviews() {
    const sampleReviews = [
        {
            rating: 5,
            itemName: "经典汉堡",
            author: "美食爱好者",
            content: "汉堡味道非常棒，牛肉饼很新鲜，蔬菜也很新鲜，整体口感很好！"
        },
        {
            rating: 4,
            itemName: "鲜榨橙汁",
            author: "健康达人",
            content: "橙汁很新鲜，口感纯正，就是价格稍微有点贵。"
        }
    ];
    
    sampleReviews.forEach(review => {
        addReview(review);
    });
}

function saveReviews() {
    localStorage.setItem('restaurantReviews', JSON.stringify(reviews));
}

function addReview(reviewData) {
    const newReview = {
        id: ++currentReviewId,
        ...reviewData,
        timestamp: new Date().toLocaleString('zh-CN'),
        replies: []
    };
    reviews.unshift(newReview);
    saveReviews();
    return newReview;
}

function addReply(reviewId, replyData) {
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
        const newReply = {
            id: ++currentReviewId,
            ...replyData,
            timestamp: new Date().toLocaleString('zh-CN')
        };
        review.replies.push(newReply);
        saveReviews();
        return newReply;
    }
    return null;
}

function getReviews() {
    return reviews;
}

// 评论模态框
function showReviewsModal() {
    const overlay = document.createElement('div');
    overlay.className = 'reviews-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: flex-end;
        z-index: 1000;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
    `;

    const modal = document.createElement('div');
    modal.className = 'reviews-modal';
    modal.innerHTML = `
        <div class="reviews-header">
            <h2>用户评价</h2>
            <button class="close-btn" onclick="closeReviewsModal()">×</button>
        </div>
        <div class="reviews-content">
            <div class="review-form-section">
                <h3>发表评价</h3>
                <form id="review-form">
                    <div class="form-group">
                        <label>评分：</label>
                        <div class="star-rating" id="star-rating">
                            ${[1,2,3,4,5].map(i => `<span class="star" data-rating="${i}">★</span>`).join('')}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>菜品名称：</label>
                        <select id="review-item" required>
                            <option value="">选择菜品</option>
                            <option value="经典汉堡">经典汉堡</option>
                            <option value="香辣炸鸡">香辣炸鸡</option>
                            <option value="麻辣火锅">麻辣火锅</option>
                            <option value="番茄火锅">番茄火锅</option>
                            <option value="宫保鸡丁">宫保鸡丁</option>
                            <option value="鱼香肉丝">鱼香肉丝</option>
                            <option value="炸鸡排">炸鸡排</option>
                            <option value="炸薯条">炸薯条</option>
                            <option value="可口可乐">可口可乐</option>
                            <option value="鲜榨橙汁">鲜榨橙汁</option>
                            <option value="香草冰淇淋">香草冰淇淋</option>
                            <option value="巧克力蛋糕">巧克力蛋糕</option>
                            <option value="自定义菜品">自定义菜品</option>
                            <option value="创意甜品">创意甜品</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>您的昵称：</label>
                        <input type="text" id="review-author" placeholder="请输入昵称" required>
                    </div>
                    <div class="form-group">
                        <label>评价内容：</label>
                        <textarea id="review-content" placeholder="请输入您的评价..." rows="3" required></textarea>
                    </div>
                    <button type="submit" class="submit-btn">提交评价</button>
                </form>
            </div>
            <div class="reviews-list-section">
                <h3>用户评价列表</h3>
                <div id="reviews-list" class="reviews-list">
                    ${renderReviews()}
                </div>
            </div>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // 设置事件监听
    setupReviewForm();
    setupStarRating();
    setupReviewModalEvents(overlay);
    
    // 防止背景滚动
    document.body.style.overflow = 'hidden';
}

function closeReviewsModal() {
    const overlay = document.querySelector('.reviews-overlay');
    if (overlay) {
        document.body.style.overflow = 'auto';
        document.body.removeChild(overlay);
    }
}

function renderReviews() {
    const reviewsData = getReviews();
    if (reviewsData.length === 0) {
        return '<p class="empty-reviews">暂无评价</p>';
    }

    return reviewsData.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="review-info">
                    <span class="review-author">${review.author}</span>
                    <span class="review-item-name">评价了 ${review.itemName}</span>
                    <span class="review-time">${review.timestamp}</span>
                </div>
                <div class="review-rating">
                    ${generateStarDisplay(review.rating)}
                </div>
            </div>
            <div class="review-content">${review.content}</div>
            <div class="review-actions">
                <button class="reply-btn" onclick="toggleReplyForm(${review.id})">回复</button>
                <button class="replies-btn" onclick="toggleReplies(${review.id})">
                    查看回复 (${review.replies.length})
                </button>
            </div>
            <div class="reply-form" id="reply-form-${review.id}" style="display: none;">
                <div class="reply-input-group">
                    <input type="text" id="reply-author-${review.id}" placeholder="您的昵称">
                    <textarea id="reply-content-${review.id}" placeholder="写下您的回复..." rows="2"></textarea>
                    <button class="submit-reply-btn" onclick="submitReply(${review.id})">提交回复</button>
                </div>
            </div>
            <div class="replies-list" id="replies-${review.id}">
                ${renderReplies(review.replies)}
            </div>
        </div>
    `).join('');
}

function renderReplies(replies) {
    if (replies.length === 0) return '';
    
    return replies.map(reply => `
        <div class="reply-item">
            <div class="reply-author">${reply.author}</div>
            <div class="reply-content">${reply.content}</div>
            <div class="reply-time">${reply.timestamp}</div>
        </div>
    `).join('');
}

function generateStarDisplay(rating) {
    return [1,2,3,4,5].map(i => 
        `<span class="star ${i <= rating ? 'filled' : ''}">★</span>`
    ).join('');
}

function setupReviewForm() {
    const form = document.getElementById('review-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitReview();
    });
}

function setupStarRating() {
    const stars = document.querySelectorAll('.star');
    let currentRating = 0;
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            currentRating = parseInt(this.dataset.rating);
            updateStarDisplay(currentRating);
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            updateStarDisplay(rating);
        });
    });
    
    document.getElementById('star-rating').addEventListener('mouseleave', function() {
        updateStarDisplay(currentRating);
    });
    
    window.currentRating = currentRating;
}

function updateStarDisplay(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });
    window.currentRating = rating;
}

function submitReview() {
    const rating = window.currentRating;
    const itemName = document.getElementById('review-item').value;
    const author = document.getElementById('review-author').value;
    const content = document.getElementById('review-content').value;
    
    if (!rating || !itemName || !author || !content) {
        showNotification('请填写完整的评价信息', 'error');
        return;
    }
    
    addReview({
        rating: rating,
        itemName: itemName,
        author: author,
        content: content
    });
    
    // 重置表单
    document.getElementById('review-form').reset();
    window.currentRating = 0;
    updateStarDisplay(0);
    
    // 更新评论列表
    document.getElementById('reviews-list').innerHTML = renderReviews();
    
    showNotification('评价提交成功！', 'success');
}

function toggleReplyForm(reviewId) {
    const replyForm = document.getElementById(`reply-form-${reviewId}`);
    replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
}

function toggleReplies(reviewId) {
    const repliesList = document.getElementById(`replies-${reviewId}`);
    repliesList.style.display = repliesList.style.display === 'none' ? 'block' : 'none';
}

function submitReply(reviewId) {
    const author = document.getElementById(`reply-author-${reviewId}`).value;
    const content = document.getElementById(`reply-content-${reviewId}`).value;
    
    if (!author || !content) {
        showNotification('请填写完整的回复信息', 'error');
        return;
    }
    
    addReply(reviewId, {
        author: author,
        content: content
    });
    
    // 重置表单并隐藏
    document.getElementById(`reply-author-${reviewId}`).value = '';
    document.getElementById(`reply-content-${reviewId}`).value = '';
    document.getElementById(`reply-form-${reviewId}`).style.display = 'none';
    
    // 更新评论列表
    document.getElementById('reviews-list').innerHTML = renderReviews();
    
    showNotification('回复提交成功！', 'success');
}

function setupReviewModalEvents(overlay) {
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeReviewsModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeReviewsModal();
        }
    });
}

// 评价功能
function openReviews() {
    showReviewsModal();
}

// 要求数据管理
let requests = [];
let currentRequestId = 0;

function loadRequests() {
    const savedRequests = localStorage.getItem('restaurantRequests');
    if (savedRequests) {
        requests = JSON.parse(savedRequests);
        currentRequestId = Math.max(...requests.map(r => r.id), 0);
    }
}

function saveRequests() {
    localStorage.setItem('restaurantRequests', JSON.stringify(requests));
}

function addRequest(requestData) {
    const newRequest = {
        id: ++currentRequestId,
        ...requestData,
        timestamp: new Date().toLocaleString('zh-CN'),
        status: 'pending', // pending, processing, completed, cancelled
        priority: requestData.urgent ? 'urgent' : 'normal',
        estimatedTime: getEstimatedTimeDisplay(requestData.time)
    };
    requests.unshift(newRequest);
    saveRequests();
    return newRequest;
}

function getEstimatedTimeDisplay(timeValue) {
    const timeMap = {
        'asap': '15-30分钟',
        'normal': '30-45分钟', 
        'relaxed': '45-60分钟'
    };
    return timeMap[timeValue] || '30-45分钟';
}

function getRequests() {
    return requests;
}

function updateRequestStatus(id, status) {
    const request = requests.find(r => r.id === id);
    if (request) {
        request.status = status;
        request.updatedAt = new Date().toLocaleString('zh-CN');
        saveRequests();
        return request;
    }
    return null;
}

// 要求功能
function openRequests() {
    showRequestsModal();
}

function showRequestsModal() {
    const overlay = document.getElementById('requests-overlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setupRequestForm();
        setupRequestsModalEvents();
    }
}

function closeRequestsModal() {
    const overlay = document.getElementById('requests-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        document.getElementById('request-form').reset();
    }
}

function setupRequestForm() {
    const form = document.getElementById('request-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitRequest();
    });
}

function submitRequest() {
    const author = document.getElementById('request-author').value;
    const contact = document.getElementById('request-contact').value;
    const type = document.getElementById('request-type').value;
    const description = document.getElementById('request-description').value;
    const time = document.getElementById('request-time').value;
    const urgent = document.getElementById('request-urgent').checked;

    if (!author || !type || !description || !time) {
        showNotification('请填写所有必填项', 'error');
        return;
    }

    const requestData = {
        author: author,
        contact: contact,
        type: type,
        description: description,
        time: time,
        urgent: urgent
    };

    addRequest(requestData);
    
    showNotification('要求提交成功！我们会尽快与您联系确认详情', 'success');
    
    // 延迟关闭模态框
    setTimeout(() => {
        closeRequestsModal();
    }, 2000);
}

function viewMyRequests() {
    const userRequests = requests.filter(r => r.author === document.getElementById('request-author').value);
    
    if (userRequests.length === 0) {
        showNotification('您还没有提交任何要求', 'info');
        return;
    }

    let requestsHTML = '<h3>我的要求记录：</h3>';
    userRequests.forEach(request => {
        requestsHTML += `
            <div class="my-request-item">
                <div class="request-header">
                    <span class="request-type">${getRequestTypeDisplay(request.type)}</span>
                    <span class="request-status ${request.status}">${getRequestStatusDisplay(request.status)}</span>
                </div>
                <div class="request-description">${request.description}</div>
                <div class="request-meta">
                    <span class="request-time">提交时间：${request.timestamp}</span>
                    <span class="request-estimated">预计完成：${request.estimatedTime}</span>
                </div>
            </div>
        `;
    });

    showNotification(`${requestsHTML}`, 'info');
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

function getRequestStatusDisplay(status) {
    const statusMap = {
        'pending': '待处理',
        'processing': '制作中',
        'completed': '已完成',
        'cancelled': '已取消'
    };
    return statusMap[status] || status;
}

// 通知功能
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 1001;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    // 根据类型设置背景色
    const colors = {
        'info': '#007aff',
        'success': '#34c759',
        'warning': '#ff9500',
        'error': '#ff3b30'
    };
    notification.style.backgroundColor = colors[type] || colors['info'];
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动消失
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}