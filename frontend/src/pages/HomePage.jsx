
import React from "react";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

function HomePage() {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen w-screen bg-[#f5f7fb] flex flex-col pt-16">
      <div className="flex flex-1 h-full w-full overflow-hidden">
        {/* Left: compact Discord-like sidebar (single) */}
  <aside className="flex-shrink-0 bg-base-200 text-base-content w-16 md:w-64 flex flex-col">
          <Sidebar />
        </aside>

        {/* Vertical divider */}
        <div className="w-px bg-gray-200/30" />

  {/* Main Chat Area */}
  <div className="flex-1 flex flex-col h-full bg-white shadow-sm">
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center">
              <NoChatSelected />
            </div>
          ) : (
            <ChatContainer />
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
