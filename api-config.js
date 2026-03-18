// API配置 - 前端通过此配置访问后端API
const API_BASE_URL = window.API_BASE_URL || '';

// 状态轮询间隔（毫秒）
const STATUS_POLL_INTERVAL = 3000;

// 是否启用调试模式
const DEBUG = false;

function debugLog(...args) {
  if (DEBUG) {
    console.log('[DEBUG]', ...args);
  }
}
