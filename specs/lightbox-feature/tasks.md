# 实施计划 - 修复坐标轴混淆问题

- [ ] 1. 修复 `openLightbox` 中的坐标赋值错误
    - 修改 `script.js` 中的 `card.style.top` 和 `card.style.left` 赋值。
    - **修正**：将 `top` 设为 `centerY`，`left` 设为 `centerX`（之前写反了）。
    - _原因: 坐标轴混淆导致卡片定位到错误位置（如左下角）。_
