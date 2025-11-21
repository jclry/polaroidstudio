# 技术方案设计

## 架构概述

引入 **IndexedDB** 层，用于持久化存储照片数据。所有对照片的增删改操作都将同步更新到 IndexedDB。应用启动时，从 IndexedDB 加载数据并渲染。

## 模块设计

### 1. `js/db.js` (新文件)
封装 IndexedDB 操作，提供简单的 Promise API：
- `initDB()`: 打开数据库 `PolaroidDB`，创建对象仓库 `photos`。
- `savePhoto(photo)`: 保存或更新照片对象。
- `deletePhoto(id)`: 根据 ID 删除照片。
- `getAllPhotos()`: 获取所有照片。

### 2. 数据模型
照片对象结构：
```javascript
{
    id: string (UUID), // 唯一标识
    imgSrc: string (Base64),
    bgColor: string,
    x: number,
    y: number,
    r: number, // rotation
    timestamp: string,
    createdAt: number // for sorting/zIndex
}
```

### 3. 集成点

#### A. 初始化 (`js/app.js`)
- `initApp()` 中调用 `db.initDB()`。
- 成功后调用 `db.getAllPhotos()`，遍历并渲染已有照片。
- 渲染函数需要复用 `createCardDOM` 逻辑（需从 `finishSequence` 中抽离）。

#### B. 新增照片 (`js/animation.js`)
- 在 `finishSequence` 中，生成唯一 ID。
- 构建 photo 对象。
- 调用 `db.savePhoto(photo)`。
- 将 ID 绑定到 DOM 元素 (`dataset.id`)。

#### C. 移动照片 (`js/canvas.js`)
- 在 `handleMouseUp` (拖拽结束) 时，获取当前卡片的 ID 和新位置。
- 更新内存对象（如果需要）并调用 `db.savePhoto(updatedData)`。
- *注意*：为了性能，只在拖拽结束时保存，不要在 `mousemove` 中保存。

#### D. 删除照片 (`js/animation.js` / `lightbox.js`)
- 点击删除按钮时，获取 ID。
- 调用 `db.deletePhoto(id)`。

## 代码重构需求
目前 `finishSequence` 负责创建 DOM。为了支持“从 DB 加载”和“新生成”两种场景，需要将 **创建卡片 DOM** 的逻辑提取为一个独立函数 `renderCard(data, isNew = false)`。
- `isNew = true`: 执行显影动画。
- `isNew = false`: 直接显示最终状态（无显影动画）。

## 依赖
无外部依赖，使用原生 IndexedDB API。

