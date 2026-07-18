import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Mic, MicOff, MessageCircle, Send, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { useAlertStreamContext } from "../../context/AlertStreamContext";
import { useChat } from "../../hooks/useChat";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../../hooks/useSpeechSynthesis";
import { ChatMessageBubble } from "./ChatMessageBubble";

export function ChatSidebar() {
  const { alerts, status } = useAlertStreamContext();
  const { messages, sending, send } = useChat(alerts);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { speak, stop: stopSpeaking, isSupported: ttsSupported, isSpeaking } = useSpeechSynthesis();
  const {
    isSupported: sttSupported,
    isListening,
    start: startListening,
    stop: stopListening,
  } = useSpeechRecognition((transcript) => {
    setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
  });

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, open]);

  const handleSend = async () => {
    const text = input;
    if (!text.trim() || sending) return;
    setInput("");
    if (isListening) stopListening();
    const reply = await send(text);
    if (reply && speakEnabled && ttsSupported) speak(reply);
  };

  const handleMicToggle = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const toggleSpeak = () => {
    if (isSpeaking) stopSpeaking();
    setSpeakEnabled((v) => !v);
  };

  return (
    <>
      {/* Floating toggle -- always visible, app-wide (mounted in AppLayout) */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close SentinelAI assistant" : "Open SentinelAI assistant"}
        className={clsx(
          "fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full border shadow-glow transition-all",
          open
            ? "border-sentinel-border bg-sentinel-panel text-slate-300"
            : "border-sentinel-cyan/40 bg-sentinel-cyan text-slate-950 hover:opacity-90"
        )}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Collapsible/expandable panel */}
      <div
        className={clsx(
          "fixed bottom-0 right-0 top-16 z-20 flex w-full flex-col border-l border-sentinel-border bg-sentinel-panel/95 backdrop-blur-md transition-transform duration-300 ease-out",
          "sm:bottom-3 sm:right-3 sm:top-20 sm:h-[calc(100vh-6rem)] sm:max-w-[380px] sm:rounded-2xl sm:border",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between gap-2 border-b border-sentinel-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sentinel-cyan/30 bg-sentinel-cyan/10">
              <Sparkles className="h-4 w-4 text-sentinel-cyan" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">SentinelAI Assistant</p>
              <p className="text-[11px] text-slate-500">Ask about this session's alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {ttsSupported && (
              <button
                onClick={toggleSpeak}
                title={speakEnabled ? "Mute spoken replies" : "Speak replies aloud"}
                className="rounded-lg border border-sentinel-border p-1.5 text-slate-400 hover:text-slate-200"
              >
                {speakEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              title="Collapse"
              className="rounded-lg border border-sentinel-border p-1.5 text-slate-400 hover:text-slate-200 sm:hidden"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="rounded-xl border border-sentinel-border bg-black/20 p-3 text-sm text-slate-400">
              Try asking: <span className="text-slate-300">&ldquo;Summarize this session&rdquo;</span> or{" "}
              <span className="text-slate-300">&ldquo;Why was an alert escalated?&rdquo;</span>
              {sttSupported && (
                <>
                  {" "}
                  Or tap <Mic className="inline h-3 w-3 -translate-y-px text-slate-500" /> and just ask.
                </>
              )}
            </div>
          )}

          {messages.map((message, index) => (
            <ChatMessageBubble
              key={index}
              message={message}
              onSpeak={ttsSupported ? () => speak(message.content) : undefined}
            />
          ))}

          {sending && (
            <div className="flex items-center gap-2 pl-8 text-xs text-slate-500">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-sentinel-cyan" />
              Thinking…
            </div>
          )}
        </div>

        <div className="border-t border-sentinel-border p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder={isListening ? "Listening…" : "Ask about the alerts…"}
              className="max-h-24 flex-1 resize-none rounded-lg border border-sentinel-border bg-black/30 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-sentinel-cyan/50"
            />
            {sttSupported && (
              <button
                onClick={handleMicToggle}
                title={isListening ? "Stop listening" : "Ask by voice"}
                className={clsx(
                  "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border transition-colors",
                  isListening
                    ? "animate-pulse-dot border-red-500/40 bg-red-500/10 text-red-300"
                    : "border-sentinel-border text-slate-400 hover:text-slate-200"
                )}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              title="Send"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-sentinel-cyan text-slate-950 transition-opacity disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          {status === "connecting" && (
            <p className="mt-2 text-[11px] text-slate-500">Waiting for the alert stream to connect…</p>
          )}
        </div>
      </div>
    </>
  );
}
