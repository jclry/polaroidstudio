# 技术方案设计 - Iteration 7

## DOM 结构变更
- **Right Panel (.photo-gallery)**: 作为 Viewport。
  - **New Wrapper (.canvas-world)**: 作为可拖拽的画布层，承载内容。
    - `#gallery-slot` (包含照片和空状态)
    - `.download-section` (包含导出按钮)

## 样式设计 (CSS)
- **背景纹理**:
  - 应用于 `.canvas-world`。
  - `background-image: radial-gradient(#d1d1d1 2px, transparent 2px);`
  - `background-size: 24px 24px;`
  - 背景随画布移动，营造“移动桌面”的感觉。
- **渐变分割**:
  - 移除 `.camera-stage` 的 `border-right`。
  - 在 `.camera-stage` 右侧添加伪元素遮罩，或者在 `.photo-gallery` 左侧添加覆盖层。
  - 方案：`.camera-stage` `z-index` 略高，右边缘添加 `box-shadow` 或 `linear-gradient` 遮罩，使硬边柔化。
  - 具体：`box-shadow: 20px 0 40px -10px rgba(255,255,255,1);` 配合左侧背景色渐变。

## 交互逻辑 (JS)
- **拖拽 (Panning)**:
  - 监听 `.photo-gallery` 的 `mousedown`.
  - 记录初始鼠标位置和初始 `translate` 值。
  - `mousemove`: 更新 `translate(x, y)`.
  - `mouseup`: 结束拖拽。
- **飞行目标计算**:
  - 由于使用了 `getBoundingClientRect()` 获取目标位置，即使画布被移动，计算出的 Viewport 坐标依然准确。
  - 逻辑无需修改，天然支持。

