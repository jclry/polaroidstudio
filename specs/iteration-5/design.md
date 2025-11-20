# 技术方案设计 - Iteration 5

## 1. 光影优化 (CSS)
- **容器**: `.printing-mask`
- **方案**: 使用 `::after` 伪元素创建渐变遮罩。
- **样式**:
  ```css
  .printing-mask::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 40px; /* 渐变高度 */
      background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%);
      z-index: 30; /* 确保在照片之上 */
      pointer-events: none;
  }
  ```

## 2. 缩放重构 (JS + CSS)
- **核心逻辑**: 保持 DOM 尺寸不变 (320px)，仅改变视觉 Scale。

### Phase 1: 出片 (In Mask)
- **Mask**: 获取当前 Mask 宽度 (例如 `M` px).
- **Ghost**: 固定宽度 `320px`.
- **Scale**: `s = M / 320`.
- **Transform**:
  - 起点: `translateX(-50%) scale(s) translateY(-100%)` (居中 + 缩放 + 隐藏)
  - 终点: `translateX(-50%) scale(s) translateY(0%)`
  - `transform-origin`: `top center`.

### Phase 2: 交接 (Handoff)
- **读取**: `rect = ghost.getBoundingClientRect()`.
- **重置**: 挂载到 Body.
- **样式**:
  - `position: fixed`
  - `left: rect.left`
  - `top: rect.top`
  - `width: 320px`
  - `transform: scale(s)` (保持缩放状态)
  - `transform-origin: top left` (方便后续计算)
  - `margin: 0`

### Phase 3: 飞行 (Flight)
- **目标**: 右侧卡片中心 (TargetRect).
- **计算**:
  - `deltaX = TargetLeft - rect.left`
  - `deltaY = TargetTop - rect.top`
  - 注意：Target 是 Scale 1 的。
- **动画**:
  - 起点: `translate(0, 0) scale(s) rotate(0)`
  - 终点: `translate(deltaX, deltaY) scale(1) rotate(3deg)`

