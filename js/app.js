/* ==========================================
   APP.JS - 应用入口 + 全局状态 + 工具函数
   ========================================== */

// ============ 全局状态 ============
const AppState = {
    lastSpawnPosition: { x: 0, y: 0 },
    zIndexCounter: 100,
    activeLightboxCard: null,
    originalCardStyles: {
        position: '',
        top: '',
        left: '',
        transform: '',
        zIndex: ''
    }
};

// ============ 工具函数 ============
function getCurrentTimestamp() {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${mm}.${dd}.${yy} ${hh}:${min}:${ss}`;
}

// ============ 初始化 ============
function initApp() {
    // 初始化日期输入框（虽然每次拍照会更新）
    const dateInput = document.getElementById('dateLabel');
    if (dateInput) {
        const today = new Date();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const yy = String(today.getFullYear()).slice(-2);
        dateInput.value = `${mm}.${dd}.${yy}`;
    }
    
    // 初始化各模块
    initCamera();
    initCanvas();
    initLightbox();

    // 初始化数据库并加载照片
    if (window.PolaroidDB) {
        window.PolaroidDB.init().then(() => {
            return window.PolaroidDB.getAllPhotos();
        }).then(photos => {
            if (photos && photos.length > 0) {
                photos.forEach(photo => {
                    if (window.renderCard) {
                        window.renderCard(photo, false);
                    }
                });
            }
        }).catch(err => {
            console.error('DB Init Error:', err);
        });
    }
}

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', initApp);