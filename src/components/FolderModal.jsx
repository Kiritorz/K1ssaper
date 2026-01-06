// src/components/FolderModal.jsx
import React from 'react';

const FolderModal = ({
    isOpen,
    onClose,
    folderName,
    setFolderName,
    handleCreateFolder
}) => {
    if (!isOpen) return null;

    return (
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
                    <button onClick={onClose} className="px-6 py-2.5 rounded-full border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">Cancel</button>
                    <button onClick={handleCreateFolder} disabled={!folderName.trim()} className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all">Create</button>
                </div>
            </div>
        </div>
    );
};

export default FolderModal;
