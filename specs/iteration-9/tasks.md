# 实施计划 - Iteration 9 (Revised)

- [ ] 1. 基础结构清理
    - 移除 HTML 中静态的 polaroidCard
    - 移除 JS 中 Canvas Panning 逻辑
- [ ] 2. JS 核心逻辑重构
    - 移除颜色即时响应逻辑
    - 实现 `getNextSpawnPosition` 算法 (基于上次生成位置)
    - 重写 `createAndAnimateGhostCard` (目标为 Canvas Center + Offset)
    - 重写 `finishSequence`：创建新 Card DOM 并 Append
- [ ] 3. 交互系统升级 (Card Only)
    - 实现卡片独立拖拽逻辑 (State: isDraggingCard, currentCard, offset...)
    - 实现点击置顶 (Z-Index)
- [ ] 4. 验证
    - 检查画布是否固定
    - 检查照片是否可拖拽
    - 检查连续拍照时照片是否散落分布
