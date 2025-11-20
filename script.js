// 1. 初始化日期 (保留初始值逻辑，虽然每次拍照会更新)
const dateInput = document.getElementById('dateLabel'); // 隐藏的 input
const today = new Date();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const yy = String(today.getFullYear()).slice(-2);
dateInput.value = `${mm}.${dd}.${yy}`;

// 2. 核心交互逻辑
const fileInput = document.getElementById('file-input');
const previewImg = document.getElementById('preview-img'); // 隐藏的 img 标签
const flashOverlay = document.getElementById('flash-overlay');
const printSlot = document.getElementById('printSlot');
const galleryViewport = document.getElementById('galleryViewport');
const canvasWorld = document.getElementById('canvasWorld');
const lightboxOverlay = document.getElementById('lightbox-overlay'); // 新增

// 全局状态
let lastSpawnPosition = { x: 0, y: 0 }; // 相对于画布中心的偏移量
let zIndexCounter = 100; // 用于层级置顶
let activeLightboxCard = null; // 当前在灯箱中的卡片
// 记录卡片进入灯箱前的原始内联样式，用于恢复
let originalCardStyles = {
    position: '',
    top: '',
    left: '',
    transform: '',
    zIndex: ''
};

// 获取当前格式化时间戳
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

// 触发文件选择
function triggerCamera() {
    fileInput.click();
}

// 监听文件选择
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const imgSrc = event.target.result;
            startPhotoSequence(imgSrc);
        }
        reader.readAsDataURL(file);
    }
    this.value = null;
});

// 开始拍照序列动画
function startPhotoSequence(imgSrc) {
    // 1. 预加载图片 (用于 ghost card)
    previewImg.src = imgSrc;
    
    // 2. 触发闪光灯
    flashOverlay.classList.remove('flash-active');
    void flashOverlay.offsetWidth;
    flashOverlay.classList.add('flash-active');
    
    // 3. 激活出片口阴影
    printSlot.classList.add('active');

    // 4. 获取当前选中的颜色 (决定本次拍摄的相纸颜色)
    const activeDot = document.querySelector('.color-dot.active');
    const activeColor = activeDot ? activeDot.getAttribute('data-color') : '#ffffff';

    // 5. 计算本次生成的位置 (智能堆叠算法)
    const offsetX = (Math.random() - 0.5) * 120; 
    const offsetY = (Math.random() - 0.5) * 80;
    
    const hasCards = canvasWorld.querySelectorAll('.polaroid-card').length > 0;
    
    if (!hasCards) {
        lastSpawnPosition = { x: 0, y: 0 };
    } else {
        lastSpawnPosition.x += offsetX;
        lastSpawnPosition.y += offsetY;
    }
    
    if (Math.abs(lastSpawnPosition.x) > 300) lastSpawnPosition.x *= 0.5;
    if (Math.abs(lastSpawnPosition.y) > 300) lastSpawnPosition.y *= 0.5;

    // 6. 获取当前时间戳
    const timestamp = getCurrentTimestamp();

    // 7. 执行动画
    createAndAnimateGhostCard(imgSrc, activeColor, lastSpawnPosition, timestamp);
}

