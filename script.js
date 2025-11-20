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
        if (img) {
            // 强制重置动画状态以确保 delay 生效
            img.style.animationName = 'none';
            void img.offsetWidth; // 触发重排
            img.style.animationName = 'developPhoto';
            img.style.animationDelay = `-${handoffElapsed}ms`;
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
        </div>
        <div class="date-label">${timestamp}</div>
    `;
    
    // 计算并同步显影动画进度
    const elapsed = Date.now() - developStartTime;
    const img = card.querySelector('.developing-img');
    if (img) {
        // 这里是新创建的 DOM，动画默认从 0 开始，直接设置 delay 即可
        img.style.animationDelay = `-${elapsed}ms`;
    }
    
    // 绑定数据
    card.dataset.x = position.x;
    card.dataset.y = position.y;
    card.dataset.r = rotation;
    
    // 绑定点击事件（用于触发 Lightbox）
    // 注意：区分点击和拖拽
    card.addEventListener('click', function(e) {
        if (!isDragging && !activeLightboxCard) {
            openLightbox(card);
        }
    });

    canvasWorld.appendChild(card);
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
    
    // 保存卡片当前的内联样式
    originalCardStyles.position = card.style.position;
    originalCardStyles.top = card.style.top;
    originalCardStyles.left = card.style.left;
    originalCardStyles.transform = card.style.transform;
    originalCardStyles.zIndex = card.style.zIndex;

    // 获取卡片当前在视口中的位置
    const rect = card.getBoundingClientRect();
    
    // 将卡片切换为 fixed 定位，并保持在当前视觉位置 (作为动画起点)
    card.style.position = 'fixed';
    card.style.top = rect.top + 'px';
    card.style.left = rect.left + 'px';
    card.style.transform = 'none'; // 移除 transform，因为我们直接设定了 top/left
    card.style.margin = '0';
    card.style.zIndex = '9999';
    
    // 激活遮罩
    lightboxOverlay.classList.add('active');
    
    // 强制重排，确保浏览器记录下起始位置
    void card.offsetWidth;

    // 激活灯箱类 (添加阴影等样式)
    card.classList.add('lightbox-active');

    // 设定动画终点：屏幕中心
    // 目标位置：屏幕中心减去卡片一半宽/高
    // 注意：CSS 中可能有 scale 放大，这里我们用 transform 来做位移和缩放
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cardWidth = rect.width; // 此时卡片未缩放
    const cardHeight = rect.height;
    
    const targetX = (viewportWidth - cardWidth) / 2;
    const targetY = (viewportHeight - cardHeight) / 2;
    
    // 计算从当前 fixed 位置 (rect.left, rect.top) 到目标位置 (targetX, targetY) 的位移
    const translateX = targetX - rect.left;
    const translateY = targetY - rect.top;
    
    // 应用变换：位移 + 放大 + 摆正(不旋转)
    // 注意：因为我们之前清除了 transform，现在的 rotation 是 0
    card.style.transform = `translate(${translateX}px, ${translateY}px) scale(1.5)`;
}

function closeLightbox() {
    if (!activeLightboxCard) return;

    // 移除遮罩
    lightboxOverlay.classList.remove('active');
    
    // 移除卡片灯箱样式类
    activeLightboxCard.classList.remove('lightbox-active');
    
    // 恢复动画：回到原来的位置
    // 因为我们之前是 fixed 定位，现在我们需要让它回到那个 visually 相同的位置，但其实我们保存了原始的 absolute 布局
    // 更好的做法是：先让它以 fixed 方式飞回原来的屏幕坐标，动画结束后，再切回 absolute
    
    // 1. 恢复到 fixed 状态下的初始位置 (即动画起点，也就是 absolute 时的屏幕位置)
    card = activeLightboxCard;
    card.style.transform = 'translate(0, 0) scale(1)';
    
    // 监听 transition 结束
    // 为了防止多次绑定，使用 { once: true }
    card.addEventListener('transitionend', function restoreStyle() {
        if (card !== activeLightboxCard) { // 确保是当前关闭的卡片
            // 恢复原始样式 (absolute 定位)
            card.style.position = originalCardStyles.position;
            card.style.top = originalCardStyles.top;
            card.style.left = originalCardStyles.left;
            card.style.transform = originalCardStyles.transform;
            card.style.zIndex = originalCardStyles.zIndex;
            // 清理 margin (openLightbox 时设为了 0)
            card.style.margin = ''; 
            
            // 强制重置 activeCard
             activeLightboxCard = null;
        }
    }, { once: true });
    
    // 这里的 activeLightboxCard 需要在动画开始后就置空吗？
    // 不，因为我们需要在 transitionend 中引用它。
    // 但 closeLightbox 可能被快速点击触发，所以我们需要一个局部变量引用它，然后把全局置空？
    // 或者在 transitionend 里置空。
    // 为了防止逻辑冲突，我们这里暂不置空全局变量，直到动画结束。
    // 但如果用户在动画期间又点击了别的？遮罩层会挡住操作。
}

// 点击遮罩关闭灯箱
lightboxOverlay.addEventListener('click', function() {
    if (activeLightboxCard) {
        closeLightbox();
    }
});
