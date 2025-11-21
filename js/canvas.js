/* ==========================================
   CANVAS.JS - 画布管理 + 卡片拖拽
   ========================================== */

// 拖拽状态
let isDragging = false;
let currentCard = null;
let dragStartX, dragStartY;
let initialCardX, initialCardY;

// 导出给其他模块使用（用于区分点击和拖拽）
window.cardHasMoved = false;

// ============ 画布初始化 ============
function initCanvas() {
    const galleryViewport = document.getElementById('galleryViewport');
    
    // 鼠标按下事件
    galleryViewport.addEventListener('mousedown', handleMouseDown);
    
    // 全局鼠标移动和释放事件
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
}

// ============ 拖拽事件处理 ============
function handleMouseDown(e) {
    // 如果灯箱开启，禁止拖拽
    if (AppState.activeLightboxCard) return;

    const card = e.target.closest('.polaroid-card');
    
    if (card) {
        isDragging = true;
        window.cardHasMoved = false;
        currentCard = card;
        
        card.style.zIndex = ++AppState.zIndexCounter;
        card.style.cursor = 'grabbing';
        
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        
        initialCardX = parseFloat(card.dataset.x) || 0;
        initialCardY = parseFloat(card.dataset.y) || 0;
        
        e.preventDefault();
    }
}

function handleMouseMove(e) {
    if (!isDragging || !currentCard) return;
    
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    
    // 如果移动超过阈值，标记为拖拽
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        window.cardHasMoved = true;
    }

    const newX = initialCardX + deltaX;
    const newY = initialCardY + deltaY;
    
    const rotation = currentCard.dataset.r || 0;
    
    currentCard.style.transform = `translate(calc(-50% + ${newX}px), calc(-50% + ${newY}px)) rotate(${rotation}deg)`;
    
    currentCard.dataset.x = newX;
    currentCard.dataset.y = newY;
}

function handleMouseUp() {
    if (isDragging && currentCard) {
        currentCard.style.cursor = 'grab';
        
        // 如果发生了移动，且有 ID，则更新数据库
        if (window.cardHasMoved && window.PolaroidDB && currentCard.dataset.id) {
            const id = currentCard.dataset.id;
            const x = parseFloat(currentCard.dataset.x);
            const y = parseFloat(currentCard.dataset.y);
            
            window.PolaroidDB.getPhoto(id).then(photo => {
                if (photo) {
                    photo.x = x;
                    photo.y = y;
                    window.PolaroidDB.savePhoto(photo);
                }
            }).catch(err => console.error('Failed to update position:', err));
        }
        
        setTimeout(() => {
            isDragging = false;
            currentCard = null;
        }, 50);
    }
}