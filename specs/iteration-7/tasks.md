# 实施计划 - Iteration 7

- [ ] 1. HTML 结构改造
    - 在 `.photo-gallery` 内部增加 `.canvas-world` 容器
    - 将右侧原有内容移入 `.canvas-world`
- [ ] 2. CSS 样式实现
    - 定义点状背景 (Radial Gradient)
    - 实现 `.canvas-world` 的无限大尺寸 (e.g. 200% width/height)
    - 实现左侧与右侧的渐变过渡 (移除边框，添加 shadow mask)
    - 设置 cursor 样式
- [ ] 3. JS 拖拽逻辑
    - 实现 Panning 功能 (State: isDragging, startX, startY, currentTranslate)
    - 确保拖拽平滑
- [ ] 4. 验证
    - 检查拖拽画布时背景是否移动
    - 检查移动画布后拍照，照片是否准确飞入新位置

