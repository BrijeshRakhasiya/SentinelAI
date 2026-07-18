import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMarkdownProps {
  content: string;
}

const components: Components = {
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-2 first:mt-0 text-xs font-semibold uppercase tracking-wide text-sentinel-cyan">
      {children}
    </h3>
  ),
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="text-slate-300">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-slate-100">{children}</strong>,
  em: ({ children }) => <em className="text-slate-400">{children}</em>,
  code: ({ children }) => (
    <code className="rounded bg-black/40 px-1 py-0.5 font-mono text-[0.85em] text-sentinel-cyan">
      {children}
    </code>
  ),
  a: ({ href, children }) => (
    <span className="text-slate-400" title={href ?? undefined}>
      {children}
    </span>
  ),
};

/** Renders assistant replies as styled Markdown (bold, lists, headers). */
export function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <div className="chat-markdown text-sm leading-relaxed text-slate-300">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
