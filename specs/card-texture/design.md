# 技术方案设计

## 架构
前端 CSS 修改。

## 详细设计

### 1. CSS 背景叠加
利用 CSS `background-image` 属性加载 SVG 纹理。由于拍立得卡片的底色（`background-color`）是通过 JavaScript 动态设置在内联样式上的，CSS 类中的 `background-image` 将与内联 `background-color` 叠加显示。

`assets/layout.svg` 为半透明黑色纹理，直接叠加在任何底色上都能产生纹理效果。

### 2. 代码变更
**文件**: `css/card.css`

**变更点**:
- `.polaroid-card`: 添加背景图及定位属性。
- `.ghost-card`: 添加背景图及定位属性（保持动画过程中的一致性）。

```css
.polaroid-card, .ghost-card {
    background-image: url('../assets/layout.svg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}
```

## 验证计划
1. 生成一张新照片，检查卡片背景是否有纹理。
2. 检查不同颜色的卡片，确认纹理在不同底色下均可见。

