// 认证页面JavaScript功能
function switchTab(tab) {
    // 切换标签按钮状态
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // 切换表单显示
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(f => f.classList.remove('active'));
    
    if (tab === 'login') {
        document.getElementById('login-form').classList.add('active');
    } else {
        document.getElementById('register-form').classList.add('active');
    }
}

// 显示消息
function showMessage(message, type = 'success') {
    const messageElement = document.getElementById(type + '-message');
    messageElement.textContent = message;
    messageElement.classList.add('show');
    
    setTimeout(() => {
        messageElement.classList.remove('show');
    }, 3000);
}

// 表单验证
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 1;
}

// 登录表单提交
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // 验证表单
    if (!validateEmail(email)) {
        showMessage('请输入有效的邮箱地址', 'error');
        return;
    }
    
    if (!validatePassword(password)) {
        showMessage('密码至少需要1个字符', 'error');
        return;
    }
    
    // 模拟登录成功
    showMessage('登录成功！正在跳转...', 'success');
    
    // 模拟跳转到主页
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
});

// 注册表单提交
document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const agreeTerms = document.getElementById('agree-terms').checked;
    
    // 验证表单
    if (username.length < 2) {
        showMessage('用户名至少需要2个字符', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showMessage('请输入有效的邮箱地址', 'error');
        return;
    }
    
    if (!validatePassword(password)) {
        showMessage('密码至少需要6个字符', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('两次输入的密码不一致', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showMessage('请同意服务条款和隐私政策', 'error');
        return;
    }
    
    // 模拟注册成功
    showMessage('注册成功！正在跳转到登录页面...', 'success');
    
    // 模拟跳转到登录页面
    setTimeout(() => {
        switchTab('login');
        document.querySelector('.auth-tab').click();
    }, 1500);
});

// 忘记密码链接
document.querySelector('.forgot-password').addEventListener('click', function(e) {
    e.preventDefault();
    showMessage('密码重置功能正在开发中', 'error');
});

// 微信登录
document.querySelector('.wechat-btn').addEventListener('click', function() {
    showMessage('微信登录功能正在开发中', 'error');
});

// 手机号登录
document.querySelector('.phone-btn').addEventListener('click', function() {
    showMessage('手机号登录功能正在开发中', 'error');
});

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 默认显示登录表单
    document.getElementById('login-form').classList.add('active');
    
    // 为输入框添加焦点效果
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
});