import { useState, useEffect, useMemo, useRef } from 'react';
import { translations } from './constants/translations';
import { FileSystemDB, isElectron } from './lib/fileSystemDB';
import { IndexedDB } from './lib/indexedDB';
import { SupabaseDB } from './lib/supabaseDB';
import { parseGroups, formatTime, getGroupStyles, isMac } from './lib/utils';
import AdvancedMarkdown from './components/AdvancedMarkdown';
import UploadModal from './components/UploadModal';
import NoteModal from './components/NoteModal';
import FolderModal from './components/FolderModal';
import { createClient } from '@supabase/supabase-js';
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
  AlertCircle,
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
  Circle,
  RefreshCw
} from 'lucide-react';











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

  const [storageMode, setStorageMode] = useState(() => localStorage.getItem('kpapers_storage_mode') || 'local');
  const [supabaseConfig, setSupabaseConfig] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('kpapers_supabase_config')) || { url: '', key: '' };
    } catch { return { url: '', key: '' }; }
  });
  const [syncProgress, setSyncProgress] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

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
  const [currentTagInput, setCurrentTagInput] = useState('');

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

    if (storageMode === 'supabase') {
      await SupabaseDB.saveNote(supabaseConfig, newFolder);
    } else if (isElectron()) {
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

    if (storageMode === 'supabase') {
      await SupabaseDB.saveNote(supabaseConfig, updatedNote);
    } else if (isElectron()) {
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
      meta.content = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: file: https: local-resource:;";
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
    let isMounted = true;

    const fetchData = async () => {
      try {
        let papersData = [];
        let notesData = [];

        if (storageMode === 'supabase') {
          if (supabaseConfig.url && supabaseConfig.key) {
            try {
              papersData = await SupabaseDB.getAll(supabaseConfig);
              notesData = await SupabaseDB.getNotes(supabaseConfig);
              if (isMounted) setIsSupabaseConnected(true);
            } catch (err) {
              console.error("Supabase load error", err);
              if (isMounted) setIsSupabaseConnected(false);
            }
          } else {
            if (isMounted) setIsSupabaseConnected(false);
          }
        } else if (isElectron()) {
          [papersData, notesData] = await Promise.all([
            FileSystemDB.getAll(localPath),
            FileSystemDB.getNotes(localPath)
          ]);
        } else {
          // Web fallback
          [papersData, notesData] = await Promise.all([
            IndexedDB.getAll(),
            IndexedDB.getNotes()
          ]);
        }

        if (isMounted) {
          setPapers(papersData);
          setNotes(notesData);
          setLoading(false);
        }
      } catch (e) {
        console.error("Fetch Error:", e);
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [localRefreshTrigger, localPath, storageMode, supabaseConfig]);

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

      const paperPayload = editingPaper ? { ...docData, id: editingPaper.id } : docData;

      if (storageMode === 'supabase') {
        await SupabaseDB.save(supabaseConfig, paperPayload, uploadFile);
      } else if (isElectron()) {
        await FileSystemDB.save(localPath, paperPayload, uploadFile);
      } else {
        await IndexedDB.save(paperPayload);
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

      if (storageMode === 'supabase') {
        await SupabaseDB.saveNote(supabaseConfig, noteData);
      } else if (isElectron()) {
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
      if (storageMode === 'supabase') {
        await SupabaseDB.delete(supabaseConfig, id);
      } else if (isElectron()) {
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
      if (storageMode === 'supabase') {
        await SupabaseDB.deleteNote(supabaseConfig, id);
      } else if (isElectron()) {
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

    if (storageMode === 'supabase') {
      await SupabaseDB.save(supabaseConfig, updatedPaper);
    } else if (isElectron()) {
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

    if (storageMode === 'supabase') {
      await SupabaseDB.save(supabaseConfig, updatedPaper);
    } else if (isElectron()) {
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
    if (storageMode === 'supabase' && supabaseConfig.url && supabaseConfig.key) {
      const sb = SupabaseDB.init(supabaseConfig.url, supabaseConfig.key);
      const { data } = sb.storage.from('pdfs').getPublicUrl(`${paper.id}.pdf`);
      return data.publicUrl;
    }

    const pdfPath = getComputedPdfPath(paper);
    if (isElectron() && pdfPath) {
      // Normalize backslashes for URL on Windows
      const normalizedPath = pdfPath.replace(/\\/g, '/');
      return `file://${normalizedPath}`;
    }
    return null;
  };

  const downloadPdf = (paper) => {
    if (storageMode === 'supabase') {
      const url = getPdfUrl(paper);
      if (url) window.open(url, '_blank');
      return;
    }

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

  const addTag = (tag) => {
    const cleanTag = tag.trim();
    if (!cleanTag) return;
    const currentTags = parseGroups(formData.group);
    if (!currentTags.includes(cleanTag)) {
      const newTags = [...currentTags, cleanTag];
      setFormData(prev => ({ ...prev, group: newTags.join(', ') }));
    }
    setCurrentTagInput('');
    setShowGroupSuggestions(false);
  };

  const removeTag = (tagToRemove) => {
    const currentTags = parseGroups(formData.group);
    const newTags = currentTags.filter(t => t !== tagToRemove);
    setFormData(prev => ({ ...prev, group: newTags.join(', ') }));
  };

  const handleGroupChange = (e) => {
    const val = e.target.value;
    // Special handling for comma to add tag
    if (val.endsWith(',') || val.endsWith('，')) {
      const newTag = val.slice(0, -1);
      if (newTag.trim()) addTag(newTag);
      return;
    }
    setCurrentTagInput(val);

    const currentTags = parseGroups(formData.group);
    const allTags = groups.filter(g => g !== 'All' && g !== 'Uncategorized' && g !== 'Read' && g !== 'Unread');
    const availableTags = allTags.filter(t => !currentTags.includes(t));

    if (val.trim()) {
      const matches = availableTags.filter(t => t.toLowerCase().includes(val.toLowerCase()));
      setGroupSuggestions(matches);
      setShowGroupSuggestions(true);
    } else {
      setGroupSuggestions(availableTags);
    }
  };

  const openAddModal = () => {
    setEditingPaper(null);
    setUploadStep('drop');
    setUploadFile(null);
    setFormData({ title: '', summary: '', authors: '', venue: '', year: new Date().getFullYear(), group: '', notes: '', url: '', isRead: false });
    setCurrentTagInput('');
    setIsUploadModalOpen(true);
  };
  const openEditModal = (paper) => {
    setEditingPaper(paper);
    setUploadStep('form');
    setFormData({ ...paper, summary: paper.summary || '', url: paper.url || '' });
    setCurrentTagInput('');
    setIsUploadModalOpen(true);
  };
  const openNoteModal = (note = null, mode = 'edit') => {
    setSelectedNote(note);
    setNoteFormData(note ? { title: note.title, content: note.content } : { title: '', content: '' });
    setIsNotePreviewFullscreen(mode === 'preview');
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
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white ${storageMode === 'supabase'
            ? (isSupabaseConnected ? 'bg-gradient-to-tr from-emerald-600 to-teal-500' : 'bg-gradient-to-tr from-amber-500 to-orange-500')
            : 'bg-gradient-to-tr from-zinc-800 to-zinc-600'
            }`}>
            <span className="font-bold text-xs">{storageMode === 'supabase' ? 'S' : 'K'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-800">
              {storageMode === 'supabase'
                ? (loading ? 'Connecting...' : (isSupabaseConnected ? 'Supabase User' : 'Disconnected'))
                : 'Local User'}
            </span>
            <span className={`text-[10px] font-medium uppercase tracking-wide flex items-center gap-1 ${storageMode === 'supabase' && !isSupabaseConnected ? 'text-amber-600' : 'text-zinc-400'
              }`}>
              {storageMode === 'supabase'
                ? (isSupabaseConnected ? <Globe size={10} /> : <AlertCircle size={10} />)
                : <HardDrive size={10} />}
              {storageMode === 'supabase'
                ? (loading ? 'Checking...' : (isSupabaseConnected ? t('onlineDB') : 'Check Connection'))
                : t('localStorage')}
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

                  {/* Storage Mode Setting */}
                  <div className="mb-10 animate-in slide-in-from-top-4 fade-in duration-300">
                    <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                      <HardDrive size={20} className="text-zinc-400" />
                      {t('storageMode')}
                    </h3>
                    <div className="bg-white rounded-2xl border border-zinc-200 p-1 flex gap-1 shadow-sm mb-4">
                      <button
                        onClick={() => { setStorageMode('local'); localStorage.setItem('kpapers_storage_mode', 'local'); }}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${storageMode === 'local' ? 'bg-zinc-100 text-zinc-900 shadow-inner' : 'text-zinc-500 hover:bg-zinc-50'}`}
                      >
                        {t('localStorage')}
                      </button>
                      <button
                        onClick={() => { setStorageMode('supabase'); localStorage.setItem('kpapers_storage_mode', 'supabase'); }}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${storageMode === 'supabase' ? 'bg-zinc-100 text-zinc-900 shadow-inner' : 'text-zinc-500 hover:bg-zinc-50'}`}
                      >
                        Supabase Cloud
                      </button>
                    </div>

                    {storageMode === 'supabase' && (
                      <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-6 animate-in slide-in-from-top-2">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Supabase URL</label>
                            <input
                              type="text"
                              className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm"
                              placeholder="https://your-project.supabase.co"
                              value={supabaseConfig.url}
                              onChange={(e) => {
                                const newConfig = { ...supabaseConfig, url: e.target.value };
                                setSupabaseConfig(newConfig);
                                localStorage.setItem('kpapers_supabase_config', JSON.stringify(newConfig));
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Supabase Key (Anon Public)</label>
                            <input
                              type="password"
                              className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm"
                              placeholder="your-anon-key"
                              value={supabaseConfig.key}
                              onChange={(e) => {
                                const newConfig = { ...supabaseConfig, key: e.target.value };
                                setSupabaseConfig(newConfig);
                                localStorage.setItem('kpapers_supabase_config', JSON.stringify(newConfig));
                              }}
                            />
                          </div>

                          <div className="pt-4 border-t border-zinc-200 mt-4">
                            <button
                              onClick={async () => {
                                if (isSyncing) return;
                                setIsSyncing(true);
                                setSyncProgress('Starting sync...');
                                try {
                                  const result = await SupabaseDB.syncFromLocal(supabaseConfig, localPath, (msg) => setSyncProgress(msg));
                                  setSyncProgress(`Sync Complete! Skipped ${result.skipped} items.`);
                                  setLocalRefreshTrigger(prev => prev + 1);
                                  setTimeout(() => setSyncProgress(''), 5000);
                                } catch (e) {
                                  setSyncProgress(`Error: ${e.message}`);
                                } finally {
                                  setIsSyncing(false);
                                }
                              }}
                              disabled={isSyncing}
                              className={`w-full py-2.5 bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-zinc-200 transition-all flex items-center justify-center gap-2 ${isSyncing ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99]'}`}
                            >
                              {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                              {isSyncing ? 'Syncing...' : 'Sync Local Data to Cloud'}
                            </button>
                            {syncProgress && <p className="text-center text-xs text-zinc-500 mt-2 font-mono">{syncProgress}</p>}
                          </div>
                          <p className="text-xs text-zinc-400 mt-4">
                            Requires standard tables: 'papers', 'notes' and storage bucket 'pdfs'.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Storage Path Setting */}
                  {storageMode === 'local' && (
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
                  )}

                  <div className="mb-10">
                    <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                      <User size={20} className="text-zinc-400" />
                      {t('account')}
                    </h3>
                    <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-6 flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full text-white flex items-center justify-center text-2xl font-bold shadow-lg ${storageMode === 'supabase'
                        ? (isSupabaseConnected ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-amber-500 to-orange-500')
                        : 'bg-gradient-to-br from-zinc-800 to-black'
                        }`}>
                        {storageMode === 'supabase' ? 'S' : 'K'}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 text-lg">
                          {storageMode === 'supabase' ? 'Supabase User' : 'Local User'}
                        </div>
                        <div className="text-sm text-zinc-500">
                          {storageMode === 'supabase'
                            ? (loading ? 'Verifying Connection...' : (isSupabaseConnected
                              ? (supabaseConfig.url ? supabaseConfig.url.replace(/^https?:\/\//, '').split('/')[0] : 'Connected')
                              : 'Connection Failed - Check Settings'))
                            : t('proUser')}
                        </div>
                      </div>
                      <div className={`ml-auto px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${storageMode === 'supabase'
                        ? (isSupabaseConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')
                        : 'bg-zinc-200 text-zinc-600'
                        }`}>
                        {storageMode === 'supabase'
                          ? (loading ? 'Checking...' : (isSupabaseConnected ? t('online') : 'Offline'))
                          : t('offline')}
                      </div>
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
                  {storageMode === 'supabase' && (
                    <button
                      onClick={() => setLocalRefreshTrigger(prev => prev + 1)}
                      className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all non-draggable"
                      title="Refresh Notes"
                    >
                      <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsFolderModalOpen(true)}
                    className="bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 py-2 px-4 rounded-full flex items-center gap-2 text-sm font-medium shadow-sm non-draggable"
                  >
                    <FolderOpen size={16} /> New Folder
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
                        <p className="text-sm text-zinc-500">{notes.filter(n => n.parentId === folder.id).length} items</p>
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
                    {/* Cloud Refresh Button */}
                    {storageMode === 'supabase' && (
                      <button
                        onClick={() => setLocalRefreshTrigger(prev => prev + 1)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all mr-2"
                        title="Refresh from Cloud"
                      >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                      </button>
                    )}
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
                  {((isElectron() && !isMac && selectedPaper.hasPdf) || (!isElectron() && selectedPaper.pdfFile) || (storageMode === 'supabase' && selectedPaper.hasPdf)) ? (
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
                    {storageMode === 'supabase' ? <Download size={18} /> : (isElectron() ? <Folder size={18} /> : <Download size={18} />)}
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
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={closeModals}
        editingPaper={editingPaper}
        uploadStep={uploadStep}
        handleOpenFileDialog={handleOpenFileDialog}
        switchToManualEntry={switchToManualEntry}
        formData={formData}
        setFormData={setFormData}
        currentTagInput={currentTagInput}
        handleGroupChange={handleGroupChange}
        addTag={addTag}
        removeTag={removeTag}
        showGroupSuggestions={showGroupSuggestions}
        setShowGroupSuggestions={setShowGroupSuggestions}
        groupSuggestions={groupSuggestions}
        setGroupSuggestions={setGroupSuggestions}
        groups={groups}
        uploadFile={uploadFile}
        handleSavePaper={handleSavePaper}
        t={t}
      />

      {/* --- Note Modal --- */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        selectedNote={selectedNote}
        isNotePreviewFullscreen={isNotePreviewFullscreen}
        setIsNotePreviewFullscreen={setIsNotePreviewFullscreen}
        noteFormData={noteFormData}
        setNoteFormData={setNoteFormData}
        handleSaveNote={handleSaveNote}
        t={t}
      />

      {/* --- New Folder Modal --- */}
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        folderName={folderName}
        setFolderName={setFolderName}
        handleCreateFolder={handleCreateFolder}
      />

    </div>
  );
}