function createAndAnimateGhostCard(imgSrc, bgColor, targetOffset, timestamp) {
    // 记录显影开始时间
    const developStartTime = Date.now();

    // 计算目标屏幕坐标 (Flight Target)
    const canvasRect = canvasWorld.getBoundingClientRect();
    const canvasCenterX = canvasRect.left + canvasRect.width / 2;
    const canvasCenterY = canvasRect.top + canvasRect.height / 2;
    
    // 目标中心点屏幕坐标
    const targetScreenX = canvasCenterX + targetOffset.x;
    const targetScreenY = canvasCenterY + targetOffset.y;
    
    // 目标左上角屏幕坐标 (Scale 1 时的尺寸)
    const ghostWidth = 320;
    
    // 计算缩放比例 (Mask -> 320)
    const maskWidth = printSlot.offsetWidth;
    const scaleFactor = maskWidth / ghostWidth;

    // 创建 Ghost DOM
    const ghost = document.createElement('div');
    ghost.className = 'ghost-card';
    ghost.style.backgroundColor = bgColor;
    
    // 增加 developing-img 类
    ghost.innerHTML = `
        <div class="image-container">
            <img src="${imgSrc}" class="developing-img">
            <div class="develop-overlay"></div>
        </div>
        <div class="date-label">${timestamp}</div>
    `;
    
    // === Phase 1: 放入 Mask ===
    ghost.style.position = 'absolute';
    ghost.style.left = '50%';
    ghost.style.marginLeft = '-160px'; 
    ghost.style.top = '0';
    ghost.style.transformOrigin = 'top center';
    ghost.style.transform = `scale(${scaleFactor}) translateY(-100%)`;
    
    printSlot.appendChild(ghost);

    // 动画 1：滑出
    const slideAnim = ghost.animate([
        { transform: `scale(${scaleFactor}) translateY(-100%)` },
        { transform: `scale(${scaleFactor}) translateY(0%)` }
    ], {
        duration: 1500,
        easing: 'linear',
        fill: 'forwards'
    });

    slideAnim.finished.then(() => {
        // 移除出片口阴影
        printSlot.classList.remove('active');
        
        // === Phase 2: Handoff ===
        const rect = ghost.getBoundingClientRect();
        const fullHeight = rect.height / scaleFactor;
        
        document.body.appendChild(ghost);
        
        // 关键修复：DOM 移动会导致 CSS 动画重置，需手动同步显影进度
        const handoffElapsed = Date.now() - developStartTime;
        const img = ghost.querySelector('.developing-img');
        const overlay = ghost.querySelector('.develop-overlay');
        
        if (img) {
            img.style.animationName = 'none';
            void img.offsetWidth; 
            img.style.animationName = 'developPhoto';
            img.style.animationDelay = `-${handoffElapsed}ms`;
        }
        if (overlay) {
            overlay.style.animationName = 'none';
            void overlay.offsetWidth; 
            overlay.style.animationName = 'developWhiteOverlay';
            overlay.style.animationDelay = `-${handoffElapsed}ms`;
        }
        
        ghost.style.position = 'fixed';
        ghost.style.left = `${rect.left}px`;
        ghost.style.top = `${rect.top}px`;
        ghost.style.margin = '0';
        
        ghost.style.transformOrigin = 'top left';
        ghost.style.transform = `scale(${scaleFactor})`;
        
        void ghost.offsetWidth;
        
        // === Phase 3: Flight & Scaling ===
        // 重新计算目标左上角 (基于准确的 fullHeight)
        const targetLeft = targetScreenX - ghostWidth / 2;
        const targetTop = targetScreenY - fullHeight / 2;
        
        const deltaX = targetLeft - rect.left;
        const deltaY = targetTop - rect.top;
        
        const randomRotate = (Math.random() - 0.5) * 20;
        
        const flyAnim = ghost.animate([
            { transform: `translate(0, 0) scale(${scaleFactor}) rotate(0deg)` },
            { transform: `translate(${deltaX}px, ${deltaY}px) scale(1) rotate(${randomRotate}deg)` }
        ], {
            duration: 1000,
            easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
            fill: 'forwards'
        });
        
        flyAnim.finished.then(() => {
            // 关键修复：基于 Ghost 最终的实际位置来生成卡片
            const finalRect = ghost.getBoundingClientRect();
            
            const currentCanvasRect = canvasWorld.getBoundingClientRect();
            const cCenterX = currentCanvasRect.left + currentCanvasRect.width / 2;
            const cCenterY = currentCanvasRect.top + currentCanvasRect.height / 2;
            
            const gCenterX = finalRect.left + finalRect.width / 2;
            const gCenterY = finalRect.top + finalRect.height / 2;
            
            const actualOffsetX = gCenterX - cCenterX;
            const actualOffsetY = gCenterY - cCenterY;
            
            // 传递 developStartTime 以同步显影动画
            finishSequence(ghost, imgSrc, bgColor, { x: actualOffsetX, y: actualOffsetY }, randomRotate, timestamp, developStartTime);
        });
    });
}

