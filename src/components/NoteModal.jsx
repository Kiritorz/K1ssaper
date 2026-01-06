// src/components/NoteModal.jsx
import { Maximize2, Minimize2 } from 'lucide-react';
import AdvancedMarkdown from './AdvancedMarkdown';

const NoteModal = ({
    isOpen,
    onClose,
    selectedNote,
    isNotePreviewFullscreen,
    setIsNotePreviewFullscreen,
    noteFormData,
    setNoteFormData,
    handleSaveNote,
    t
}) => {
    if (!isOpen) return null;

    return (
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
                        <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors">{t('cancel')}</button>
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
    );
};

export default NoteModal;
