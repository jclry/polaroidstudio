# 技术方案设计 - Iteration 8

## 样式变更 (CSS)
- **点状背景**:
  - 颜色: `#e6e6e6` (更浅)
  - 大小: 1.5px (更小)
  - 间距: 14px (更密)
- **UI 清理**:
  - 删除 `.empty-state`, `.download-section` 相关样式。
- **卡片初始状态**:
  - 移除 `display: none`。
  - 新增辅助类 `.hidden-card` (`visibility: hidden` 或 `opacity: 0`)，确保卡片占据布局空间但不显示。

## 逻辑变更 (JS)
- **目标计算**:
  - 不再需要判断 `polaroidCard.style.display === 'none'`。
  - 直接获取 `polaroidCard` 的 Rect。
- **动画结束**:
  - 移除对 `emptyState` 和 `downloadSection` 的 DOM 操作。
  - 将 `polaroidCard` 设为可见。

