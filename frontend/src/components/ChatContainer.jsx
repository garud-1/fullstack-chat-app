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
    if(messageEndRef.current && messages) 
    messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  },[messages])
  
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
    <>
      <div
        className="flex flex-1 flex-col overflow-auto relative"
        style={{
          backgroundImage:
            theme === "dark"
              ? "url('https://i.pinimg.com/736x/d4/0d/20/d40d20985b3163d030d35a5e1901062d.jpg')"
              : "url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')",
          backgroundSize: 'fit',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay for opacity */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: theme === "dark" ? '#222d31' : '#ffffff',
            opacity: theme === "dark" ? 0.85 : 0.7,
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'background 0.3s, opacity 0.3s',
          }}
        />
        <div className="relative z-10 flex-1 flex flex-col">
          <ChatHeader />
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`chat ${
                message.senderId === authUser._id ? "chat-end" : "chat-start"
              }`}
              ref={messageEndRef}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              {/* // here we will render the time of the message  */}
              <div className="chat-header mb-1">
                <time className="text-xs-opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          ))}
        </div>
        <MessageInput />
      </div>
    </div>
    </>
  );
}

export default ChatContainer;
