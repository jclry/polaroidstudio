# 技术方案设计

## 架构设计

本次重构将采用标准的 Web 前端“关注点分离”（Separation of Concerns）架构。

### 文件结构
```
/Users/chiyin/Desktop/Coding/WebService/NoteBook/
├── index.html      # 结构层：负责页面 DOM 结构
├── style.css       # 表现层：负责页面样式
└── script.js       # 行为层：负责页面交互逻辑
```

## 详细设计

### 1. CSS 迁移策略
-   **源**：`index.html` 中的 `<style>` 块。
-   **目标**：`style.css`。
-   **引用方式**：在 `index.html` 的 `<head>` 中使用 `<link rel="stylesheet" href="style.css">`。
-   **内容处理**：直接移动，无需预处理，保持原有 CSS 变量及选择器结构。

### 2. JS 迁移策略
-   **源**：`index.html` 底部的 `<script>` 块（不包含 `html2canvas` 的 CDN 引用）。
-   **目标**：`script.js`。
-   **引用方式**：在 `index.html` 的 `</body>` 闭合标签前使用 `<script src="script.js"></script>`。
-   **执行时机**：由于脚本放在底部，DOM 元素已加载，无需改为 `DOMContentLoaded` 事件包裹，保持原有执行顺序。

### 3. HTML 清理
-   删除原有的 `<style>` 块。
-   删除原有的业务逻辑 `<script>` 块。
-   保留 `html2canvas` 库的引用位置（`<head>` 中）。

## 测试策略
-   **手动测试**：
    1.  打开 `index.html`，检查页面布局是否崩坏（验证 CSS）。
    2.  点击上传图片，检查是否能预览（验证 JS）。
    3.  点击颜色圆点，检查背景是否变色（验证 JS + CSS 交互）。
    4.  点击导出按钮，检查是否生成图片（验证 JS + 外部库调用）。

