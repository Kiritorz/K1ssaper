// src/hooks/useSupabase.js
import { useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { isElectron } from '../lib/fileSystemDB'; // Or wherever we put isElectron

export const useSupabase = () => {
    const [dbConfig, setDbConfig] = useState(() => {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('dbConfig');
            return saved ? JSON.parse(saved) : { url: '', key: '', storagePath: '' };
        }
        return { url: '', key: '', storagePath: '' };
    });

    const supabase = useMemo(() => {
        if (dbConfig.url && dbConfig.key) {
            return createClient(dbConfig.url, dbConfig.key, {
                auth: { persistSession: false }
            });
        }
        return null;
    }, [dbConfig.url, dbConfig.key]);

    return { dbConfig, setDbConfig, supabase };
};
