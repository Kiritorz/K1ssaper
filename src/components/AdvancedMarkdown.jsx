// src/components/AdvancedMarkdown.jsx
import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

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

export default AdvancedMarkdown;
