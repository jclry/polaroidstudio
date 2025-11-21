/* ==========================================
   LIGHTBOX.JS - 灯箱功能
   ========================================== */

let lightboxOverlay;
let actionBarTimer = null;

// ============ 灯箱初始化 ============
function initLightbox() {
    lightboxOverlay = document.getElementById('lightbox-overlay');
    
    // 点击遮罩关闭灯箱
    lightboxOverlay.addEventListener('click', function() {
        if (AppState.activeLightboxCard) {
            closeLightbox();
        }
    });
}

// ============ 打开灯箱 ============
function openLightbox(card) {
    if (window.cardHasMoved) return;

    AppState.activeLightboxCard = card;
    
    // 同步动画状态
    syncAnimationState(card);

    // 保存原始 zIndex
    AppState.originalCardStyles.zIndex = card.style.zIndex;

    // 获取卡片当前位置
    const rect = card.getBoundingClientRect();
    const rotation = parseFloat(card.dataset.r) || 0;
    
    // 移至 body
    document.body.appendChild(card);
    
    // 再次同步动画状态
    syncAnimationState(card);
    
    // 计算视觉中心点
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // 切换为 fixed 定位
    card.style.position = 'fixed';
    card.style.top = centerY + 'px';
    card.style.left = centerX + 'px';
    card.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    card.style.margin = '0';
    card.style.zIndex = '9999';
    
    lightboxOverlay.classList.add('active');
    void card.offsetWidth;
    card.classList.add('lightbox-active');

    // 延迟显示操作栏 (400ms transition)
    if (actionBarTimer) clearTimeout(actionBarTimer);
    actionBarTimer = setTimeout(() => {
        if (AppState.activeLightboxCard === card) {
            card.classList.add('actions-visible');
        }
    }, 400);

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const targetCenterX = viewportWidth / 2;
    const targetCenterY = viewportHeight / 2;
    const deltaX = targetCenterX - centerX;
    const deltaY = targetCenterY - centerY;
    
    card.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) scale(1.5) rotate(0deg)`;
}

// ============ 关闭灯箱 ============
function closeLightbox() {
    if (!AppState.activeLightboxCard) return;

    // 清理定时器并立即隐藏操作栏
    if (actionBarTimer) {
        clearTimeout(actionBarTimer);
        actionBarTimer = null;
    }
    AppState.activeLightboxCard.classList.remove('actions-visible');

    lightboxOverlay.classList.remove('active');
    
    // 强制设置关闭动画，使用更平滑的曲线 (Standard Easing) 避免“突然变快”
    // 时长保持 0.4s
    AppState.activeLightboxCard.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    
    const r = AppState.activeLightboxCard.dataset.r;
    AppState.activeLightboxCard.style.transform = `translate(-50%, -50%) scale(1) rotate(${r}deg)`;
    
    const card = AppState.activeLightboxCard;
    card.addEventListener('transitionend', function restoreStyle() {
        if (card === AppState.activeLightboxCard) { 
            // 1. 临时禁用 transition，防止样式还原时产生多余动画
            card.style.transition = 'none';

            card.classList.remove('lightbox-active');
            const canvasWorld = document.getElementById('canvasWorld');
            canvasWorld.appendChild(card);
            syncAnimationState(card);
            card.style.position = 'absolute';
            card.style.top = '50%';
            card.style.left = '50%';
            card.style.margin = ''; 
            card.style.zIndex = AppState.originalCardStyles.zIndex;
            const x = card.dataset.x;
            const y = card.dataset.y;
            card.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${r}deg)`;
            
            // 2. 强制重排，使样式更改立即生效
            void card.offsetWidth;

            // 3. 恢复 transition
            card.style.transition = '';

            AppState.activeLightboxCard = null;
        }
    }, { once: true });
}