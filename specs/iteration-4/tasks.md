# 实施计划 - Iteration 4

- [ ] 1. CSS 样式调整
    - 调整 `.printing-mask` 宽度 (缩小至 58%)
    - 为 `.printing-mask` 添加内阴影 (inset box-shadow)
    - 移除 `.color-dot` 的阴影
- [ ] 2. JS 动画逻辑升级
    - 修改 Ghost 创建逻辑：初始宽度设为 100% (跟随 Mask)
    - 修改 Handoff 逻辑：锁定当前像素宽度
    - 修改 Flight 动画：增加 width 属性的变化 (从小变大)
- [ ] 3. 验证
    - 检查出片比例是否自然
    - 检查飞入过程中的缩放是否平滑

