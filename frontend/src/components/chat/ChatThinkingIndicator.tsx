import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const STATUS_LINES = [
  "Reviewing session data",
  "Checking escalations",
  "Summarizing for you",
];

/** Animated placeholder shown while the assistant is generating a reply. */
export function ChatThinkingIndicator() {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLineIndex((prev) => (prev + 1) % STATUS_LINES.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-2">
      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-sentinel-cyan/15 text-sentinel-cyan">
        <Sparkles className="h-3.5 w-3.5 animate-pulse" />
      </div>

      <div className="max-w-[85%] rounded-xl border border-sentinel-cyan/20 bg-gradient-to-br from-black/30 to-sentinel-cyan/5 px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 transition-opacity duration-300">
            {STATUS_LINES[lineIndex]}
          </span>
          <span className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 animate-thinking-dot rounded-full bg-sentinel-cyan"
                style={{ animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </span>
        </div>
        <div className="relative mt-2.5 h-1 overflow-hidden rounded-full bg-black/40">
          <div className="absolute inset-y-0 w-2/5 animate-thinking-shimmer rounded-full bg-gradient-to-r from-transparent via-sentinel-cyan/70 to-transparent" />
        </div>
      </div>
    </div>
  );
}
