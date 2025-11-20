# 技术方案设计 - Iteration 2

## 布局变更
- **DOM 迁移**：
  - `h1` 移至 `.camera-stage` 顶部。
  - `.controls` 移至 `.camera-stage` 底部（相机下方）。
  - 右侧 `.photo-gallery` 仅保留 `#gallery-slot`。

## 动画架构：Mask-to-Body Handoff

### 1. 遮罩容器 (`.printing-mask`)
- **位置**：定位在相机图片的出片口缝隙处。
- **属性**：`overflow: hidden`。
- **层级**：位于相机图片下方（视觉上），或者上方但通过透明度控制？
  - *修正*：如果相机图片是整张方形图（含白色背景），遮罩必须位于图片**上方** (`z-index > img`)。
  - 为了不挡住相机机身，遮罩的 `top` 必须精确从缝隙开始。
  - 遮罩的高度决定了照片滑出的最大距离。

### 2. 动画序列
**Phase 1: Ejection (出片)**
- **Parent**: `.printing-mask`
- **Target**: `.ghost-card`
- **Initial**: `transform: translateY(-101%)` (完全在遮罩上方，即不可见)
- **Action**: `transform: translateY(0%)` (滑到底部)
- **Duration**: 1.5s

**Phase 2: Handoff (交接)**
- **Action**:
  1. JS 读取 Ghost 当前的屏幕坐标 (`getBoundingClientRect`)。
  2. 将 Ghost 从 `.printing-mask` 移出，挂载到 `body`。
  3. 设置 `position: fixed`，并赋予刚才的坐标。
  - *目的*：脱离 `overflow: hidden` 的限制，允许自由飞翔。

**Phase 3: Flight (飞行)**
- **Target**: 右侧画廊中心。
- **Action**: 使用 `animate()` 或 CSS Transition 移动到目标坐标并旋转。

## CSS 坐标估算
- 相机图片假设为正方形。
- 出片口通常在底部 1/5 处。
- 预估 `.printing-mask` 的 `top` 约为 `82%`，`width` 约为 `65%`（需根据实际卡片宽度调整）。

