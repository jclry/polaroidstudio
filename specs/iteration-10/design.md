# 技术方案设计 - Iteration 10

## 1. 样式修正 (CSS)
- **Box-Sizing**: 统一 `.polaroid-card` 和 `.ghost-card` 的 `box-sizing` 为 `border-box`。
  - 这是导致跳变的主要原因（30px 的宽度差）。

## 2. 坐标校准 (JS)
- **问题**: 飞行终点计算可能存在微小误差，或者 CSS Transform 的精度问题。
- **方案**: 在 `finishSequence` 中，不要盲目信任预设的 `targetOffset`，而是信任 Ghost Card **落地时的实际位置**。
- **算法**:
  1. 获取 `ghostRect = ghostElement.getBoundingClientRect()`。
  2. 获取 `canvasRect = canvasWorld.getBoundingClientRect()`。
  3. 计算 Ghost 中心相对于 Canvas 中心的偏移量：
     - `actualX = (ghostRect.left + ghostRect.width/2) - (canvasRect.left + canvasRect.width/2)`
     - `actualY = (ghostRect.top + ghostRect.height/2) - (canvasRect.top + canvasRect.height/2)`
  4. 使用 `actualX, actualY` 来设置 Real Card 的 `transform: translate(...)`。
  5. 更新 `dataset.x/y` 为这个校准后的值。

