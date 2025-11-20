# 技术方案设计 - 拟物化相机

## 架构设计

### 1. 目录结构
新增 `assets` 目录用于存放静态资源。
```
/
├── assets/
│   └── camera.png   # 用户提供的相机图片
├── index.html
├── style.css
├── script.js
```

### 2. 页面布局 (DOM)
采用 Flexbox 实现左右分栏。
- **Root**: `.studio-container` (Flex Row)
- **Left**: `.camera-stage`
  - Container for Camera Image
  - Shutter Button (Overlay div)
  - Exit Slot (Hidden container for animation start)
- **Right**: `.photo-gallery`
  - Final position for Polaroid Card
  - Controls (Color picker, Download btn)
- **Global**: `#flash-overlay` (Fixed, z-index: 9999)

### 3. 动画流程设计 (JS + CSS)

**状态机：**
1.  **Idle**: 等待用户点击。
2.  **Selecting**: 用户点击快门 -> 触发 `<input type="file">`。
3.  **Processing**: 用户选中文件 -> JS 读取 FileReader。
4.  **Flashing**: 读取完成 -> `#flash-overlay` opacity 1 -> 0。
5.  **Printing (Animation)**:
    -   创建一个 "Ghost Card" (克隆的拍立得卡片 DOM)。
    -   初始位置：绝对定位在相机图片底部中间，z-index 低于相机（看起来像在内部）。
    -   动作 1：`translateY(100%)` 滑出相机底部。
    -   动作 2：计算右侧目标位置 (`getBoundingClientRect`)。
    -   动作 3：`transition` 移动到右侧目标位置并旋转 (`rotate(3deg)`)。
6.  **Done**: 动画结束 -> 销毁 Ghost Card -> 显示真实的右侧 Card。

### 4. 样式细节
-   **相机容器**：`position: relative;`
-   **快门按钮**：使用 `position: absolute;` 定位在相机图片的红点上。由于图片尺寸未知，初始设置为百分比定位（例如 `top: 50%; left: 25%;`），并设置红色半透明背景方便调试（最终设为透明）。
-   **照片旋转**：右侧最终卡片增加 `transform: rotate(2deg);` 增加自然感。

## 测试策略
1.  **图片位测试**：确认 `assets/camera.png` 加载成功。
2.  **快门测试**：确认点击红点能弹出文件选择。
3.  **动画测试**：确认照片从相机“吐出”并飞入右侧，无跳变。

