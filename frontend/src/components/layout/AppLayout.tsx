import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { AlertStreamProvider } from "../../context/AlertStreamContext";
import { ChatSidebar } from "../chat/ChatSidebar";

export function AppLayout() {
  return (
    <AlertStreamProvider>
      <div className="min-h-screen bg-sentinel-bg bg-grid text-slate-100">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <ChatSidebar />
      </div>
    </AlertStreamProvider>
  );
}
