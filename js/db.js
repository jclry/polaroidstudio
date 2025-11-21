/* ==========================================
   DB.JS - IndexedDB 数据持久化
   ========================================== */

const DB_NAME = 'PolaroidStudioDB';
const STORE_NAME = 'photos';
const DB_VERSION = 1;

let db = null;

const DB = {
    // 初始化数据库
    init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                console.log('Database initialized');
                resolve(db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    },

    // 保存或更新照片
    savePhoto(photo) {
        return new Promise((resolve, reject) => {
            if (!db) return reject('DB not initialized');
            
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(photo);

            request.onsuccess = () => resolve(photo);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    // 删除照片
    deletePhoto(id) {
        return new Promise((resolve, reject) => {
            if (!db) return reject('DB not initialized');

            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    },

    // 获取单张照片
    getPhoto(id) {
        return new Promise((resolve, reject) => {
            if (!db) return reject('DB not initialized');

            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    // 获取所有照片
    getAllPhotos() {
        return new Promise((resolve, reject) => {
            if (!db) return reject('DB not initialized');

            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }
};

// 导出全局对象
window.PolaroidDB = DB;

