// src/lib/utils.js

export const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent);

export const parseGroups = (groupString) => {
    if (!groupString) return [];
    return groupString.split(/[,，]/).map(s => s.trim()).filter(Boolean);
};

export const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
};

// Generates a deterministic color style for a group tag
export const getGroupStyles = (groupName) => {
    // 16 different color combinations (Tailwind classes)
    const colorStyles = [
        { className: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-400" },
        { className: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-400" },
        { className: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
        { className: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-400" },
        { className: "bg-lime-50 text-lime-700 border-lime-200", dot: "bg-lime-400" },
        { className: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-400" },
        { className: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
        { className: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-400" },
        { className: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-400" },
        { className: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-400" },
        { className: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-400" },
        { className: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-400" },
        { className: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-400" },
        { className: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-400" },
        { className: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200", dot: "bg-fuchsia-400" },
        { className: "bg-pink-50 text-pink-700 border-pink-200", dot: "bg-pink-400" },
        { className: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-400" },
    ];

    let hash = 0;
    for (let i = 0; i < groupName.length; i++) {
        hash = groupName.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colorStyles.length;
    return colorStyles[index];
};
