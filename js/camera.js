/* ==========================================
   CAMERA.JS - 相机拍摄 + 颜色选择器
   ========================================== */

// DOM 元素
let fileInput, previewImg, flashOverlay, printSlot;

// ============ 颜色选择器 ============
function initColorPicker() {
    const dots = document.querySelectorAll('.color-dot');
    
    if (dots.length > 0) {
        dots[0].classList.add('active');
    }
    
    dots.forEach(dot => {
        dot.addEventListener('click', function() {
            dots.forEach(d => d.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ============ 相机功能 ============
function initCamera() {
    // 获取DOM元素
    fileInput = document.getElementById('file-input');
    previewImg = document.getElementById('preview-img');
    flashOverlay = document.getElementById('flash-overlay');
    printSlot = document.getElementById('printSlot');
    
    // 初始化颜色选择器
    initColorPicker();
    
    // 监听文件选择
    fileInput.addEventListener('change', handleFileSelect);
}

// 触发文件选择
function triggerCamera() {
    fileInput.click();
}

// 处理文件选择
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const imgSrc = event.target.result;
            startPhotoSequence(imgSrc);
        }
        reader.readAsDataURL(file);
    }
    fileInput.value = null;
}

// 开始拍照序列
function startPhotoSequence(imgSrc) {
    // 1. 预加载图片
    previewImg.src = imgSrc;
    
    // 2. 触发闪光灯
    flashOverlay.classList.remove('flash-active');
    void flashOverlay.offsetWidth;
    flashOverlay.classList.add('flash-active');
    
    // 3. 激活出片口阴影
    printSlot.classList.add('active');

    // 4. 获取当前选中的颜色
    const activeDot = document.querySelector('.color-dot.active');
    const activeColor = activeDot ? activeDot.getAttribute('data-color') : '#ffffff';

    // 5. 计算生成位置（智能堆叠算法）
    const canvasWorld = document.getElementById('canvasWorld');
    const offsetX = (Math.random() - 0.5) * 120; 
    const offsetY = (Math.random() - 0.5) * 80;
    
    const hasCards = canvasWorld.querySelectorAll('.polaroid-card').length > 0;
    
    if (!hasCards) {
        AppState.lastSpawnPosition = { x: 0, y: 0 };
    } else {
        AppState.lastSpawnPosition.x += offsetX;
        AppState.lastSpawnPosition.y += offsetY;
    }
    
    if (Math.abs(AppState.lastSpawnPosition.x) > 300) AppState.lastSpawnPosition.x *= 0.5;
    if (Math.abs(AppState.lastSpawnPosition.y) > 300) AppState.lastSpawnPosition.y *= 0.5;

    // 6. 获取当前时间戳
    const timestamp = getCurrentTimestamp();

    // 7. 执行动画（调用 animation.js 中的函数）
    createAndAnimateGhostCard(imgSrc, activeColor, AppState.lastSpawnPosition, timestamp);
}