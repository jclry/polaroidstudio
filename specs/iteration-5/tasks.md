# 实施计划 - Iteration 5

- [ ] 1. CSS 样式更新
    - 移除 `.printing-mask` 的 box-shadow
    - 添加 `.printing-mask::after` 渐变光影
    - 确保 `.ghost-card` 默认宽度为 320px
- [ ] 2. JS 动画重写
    - 计算 scaleFactor (maskWidth / 320)
    - 重写 Phase 1 动画：使用 scale() 适配出片口
    - 重写 Phase 2 Handoff：锁定 scale，重置 transform-origin
    - 重写 Phase 3 Flight：从 scale(s) 变大到 scale(1)
- [ ] 3. 验证
    - 检查阴影是否自然
    - 检查大小变化是否平滑无跳变

