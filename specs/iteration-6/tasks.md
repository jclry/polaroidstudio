# 实施计划 - Iteration 6

- [ ] 1. CSS 样式调整
    - 调整 `.printing-mask` 宽度至 46%
    - 设置 `.printing-mask::after` 默认 opacity 为 0
    - 添加 `.printing-mask.active::after` 样式 (opacity 1)
- [ ] 2. JS 逻辑调整
    - 在 startPhotoSequence 中添加 active 类
    - 在 slideAnim 完成后移除 active 类
- [ ] 3. 验证
    - 检查阴影是否随照片出现和消失
    - 检查出片宽度是否更贴合红框

