// src/lib/indexedDB.js
const STORE_NAME = 'papers';
const NOTES_STORE_NAME = 'notes';

export const IndexedDB = {
    open: () => {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open('K1ssaperItems', 2);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(NOTES_STORE_NAME)) {
                    db.createObjectStore(NOTES_STORE_NAME, { keyPath: 'id' });
                }
            };
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    },
    getAll: async () => {
        const db = await IndexedDB.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            request.onerror = () => reject(request.error);
        });
    },
    getNotes: async () => {
        const db = await IndexedDB.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([NOTES_STORE_NAME], 'readonly');
            const store = transaction.objectStore(NOTES_STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            request.onerror = () => reject(request.error);
        });
    },
    save: async (paper) => {
        const db = await IndexedDB.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const item = { ...paper, id: paper.id || crypto.randomUUID(), createdAt: paper.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
            const request = store.put(item);
            request.onsuccess = () => resolve(item);
            request.onerror = () => reject(request.error);
        });
    },
    saveNote: async (note) => {
        const db = await IndexedDB.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([NOTES_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(NOTES_STORE_NAME);
            const item = { ...note, id: note.id || crypto.randomUUID(), createdAt: note.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
            const request = store.put(item);
            request.onsuccess = () => resolve(item);
            request.onerror = () => reject(request.error);
        });
    },
    delete: async (id) => {
        const db = await IndexedDB.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },
    deleteNote: async (id) => {
        const db = await IndexedDB.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([NOTES_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(NOTES_STORE_NAME);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
};
