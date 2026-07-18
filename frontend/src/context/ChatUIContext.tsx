import { createContext, ReactNode, useCallback, useContext, useState } from "react";

interface ChatUIContextValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const ChatUIContext = createContext<ChatUIContextValue | undefined>(undefined);

/** Shares the chat panel's open/closed state between the topbar toggle
 * button (Navbar) and the panel itself (ChatSidebar). */
export function ChatUIProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);

  return <ChatUIContext.Provider value={{ open, toggle, close }}>{children}</ChatUIContext.Provider>;
}

export function useChatUI(): ChatUIContextValue {
  const ctx = useContext(ChatUIContext);
  if (!ctx) {
    throw new Error("useChatUI must be used within a ChatUIProvider");
  }
  return ctx;
}