function finishSequence(ghostElement, imgSrc, bgColor, position, rotation, timestamp, developStartTime) {
    ghostElement.remove();
    
    // 创建真实的卡片 DOM
    const card = document.createElement('div');
    card.className = 'polaroid-card';
    card.style.backgroundColor = bgColor;
    
    // 记录创建时间，用于动画同步
    card.dataset.createdAt = developStartTime;
    
    // 初始定位
    card.style.position = 'absolute';
    card.style.left = '50%';
    card.style.top = '50%';
    
    // 设置 Transform
    card.style.transform = `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) rotate(${rotation}deg)`;
    card.style.zIndex = ++zIndexCounter;
    
    card.innerHTML = `
        <div class="image-container">
            <img src="${imgSrc}" class="developing-img">
            <div class="develop-overlay"></div>
        </div>
        <div class="date-label">${timestamp}</div>
    `;
    
    // 计算并同步显影动画进度
    syncAnimationState(card);
    
    // 绑定数据
    card.dataset.x = position.x;
    card.dataset.y = position.y;
    card.dataset.r = rotation;
    
    // 绑定点击事件（用于触发 Lightbox）
    // 注意：区分点击和拖拽
    card.addEventListener('click', function(e) {
        if (!hasMoved && !activeLightboxCard) {
            openLightbox(card);
        }
    });

    canvasWorld.appendChild(card);
}

// 动画同步辅助函数
function syncAnimationState(card) {
    const createdAt = parseInt(card.dataset.createdAt);
    if (!createdAt) return;
    
    const elapsed = Date.now() - createdAt;
    
    const img = card.querySelector('.developing-img');
    const overlay = card.querySelector('.develop-overlay');
    
    if (img) {
        img.style.animationName = 'none';
        void img.offsetWidth;
        img.style.animationName = 'developPhoto';
        img.style.animationDelay = `-${elapsed}ms`;
    }
    if (overlay) {
        overlay.style.animationName = 'none';
        void overlay.offsetWidth;
        overlay.style.animationName = 'developWhiteOverlay';
        overlay.style.animationDelay = `-${elapsed}ms`;
    }
}

// 3. 颜色切换逻辑 (仅更新 UI 状态)
const dots = document.querySelectorAll('.color-dot');

if(dots.length > 0) {
    dots[0].classList.add('active');
}

dots.forEach(dot => {
    dot.addEventListener('click', function() {
        dots.forEach(d => d.classList.remove('active'));
        this.classList.add('active');
    });
});

// 4. 交互系统：卡片拖拽
let isDragging = false;
let hasMoved = false; // 用于区分点击和拖拽
let currentCard = null;
let dragStartX, dragStartY;
let initialCardX, initialCardY;

galleryViewport.addEventListener('mousedown', function(e) {
    // 如果灯箱开启，禁止拖拽
    if (activeLightboxCard) return;

    const card = e.target.closest('.polaroid-card');
    
    if (card) {
        isDragging = true;
        hasMoved = false;
        currentCard = card;
        
        card.style.zIndex = ++zIndexCounter;
        card.style.cursor = 'grabbing';
        
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        
        initialCardX = parseFloat(card.dataset.x) || 0;
        initialCardY = parseFloat(card.dataset.y) || 0;
        
        e.preventDefault();
    }
});

window.addEventListener('mousemove', function(e) {
    if (!isDragging || !currentCard) return;
    
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    
    // 如果移动超过一定阈值，标记为移动（拖拽），否则视为点击
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        hasMoved = true;
    }

    const newX = initialCardX + deltaX;
    const newY = initialCardY + deltaY;
    
    const rotation = currentCard.dataset.r || 0;
    
    currentCard.style.transform = `translate(calc(-50% + ${newX}px), calc(-50% + ${newY}px)) rotate(${rotation}deg)`;
    
    currentCard.dataset.x = newX;
    currentCard.dataset.y = newY;
});

window.addEventListener('mouseup', function() {
    if (isDragging && currentCard) {
        currentCard.style.cursor = 'grab';
        
        // 延迟重置 isDragging，以便 click 事件能正确读取状态（如果是微小移动，仍视为 click）
        // 但这里我们在 mousedown/move 中做了 hasMoved 标记
        // 如果 hasMoved 为 true，则是拖拽；否则是点击
        // 在 finishSequence 中绑定的 click 事件会检查 isDragging
        // 我们需要一种机制来告诉 click handler：这是拖拽结束，不是点击
        
        setTimeout(() => {
            isDragging = false;
            currentCard = null;
        }, 50);
    }
});

