# 实施计划 - Iteration 2

- [ ] 1. 布局重组 (HTML/CSS)
    - 移动 h1 到左侧
    - 移动 controls 到左侧
    - 清理右侧结构
- [ ] 2. 实现蒙版容器 (CSS)
    - 将 `#printSlot` 改造为 `.printing-mask`
    - 调整 CSS 定位 (top, left, width, height, overflow)
    - _技巧_: 暂时给 mask 加红色边框以便调试对齐
- [ ] 3. 重写 JS 动画逻辑
    - 修改 Ghost 创建逻辑：添加到 mask 中
    - 修改 Phase 1 动画：translateY(-100%) -> 0
    - 实现 DOM 转移逻辑 (Mask -> Body)
    - 保持 Phase 2 飞行逻辑
- [ ] 4. 验证
    - 检查出片是否自然（无渐变，只有滑动）
    - 检查飞出是否平滑

