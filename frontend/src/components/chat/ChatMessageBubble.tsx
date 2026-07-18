import clsx from "clsx";
import { Sparkles, User, Volume2 } from "lucide-react";
import type { ChatMessage } from "../../api/types";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onSpeak?: () => void;
}

export function ChatMessageBubble({ message, onSpeak }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={clsx("flex gap-2", isUser && "flex-row-reverse")}>
      <div
        className={clsx(
          "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-slate-700/60 text-slate-300" : "bg-sentinel-cyan/15 text-sentinel-cyan"
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
      </div>

      <div
        className={clsx(
          "group relative max-w-[85%] rounded-xl border px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "border-sentinel-cyan/20 bg-sentinel-cyan/10 text-slate-100"
            : "border-sentinel-border bg-black/20 text-slate-300"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {!isUser && onSpeak && (
          <button
            onClick={onSpeak}
            title="Read aloud"
            className="absolute -bottom-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border border-sentinel-border bg-sentinel-panel text-slate-500 opacity-0 transition-opacity hover:text-sentinel-cyan group-hover:opacity-100"
          >
            <Volume2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
