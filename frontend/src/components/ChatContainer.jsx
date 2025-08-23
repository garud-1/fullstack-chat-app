import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeleton/MessageSkeleton.jsx";
import MessageInput from "./MessageInput.jsx";
import { Key } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";
import { formatMessageTime } from "../utils/utils.js";
import { useThemeStore } from "../store/useThemeStore";

function ChatContainer() {
  const { messages, getMessages, isMessagesLoading, selectedUser , subscribeToMessages,unsubscribeFromMessages } = useChatStore();
  const { authUser } = useAuthStore();
  const { theme } = useThemeStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
  }, [selectedUser._id, getMessages , subscribeToMessages ,unsubscribeFromMessages ]);
  
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }
  return (
    <div className="flex flex-1 flex-col overflow-hidden relative bg-base-200">
      <div className="relative z-10 flex-1 flex flex-col">
        <ChatHeader />
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent">
          {messages.length === 0 && (
            <div className="text-center text-neutral-500 mt-8">No messages yet — say hello 👋</div>
          )}
          {messages.map((message) => {
            const isOwn = message.senderId === authUser._id;
            return (
              <div
                key={message._id}
                className={`flex items-end gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!isOwn && (
                  <img
                    src={selectedUser.profilePic || '/avatar.png'}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                )}

                <div className="max-w-[75%]">
                  <div
                    className={`inline-block px-4 py-2 rounded-xl break-words shadow-sm ${
                      isOwn ? 'bg-primary text-primary-content rounded-br-none' : 'bg-base-100 text-base-content rounded-bl-none'
                    }`}
                  >
                    {message.image && (
                      <img src={message.image} alt="attachment" className="max-w-full rounded-md mb-2" />
                    )}
                    {message.text && <div className="whitespace-pre-wrap">{message.text}</div>}
                  </div>
                  <div className={`text-[11px] mt-1 ${isOwn ? 'text-right text-neutral-400' : 'text-left text-neutral-400'}`}>
                    {formatMessageTime(message.createdAt)}
                  </div>
                </div>

                {isOwn && (
                  <img
                    src={authUser.profilePic || '/avatar.png'}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                )}
              </div>
            );
          })}

          <div ref={messageEndRef} />
        </div>

        <div className="border-t mt-auto">
          <MessageInput />
        </div>
      </div>
    </div>
  );
}

export default ChatContainer;
