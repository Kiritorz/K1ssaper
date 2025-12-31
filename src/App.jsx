import { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Upload,
  Search,
  Tag,
  User,
  FileText,
  X,
  Edit3,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Layout,
  Grid,
  List,
  Loader2,
  StickyNote,
  Maximize2,
  Minimize2,
  ArrowLeft,
  ExternalLink,
  Quote,
  AlertTriangle,
  Settings,
  HardDrive,
  Download,
  File as FileIcon,
  FolderOpen,
  Minus,
  ZoomIn,
  ZoomOut,
  Square,
  Globe,
  Folder,
  Edit2,
  CheckCircle2,
  Circle
} from 'lucide-react';

// --- Translation Dictionary ---
const translations = {
  en: {
    library: "Library",
    settings: "Settings",
    newPaper: "New Paper",
    filters: "FILTERS",
    groupsHeader: "GROUPS",
    allPapers: "All Papers",
    filterRead: "Read",
    filterUnread: "Unread",
    searchPlaceholder: "Search...",
    syncing: "Syncing Library...",
    noPapers: "No papers found",
    noPapersSub: "Try adjusting your search or add a new paper.",
    title: "Title",
    authors: "Authors",
    venue: "Venue",
    year: "Year",
    group: "Groups",
    updatedAt: "Updated",
    localStorage: "Local Storage",
    onlineDB: "Online DB",
    storageMode: "Storage Mode",
    storageLocation: "Storage Location",
    currentPath: "Current Path",
    changeFolder: "Change Folder",
    openFolder: "Open Folder",
    account: "Account",
    proUser: "Pro User",
    offline: "Offline",
    online: "Online",
    language: "Language",
    interfaceLanguage: "Interface Language",
    editDetails: "Edit Details",
    addPaper: "Add Paper",
    paperDetails: "Paper Details",
    dropPdf: "Click to Select PDF",
    autoExtract: "We'll automatically extract the title for you. (PDF will be saved in Local Mode)",
    enterManually: "Enter Manually",
    summary: "Summary",
    summaryPlaceholder: "Core idea in one sentence...",
    link: "Link (URL)",
    cancel: "Cancel",
    savePaper: "Save Paper",
    deleteTitle: "Delete this paper?",
    deleteConfirm: 'Are you sure you want to delete "{title}"? This action cannot be undone.',
    delete: "Delete",
    write: "Write",
    read: "Read",
    pdf: "PDF",
    close: "Close",
    pdfAvailable: "PDF Available",
    openExternal: "Open External Link",
    downloadPdf: "Download PDF",
    locatePdf: "Locate PDF File",
    exitFullscreen: "Exit Fullscreen",
    fullscreen: "Fullscreen",
    localDesc: "Select a folder to store all your data including PDFs.",
    onlineDesc: "Metadata only. Syncs across devices.",
    noteChanges: "Note: Switching modes will change the library view. Data is stored independently.",
    selectOrCreate: "Select or create (comma separated)...",
    commaSeparated: "Comma separated...",
    enterTitle: "Enter paper title...",
    markRead: "Mark as Read",
    markUnread: "Mark as Unread",
    notes: "Notes",
    newNote: "New Note",
    newFolder: "New Folder",
    folderItems: "notes",
    noNotes: "No notes found",
    noNotesSub: "Create a new note to get started.",
    deleteNoteConfirm: 'Are you sure you want to delete "{title}"?',
    deleteFolderTitle: "Delete this folder?",
    deleteNoteTitle: "Delete this note?",
    editNote: "Edit Note",
    noteTitle: "Note Title",
    noteContent: "Note Content"
  },
  zh: {
    library: "资料库",
    settings: "设置",
    newPaper: "录入新论文",
    filters: "筛选",
    groupsHeader: "分组",
    allPapers: "全部论文",
    filterRead: "已读",
    filterUnread: "未读",
    searchPlaceholder: "搜索标题、作者...",
    syncing: "正在同步资料库...",
    noPapers: "未找到论文",
    noPapersSub: "请尝试调整搜索词或录入新论文。",
    title: "标题",
    authors: "作者",
    venue: "发表处",
    year: "年份",
    group: "分组标签",
    updatedAt: "笔记更新",
    localStorage: "本地存储",
    onlineDB: "在线数据库",
    storageMode: "存储模式",
    storageLocation: "存储位置",
    currentPath: "当前路径",
    changeFolder: "选择文件夹...",
    openFolder: "打开文件夹",
    account: "账户",
    proUser: "专业版",
    offline: "离线",
    online: "在线",
    language: "语言",
    interfaceLanguage: "界面语言",
    editDetails: "编辑详情",
    addPaper: "添加论文",
    paperDetails: "论文详情",
    dropPdf: "点击选择 PDF 文件",
    autoExtract: "将自动提取标题（本地模式下会自动保存 PDF 文件）",
    enterManually: "手动录入",
    summary: "一句话总结",
    summaryPlaceholder: "一句话概括核心思想...",
    link: "链接 (URL)",
    cancel: "取消",
    savePaper: "保存",
    deleteTitle: "删除这篇论文？",
    deleteConfirm: '确定要删除 "{title}" 吗？此操作无法撤销。',
    delete: "删除",
    write: "笔记",
    read: "阅读",
    pdf: "原文",
    close: "关闭",
    pdfAvailable: "PDF 已就绪",
    openExternal: "打开外部链接",
    downloadPdf: "下载 PDF",
    locatePdf: "定位 PDF 文件",
    exitFullscreen: "退出全屏",
    fullscreen: "全屏",
    localDesc: "选择一个文件夹，所有数据（包括PDF）都将保存在此。",
    onlineDesc: "仅同步元数据。支持多设备同步。",
    noteChanges: "注意：切换模式将改变资料库视图。数据在各模式下独立存储。",
    selectOrCreate: "选择或创建...",
    commaSeparated: "用逗号分隔...",
    enterTitle: "输入论文标题...",
    markRead: "标记为已读",
    markUnread: "标记为未读",
    notes: "笔记",
    newNote: "新建笔记",
    newFolder: "新建文件夹",
    folderItems: "个笔记",
    noNotes: "未找到笔记",
    noNotesSub: "创建一个新笔记开始记录。",
    deleteNoteConfirm: '确定要删除 "{title}" 吗？',
    deleteFolderTitle: "删除这个文件夹？",
    deleteNoteTitle: "删除这个笔记？",
    editNote: "编辑笔记",
    noteTitle: "笔记标题",
    noteContent: "笔记内容"
  }
};

// --- Check Environment ---
const isElectron = () => {
  return typeof window !== 'undefined' && window.process && window.process.type === 'renderer';
};

// --- Detect MacOS ---
const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent);

