// src/lib/fileSystemDB.js
export const isElectron = () => {
    return typeof window !== 'undefined' && window.process && window.process.type === 'renderer';
};

export const FileSystemDB = {
    get fs() { try { return window.require('fs'); } catch (e) { return null; } },
    get path() { try { return window.require('path'); } catch (e) { return null; } },

    // Ensure directories exist
    init: (basePath) => {
        if (!isElectron()) return;
        const { fs, path } = FileSystemDB;
        if (!fs || !path || !basePath) return;

        try {
            if (!fs.existsSync(basePath)) fs.mkdirSync(basePath, { recursive: true });
            const pdfDir = path.join(basePath, 'pdfs');
            if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
            const metaPath = path.join(basePath, 'metadata.json');
            if (!fs.existsSync(metaPath)) fs.writeFileSync(metaPath, '[]');
        } catch (e) {
            console.error("FS Init Error:", e);
        }
    },

    getAll: (basePath) => {
        if (!isElectron()) return Promise.resolve([]);
        const { fs, path } = FileSystemDB;
        if (!fs || !path || !basePath) return Promise.resolve([]);

        return new Promise((resolve) => {
            try {
                FileSystemDB.init(basePath);
                const metaPath = path.join(basePath, 'metadata.json');
                if (!fs.existsSync(metaPath)) {
                    resolve([]);
                    return;
                }
                const data = fs.readFileSync(metaPath, 'utf-8');
                // Clean up data: remove localPdfPath from memory if exists, rely on hasPdf
                const papers = JSON.parse(data).map(p => {
                    if (!p.hasPdf && p.localPdfPath) p.hasPdf = true; // Legacy migration
                    if (p.localPdfPath) delete p.localPdfPath; // Remove field
                    return p;
                });
                resolve(papers);
            } catch (e) {
                console.error("FS Read Error:", e);
                resolve([]);
            }
        });
    },

    save: (basePath, paper, fileSource) => {
        // fileSource can be a File object (from drop) or a string path (from dialog)
        if (!isElectron()) return Promise.resolve(paper);
        const { fs, path } = FileSystemDB;
        if (!fs || !path || !basePath) {
            console.error("FS Save Failed: Missing dependencies or path", { fs: !!fs, path: !!path, basePath });
            return Promise.resolve(paper);
        }

        return new Promise((resolve) => {
            try {
                FileSystemDB.init(basePath);
                const metaPath = path.join(basePath, 'metadata.json');
                let currentData = [];
                if (fs.existsSync(metaPath)) {
                    currentData = JSON.parse(fs.readFileSync(metaPath, 'utf-8') || '[]');
                }

                const paperId = paper.id || crypto.randomUUID();

                const newPaper = {
                    ...paper,
                    id: paperId,
                    updatedAt: new Date().toISOString(),
                    createdAt: paper.createdAt || new Date().toISOString()
                };

                // Ensure localPdfPath is removed
                delete newPaper.localPdfPath;

                // --- PDF Saving Logic ---
                let sourcePath = null;

                // Case 1: String path (from ipcRenderer dialog)
                if (typeof fileSource === 'string') {
                    sourcePath = fileSource;
                }
                // Case 2: File object (from Drag and Drop)
                else if (fileSource && fileSource.path) {
                    sourcePath = fileSource.path;
                }

                if (sourcePath) {
                    const destName = `${paperId}.pdf`;
                    const destPath = path.join(basePath, 'pdfs', destName);
                    fs.copyFileSync(sourcePath, destPath);
                    newPaper.hasPdf = true;
                }
                // Case 3: Metadata update only, keep existing PDF status if not changed
                else if (newPaper.hasPdf === undefined && paper.hasPdf) {
                    newPaper.hasPdf = paper.hasPdf;
                }
                // ------------------------

                const index = currentData.findIndex(p => p.id === paperId);
                if (index >= 0) {
                    currentData[index] = newPaper;
                } else {
                    currentData.unshift(newPaper); // Add to top
                }

                fs.writeFileSync(metaPath, JSON.stringify(currentData, null, 2));
                resolve(newPaper);
            } catch (e) {
                console.error("FS Save Error:", e);
                resolve(paper);
            }
        });
    },

    delete: (basePath, id) => {
        if (!isElectron()) return Promise.resolve(false);
        const { fs, path } = FileSystemDB;
        if (!fs || !path || !basePath) return Promise.resolve(false);

        return new Promise((resolve) => {
            try {
                // 1. Remove from metadata
                const metaPath = path.join(basePath, 'metadata.json');
                if (fs.existsSync(metaPath)) {
                    let currentData = JSON.parse(fs.readFileSync(metaPath, 'utf-8') || '[]');

                    const paper = currentData.find(p => p.id === id);

                    // Delete PDF file based on Computed Path (Standard UUID name)
                    const pdfPath = path.join(basePath, 'pdfs', `${id}.pdf`);
                    try {
                        if (fs.existsSync(pdfPath)) {
                            fs.unlinkSync(pdfPath);
                        }
                    } catch (err) {
                        console.error("Failed to delete PDF file (non-fatal):", err);
                    }

                    // Cleanup legacy paths if they happen to exist
                    if (paper && paper.localPdfPath && paper.localPdfPath !== pdfPath) {
                        try {
                            if (fs.existsSync(paper.localPdfPath)) fs.unlinkSync(paper.localPdfPath);
                        } catch (e) { }
                    }

                    currentData = currentData.filter(p => p.id !== id);
                    fs.writeFileSync(metaPath, JSON.stringify(currentData, null, 2));
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (e) {
                console.error("FS Delete Error", e);
                resolve(false);
            }
        });
    },

    getNotes: (basePath) => {
        if (!isElectron()) return Promise.resolve([]);
        const { fs, path } = FileSystemDB;
        if (!fs || !path || !basePath) return Promise.resolve([]);

        return new Promise((resolve) => {
            try {
                FileSystemDB.init(basePath);
                const notesPath = path.join(basePath, 'notes.json');
                if (!fs.existsSync(notesPath)) {
                    resolve([]);
                    return;
                }
                const data = fs.readFileSync(notesPath, 'utf-8');
                resolve(JSON.parse(data));
            } catch (e) {
                console.error("FS Read Notes Error:", e);
                resolve([]);
            }
        });
    },

    saveNote: (basePath, note) => {
        if (!isElectron()) return Promise.resolve(note);
        const { fs, path } = FileSystemDB;
        if (!fs || !path || !basePath) return Promise.resolve(note);

        return new Promise((resolve) => {
            try {
                FileSystemDB.init(basePath);
                const notesPath = path.join(basePath, 'notes.json');
                let currentData = [];
                if (fs.existsSync(notesPath)) {
                    currentData = JSON.parse(fs.readFileSync(notesPath, 'utf-8') || '[]');
                }

                const noteId = note.id || crypto.randomUUID();
                const newNote = {
                    ...note,
                    id: noteId,
                    updatedAt: new Date().toISOString(),
                    createdAt: note.createdAt || new Date().toISOString()
                };

                const idx = currentData.findIndex(n => n.id === newNote.id);
                if (idx >= 0) {
                    currentData[idx] = { ...currentData[idx], ...newNote };
                } else {
                    currentData.push(newNote);
                }

                fs.writeFileSync(notesPath, JSON.stringify(currentData, null, 2));
                resolve(newNote);
            } catch (e) {
                console.error("FS Save Note Error:", e);
                resolve(note);
            }
        });
    },

    deleteNote: (basePath, id) => {
        if (!isElectron()) return Promise.resolve();
        const { fs, path } = FileSystemDB;
        if (!fs || !path || !basePath) return Promise.resolve();

        return new Promise((resolve) => {
            try {
                const notesPath = path.join(basePath, 'notes.json');
                if (!fs.existsSync(notesPath)) { resolve(); return; }

                let currentData = JSON.parse(fs.readFileSync(notesPath, 'utf-8') || '[]');

                // Recursive delete logic
                const idsToDelete = new Set([id]);
                let changed = true;
                while (changed) {
                    changed = false;
                    currentData.forEach(n => {
                        if (n.parentId && idsToDelete.has(n.parentId) && !idsToDelete.has(n.id)) {
                            idsToDelete.add(n.id);
                            changed = true;
                        }
                    });
                }

                currentData = currentData.filter(n => !idsToDelete.has(n.id));
                fs.writeFileSync(notesPath, JSON.stringify(currentData, null, 2));
                resolve();
            } catch (e) {
                console.error("FS Delete Note Error:", e);
                resolve();
            }
        });
    }
};
