# 技术方案设计 - Iteration 3

## DOM 结构变更
- **Left Panel (.camera-stage)**:
  - `h1`
  - `.color-palette` (新位置)
  - `.camera-wrapper` (Camera Img + Shutter + Mask)
  - `.instruction`
- **Right Panel (.photo-gallery)**:
  - `#gallery-slot` (Polaroid Card)
  - `.btn-download` (新位置，包含导出按钮)

## 样式变更
- **Font**: `h1 { font-family: Futura, "Century Gothic", sans-serif; }`
- **Palette**: `.color-palette { background: transparent; box-shadow: none; padding: 0; }`
- **Layout**: 使用 Flexbox `gap` 属性控制垂直间距。

## 逻辑变更
- **Ghost Card Color**:
  - 在创建 Ghost Card 时，获取当前 `.color-dot.active` 的 `data-color` 属性。
  - 设置 `ghost.style.backgroundColor` 为该颜色。

