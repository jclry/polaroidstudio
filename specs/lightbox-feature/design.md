# 技术方案设计 - 灯箱查看功能

## 架构设计

本功能完全基于前端实现，使用原生 JavaScript 控制 DOM 操作和 CSS Transition 动画。核心逻辑采用 **FLIP (First, Last, Invert, Play)** 思想的变体，通过切换定位上下文（Absolute -> Fixed -> Absolute）来实现平滑的视图过渡。

## 技术栈

- HTML5
- CSS3 (Transitions, Transforms, Backdrop Filter)
- Vanilla JavaScript (ES6+)

## 详细设计

### 1. 数据结构与状态管理

在 `script.js` 中维护以下状态：

```javascript
// 当前处于灯箱模式的卡片引用
let activeLightboxCard = null;

// 存储卡片进入灯箱前的原始样式，用于关闭时还原
let originalCardStyles = {
    position: '',
    top: '',
    left: '',
    transform: '',
    zIndex: ''
};

// 交互标志位
let isDragging = false;
let hasMoved = false; // 用于区分点击和拖拽
```

### 2. DOM 结构变更

**新增遮罩层节点：**

```html
<div id="lightbox-overlay" class="lightbox-overlay"></div>
```

**CSS 类定义 (`style.css`)：**

- `.lightbox-overlay`: 固定定位全屏遮罩，默认 `opacity: 0`, `pointer-events: none`。激活时 `opacity: 1`。
- `.polaroid-card.lightbox-active`: 增加层级 `z-index`，修改光标样式，增强阴影。**注意：** 不在此类中定义位置属性，位置由 JS 动态计算。

### 3. 核心逻辑流程

#### A. 打开灯箱 (`openLightbox`)

1. **前置检查**：确认 `hasMoved` 为 false（非拖拽操作），且当前无 `activeLightboxCard`。
2. **状态保存**：记录目标卡片的 `style.position`, `top`, `left`, `transform`, `zIndex`。
3. **坐标获取**：调用 `card.getBoundingClientRect()` 获取卡片当前在视口中的绝对位置。
4. **定位切换 (Absolute -> Fixed)**：
   - 设置 `position: fixed`。
   - 设置 `top`, `left` 为刚才获取的 rect 坐标。
   - 清除 `transform`（暂时复位旋转），清除 `margin`。
   - 设置高 `z-index` (9999)。
   - **强制重排 (Reflow)**：读取 `offsetWidth` 确保浏览器渲染起始帧。
5. **执行动画**：
   - 计算屏幕中心坐标。
   - 计算位移差值 `deltaX`, `deltaY`。
   - 设置 `transform: translate(deltaX, deltaY) scale(1.5)`。
   - 添加 CSS 类 `.lightbox-active` (触发 transition)。
   - 显示遮罩层。

#### B. 关闭灯箱 (`closeLightbox`)

1. **移除状态**：移除遮罩层激活类，移除卡片 `.lightbox-active` 类。
2. **视觉回归**：
   - 将卡片 `transform` 重置为 `translate(0, 0) scale(1)`。
   - 由于卡片仍是 `fixed` 定位且 `top/left` 也是原位，这会使卡片视觉上飞回原来的屏幕位置。
3. **状态还原 (on transitionend)**：
   - 监听 `transitionend` 事件（`once: true`）。
   - 动画结束后，将卡片的 `position`, `top`, `left`, `transform` (含旋转), `zIndex` 全部恢复为 `originalCardStyles` 中的值。
   - 重置 `activeLightboxCard` 为 null。

### 4. 交互冲突处理

- **拖拽 vs 点击**：在 `mousemove` 中若移动距离超过阈值（如 3px），置 `hasMoved = true`。`click` 事件中检查此标志，若为 true 则不触发灯箱。
- **遮罩点击**：监听 `.lightbox-overlay` 的点击事件触发关闭逻辑。

## 安全性与性能

- 使用 `will-change: transform` (可选) 优化动画性能。
- 确保事件监听器正确解绑或使用一次性监听，防止内存泄漏。
- 使用 `backdrop-filter` 时注意兼容性（主要现代浏览器均支持）。

