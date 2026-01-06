// src/components/UploadModal.jsx
import { X, Upload, Tag, File as FileIcon } from 'lucide-react';
import { parseGroups, getGroupStyles } from '../lib/utils';
import { useEffect } from 'react';

const UploadModal = ({
    isOpen,
    onClose,
    editingPaper,
    uploadStep,
    handleOpenFileDialog,
    switchToManualEntry,
    formData,
    setFormData,
    currentTagInput,
    handleGroupChange,
    addTag,
    removeTag,
    showGroupSuggestions,
    setShowGroupSuggestions,
    groupSuggestions,
    setGroupSuggestions,
    groups,
    uploadFile,
    handleSavePaper,
    t
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-2xl w-full max-w-[520px] overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/40 ring-1 ring-black/5">

                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-zinc-100/80 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-zinc-900">{editingPaper ? t('editDetails') : (uploadStep === 'drop' ? t('addPaper') : t('paperDetails'))}</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors"><X size={18} /></button>
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

                            <div className="relative z-50">
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">{t('group')}</label>
                                <div className="relative bg-zinc-50 border-none rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all min-h-[48px] px-3 py-2 flex flex-wrap gap-2 items-center">
                                    <Tag size={16} className="text-zinc-400 mr-1" />

                                    {/* Selected Tags Chips */}
                                    {parseGroups(formData.group).map((tag, idx) => (
                                        <span key={idx} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shadow-sm animate-in zoom-in-50 duration-200 ${getGroupStyles(tag).className}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${getGroupStyles(tag).dot}`}></span>
                                            {tag}
                                            <button onClick={(e) => { e.stopPropagation(); removeTag(tag); }} className="hover:bg-black/10 rounded-full p-0.5 ml-0.5 transition-colors">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}

                                    <input
                                        type="text"
                                        className="flex-1 bg-transparent border-none text-sm font-medium focus:ring-0 placeholder:font-normal min-w-[120px] p-1"
                                        placeholder={parseGroups(formData.group).length === 0 ? t('selectOrCreate') : ''}
                                        value={currentTagInput}
                                        onChange={handleGroupChange}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (currentTagInput.trim()) addTag(currentTagInput);
                                                else if (groupSuggestions.length > 0) addTag(groupSuggestions[0]); // Select first suggestion on Enter if text match? Maybe unsafe. Let's just add text.
                                            }
                                            if (e.key === 'Backspace' && !currentTagInput) {
                                                const tags = parseGroups(formData.group);
                                                if (tags.length > 0) removeTag(tags[tags.length - 1]);
                                            }
                                        }}
                                        onBlur={() => setTimeout(() => setShowGroupSuggestions(false), 200)}
                                        onFocus={() => {
                                            const currentTags = parseGroups(formData.group);
                                            const allTags = groups.filter(g => g !== 'All' && g !== 'Uncategorized' && g !== 'Read' && g !== 'Unread');
                                            const availableTags = allTags.filter(t => !currentTags.includes(t));
                                            if (!currentTagInput.trim()) {
                                                setGroupSuggestions(availableTags);
                                                setShowGroupSuggestions(true);
                                            }
                                        }}
                                    />

                                    {/* Custom Suggestions Dropdown */}
                                    {showGroupSuggestions && groupSuggestions.length > 0 && (
                                        <div className="absolute z-[60] left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-zinc-100 max-h-40 overflow-y-auto">
                                            {groupSuggestions.map(suggestion => (
                                                <div
                                                    key={suggestion}
                                                    className="px-4 py-2 text-sm text-zinc-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer flex items-center gap-2"
                                                    onMouseDown={(e) => { e.preventDefault(); addTag(suggestion); }}
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
                                <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors">{t('cancel')}</button>
                                <button onClick={handleSavePaper} disabled={!formData.title} className="px-8 py-3 text-sm font-bold bg-black text-white rounded-full hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all">{t('savePaper')}</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
