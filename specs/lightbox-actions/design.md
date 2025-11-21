# 技术方案设计

## 逻辑变更 (js/lightbox.js)

### 关闭灯箱 (`closeLightbox`)
1.  显式设置 transition，保持 0.4s 时长，但修改曲线。
2.  新曲线：`cubic-bezier(0.45, 0, 0.55, 1)` (Ease-In-Out) 或 `cubic-bezier(0.4, 0, 0.2, 1)`。
    - 为了平滑，建议使用 **Ease-In-Out**，这样开始变小时会先加速，中间快，最后减速。这比“一开始就很快”要自然得多。
    - 让我们选用 `cubic-bezier(0.4, 0, 0.2, 1)` (Standard Easing)。

    ```javascript
    AppState.activeLightboxCard.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    ```

3.  确认 `transitionend` 清理逻辑依然有效（它会移除内联 transition，所以不需要额外操作）。
