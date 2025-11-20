# 技术方案设计 - Iteration 9 (Revised)

## 1. 颜色逻辑
- **分离**: 移除 `color-dot` 点击事件中对 `polaroidCard` 样式的直接修改。
- **快照**: 在 `startPhotoSequence` 时读取当前 Active Color。

## 2. 多图生成系统
- **DOM 结构**:
  - 移除 HTML 中静态的 `#polaroidCard` 和 `#gallery-slot`。
  - 照片直接 `appendChild` 到 `#canvasWorld`。
- **位置算法 (Spawn Logic)**:
  - 维护全局变量 `lastSpawnPosition = { x: 0, y: 0 }` (相对于画布中心)。
  - **规则**：仅基于生成序列递增，不受用户拖拽影响。
  - 新位置公式: `x = lastSpawnPosition.x + random(-60, 60)`, `y = lastSpawnPosition.y + random(-40, 40)`。
  - 更新 `lastSpawnPosition` 为新计算的值。

## 3. 交互系统 (Card Only)
- **Canvas**: 禁止拖拽，背景固定。
- **Card Drag**:
  - 监听 `.polaroid-card` 的 `mousedown`。
  - 实现标准的 Drag & Drop (使用 `transform: translate`)。
  - **Z-Index**: 点击时置顶。

## 4. 坐标系转换
- 画布固定居中。
- 画布中心屏幕坐标 = `canvasWorld.getBoundingClientRect()` 中心。
- 目标屏幕坐标 = 画布中心屏幕坐标 + `lastSpawnPosition`。
