// API配置 - 前端通过此配置访问后端API
const API_CANDIDATES = [
    // 内网IP（优先）
    'http://172.24.85.42:19000',
    // 公网IP
    'http://115.190.33.33:19000',
    'http://115.190.33.166:19000',
    // 本地
    'http://127.0.0.1:19000',
    'http://localhost:19000'
];

// 状态轮询间隔（毫秒）
const STATUS_POLL_INTERVAL = 3000;

// 当前使用的API地址
let API_BASE_URL = '';

// 是否启用调试模式
const DEBUG = true;

function debugLog(...args) {
    if (DEBUG) {
        console.log('[API]', ...args);
    }
}

// 自动检测可用的API地址
async function detectAPIEndpoint() {
    debugLog('开始检测API端点...');
    
    for (const apiUrl of API_CANDIDATES) {
        try {
            debugLog('尝试连接:', apiUrl);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`${apiUrl}/health`, {
                method: 'GET',
                signal: controller.signal,
                cache: 'no-store'
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                debugLog('API连接成功:', apiUrl, data);
                return apiUrl;
            }
        } catch (e) {
            debugLog('API连接失败:', apiUrl, e.message);
        }
    }
    
    debugLog('所有API端点都无法连接');
    return null;
}

// 初始化API配置
async function initAPIConfig() {
    // 优先使用URL参数或localStorage中的配置
    const urlParams = new URLSearchParams(window.location.search);
    let apiUrl = urlParams.get('api') || localStorage.getItem('star_api_url');
    
    if (apiUrl) {
        debugLog('使用配置的API地址:', apiUrl);
        API_BASE_URL = apiUrl;
        localStorage.setItem('star_api_url', apiUrl);
        return;
    }
    
    // 自动检测
    apiUrl = await detectAPIEndpoint();
    
    if (apiUrl) {
        API_BASE_URL = apiUrl;
        localStorage.setItem('star_api_url', apiUrl);
        debugLog('自动检测到可用API:', apiUrl);
        window.API_BASE_URL = apiUrl;
    } else {
        // 如果都失败了，使用第一个候选地址作为默认
        API_BASE_URL = API_CANDIDATES[0];
        window.API_BASE_URL = API_BASE_URL;
        debugLog('使用默认API地址:', API_BASE_URL);
        localStorage.setItem('star_api_url', API_BASE_URL);
    }
}

// 页面加载时初始化
if (typeof window !== 'undefined') {
    initAPIConfig().then(() => {
        debugLog('API配置完成:', API_BASE_URL);
        // 触发自定义事件，通知其他脚本
        if (typeof window.dispatchEvent === 'function') {
            const event = new CustomEvent('apiConfigReady', { detail: { apiUrl: API_BASE_URL } });
            window.dispatchEvent(event);
        }
    });
}
