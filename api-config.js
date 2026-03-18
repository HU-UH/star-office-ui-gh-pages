// API配置 - deephu.com 专用
const API_BASE_URL = 'http://deephu.com:19000';

// 备用API地址
const API_BACKUP_URLS = [
    'http://127.0.0.1:19000',
    'http://localhost:19000',
    'http://172.24.85.42:19000',
    'http://101.126.133.100:19000'
];

// 是否启用调试模式
const DEBUG = true;

function debugLog(...args) {
    if (DEBUG) {
        console.log('[API]', ...args);
    }
}

// 尝试主API，失败则尝试备用
async function fetchWithFallback(url, options = {}) {
    try {
        return await fetch(url, options);
    } catch (error) {
        debugLog('主API失败，尝试备用API:', error.message);
        
        for (const backupUrl of API_BACKUP_URLS) {
            try {
                debugLog('尝试备用API:', backupUrl);
                return await fetch(backupUrl, options);
            } catch (e) {
                debugLog('备用API失败:', backupUrl, e.message);
            }
        }
        
        throw error;
    }
}

// 获取API端点
function getAPIEndpoint(path) {
    return `${API_BASE_URL}${path}`;
}

// 包装fetch
async function apiRequest(path, options = {}) {
    const url = getAPIEndpoint(path);
    
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'no-store'
    };
    
    return fetchWithFallback(url, { ...defaultOptions, ...options });
}

// 暴露给全局
window.API_BASE_URL = API_BASE_URL;
window.apiRequest = apiRequest;
window.getAPIEndpoint = getAPIEndpoint;

// 初始化日志
debugLog('API配置初始化完成');
debugLog('API地址:', API_BASE_URL);
