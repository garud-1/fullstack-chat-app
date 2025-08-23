import React, { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import FriendsSidebar from "../components/FriendsSidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";


function HomePage() {
  const { selectedUser } = useChatStore();
  const [showFriends, setShowFriends] = useState(false);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col">
      <div className="flex flex-1 h-full w-full overflow-hidden">
        {/* Sidebar Tabs and Sidebar */}
        <div className="flex flex-col h-full w-20 lg:w-72 bg-base-100 border-r border-base-200 shadow-lg z-10">
          <div className="flex">
            <button
              className={`flex-1 px-4 py-3 font-semibold ${!showFriends ? 'bg-base-300' : 'bg-base-100'} transition`}
              onClick={() => setShowFriends(false)}
            >
              Contacts
            </button>
            <button
              className={`flex-1 px-4 py-3 font-semibold ${showFriends ? 'bg-base-300' : 'bg-base-100'} transition`}
              onClick={() => setShowFriends(true)}
            >
              Friends
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {!showFriends ? <Sidebar /> : <FriendsSidebar />}
          </div>
        </div>
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-white/80 backdrop-blur-md">
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
