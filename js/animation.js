/* ==========================================
   ANIMATION.JS - 照片动画逻辑
   ========================================== */

// ============ 显影动画同步 ============
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

// ============ Ghost 卡片动画 ============
function createAndAnimateGhostCard(imgSrc, bgColor, targetOffset, timestamp) {
    const developStartTime = Date.now();
    const canvasWorld = document.getElementById('canvasWorld');
    const printSlot = document.getElementById('printSlot');

    // 计算目标屏幕坐标
    const canvasRect = canvasWorld.getBoundingClientRect();
    const canvasCenterX = canvasRect.left + canvasRect.width / 2;
    const canvasCenterY = canvasRect.top + canvasRect.height / 2;
    
    const targetScreenX = canvasCenterX + targetOffset.x;
    const targetScreenY = canvasCenterY + targetOffset.y;
    
    const ghostWidth = 320;
    const maskWidth = printSlot.offsetWidth;
    const scaleFactor = maskWidth / ghostWidth;

    // 创建 Ghost DOM
    const ghost = document.createElement('div');
    ghost.className = 'ghost-card';
    ghost.style.backgroundColor = bgColor;
    
    ghost.innerHTML = `
        <div class="image-container">
            <img src="${imgSrc}" class="developing-img">
            <div class="develop-overlay"></div>
        </div>
        <div class="date-label">${timestamp}</div>
    `;
    
    // Phase 1: 放入 Mask
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
        printSlot.classList.remove('active');
        
        // Phase 2: Handoff
        const rect = ghost.getBoundingClientRect();
        const fullHeight = rect.height / scaleFactor;
        
        document.body.appendChild(ghost);
        
        // 同步显影进度
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
        
        // Phase 3: Flight & Scaling
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
            const finalRect = ghost.getBoundingClientRect();
            
            const currentCanvasRect = canvasWorld.getBoundingClientRect();
            const cCenterX = currentCanvasRect.left + currentCanvasRect.width / 2;
            const cCenterY = currentCanvasRect.top + currentCanvasRect.height / 2;
            
            const gCenterX = finalRect.left + finalRect.width / 2;
            const gCenterY = finalRect.top + finalRect.height / 2;
            
            const actualOffsetX = gCenterX - cCenterX;
            const actualOffsetY = gCenterY - cCenterY;
            
            finishSequence(ghost, imgSrc, bgColor, { x: actualOffsetX, y: actualOffsetY }, randomRotate, timestamp, developStartTime);
        });
    });
}

// ============ 完成序列，创建真实卡片 ============
function finishSequence(ghostElement, imgSrc, bgColor, position, rotation, timestamp, developStartTime) {
    ghostElement.remove();
    
    // 生成 ID
    const id = crypto.randomUUID();
    const photoData = {
        id,
        imgSrc,
        bgColor,
        x: position.x,
        y: position.y,
        r: rotation,
        timestamp,
        createdAt: developStartTime
    };
    
    // 保存到 DB
    if (window.PolaroidDB) {
        window.PolaroidDB.savePhoto(photoData).catch(console.error);
    }
    
    // 渲染卡片 (新生成的卡片 isNew = true)
    renderCard(photoData, true);
}

// ============ 渲染卡片 DOM ============
function renderCard(data, isNew = false) {
    const canvasWorld = document.getElementById('canvasWorld');
    
    // 创建真实的卡片 DOM
    const card = document.createElement('div');
    card.className = 'polaroid-card';
    card.style.backgroundColor = data.bgColor;
    
    card.dataset.id = data.id;
    card.dataset.createdAt = data.createdAt;
    
    // 恢复位置
    card.style.position = 'absolute';
    card.style.left = '50%';
    card.style.top = '50%';
    card.style.transform = `translate(calc(-50% + ${data.x}px), calc(-50% + ${data.y}px)) rotate(${data.r}deg)`;
    card.style.zIndex = ++AppState.zIndexCounter;
    
    // 构建 HTML
    // 根据是否为新照片选择 CSS 类
    const imgClass = isNew ? 'developing-img' : 'developed-img';
    const overlayHTML = isNew ? '<div class="develop-overlay"></div>' : '';

    card.innerHTML = `
        <div class="image-container">
            <img src="${data.imgSrc}" class="${imgClass}">
            ${overlayHTML}
        </div>
        <div class="date-label">${data.timestamp}</div>
        <div class="action-bar">
            <button class="action-btn btn-download" disabled>Download</button>
            <button class="action-btn btn-delete">Delete</button>
        </div>
    `;
    
    // 绑定数据到 DOM (用于 Lightbox 和 Drag)
    card.dataset.x = data.x;
    card.dataset.y = data.y;
    card.dataset.r = data.r;

    // 同步动画状态 (仅新照片需要)
    if (isNew) {
        syncAnimationState(card);
    }

    // 绑定操作按钮事件
    const btnDownload = card.querySelector('.btn-download');
    const btnDelete = card.querySelector('.btn-delete');

    if (btnDownload) {
        btnDownload.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Direct Capture: Screenshot the card exactly as it appears in the lightbox
            html2canvas(card, {
                scale: 2,
                backgroundColor: null,
                useCORS: true,
                // 1. Remove buttons from screenshot
                ignoreElements: (element) => {
                    return element.classList.contains('action-bar');
                },
                // 2. Clean up styles (remove drop shadow) in the virtual DOM before capture
                onclone: (clonedDoc) => {
                    const clonedCard = clonedDoc.querySelector(`.polaroid-card[data-id="${data.id}"]`);
                    if (clonedCard) {
                        // Remove the outer drop shadow to keep edges clean
                        // Keep inset shadow for texture depth
                        clonedCard.style.boxShadow = 'inset 0 0 2px 2px rgba(0,0,0,0.1)';
                        
                        // NOTE: Do NOT reset transform here.
                        // In lightbox mode, the card is centered via translate(-50%, -50%).
                        // Removing transform would shift it out of frame.
                    }
                }
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `polaroid_${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }).catch(err => {
                console.error('Screenshot failed:', err);
            });
        });
    }

    if (btnDelete) {
        btnDelete.addEventListener('click', function(e) {
            e.stopPropagation();
            
            if (AppState.activeLightboxCard === card) {
                const overlay = document.getElementById('lightbox-overlay');
                if (overlay) overlay.classList.remove('active');
                AppState.activeLightboxCard = null;
            }
            
            // 从 DB 删除
            if (window.PolaroidDB) {
                window.PolaroidDB.deletePhoto(data.id).catch(console.error);
            }
            
            card.remove();
        });
    }
    
    // 绑定点击事件（用于触发 Lightbox）
    card.addEventListener('click', function(e) {
        if (!window.cardHasMoved && !AppState.activeLightboxCard) {
            openLightbox(card);
        }
    });

    canvasWorld.appendChild(card);
    
    // 暴露给全局 (如果需要)
    return card;
}

// 导出 renderCard 供 app.js 使用
window.renderCard = renderCard;