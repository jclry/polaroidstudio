# 需求文档

## 介绍

当前项目为一个单文件 `index.html` 的 Web 应用 "Polaroid Studio"。为了提高代码的可维护性和清晰度，需要将 HTML、CSS 和 JavaScript 代码拆分到独立的文件中。

## 需求

### 需求 1 - 代码分离

**用户故事：** 作为开发者，我希望将 HTML、CSS 和 JS 分离，以便于管理和维护代码。

#### 验收标准

1.  **CSS 分离**：原本 `<style>` 标签内的所有 CSS 代码应当移动到 `style.css` 文件中，并在 `index.html` 中通过 `<link>` 标签引入。
2.  **JS 分离**：原本 `<script>` 标签内的所有业务逻辑代码应当移动到 `script.js` 文件中，并在 `index.html` 中通过 `<script src="...">` 引入。
3.  **功能保持**：拆分后的应用应当保持原有的所有功能（图片上传、颜色切换、日期显示、图片导出）完全一致，无功能丢失。
4.  **文件结构**：
    -   `index.html`
    -   `style.css`
    -   `script.js`

