// src/lib/supabaseDB.js
import { createClient } from '@supabase/supabase-js';
import { FileSystemDB } from './fileSystemDB';

export const SupabaseDB = {
    client: null,
    init: (url, key) => {
        if (url && key) {
            if (!SupabaseDB.client || SupabaseDB.client.supabaseUrl !== url) {
                SupabaseDB.client = createClient(url, key);
            }
        }
        return SupabaseDB.client;
    },

    getAll: async (config) => {
        const sb = SupabaseDB.init(config.url, config.key);
        if (!sb) return [];

        const { data, error } = await sb.from('papers').select('*').order('createdAt', { ascending: false });
        if (error) {
            console.error('Supabase getAll Error:', error);
            throw error;
        }
        // Fix dates if they come back as strings, usually they are fine
        return data;
    },

    getNotes: async (config) => {
        const sb = SupabaseDB.init(config.url, config.key);
        if (!sb) return [];

        const { data, error } = await sb.from('notes').select('*');
        if (error) {
            console.error('Supabase getNotes Error:', error);
            throw error;
        }
        return data;
    },

    save: async (config, paper, fileSource) => {
        const sb = SupabaseDB.init(config.url, config.key);
        if (!sb) throw new Error("Supabase not configured");

        const paperId = paper.id || crypto.randomUUID();
        const newPaper = {
            ...paper,
            id: paperId,
            updatedAt: new Date().toISOString(),
            createdAt: paper.createdAt || new Date().toISOString()
        };
        if (newPaper.localPdfPath) delete newPaper.localPdfPath;

        // Upload PDF if source provided
        if (fileSource) {
            let fileBody = null;
            if (typeof fileSource === 'string' && window.require) {
                const fs = window.require('fs');
                try {
                    const buffer = fs.readFileSync(fileSource);
                    const uint8Array = new Uint8Array(buffer);
                    fileBody = new Blob([uint8Array], { type: 'application/pdf' });
                } catch (e) { console.error("Read file error", e); }
            } else if (fileSource instanceof File) {
                fileBody = fileSource;
            }

            if (fileBody) {
                const { error: uploadError } = await sb.storage
                    .from('pdfs')
                    .upload(`${newPaper.id}.pdf`, fileBody, {
                        contentType: 'application/pdf',
                        upsert: true
                    });

                if (uploadError) {
                    console.error("Supabase Storage Error:", uploadError);
                    alert(`Upload failed: ${uploadError.message}`);
                } else {
                    newPaper.hasPdf = true;
                }
            }
        }

        const { error } = await sb.from('papers').upsert(newPaper);
        if (error) {
            console.error("Supabase Save Error:", error);
            throw error;
        }

        return newPaper;
    },

    delete: async (config, id) => {
        const sb = SupabaseDB.init(config.url, config.key);
        if (!sb) return;

        // Try delete PDF
        await sb.storage.from('pdfs').remove([`${id}.pdf`]);

        // Delete Metadata
        const { error } = await sb.from('papers').delete().eq('id', id);
        if (error) {
            console.error("Supabase Delete Error:", error);
            throw error;
        }
    },

    saveNote: async (config, note) => {
        const sb = SupabaseDB.init(config.url, config.key);
        if (!sb) return note;

        const noteId = note.id || crypto.randomUUID();
        const newNote = {
            ...note,
            id: noteId,
            updatedAt: new Date().toISOString(),
            createdAt: note.createdAt || new Date().toISOString()
        };

        const { error } = await sb.from('notes').upsert(newNote);
        if (error) {
            console.error("Supabase Save Note Error:", error);
            throw error;
        }
        return newNote;
    },

    deleteNote: async (config, id) => {
        const sb = SupabaseDB.init(config.url, config.key);
        if (!sb) return;

        // Simple delete, assume user handles children manually or via DB cascade
        const { error } = await sb.from('notes').delete().eq('id', id);
        if (error) console.error("Supabase Delete Note Error:", error);
    },

    syncFromLocal: async (config, localPath, onProgress) => {
        const sb = SupabaseDB.init(config.url, config.key);
        if (!sb) throw new Error("Supabase not connected");

        // Fetch Local
        const localPapers = await FileSystemDB.getAll(localPath);
        const localNotes = await FileSystemDB.getNotes(localPath);

        if (localPapers.length === 0 && localNotes.length === 0) {
            throw new Error("No local data found to sync.");
        }

        if (onProgress) onProgress("Fetching remote state...");

        // 1. Prefetch Remote State (Optimization)
        // Fetch existing IDs and timestamps to skip unchanged records
        const { data: remotePapersData, error: rpError } = await sb
            .from('papers')
            .select('id, updatedAt, hasPdf')
            .limit(10000); // 10k limit should cover most personal libraries

        if (rpError) console.error("Error fetching remote papers:", rpError);

        const remotePapersMap = new Map();
        if (remotePapersData) {
            remotePapersData.forEach(p => remotePapersMap.set(p.id, p));
        }

        const { data: remoteNotesData, error: rnError } = await sb
            .from('notes')
            .select('id, updatedAt')
            .limit(10000);

        if (rnError) console.error("Error fetching remote notes:", rnError);

        const remoteNotesMap = new Map();
        if (remoteNotesData) {
            remoteNotesData.forEach(n => remoteNotesMap.set(n.id, n));
        }

        let total = localPapers.length + localNotes.length;
        let current = 0;
        let skippedCount = 0;

        // Sync Papers
        for (const p of localPapers) {
            current++;
            const remoteP = remotePapersMap.get(p.id);

            // Time comparison logic
            // If remote exists AND local time <= remote time, we might skip metadata update
            // Note: We used to overwrite updatedAt with new Date(), now we respect local updatedAt
            const localTime = p.updatedAt ? new Date(p.updatedAt).getTime() : 0;
            const remoteTime = remoteP && remoteP.updatedAt ? new Date(remoteP.updatedAt).getTime() : -1;

            // Check if metadata needs sync
            // Sync if: Remote missing OR Local is newer
            // Skip if: Remote exists AND Local is same or older
            const shouldSyncMeta = !remoteP || localTime > remoteTime;

            // Check PDF Logic
            let hasPdfFile = false;
            let didUploadPdf = false;

            if (window.require) {
                const fs = window.require('fs');
                const path = window.require('path');
                const pdfPath = path.join(localPath, 'pdfs', `${p.id}.pdf`);

                if (fs.existsSync(pdfPath)) {
                    hasPdfFile = true; // Local has PDF

                    // Optimization: Skip PDF upload if remote ALREADY has PDF
                    // The user requested: "PDF file exists also update skip" -> We assume if DB says hasPdf=true, it exists.
                    // If we want to be 100% sure we could check storage list, but trusting DB metadata is faster 
                    // and standard for this kind of sync.
                    const remoteHasPdf = remoteP && remoteP.hasPdf;

                    if (!remoteHasPdf) {
                        // PDF missing in cloud, upload it
                        if (onProgress) onProgress(`[${current}/${total}] Uploading PDF: ${p.title}`);
                        try {
                            const buffer = fs.readFileSync(pdfPath);
                            const uint8Array = new Uint8Array(buffer);
                            const blob = new Blob([uint8Array], { type: 'application/pdf' });

                            const { error: upErr } = await sb.storage.from('pdfs').upload(`${p.id}.pdf`, blob, { upsert: true, contentType: 'application/pdf' });
                            if (upErr) {
                                console.error(`Failed to upload PDF for ${p.title}:`, upErr);
                            } else {
                                didUploadPdf = true;
                            }
                        } catch (readErr) {
                            console.error(`Failed to read PDF for ${p.title}:`, readErr);
                        }
                    } else {
                        // Remote has PDF, skip upload
                        // (Implicitly skipping because clause !remoteHasPdf is false)
                    }
                }
            }

            // Decide whether to Upsert Metadata
            // If we uploaded a PDF, we MUST upsert to set `hasPdf: true` (or ensure it's recorded)
            // If meta is newer, we MUST upsert
            // If neither, we skip
            if (shouldSyncMeta || didUploadPdf) {
                if (onProgress) onProgress(`[${current}/${total}] Syncing Meta: ${p.title}`);
                const { error } = await sb.from('papers').upsert({
                    ...p,
                    hasPdf: hasPdfFile || p.hasPdf, // Ensure consistent state
                    // Important: Use local timestamp to allow correct future comparisons. 
                    // If local didn't have one, use NOW.
                    updatedAt: p.updatedAt || new Date().toISOString()
                });
                if (error) console.error(`Failed to sync metadata for ${p.title}:`, error);
            } else {
                skippedCount++;
                // console.log(`Skipped ${p.title} (Up to date)`);
            }
        }

        // Sync Notes
        for (const n of localNotes) {
            current++;
            const remoteN = remoteNotesMap.get(n.id);
            const localTime = n.updatedAt ? new Date(n.updatedAt).getTime() : 0;
            const remoteTime = remoteN && remoteN.updatedAt ? new Date(remoteN.updatedAt).getTime() : -1;

            if (!remoteN || localTime > remoteTime) {
                if (onProgress) onProgress(`[${current}/${total}] Syncing Note: ${n.title}`);
                const { error } = await sb.from('notes').upsert({
                    ...n,
                    updatedAt: n.updatedAt || new Date().toISOString()
                });
                if (error) console.error(`Failed to sync note ${n.title}:`, error);
            } else {
                skippedCount++;
            }
        }

        if (onProgress) onProgress(`Sync Complete. Skipped ${skippedCount} up-to-date items.`);
        return { synced: total, skipped: skippedCount };
    }
};
