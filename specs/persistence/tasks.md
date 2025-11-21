# 实施计划

- [ ] 1. 数据库层 (`js/db.js`)
  - 实现 `initDB`, `savePhoto`, `deletePhoto`, `getAllPhotos`。
  - 在 `index.html` 中引入 `js/db.js`。

- [ ] 2. 逻辑重构 (`js/animation.js`)
  - 提取 `createCardDOM(data, isNew)` 函数。
  - `finishSequence` 修改为调用 `createCardDOM` 并保存数据到 DB。
  - 生成 UUID 逻辑。

- [ ] 3. 初始化加载 (`js/app.js`)
  - 在 `initApp` 中初始化 DB 并加载历史照片。

- [ ] 4. 状态同步 (`js/canvas.js`, `js/animation.js`)
  - 拖拽结束 (`handleMouseUp`) 更新 DB 中的位置信息。
  - 删除按钮逻辑更新：同步删除 DB 数据。

- [ ] 5. 验证
  - 刷新页面，确认照片保留。
  - 新增、移动、删除操作，确认数据同步正常。
  - 检查 IndexedDB 控制台数据。