// --- Native File System DB (Electron) ---
const FileSystemDB = {
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
          const pdfDir = path.join(basePath, 'pdfs');
          if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

          const extension = path.extname(sourcePath) || '.pdf';
          const destName = `${newPaper.id}${extension}`;
          const destPath = path.join(pdfDir, destName);

          console.log(`FS: Copying PDF from [${sourcePath}] to [${destPath}]`);

          try {
            fs.copyFileSync(sourcePath, destPath);
            newPaper.hasPdf = true;
          } catch (copyErr) {
            console.error("Failed to copy PDF:", copyErr);
            alert(`Failed to copy PDF file.\nSource: ${sourcePath}\nDest: ${destPath}\nError: ${copyErr.message}`);
          }
        } else if (fileSource) {
          console.warn("File source present but no path property found.", fileSource);
        }

        // Update or Add
        const idx = currentData.findIndex(p => p.id === newPaper.id);
        if (idx >= 0) {
          currentData[idx] = { ...currentData[idx], ...newPaper };
        } else {
          currentData.push(newPaper);
        }

        fs.writeFileSync(metaPath, JSON.stringify(currentData, null, 2));
        resolve(newPaper);
      } catch (e) {
        console.error("FS Save Error:", e);
        alert(`Failed to save metadata: ${e.message}`);
        resolve(paper);
      }
    });
  },

  delete: (basePath, id) => {
    if (!isElectron()) return Promise.resolve();
    const { fs, path } = FileSystemDB;
    if (!fs || !path || !basePath) return Promise.resolve();

    return new Promise((resolve) => {
      try {
        const metaPath = path.join(basePath, 'metadata.json');
        if (!fs.existsSync(metaPath)) { resolve(); return; }

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
        resolve();
      } catch (e) {
        console.error("FS Delete Error:", e);
        resolve();
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

// --- Fallback Local Storage Engine (IndexedDB for Web Demo) ---
const DB_NAME = 'KPapersLocalDB';
const DB_VERSION = 2; // Incremented version
const STORE_NAME = 'papers';
const NOTES_STORE_NAME = 'notes';

const IndexedDB = {
  open: () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
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

// --- Helper: Auto-generate consistent Apple-style pastel colors (Static Mapping) ---
const groupColorPalette = [
  { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-400' },
  { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-400' },
  { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', dot: 'bg-purple-400' },
  { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-400' },
  { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', dot: 'bg-rose-400' },
  { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', dot: 'bg-cyan-400' },
  { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', border: 'border-fuchsia-200', dot: 'bg-fuchsia-400' },
  { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', dot: 'bg-orange-400' },
  { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', dot: 'bg-indigo-400' },
  { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', dot: 'bg-teal-400' },
  { bg: 'bg-lime-50', text: 'text-lime-600', border: 'border-lime-200', dot: 'bg-lime-400' },
  { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200', dot: 'bg-sky-400' },
  { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', dot: 'bg-violet-400' },
  { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', dot: 'bg-pink-400' },
  { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
  { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-400' },
];

const getGroupStyles = (groupName) => {
  if (!groupName || groupName === 'Uncategorized') return { className: 'bg-zinc-100 text-zinc-500 border-zinc-200', dot: 'bg-zinc-400' };
  if (groupName === 'All') return { className: 'bg-zinc-800 text-white border-zinc-800 shadow-sm', dot: 'bg-white' };

  let hash = 0;
  for (let i = 0; i < groupName.length; i++) {
    hash = ((hash << 5) - hash) + groupName.charCodeAt(i);
    hash |= 0;
  }

  hash = hash + groupName.length * 13;

  const palette = groupColorPalette[Math.abs(hash) % groupColorPalette.length];
  return {
    className: `${palette.bg} ${palette.text} ${palette.border}`,
    dot: palette.dot
  };
};

// --- Helper: Parse Groups ---
const parseGroups = (groupString) => {
  if (!groupString) return [];
  return groupString.split(/[,，]/).map(s => s.trim()).filter(Boolean);
};

// --- Helper: Format Timestamp ---
const formatTime = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
};

// --- Advanced Markdown Renderer ---
const AdvancedMarkdown = ({ content }) => {
  const [libsLoaded, setLibsLoaded] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const loadScript = (src, globalKey) => new Promise((resolve, reject) => {
      if (window[globalKey]) return resolve();

      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        const interval = setInterval(() => {
          if (window[globalKey]) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        if (window[globalKey]) resolve();
        else {
          const interval = setInterval(() => {
            if (window[globalKey]) {
              clearInterval(interval);
              resolve();
            }
          }, 50);
        }
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    const loadCSS = (href) => {
      if (document.querySelector(`link[href="${href}"]`)) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    };

    Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/marked/marked.min.js', 'marked'),
      loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js', 'katex')
    ]).then(() => {
      loadCSS('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css');
      setLibsLoaded(true);
    }).catch(err => console.error("Failed to load markdown libs", err));
  }, []);

  useEffect(() => {
    if (!libsLoaded || !window.marked || !window.katex || !content) return;

    window.marked.use({ gfm: true, breaks: true });

    const mathBlocks = [];
    // Pre-process local image paths (Windows)
    let processedContent = content.replace(/!\[(.*?)\]\(([a-zA-Z]:[\\/][^)]+)\)/g, (match, alt, path) => {
      const normalizedPath = path.replace(/\\/g, '/');
      return `![${alt}](file:///${normalizedPath})`;
    });

    let protectedText = processedContent.replace(/\$\$([\s\S]+?)\$\$/g, (_, equation) => {
      const id = mathBlocks.length;
      mathBlocks.push({ type: 'block', equation });
      return `MATHBLOCK${id}ENDMATHBLOCK`;
    });

    protectedText = protectedText.replace(/(\$((?:[^\\$]|\\.)+)\$|\\\(([\s\S]+?)\\\))/g, (_, __, dollarContent, parenContent) => {
      const id = mathBlocks.length;
      const equation = dollarContent || parenContent;
      mathBlocks.push({ type: 'inline', equation });
      return `MATHINLINE${id}ENDMATHINLINE`;
    });

    let html = window.marked.parse(protectedText);

    mathBlocks.forEach((item, index) => {
      try {
        const rendered = window.katex.renderToString(item.equation, {
          displayMode: item.type === 'block',
          throwOnError: false,
          output: 'html'
        });
        const token = item.type === 'block' ? `MATHBLOCK${index}ENDMATHBLOCK` : `MATHINLINE${index}ENDMATHINLINE`;
        html = html.replace(new RegExp(`<p>${token}</p>`, 'g'), rendered).replace(new RegExp(token, 'g'), rendered);
      } catch (e) { console.error("Math render error", e); }
    });

    if (containerRef.current) containerRef.current.innerHTML = html;
  }, [content, libsLoaded]);

  if (!content) return <p className="text-zinc-400 italic text-sm mt-4">暂无笔记内容...</p>;
  if (!libsLoaded) return <div className="flex items-center gap-2 text-zinc-400 text-sm"><Loader2 className="animate-spin" size={14} /> 正在加载渲染引擎...</div>;

  return (
    <>
      <style>{`
        .markdown-body { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif; font-size: 16px; line-height: 1.7; color: #333; }
        .markdown-body h1 { font-size: 1.8em; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.8em; letter-spacing: -0.02em; color: #111; }
        .markdown-body h2 { font-size: 1.4em; font-weight: 600; margin-top: 1.4em; margin-bottom: 0.6em; letter-spacing: -0.01em; color: #111; }
        .markdown-body h3 { font-size: 1.2em; font-weight: 600; margin-top: 1.2em; margin-bottom: 0.5em; color: #111; }
        .markdown-body p { margin-bottom: 1.2em; }
        .markdown-body blockquote { border-left: 3px solid #007AFF; padding-left: 1em; margin-left: 0; color: #666; font-style: italic; }
        .markdown-body code { background: rgba(0,0,0,0.06); padding: 0.2em 0.4em; border-radius: 6px; color: #D63384; font-size: 0.9em; font-family: "SF Mono", Menlo, monospace; }
        .markdown-body pre { background: #F5F5F7; padding: 20px; border-radius: 16px; overflow-x: auto; margin: 1.5em 0; border: 1px solid rgba(0,0,0,0.05); }
        .markdown-body pre code { background: transparent; padding: 0; color: inherit; }
        .markdown-body img { border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); margin: 2em auto; display: block; max-height: 500px; }
        .markdown-body table { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #E5E5EA; border-radius: 12px; overflow: hidden; margin: 2em 0; }
        .markdown-body th { background: #F9F9FB; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 0.9em; color: #666; border-bottom: 1px solid #E5E5EA; }
        .markdown-body td { padding: 12px 16px; border-bottom: 1px solid #E5E5EA; color: #333; }
        .markdown-body tr:last-child td { border-bottom: none; }
        .markdown-body ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1.2em; }
        .markdown-body ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1.2em; }
        .katex-display { overflow-x: auto; overflow-y: hidden; padding: 1em 0; }
      `}</style>
      <div ref={containerRef} className="markdown-body px-1" />
    </>
  );
};

export default function K1ssaper() {
  const [papers, setPapers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // App States
  const [activeTab, setActiveTab] = useState('library');
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(0);
  // Initial Path Logic - Optimized for macOS & Windows
  const [localPath, setLocalPath] = useState(() => {
    const stored = localStorage.getItem('kpapers_local_path');
    if (stored) return stored;
    if (window.require) {
      try {
        const os = window.require('os');
        const path = window.require('path');
        const homedir = os.homedir();
        if (window.process && window.process.platform === 'darwin') {
          return path.join(homedir, 'Documents', 'K1ssaper', 'Storage');
        }
        return 'D:\\K1ssaper\\Storage';
      } catch (e) {
        console.error("Failed to set default path:", e);
      }
    }
    return 'D:\\K1ssaper\\Storage';
  });

  const [zoomLevel, setZoomLevel] = useState(50);
  const [lang, setLang] = useState(() => localStorage.getItem('kpapers_lang') || 'zh');

  // UI State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [deleteNoteConfirmation, setDeleteNoteConfirmation] = useState(null);
  const [uploadStep, setUploadStep] = useState('drop');
  const [isNoteDrawerOpen, setIsNoteDrawerOpen] = useState(false);
  const [isFullScreenNote, setIsFullScreenNote] = useState(false);
  const [noteMode, setNoteMode] = useState('edit');
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [editingPaper, setEditingPaper] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [uploadFile, setUploadFile] = useState(null);
  const [groupSuggestions, setGroupSuggestions] = useState([]);
  const [showGroupSuggestions, setShowGroupSuggestions] = useState(false);

  // Notes State
  const [selectedNote, setSelectedNote] = useState(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isNotePreviewFullscreen, setIsNotePreviewFullscreen] = useState(false);
  const [noteFormData, setNoteFormData] = useState({ title: '', content: '' });

  // Folder State
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState('');

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    const newFolder = {
      id: crypto.randomUUID(),
      title: folderName,
      type: 'folder',
      parentId: currentFolderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isElectron()) {
      await FileSystemDB.saveNote(localPath, newFolder);
    }
    setLocalRefreshTrigger(prev => prev + 1);
    setFolderName('');
    setIsFolderModalOpen(false);
  };

  const handleMoveNote = async (noteId, targetFolderId) => {
    if (noteId === targetFolderId) return;
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    // Prevent moving folder into its own descendant
    if (note.type === 'folder' && targetFolderId) {
      let parent = notes.find(n => n.id === targetFolderId);
      while (parent) {
        if (parent.id === noteId) return;
        parent = notes.find(n => n.id === parent.parentId);
      }
    }

    const updatedNote = { ...note, parentId: targetFolderId, updatedAt: new Date().toISOString() };

    if (isElectron()) {
      await FileSystemDB.saveNote(localPath, updatedNote);
    }
    setLocalRefreshTrigger(prev => prev + 1);
  };

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    authors: '',
    venue: '',
    year: new Date().getFullYear(),
    group: '',
    notes: '',
    url: '',
    isRead: false
  });

  // CSP Warning Fix
  useEffect(() => {
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: file: https://cdn.jsdelivr.net local-resource:;";
      document.head.appendChild(meta);
    }
  }, []);

  // Translation Helper
  const t = (key, params = {}) => {
    const dict = translations[lang] || translations['zh'];
    let str = dict[key] || key;
    Object.keys(params).forEach(k => {
      str = str.replace(`{${k}}`, params[k]);
    });
    return str;
  };

  // --- Data Fetching Engine (Unified) ---
  useEffect(() => {
    setLoading(true);
    if (isElectron()) {
      Promise.all([
        FileSystemDB.getAll(localPath),
        FileSystemDB.getNotes(localPath)
      ]).then(([papersData, notesData]) => {
        setPapers(papersData);
        setNotes(notesData);
        setLoading(false);
      });
    } else {
      // Web fallback
      setPapers([]);
      setNotes([]);
      setLoading(false);
    }
  }, [localRefreshTrigger, localPath]);

  // --- Actions ---
  const handleOpenFileDialog = async () => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        const path = await ipcRenderer.invoke('dialog:openFile');
        if (path) {
          setUploadFile(path);
          const nodePath = window.require('path');
          const fileName = nodePath.basename(path);
          const rawName = fileName.replace(/\.pdf$/i, '');
          const cleanTitle = rawName.replace(/[-_]/g, ' ').trim();
          setFormData(prev => ({ ...prev, title: cleanTitle, authors: '', venue: '', year: new Date().getFullYear() }));
          setUploadStep('form');
        }
      } catch (e) {
        console.error("Dialog Error:", e);
      }
    }
  };

  const switchToManualEntry = () => {
    setUploadFile(null);
    setUploadStep('form');
  };

  const handleSavePaper = async () => {
    closeModals();
    setLoading(true);

    try {
      const docData = { ...formData, year: parseInt(formData.year) || new Date().getFullYear() };
      docData.updatedAt = new Date().toISOString();
      if (!editingPaper) {
        docData.createdAt = new Date().toISOString();
      }

      if (isElectron()) {
        await FileSystemDB.save(localPath, editingPaper ? { ...docData, id: editingPaper.id } : docData, uploadFile);
      }
      setLocalRefreshTrigger(prev => prev + 1);
    } catch (error) { console.error("Error saving paper:", error); } finally {
      setLoading(false);
      setUploadFile(null);
    }
  };

  const handleSaveNote = async () => {
    setIsNoteModalOpen(false);
    setLoading(true);
    try {
      const noteData = { ...noteFormData, updatedAt: new Date().toISOString() };
      if (!selectedNote) {
        noteData.createdAt = new Date().toISOString();
        noteData.parentId = currentFolderId;
        noteData.type = 'note';
      } else {
        noteData.id = selectedNote.id;
        noteData.createdAt = selectedNote.createdAt;
        noteData.parentId = selectedNote.parentId;
        noteData.type = selectedNote.type || 'note';
      }

      if (isElectron()) {
        await FileSystemDB.saveNote(localPath, noteData);
      } else {
        await IndexedDB.saveNote(noteData);
      }
      setLocalRefreshTrigger(prev => prev + 1);
    } catch (error) { console.error("Error saving note:", error); } finally {
      setLoading(false);
      setSelectedNote(null);
    }
  };

  const performDelete = async () => {
    if (!deleteConfirmation) return;
    await handleDelete(deleteConfirmation.id);
  };

  const handleDelete = async (id) => {
    setDeleteConfirmation(null);
    try {
      if (isElectron()) {
        await FileSystemDB.delete(localPath, id);
      } else {
        await IndexedDB.delete(id);
      }
      setLocalRefreshTrigger(prev => prev + 1);
      if (selectedPaper?.id === id) setIsNoteDrawerOpen(false);
    } catch (error) { console.error("Error deleting:", error); }
  };

  const performDeleteNote = async () => {
    if (!deleteNoteConfirmation) return;
    await handleDeleteNote(deleteNoteConfirmation.id);
    setDeleteNoteConfirmation(null);
  };

  const handleDeleteNote = async (id) => {
    try {
      if (isElectron()) {
        await FileSystemDB.deleteNote(localPath, id);
      } else {
        await IndexedDB.deleteNote(id);
      }
      setLocalRefreshTrigger(prev => prev + 1);
      if (selectedNote?.id === id) setSelectedNote(null);
    } catch (error) { console.error("Error deleting note:", error); }
  };

  const updateNotes = async (id, newNotes) => {
    const paper = papers.find(p => p.id === id);
    if (!paper) return;

    if (paper.notes === newNotes) return;

    const updatedPaper = { ...paper, notes: newNotes, updatedAt: new Date().toISOString() };

    if (isElectron()) {
      await FileSystemDB.save(localPath, updatedPaper);
    } else {
      await IndexedDB.save(updatedPaper);
    }
    setLocalRefreshTrigger(prev => prev + 1);
  };

  const toggleReadStatus = async (e, paper) => {
    if (e) e.stopPropagation();
    const updatedPaper = { ...paper, isRead: !paper.isRead };

    updatedPaper.updatedAt = new Date().toISOString();

    if (isElectron()) {
      await FileSystemDB.save(localPath, updatedPaper);
    }

    setPapers(prev => prev.map(p => p.id === paper.id ? updatedPaper : p));
    if (selectedPaper && selectedPaper.id === paper.id) {
      setSelectedPaper(updatedPaper);
    }

    setLocalRefreshTrigger(prev => prev + 1);
  };

  const switchLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('kpapers_lang', newLang);
  }

  const handleChangeFolderDialog = async () => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        const path = await ipcRenderer.invoke('dialog:openDirectory');
        if (path) {
          setLocalPath(path);
          localStorage.setItem('kpapers_local_path', path);
        }
      } catch (err) {
        console.error("Failed to open directory dialog:", err);
      }
    }
  };

  const openStorageFolder = () => {
    if (isElectron() && window.require) {
      const { shell } = window.require('electron');
      shell.openPath(localPath);
    } else {
      alert("Folder opening is only available in desktop app.");
    }
  };

  // CRITICAL CHANGE: Use computed path for PDF to handle cross-platform syncing properly
  const getComputedPdfPath = (paper) => {
    if (!isElectron()) return null;
    try {
      const path = window.require('path');
      return path.join(localPath, 'pdfs', `${paper.id}.pdf`);
    } catch (e) {
      return null;
    }
  };

  const getPdfUrl = (paper) => {
    const pdfPath = getComputedPdfPath(paper);
    if (isElectron() && pdfPath) {
      // Normalize backslashes for URL on Windows
      const normalizedPath = pdfPath.replace(/\\/g, '/');
      return `file://${normalizedPath}`;
    }
    return null;
  };

  const downloadPdf = (paper) => {
    const pdfPath = getComputedPdfPath(paper);
    if (isElectron() && pdfPath) {
      if (window.require) {
        const { shell } = window.require('electron');
        shell.showItemInFolder(pdfPath);
      }
    }
  };

  const closeDrawer = () => {
    if (isFullScreenNote) {
      setIsFullScreenNote(false);
      setIsNoteDrawerOpen(false);
      setSelectedPaper(null);
    } else {
      setIsNoteDrawerOpen(false);
      setTimeout(() => {
        setIsFullScreenNote(false);
        setSelectedPaper(null);
      }, 500);
    }
  };

  const openLink = (url) => {
    if (!url) return;
    const href = url.startsWith('http') ? url : `https://${url}`;
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const handleWindowControl = (action) => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send(`window-${action}`);
      } catch (e) {
        console.error("Electron IPC not available", e);
      }
    }
  };

  const handleGroupChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, group: val }));
    const parts = val.split(/[,，]/);
    const lastPart = parts[parts.length - 1].trim();
    if (lastPart) {
      const allTags = groups.filter(g => g !== 'All' && g !== 'Uncategorized' && g !== 'Read' && g !== 'Unread');
      const matches = allTags.filter(t => t.toLowerCase().startsWith(lastPart.toLowerCase()));
      setGroupSuggestions(matches);
      setShowGroupSuggestions(matches.length > 0);
    } else {
      setShowGroupSuggestions(false);
    }
  };

  const selectGroupSuggestion = (suggestion) => {
    const val = formData.group;
    let lastCommaIndex = -1;
    for (let i = val.length - 1; i >= 0; i--) {
      if (val[i] === ',' || val[i] === '，') {
        lastCommaIndex = i;
        break;
      }
    }
    let newVal;
    if (lastCommaIndex === -1) {
      newVal = suggestion + ', ';
    } else {
      newVal = val.substring(0, lastCommaIndex + 1) + ' ' + suggestion + ', ';
    }
    setFormData(prev => ({ ...prev, group: newVal }));
    setShowGroupSuggestions(false);
  };

  const openAddModal = () => {
    setEditingPaper(null);
    setUploadStep('drop');
    setUploadFile(null);
    setFormData({ title: '', summary: '', authors: '', venue: '', year: new Date().getFullYear(), group: '', notes: '', url: '', isRead: false });
    setIsUploadModalOpen(true);
  };
  const openEditModal = (paper) => {
    setEditingPaper(paper);
    setUploadStep('form');
    setFormData({ ...paper, summary: paper.summary || '', url: paper.url || '' });
    setIsUploadModalOpen(true);
  };
  const openNoteModal = (note = null) => {
    setSelectedNote(note);
    setNoteFormData(note ? { title: note.title, content: note.content } : { title: '', content: '' });
    setIsNotePreviewFullscreen(false);
    setIsNoteModalOpen(true);
  };
  const openNotes = async (paper) => {
    setSelectedPaper(paper);
    setNoteMode('preview');
    setIsFullScreenNote(false);
    // Ensure the drawer mounts in closed state first, then animates open
    setTimeout(() => setIsNoteDrawerOpen(true), 50);
  };
  const closeModals = () => {
    setIsUploadModalOpen(false);
    setEditingPaper(null);
    setDeleteConfirmation(null);
    setDeleteNoteConfirmation(null);
    setShowGroupSuggestions(false);
  };
  const handleSort = (key) => { setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc' }); };
  const hasNotes = (paper) => paper.notes && paper.notes.trim().length > 0;

  const groups = useMemo(() => {
    const allTags = new Set();
    papers.forEach(p => {
      if (p.group) {
        parseGroups(p.group).forEach(t => allTags.add(t));
      } else {
        allTags.add('Uncategorized');
      }
    });
    return ['All', 'Read', 'Unread', ...Array.from(allTags).filter(t => t !== 'Uncategorized').sort()];
  }, [papers]);

  const filteredPapers = useMemo(() => {
    let result = [...papers];
    if (activeGroup === 'Read') {
      result = result.filter(p => p.isRead);
    } else if (activeGroup === 'Unread') {
      result = result.filter(p => !p.isRead);
    } else if (activeGroup !== 'All') {
      result = result.filter(p => {
        if (activeGroup === 'Uncategorized') return !p.group;
        if (!p.group) return false;
        const pGroups = parseGroups(p.group);
        return pGroups.includes(activeGroup);
      });
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.authors.toLowerCase().includes(q) || p.venue.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      const getTime = (t) => {
        if (!t) return 0;
        return new Date(t).getTime();
      }
      if (sortConfig.key === 'updatedAt' || sortConfig.key === 'createdAt') {
        return sortConfig.direction === 'asc' ? getTime(aVal) - getTime(bVal) : getTime(bVal) - getTime(aVal);
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [papers, activeGroup, searchQuery, sortConfig]);

  const gridColumns = useMemo(() => {
    if (zoomLevel < 20) return 'grid-cols-6';
    if (zoomLevel < 40) return 'grid-cols-5';
    if (zoomLevel < 60) return 'grid-cols-4';
    if (zoomLevel < 80) return 'grid-cols-3';
    return 'grid-cols-2';
  }, [zoomLevel]);

  const listDensity = useMemo(() => {
    if (zoomLevel < 30) return { py: 'py-2', text: 'text-xs' };
    if (zoomLevel < 70) return { py: 'py-3.5', text: 'text-sm' };
    return { py: 'py-5', text: 'text-base' };
  }, [zoomLevel]);

  const SortIcon = ({ column }) => sortConfig.key !== column ? <div className="w-3 h-3" /> : sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;

  return (
    <div className="flex h-screen bg-[#F5F5F7] text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden relative">
      <style>{`
        .draggable { -webkit-app-region: drag; }
        .non-draggable { -webkit-app-region: no-drag; }
      `}</style>

      {/* --- Unified Drag Region (Top 32px of the entire app) --- */}
      <div className="absolute top-0 left-0 w-full h-8 draggable z-[100]" />

      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col pt-4 pb-4 px-4 border-r border-transparent relative draggable">
        {/* App Title Text Only */}
        <div className={`flex items-center gap-3 px-3 mb-8 ${isMac ? 'mt-10' : 'mt-4'} non-draggable`}>
          <span className="font-bold text-xl tracking-tight text-zinc-900">K1ssaper</span>
        </div>

        {/* Nav Items */}
        <div className="space-y-1 mb-6 non-draggable">
          <button
            onClick={() => setActiveTab('library')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 ${activeTab === 'library' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:bg-white/50'}`}
          >
            <BookOpen size={18} /> {t('library')}
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 ${activeTab === 'notes' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:bg-white/50'}`}
          >
            <StickyNote size={18} /> {t('notes')}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 ${activeTab === 'settings' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:bg-white/50'}`}
          >
            <Settings size={18} /> {t('settings')}
          </button>
        </div>

        {activeTab === 'library' && (
          <div className="flex-1 flex flex-col min-h-0 non-draggable">
            <button
              onClick={openAddModal}
              className="w-full bg-zinc-900 hover:bg-black text-white py-2.5 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-all shadow-lg shadow-zinc-200/50 mb-6 active:scale-95 group flex-shrink-0"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="tracking-wide">{t('newPaper')}</span>
            </button>

            {/* Fixed Filters */}
            <div className="mt-4 mb-2">
              {['All', 'Read', 'Unread'].map(filterKey => {
                const isActive = activeGroup === filterKey;
                let label = t('allPapers');
                let count = papers.length;
                let icon = <Layout size={16} className={isActive ? 'text-black' : 'text-zinc-400'} />;

                if (filterKey === 'Read') {
                  label = t('filterRead');
                  count = papers.filter(p => p.isRead).length;
                  icon = <CheckCircle2 size={16} className={isActive ? 'text-green-600' : 'text-zinc-400'} />;
                } else if (filterKey === 'Unread') {
                  label = t('filterUnread');
                  count = papers.filter(p => !p.isRead).length;
                  icon = <Circle size={16} className={isActive ? 'text-zinc-900' : 'text-zinc-400'} />;
                }

                return (
                  <button
                    key={filterKey}
                    onClick={() => setActiveGroup(filterKey)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-[13px] flex items-center justify-between group ${isActive
                      ? 'bg-white shadow-sm text-zinc-900 font-semibold'
                      : 'text-zinc-500 hover:bg-white/60 hover:text-zinc-800'
                      }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {icon}
                      <span className="truncate">{label}</span>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full transition-colors ${isActive ? 'bg-zinc-100 text-zinc-600' : 'text-zinc-400 bg-transparent'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Groups Area */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar border-t border-zinc-200/50 pt-2">
              <div className="px-3 py-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1 opacity-80">{t('groupsHeader')}</div>

              {groups.filter(g => !['All', 'Read', 'Unread'].includes(g)).map(group => {
                const isActive = activeGroup === group;
                const count = papers.filter(p => {
                  if (group === 'Uncategorized') return !p.group;
                  if (!p.group) return false;
                  return parseGroups(p.group).includes(group);
                }).length;
                const groupStyles = getGroupStyles(group);

                return (
                  <button
                    key={group}
                    onClick={() => setActiveGroup(group)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-[13px] flex items-center justify-between group ${isActive
                      ? 'bg-white shadow-sm text-zinc-900 font-semibold'
                      : 'text-zinc-500 hover:bg-white/60 hover:text-zinc-800'
                      }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${groupStyles.dot}`}></div>
                      <span className="truncate">{group}</span>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full transition-colors ${isActive ? 'bg-zinc-100 text-zinc-600' : 'text-zinc-400 bg-transparent'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-zinc-200/50 px-2 flex items-center gap-3 opacity-80 non-draggable">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-600 flex items-center justify-center text-white shadow-md border-2 border-white">
            <span className="font-bold text-xs">K</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-800">K1ssInn</span>
            <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide flex items-center gap-1">
              <HardDrive size={10} /> {t('localStorage')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 p-4 pl-0 pt-4">
        <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-[24px] shadow-sm flex flex-col overflow-hidden border border-white/60 relative">

          {activeTab === 'settings' ? (
            // --- Settings View ---
            <>
              <div className="h-16 flex items-center justify-between px-8 pr-8 flex-shrink-0 border-b border-zinc-100/50 z-20 bg-white/50 backdrop-blur-md sticky top-0 draggable">
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight non-draggable">{t('settings')}</h2>

                <div className="flex items-center gap-4">
                  {/* Integrated Window Controls for Settings Page */}
                  {!isMac && (
                    <div key="settings-controls" className="flex bg-zinc-100/50 rounded-xl p-1 gap-1 pointer-events-auto non-draggable">
                      <button onClick={() => handleWindowControl('minimize')} className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-800 transition-colors">
                        <Minus size={14} />
                      </button>
                      <button onClick={() => handleWindowControl('maximize')} className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-800 transition-colors">
                        <Square size={12} />
                      </button>
                      <button onClick={() => handleWindowControl('close')} className="p-1.5 hover:bg-red-100 hover:text-red-500 rounded-lg text-zinc-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 p-12 overflow-y-auto">
                <div className="max-w-2xl">
                  {/* Language Setting */}
                  <div className="mb-10 animate-in slide-in-from-top-4 fade-in duration-300">
                    <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                      <Globe size={20} className="text-zinc-400" />
                      {t('interfaceLanguage')}
                    </h3>
                    <div className="bg-white rounded-2xl border border-zinc-200 p-1 flex gap-1 shadow-sm">
                      <button
                        onClick={() => switchLanguage('en')}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${lang === 'en' ? 'bg-zinc-100 text-zinc-900 shadow-inner' : 'text-zinc-500 hover:bg-zinc-50'}`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => switchLanguage('zh')}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${lang === 'zh' ? 'bg-zinc-100 text-zinc-900 shadow-inner' : 'text-zinc-500 hover:bg-zinc-50'}`}
                      >
                        中文
                      </button>
                    </div>
                  </div>

                  {/* Storage Path Setting */}
                  <div className="mb-10 animate-in slide-in-from-top-4 fade-in duration-300">
                    <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                      <FolderOpen size={20} className="text-zinc-400" />
                      {t('storageLocation')}
                    </h3>
                    <div className="bg-white rounded-2xl border border-zinc-200 p-4 flex items-center gap-4 shadow-sm">
                      <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 flex-shrink-0">
                        <HardDrive size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">{t('currentPath')}</div>
                        {/* Editable Input for Path */}
                        <input
                          type="text"
                          value={localPath}
                          onChange={(e) => {
                            setLocalPath(e.target.value);
                            localStorage.setItem('kpapers_local_path', e.target.value);
                          }}
                          className="text-sm font-mono text-zinc-700 w-full bg-transparent border-none focus:ring-0 p-0 truncate"
                          placeholder="e.g. D:\Papers"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={openStorageFolder}
                          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-full transition-colors whitespace-nowrap flex items-center gap-1"
                        >
                          <FolderOpen size={14} />
                          {t('openFolder')}
                        </button>
                        <button
                          onClick={handleChangeFolderDialog}
                          className="px-4 py-2 bg-zinc-900 hover:bg-black text-white text-sm font-medium rounded-full transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1"
                        >
                          <Edit2 size={14} />
                          {t('changeFolder')}
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-zinc-400 px-2">{t('localDesc')}</p>
                  </div>

                  <div className="mb-10">
                    <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                      <User size={20} className="text-zinc-400" />
                      {t('account')}
                    </h3>
                    <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-6 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-800 to-black text-white flex items-center justify-center text-2xl font-bold shadow-lg">K</div>
                      <div>
                        <div className="font-bold text-zinc-900 text-lg">K1ssInn</div>
                        <div className="text-sm text-zinc-500">{t('proUser')}</div>
                      </div>
                      <div className="ml-auto px-3 py-1 bg-zinc-200 rounded-full text-xs font-bold text-zinc-600 uppercase tracking-wide">{t('offline')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === 'notes' ? (
            // --- Notes View (Folder System) ---
            <>
              <div className="h-16 flex items-center justify-between px-8 pr-8 flex-shrink-0 border-b border-zinc-100/50 z-20 bg-white/50 backdrop-blur-md sticky top-0 draggable">
                <div className="flex items-center gap-4 non-draggable overflow-hidden">
                  <h2 className="text-2xl font-bold text-zinc-900 tracking-tight flex-shrink-0">{t('notes')}</h2>
                  <div className="h-6 w-px bg-zinc-200 mx-2"></div>
                  {/* Breadcrumbs */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mask-linear-fade p-1 -ml-1">
                    <button
                      onClick={() => setCurrentFolderId(null)}
                      onDragOver={(e) => { e.preventDefault(); if (dragOverId !== 'root') setDragOverId('root'); }}
                      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverId(null); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOverId(null);
                        const id = e.dataTransfer.getData('text/plain');
                        if (id) handleMoveNote(id, null);
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium transition-all border-2 ${dragOverId === 'root' ? 'border-blue-500 bg-blue-50 text-blue-700' : (!currentFolderId ? 'border-transparent bg-zinc-100 text-zinc-900' : 'border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900')}`}
                    >
                      <HardDrive size={14} />
                      <span>Root</span>
                    </button>
                    {(() => {
                      const path = [];
                      let curr = currentFolderId;
                      while (curr) {
                        const folder = notes.find(n => n.id === curr);
                        if (folder) {
                          path.unshift(folder);
                          curr = folder.parentId;
                        } else {
                          break;
                        }
                      }
                      return path.map((folder, idx) => (
                        <div key={folder.id} className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-zinc-300">/</span>
                          <button
                            onClick={() => setCurrentFolderId(folder.id)}
                            onDragOver={(e) => { e.preventDefault(); if (dragOverId !== folder.id) setDragOverId(folder.id); }}
                            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverId(null); }}
                            onDrop={(e) => {
                              e.preventDefault();
                              setDragOverId(null);
                              const id = e.dataTransfer.getData('text/plain');
                              if (id && id !== folder.id) handleMoveNote(id, folder.id);
                            }}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium transition-all border-2 ${dragOverId === folder.id ? 'border-blue-500 bg-blue-50 text-blue-700' : (idx === path.length - 1 ? 'border-transparent bg-zinc-100 text-zinc-900' : 'border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900')}`}
                          >
                            <Folder size={14} />
                            <span className="max-w-[100px] truncate">{folder.title}</span>
                          </button>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsFolderModalOpen(true)}
                    className="bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 py-2 px-4 rounded-full flex items-center gap-2 text-sm font-medium shadow-sm non-draggable"
                  >
                    <FolderOpen size={16} /> {t('newFolder')}
                  </button>
                  <button
                    onClick={() => openNoteModal()}
                    className="bg-zinc-900 hover:bg-black text-white py-2 px-4 rounded-full flex items-center gap-2 text-sm font-medium shadow-lg shadow-zinc-200/50 non-draggable"
                  >
                    <Plus size={16} /> {t('newNote')}
                  </button>
                  {!isMac && (
                    <div className="flex bg-zinc-100/50 rounded-xl p-1 gap-1 pointer-events-auto non-draggable">
                      <button onClick={() => handleWindowControl('minimize')} className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-800 transition-colors"><Minus size={14} /></button>
                      <button onClick={() => handleWindowControl('maximize')} className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-800 transition-colors"><Square size={12} /></button>
                      <button onClick={() => handleWindowControl('close')} className="p-1.5 hover:bg-red-100 hover:text-red-500 rounded-lg text-zinc-500 transition-colors"><X size={14} /></button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData('text/plain');
                  if (id) {
                    // Dropping on empty space -> move to current folder
                    handleMoveNote(id, currentFolderId);
                  }
                }}
              >
                {notes.filter(n => (n.parentId || null) === currentFolderId).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-300">
                    <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                      <StickyNote size={40} className="opacity-20 text-zinc-900" />
                    </div>
                    <p className="font-semibold text-zinc-600 text-lg">{t('noNotes')}</p>
                    <p className="text-sm text-zinc-400 mt-2">{t('noNotesSub')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Folders First */}
                    {notes.filter(n => (n.parentId || null) === currentFolderId && n.type === 'folder').map(folder => (
                      <div
                        key={folder.id}
                        className={`rounded-[24px] p-6 border transition-all group relative flex flex-col h-[180px] cursor-pointer ${dragOverId === folder.id ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-400 shadow-lg scale-[1.02] z-10' : 'bg-blue-50/50 border-blue-100/50 hover:border-blue-200 hover:bg-blue-50'}`}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', folder.id);
                          e.stopPropagation();
                        }}
                        onClick={() => setCurrentFolderId(folder.id)}
                        onDragOver={(e) => { e.preventDefault(); if (dragOverId !== folder.id) setDragOverId(folder.id); }}
                        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverId(null); }}
                        onDrop={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setDragOverId(null);
                          const id = e.dataTransfer.getData('text/plain');
                          if (id && id !== folder.id) {
                            handleMoveNote(id, folder.id);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                            <Folder size={24} />
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setDeleteNoteConfirmation(folder)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </div>
                        <h3 className="font-bold text-lg text-zinc-900 mb-1 line-clamp-1">{folder.title}</h3>
                        <p className="text-sm text-zinc-500">{notes.filter(n => n.parentId === folder.id).length} {t('folderItems')}</p>
                      </div>
                    ))}

                    {/* Notes */}
                    {notes.filter(n => (n.parentId || null) === currentFolderId && n.type !== 'folder').map(note => (
                      <div
                        key={note.id}
                        className="bg-white rounded-[24px] p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-all group relative flex flex-col h-[180px] cursor-pointer"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('text/plain', note.id)}
                        onClick={() => openNoteModal(note, 'preview')}
                      >
                        <h3 className="font-bold text-lg text-zinc-900 mb-2 line-clamp-2">{note.title}</h3>
                        <div className="flex-1 overflow-hidden relative mb-4 pointer-events-none">
                          <div className="text-sm text-zinc-500 line-clamp-5 whitespace-pre-wrap font-mono">{note.content}</div>
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-50" onClick={e => e.stopPropagation()}>
                          <span className="text-xs text-zinc-400 font-medium">{formatTime(note.updatedAt)}</span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openNoteModal(note, 'edit')} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"><Edit3 size={14} /></button>
                            <button onClick={() => setDeleteNoteConfirmation(note)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            // --- Library View ---
            <>
              {/* Header */}
              <div className="h-16 flex items-center justify-between px-8 pr-8 flex-shrink-0 border-b border-zinc-100/50 z-20 bg-white/50 backdrop-blur-md sticky top-0 draggable">
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2 non-draggable">
                  {activeGroup === 'All' ? t('allPapers') : (activeGroup === 'Read' ? t('filterRead') : (activeGroup === 'Unread' ? t('filterUnread') : activeGroup))}
                </h2>

                <div className="flex items-center gap-4 non-draggable">
                  {/* Zoom/Density Slider */}
                  <div className="flex items-center gap-2 group mr-2">
                    <ZoomOut size={14} className="text-zinc-400" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={zoomLevel}
                      onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                      className="w-24 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-800 hover:accent-zinc-600 transition-all"
                      title="Adjust Display Density"
                    />
                    <ZoomIn size={14} className="text-zinc-400" />
                  </div>

                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" size={16} />
                    <input
                      type="text"
                      placeholder={t('searchPlaceholder')}
                      className="pl-9 pr-4 py-2 w-60 bg-zinc-100/50 border-none rounded-xl text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-0 focus:bg-white focus:shadow-md transition-all duration-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="bg-zinc-100/50 p-1 rounded-xl flex gap-1">
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white text-black shadow-sm scale-105' : 'text-zinc-400 hover:text-zinc-600'}`}><List size={16} /></button>
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white text-black shadow-sm scale-105' : 'text-zinc-400 hover:text-zinc-600'}`}><Grid size={16} /></button>
                  </div>

                  <div className="h-5 w-px bg-zinc-200/50"></div>

                  {/* Integrated Window Controls for Library Page */}
                  {!isMac && (
                    <div className="flex bg-zinc-100/50 rounded-xl p-1 gap-1">
                      <button onClick={() => handleWindowControl('minimize')} className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-800 transition-colors"><Minus size={14} /></button>
                      <button onClick={() => handleWindowControl('maximize')} className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-800 transition-colors"><Square size={12} /></button>
                      <button onClick={() => handleWindowControl('close')} className="p-1.5 hover:bg-red-100 hover:text-red-500 rounded-lg text-zinc-500 transition-colors"><X size={14} /></button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Scroll Area */}
              <div className={`flex-1 overflow-auto scroll-smooth ${viewMode === 'list' ? 'p-0' : 'p-6'}`}>
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                    <Loader2 className="animate-spin mb-3 text-zinc-300" size={32} />
                    <p className="text-sm font-medium">{t('syncing')}</p>
                  </div>
                ) : filteredPapers.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-300">
                    <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                      <FileText size={40} className="opacity-20 text-zinc-900" />
                    </div>
                    <p className="font-semibold text-zinc-600 text-lg">{t('noPapers')}</p>
                    <p className="text-sm text-zinc-400 mt-2">{t('noPapersSub')}</p>
                  </div>
                ) : (
                  viewMode === 'list' ? (
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10 shadow-sm">
                        <tr className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100">
                          <th className="px-4 py-3 cursor-pointer hover:text-zinc-600 w-[45%]" onClick={() => handleSort('title')}>{t('title')} <SortIcon column="title" /></th>
                          <th className="px-4 py-3 cursor-pointer hover:text-zinc-600 w-[15%]" onClick={() => handleSort('authors')}>{t('authors')} <SortIcon column="authors" /></th>
                          <th className="px-4 py-3 cursor-pointer hover:text-zinc-600 w-[12%]" onClick={() => handleSort('venue')}>{t('venue')} <SortIcon column="venue" /></th>
                          <th className="px-4 py-3 cursor-pointer hover:text-zinc-600 w-[8%]" onClick={() => handleSort('year')}>{t('year')} <SortIcon column="year" /></th>
                          <th className="px-4 py-3 cursor-pointer hover:text-zinc-600 w-[10%]" onClick={() => handleSort('group')}>{t('group')} <SortIcon column="group" /></th>
                          <th className="px-4 py-3 cursor-pointer hover:text-zinc-600 w-[10%]" onClick={() => handleSort('updatedAt')}>{t('updatedAt')} <SortIcon column="updatedAt" /></th>
                          <th className="px-4 py-3 w-[50px]"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPapers.map(paper => (
                          <tr
                            key={paper.id}
                            className="group border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-colors cursor-default"
                          >
                            <td className={`px-4 align-middle ${listDensity.py}`}>
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-black/5 cursor-pointer hover:bg-zinc-100 transition-colors ${paper.isRead ? 'bg-green-50 text-green-600' : 'bg-white text-zinc-300'}`}
                                  onClick={(e) => toggleReadStatus(e, paper)}
                                  title={paper.isRead ? t('markUnread') : t('markRead')}
                                >
                                  {paper.isRead ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                </div>
                                <div className="min-w-0 flex items-center gap-2">
                                  <div
                                    className={`font-semibold group-hover:text-blue-600 cursor-pointer truncate transition-colors max-w-[400px] ${listDensity.text} ${paper.isRead ? 'text-zinc-500' : 'text-zinc-900'}`}
                                    onClick={() => openNotes(paper)}
                                    title={paper.title}
                                  >
                                    {paper.title}
                                  </div>
                                  {paper.url && (
                                    <button onClick={(e) => { e.stopPropagation(); openLink(paper.url); }} className="text-zinc-400 hover:text-blue-500 p-1">
                                      <ExternalLink size={12} />
                                    </button>
                                  )}
                                  {hasNotes(paper) && <StickyNote size={14} className="text-amber-500 fill-amber-100 flex-shrink-0" />}
                                </div>
                              </div>
                            </td>
                            <td className={`px-4 text-zinc-500 align-middle ${listDensity.py} ${listDensity.text}`}>
                              <div className="truncate max-w-[150px]" title={paper.authors}>{paper.authors || '-'}</div>
                            </td>
                            <td className={`px-4 align-middle ${listDensity.py}`}>
                              <div className="flex items-center h-full">
                                {paper.venue && <span className="inline-block px-2.5 py-0.5 bg-white border border-zinc-200 text-zinc-600 rounded-md text-[11px] font-semibold truncate max-w-full shadow-sm align-middle">{paper.venue}</span>}
                              </div>
                            </td>
                            <td className={`px-4 text-zinc-500 font-medium tabular-nums align-middle ${listDensity.py} ${listDensity.text}`}>
                              {paper.year}
                            </td>
                            <td className={`px-4 align-middle ${listDensity.py}`}>
                              <div className="flex items-center h-full gap-1 flex-wrap">
                                {paper.group && parseGroups(paper.group).map((g, i) => (
                                  <span key={i} className={`inline-block max-w-[100px] truncate text-[11px] px-2.5 py-0.5 rounded-full font-medium border shadow-sm align-middle ${getGroupStyles(g).className}`}>
                                    {g}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className={`px-4 text-zinc-400 align-middle ${listDensity.py} text-xs`}>
                              {formatTime(paper.updatedAt)}
                            </td>
                            <td className={`px-4 text-right align-middle ${listDensity.py}`}>
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                <button onClick={() => openEditModal(paper)} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-white rounded-full transition-colors"><Edit3 size={14} /></button>
                                <button onClick={() => setDeleteConfirmation(paper)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-white rounded-full transition-colors"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className={`grid ${gridColumns} gap-6 pb-12`}>
                      {filteredPapers.map(paper => (
                        <div
                          key={paper.id}
                          onClick={() => openNotes(paper)}
                          className={`bg-white rounded-[24px] p-5 cursor-pointer border hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group relative flex flex-col min-h-[220px] ${paper.isRead ? 'border-zinc-100 shadow-sm opacity-80' : 'border-zinc-200 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]'}`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-2">
                              {paper.venue && <span className="bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-md text-[10px] text-zinc-600 font-bold uppercase tracking-wider">{paper.venue}</span>}
                              <span className="text-[11px] text-zinc-400 font-medium py-0.5">{paper.year}</span>
                            </div>
                            <div className="flex gap-1 items-center z-10">
                              {paper.url && (
                                <button onClick={(e) => { e.stopPropagation(); openLink(paper.url); }} className="text-zinc-300 hover:text-blue-500 p-0.5">
                                  <ExternalLink size={14} />
                                </button>
                              )}
                              <button
                                onClick={(e) => toggleReadStatus(e, paper)}
                                className={`p-1 rounded-full hover:bg-zinc-100 transition-colors ${paper.isRead ? 'text-green-500' : 'text-zinc-300 hover:text-zinc-500'}`}
                                title={paper.isRead ? t('markUnread') : t('markRead')}
                              >
                                {paper.isRead ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                              </button>
                            </div>
                          </div>

                          <h3 className={`font-bold leading-snug line-clamp-3 mb-2 group-hover:text-blue-600 transition-colors ${zoomLevel < 30 ? 'text-sm' : zoomLevel > 70 ? 'text-lg' : 'text-base'} ${paper.isRead ? 'text-zinc-500 font-normal' : 'text-zinc-900'}`}>
                            {paper.title}
                          </h3>

                          <div className="mt-auto relative">
                            <div className="text-xs text-zinc-500 mb-4 line-clamp-1">{paper.authors}</div>

                            <div className="flex flex-wrap items-center justify-between border-t border-zinc-50 pt-3 relative gap-2">
                              <div className="flex gap-1 flex-wrap pr-16"> {/* Added padding-right to avoid overlapping date */}
                                {paper.group ? parseGroups(paper.group).map((g, i) => (
                                  <span key={i} className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border truncate max-w-[80px] ${getGroupStyles(g).className}`}>
                                    {g}
                                  </span>
                                )) : <span></span>}
                              </div>

                              <span className="absolute right-0 bottom-0 text-[10px] text-zinc-400 font-medium tabular-nums transition-opacity duration-200 group-hover:opacity-0 bg-white pl-2">
                                {paper.updatedAt ? formatTime(paper.updatedAt) : '-'}
                              </span>
                            </div>
                          </div>

                          <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
                            <button onClick={(e) => { e.stopPropagation(); openEditModal(paper); }} className="p-2 bg-white/90 backdrop-blur text-zinc-500 hover:text-zinc-900 rounded-full shadow-lg border border-zinc-100"><Edit3 size={14} /></button>
                            <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmation(paper); }} className="p-2 bg-white/90 backdrop-blur text-zinc-500 hover:text-red-600 rounded-full shadow-lg border border-zinc-100"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- Fullscreen / Drawer Note Editor --- */}
      {selectedPaper && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[200] transition-opacity duration-500 ${isNoteDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={closeDrawer}
          />
          {/* Panel */}
          <div className={`fixed z-[200] bg-white/95 backdrop-blur-2xl shadow-2xl transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col overflow-hidden border-l border-white/50 ${!isNoteDrawerOpen && 'pointer-events-none'}
                ${isFullScreenNote
              ? 'inset-0 rounded-none'
              : `inset-y-3 right-3 w-[650px] rounded-[32px] ${isNoteDrawerOpen ? 'translate-x-0' : 'translate-x-[120%]'}`
            }
            `}>

            {/* Note Header */}
            <div className={`h-16 px-6 flex items-center justify-between border-b border-zinc-100/50 flex-shrink-0 bg-white/50 z-10 draggable ${isMac && isFullScreenNote ? 'pl-24 pr-6' : 'px-6'}`}>
              <div className="flex items-center gap-4 non-draggable">
                {/* Fixed Close Button Hit Area */}
                <button onClick={closeDrawer} className="group flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors py-2 pr-2">
                  <ArrowLeft size={18} />
                  <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity -ml-1 group-hover:ml-0 duration-200">{t('close')}</span>
                </button>
                <div className="h-4 w-px bg-zinc-200"></div>
                <div className="flex bg-zinc-100/80 rounded-lg p-1">
                  <button onClick={() => setNoteMode('edit')} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm ${noteMode === 'edit' ? 'bg-white text-zinc-900 shadow' : 'text-zinc-500 hover:text-zinc-700 shadow-none'}`}>{t('write')}</button>
                  <button onClick={() => setNoteMode('preview')} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm ${noteMode === 'preview' ? 'bg-white text-blue-600 shadow' : 'text-zinc-500 hover:text-zinc-700 shadow-none'}`}>{t('read')}</button>
                  {/* PDF View Toggle */}
                  {((isElectron() && !isMac && selectedPaper.hasPdf) || (!isElectron() && selectedPaper.pdfFile)) ? (
                    <button onClick={() => setNoteMode('pdf')} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm ${noteMode === 'pdf' ? 'bg-white text-red-600 shadow' : 'text-zinc-500 hover:text-zinc-700 shadow-none'}`}>{t('pdf')}</button>
                  ) : null}
                </div>
                <button
                  onClick={(e) => toggleReadStatus(e, selectedPaper)}
                  className={`p-2 rounded-full hover:bg-zinc-100 transition-colors ${selectedPaper.isRead ? 'text-green-600 bg-green-50' : 'text-zinc-400 hover:text-zinc-600'}`}
                  title={selectedPaper.isRead ? t('markUnread') : t('markRead')}
                >
                  {selectedPaper.isRead ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </button>
              </div>

              <div className="flex items-center gap-2 non-draggable">
                {selectedPaper.url && (
                  <button onClick={() => openLink(selectedPaper.url)} className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-blue-600 transition-colors" title={t('openExternal')}>
                    <ExternalLink size={18} />
                  </button>
                )}
                {/* PDF Download Button (Only for Local Mode papers with PDF) */}
                {(selectedPaper.hasPdf || selectedPaper.pdfFile) && (
                  <button onClick={() => downloadPdf(selectedPaper)} className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-red-600 transition-colors" title={t('locatePdf')}>
                    {isElectron() ? <Folder size={18} /> : <Download size={18} />}
                  </button>
                )}
                <button onClick={() => setIsFullScreenNote(!isFullScreenNote)} className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors" title={isFullScreenNote ? t('exitFullscreen') : t('fullscreen')}>
                  {isFullScreenNote ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto scroll-smooth bg-white">
              {noteMode === 'pdf' ? (
                <div className="h-full w-full bg-zinc-100 flex flex-col items-center justify-center">
                  {/* PDF Viewer - Using iframe with blob URL or file protocol */}
                  <iframe
                    src={getPdfUrl(selectedPaper)}
                    className="w-full h-full border-none"
                    title="PDF Preview"
                  />
                </div>
              ) : (
                <div className="max-w-3xl mx-auto w-full px-8 py-12">
                  <div className="mb-8 border-b border-zinc-100 pb-8">
                    <h2 className="text-3xl font-bold text-zinc-900 leading-tight mb-4 tracking-tight">{selectedPaper.title}</h2>
                    {selectedPaper.summary && (
                      <div className="flex gap-3 mb-6 p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-zinc-600 italic leading-relaxed">
                        <Quote size={20} className="text-zinc-300 flex-shrink-0 -mt-1" />
                        <div>{selectedPaper.summary}</div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-500 items-center">
                      {selectedPaper.authors && <span className="flex items-center gap-1.5"><User size={14} className="text-zinc-400" /> {selectedPaper.authors}</span>}
                      <div className="w-1 h-1 rounded-full bg-zinc-300"></div>
                      {selectedPaper.year && <span className="flex items-center gap-1.5">{selectedPaper.year}</span>}
                      {selectedPaper.venue && <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-md text-xs font-bold tracking-wide">{selectedPaper.venue}</span>}
                      {selectedPaper.hasPdf && <span className="flex items-center gap-1 text-red-500 font-medium ml-2"><FileIcon size={14} /> {t('pdfAvailable')}</span>}
                    </div>
                    {/* ADDED: Tags display in drawer */}
                    {selectedPaper.group && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {parseGroups(selectedPaper.group).map((g, i) => (
                          <span key={i} className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full font-medium border shadow-sm ${getGroupStyles(g).className}`}>
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="min-h-[500px]">
                    {noteMode === 'edit' ? (
                      <textarea
                        className="w-full flex-1 bg-transparent border-none focus:ring-0 text-sm leading-7 text-zinc-700 placeholder:text-zinc-300 font-mono resize-none selection:bg-blue-100 selection:text-blue-700 caret-blue-600 outline-none pb-32"
                        style={{ minHeight: '60vh' }}
                        placeholder="Start writing your thoughts..."
                        value={selectedPaper.notes || ''}
                        onChange={(e) => setSelectedPaper({ ...selectedPaper, notes: e.target.value })}
                        onBlur={(e) => updateNotes(selectedPaper.id, e.target.value)}
                        autoFocus
                      ></textarea>
                    ) : (
                      <div className="prose prose-lg prose-zinc max-w-none pb-32">
                        <AdvancedMarkdown content={selectedPaper.notes} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-zinc-900/30 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 fade-in duration-200 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">{t('deleteTitle')}</h3>
            <p className="text-sm text-zinc-500 mb-6 px-4">
              {t('deleteConfirm', { title: deleteConfirmation.title })}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-6 py-2.5 rounded-full border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={performDelete}
                className="px-6 py-2.5 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Delete Note Confirmation Modal --- */}
      {deleteNoteConfirmation && (
        <div className="fixed inset-0 bg-zinc-900/30 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 fade-in duration-200 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">{deleteNoteConfirmation.type === 'folder' ? t('deleteFolderTitle') : t('deleteNoteTitle')}</h3>
            <p className="text-sm text-zinc-500 mb-6 px-4">
              {t('deleteNoteConfirm', { title: deleteNoteConfirmation.title })}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteNoteConfirmation(null)}
                className="px-6 py-2.5 rounded-full border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={performDeleteNote}
                className="px-6 py-2.5 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- New Paper Modal (Two-Step Flow) --- */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-2xl w-full max-w-[520px] overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/40 ring-1 ring-black/5">

            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-zinc-100/80 flex justify-between items-center">
              <h3 className="font-bold text-xl text-zinc-900">{editingPaper ? t('editDetails') : (uploadStep === 'drop' ? t('addPaper') : t('paperDetails'))}</h3>
              <button onClick={closeModals} className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors"><X size={18} /></button>
            </div>

            <div className="p-8">
              {/* STEP 1: Drop Zone */}
              {!editingPaper && uploadStep === 'drop' && (
                <div className="animate-in slide-in-from-bottom-4 duration-300 fade-in">
                  <div
                    className="border-2 border-dashed border-zinc-200 bg-zinc-50/50 rounded-3xl p-10 text-center hover:bg-blue-50/30 hover:border-blue-300 transition-all cursor-pointer relative group h-[320px] flex flex-col items-center justify-center"
                    onClick={handleOpenFileDialog} // Using native dialog instead of input
                  >
                    {/* Input removed, using div click handler */}
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg shadow-zinc-200/50 flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 mb-6">
                      <Upload size={32} strokeWidth={1.5} />
                    </div>
                    <h4 className="text-lg font-bold text-zinc-800 mb-2">{t('dropPdf')}</h4>
                    <p className="text-sm text-zinc-400 px-8">{t('autoExtract')}</p>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <div className="h-px bg-zinc-100 flex-1"></div>
                    <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Or</span>
                    <div className="h-px bg-zinc-100 flex-1"></div>
                  </div>

                  <button onClick={switchToManualEntry} className="w-full mt-6 py-3 rounded-2xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                    {t('enterManually')}
                  </button>
                </div>
              )}

              {/* STEP 2: Form */}
              {(editingPaper || uploadStep === 'form') && (
                <div className="space-y-5 animate-in slide-in-from-right-8 duration-300 fade-in">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">{t('title')}</label>
                    <textarea
                      className="w-full px-4 py-3 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all resize-none placeholder:font-normal"
                      placeholder={t('enterTitle')}
                      rows={2}
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">{t('summary')}</label>
                    <textarea
                      className="w-full px-4 py-3 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all resize-none placeholder:font-normal"
                      placeholder={t('summaryPlaceholder')}
                      rows={2}
                      value={formData.summary}
                      onChange={e => setFormData({ ...formData, summary: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">{t('venue')}</label>
                      <input type="text" className="w-full px-4 py-3 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:font-normal" placeholder="e.g. CVPR" value={formData.venue} onChange={e => setFormData({ ...formData, venue: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">{t('year')}</label>
                      <input type="number" className="w-full px-4 py-3 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:font-normal" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">{t('authors')}</label>
                    <input type="text" className="w-full px-4 py-3 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:font-normal" placeholder={t('commaSeparated')} value={formData.authors} onChange={e => setFormData({ ...formData, authors: e.target.value })} />
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">{t('group')}</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 pl-10 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:font-normal"
                        placeholder={t('selectOrCreate')}
                        value={formData.group}
                        onChange={handleGroupChange}
                        onBlur={() => setTimeout(() => setShowGroupSuggestions(false), 200)}
                        onFocus={() => {
                          const parts = formData.group.split(/[,，]/);
                          const currentInput = parts[parts.length - 1].trim();
                          if (currentInput) {
                            const allTags = groups.filter(g => g !== 'All' && g !== 'Uncategorized');
                            const matches = allTags.filter(t => t.toLowerCase().startsWith(currentInput.toLowerCase()));
                            setGroupSuggestions(matches);
                            setShowGroupSuggestions(matches.length > 0);
                          }
                        }}
                      />
                      <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />

                      {/* Custom Suggestions Dropdown */}
                      {showGroupSuggestions && groupSuggestions.length > 0 && (
                        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-zinc-100 max-h-40 overflow-y-auto">
                          {groupSuggestions.map(suggestion => (
                            <div
                              key={suggestion}
                              className="px-4 py-2 text-sm text-zinc-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer flex items-center gap-2"
                              onClick={() => selectGroupSuggestion(suggestion)}
                            >
                              <span className={`w-2 h-2 rounded-full ${getGroupStyles(suggestion).dot}`}></span>
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">{t('link')}</label>
                    <input type="text" className="w-full px-4 py-3 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:font-normal" placeholder="https://..." value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} />
                  </div>

                  {uploadFile && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-medium border border-blue-100">
                      <FileIcon size={14} />
                      <span>PDF file attached and will be saved locally.</span>
                    </div>
                  )}

                  <div className="pt-6 flex justify-end gap-3">
                    <button onClick={closeModals} className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors">{t('cancel')}</button>
                    <button onClick={handleSavePaper} disabled={!formData.title} className="px-8 py-3 text-sm font-bold bg-black text-white rounded-full hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all">{t('savePaper')}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Note Modal --- */}
      {isNoteModalOpen && (
        <div className={isNotePreviewFullscreen ? "fixed inset-0 bg-white z-[300] flex flex-col" : "fixed inset-0 bg-zinc-900/20 backdrop-blur-sm z-[300] flex items-center justify-center p-4"}>
          <div className={isNotePreviewFullscreen ? "flex-1 flex flex-col overflow-hidden" : "bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-2xl w-full max-w-4xl h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/40 ring-1 ring-black/5 flex flex-col"}>
            <div className={`px-8 py-6 border-b border-zinc-100/80 flex justify-between items-center flex-shrink-0 ${isNotePreviewFullscreen ? 'bg-white' : ''}`}>
              <h3 className="font-bold text-xl text-zinc-900">{selectedNote ? t('editNote') : t('newNote')}</h3>
              <div className="flex gap-3 items-center non-draggable">
                <button
                  onClick={() => setIsNotePreviewFullscreen(!isNotePreviewFullscreen)}
                  className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors mr-2"
                  title={isNotePreviewFullscreen ? t('exitFullscreen') : t('fullscreen')}
                >
                  {isNotePreviewFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button onClick={() => setIsNoteModalOpen(false)} className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors">{t('cancel')}</button>
                <button onClick={handleSaveNote} disabled={!noteFormData.title} className="px-6 py-2 text-sm font-bold bg-black text-white rounded-full hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all">{t('savePaper')}</button>
              </div>
            </div>
            <div className={`flex-1 flex flex-col overflow-hidden ${isNotePreviewFullscreen ? 'p-0' : 'p-8'}`}>
              {!isNotePreviewFullscreen && (
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-zinc-50 border-none rounded-xl text-lg font-bold focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:font-normal mb-4"
                  placeholder={t('noteTitle')}
                  value={noteFormData.title}
                  onChange={e => setNoteFormData({ ...noteFormData, title: e.target.value })}
                  autoFocus
                />
              )}
              <div className="flex-1 flex gap-4 min-h-0">
                {!isNotePreviewFullscreen && (
                  <textarea
                    className="flex-1 h-full p-4 bg-zinc-50 border-none rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all resize-none placeholder:font-normal leading-relaxed"
                    placeholder={t('noteContent')}
                    value={noteFormData.content}
                    onChange={e => setNoteFormData({ ...noteFormData, content: e.target.value })}
                  />
                )}
                <div className={`flex-1 h-full overflow-y-auto ${isNotePreviewFullscreen ? 'bg-white max-w-4xl mx-auto w-full px-8 py-12' : 'p-4 bg-white border border-zinc-100 rounded-xl'}`}>
                  <AdvancedMarkdown content={noteFormData.content} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- New Folder Modal --- */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/40 ring-1 ring-black/5 p-6">
            <h3 className="font-bold text-xl text-zinc-900 mb-4">New Folder</h3>
            <input
              type="text"
              className="w-full px-4 py-3 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:font-normal mb-6"
              placeholder="Folder Name"
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); }}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsFolderModalOpen(false)} className="px-6 py-2.5 rounded-full border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">Cancel</button>
              <button onClick={handleCreateFolder} disabled={!folderName.trim()} className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all">Create</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