// 5. 灯箱系统
function openLightbox(card) {
    if (hasMoved) return; // 如果刚才发生了拖拽，不触发灯箱

    activeLightboxCard = card;
    
    // 1. Sync animation state BEFORE moving (to capture current visual state mentally, although not strictly needed)
    syncAnimationState(card);

    // 保存原始 zIndex (其他样式通过 dataset 还原)
    originalCardStyles.zIndex = card.style.zIndex;

    // 获取卡片当前在视口中的位置 (Bounding Box)
    const rect = card.getBoundingClientRect();
    const rotation = parseFloat(card.dataset.r) || 0;
    
    // === 关键修复：将卡片移至 body，摆脱 .canvas-world 的 transform 上下文 ===
    document.body.appendChild(card);
    
    // 2. Sync animation state AFTER moving (Critical: reparenting resets animation)
    syncAnimationState(card);
    
    // 计算视觉中心点
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // 将卡片切换为 fixed 定位，并保持在当前视觉位置 (中心定位法)
    card.style.position = 'fixed';
    card.style.top = centerY + 'px';
    card.style.left = centerX + 'px';
    // 初始 transform 包含旋转，确保无缝衔接
    card.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    card.style.margin = '0';
    card.style.zIndex = '9999';
    
    // 激活遮罩
    lightboxOverlay.classList.add('active');
    
    // 强制重排
    void card.offsetWidth;

    // 激活灯箱类
    card.classList.add('lightbox-active');

    // 计算屏幕中心目标位置
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 目标是屏幕中心
    const targetCenterX = viewportWidth / 2;
    const targetCenterY = viewportHeight / 2;
    
    // 计算位移 (从当前 centerX/Y 到目标 CenterX/Y)
    // 我们的 transform 是 translate(-50%, -50%) translate(delta)
    // 所以 delta = targetCenter - currentCenter
    
    const deltaX = targetCenterX - centerX;
    const deltaY = targetCenterY - centerY;
    
    // 应用变换：位移 + 放大 + 旋转回正 (rotate 0)
    // 注意：translate 计算是基于初始中心点的偏移
    card.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) scale(1.5) rotate(0deg)`;
}

function closeLightbox() {
    if (!activeLightboxCard) return;

    // 移除遮罩
    lightboxOverlay.classList.remove('active');
    
    // 恢复动画：回到原来的位置 (fixed origin) 并恢复旋转
    // 这里的 "原来的位置" 就是我们 fixed 定位的 top/left (即 centerX, centerY)
    // 所以位移是 0，旋转是原始角度 R
    const r = activeLightboxCard.dataset.r;
    activeLightboxCard.style.transform = `translate(-50%, -50%) scale(1) rotate(${r}deg)`;
    
    const card = activeLightboxCard;
    card.addEventListener('transitionend', function restoreStyle() {
        // 确保当前还在处理这张卡片的关闭流程
        if (card === activeLightboxCard) { 
            // 动画结束后再移除灯箱样式
            card.classList.remove('lightbox-active');

            // === 关键修复：移回 .canvas-world ===
            canvasWorld.appendChild(card);
            
            // 3. Sync animation state AFTER moving back
            syncAnimationState(card);

            // 恢复原始样式 (absolute 定位)
            card.style.position = 'absolute';
            card.style.top = '50%';
            card.style.left = '50%';
            card.style.margin = ''; 
            card.style.zIndex = originalCardStyles.zIndex;
            
            // 从 dataset 恢复准确的 transform (位置 + 旋转)
            const x = card.dataset.x;
            const y = card.dataset.y;
            // r is already const r above
            card.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${r}deg)`;
            
            // 重置 activeCard
             activeLightboxCard = null;
        }
    }, { once: true });
}

// 点击遮罩关闭灯箱
lightboxOverlay.addEventListener('click', function() {
    if (activeLightboxCard) {
        closeLightbox();
    }
});
