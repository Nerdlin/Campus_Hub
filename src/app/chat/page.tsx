"use client";
import React from "react";
import ChatWindow from "../../../src/chat/ChatWindow";
import ChatList from "../../../src/chat/ChatList";
import NewChatModal from "../../../src/chat/NewChatModal";
import AudioMessage from "../../../src/chat/AudioMessage";
import FileMessage from "../../../src/chat/FileMessage";
import RecorderControls from "../../../src/chat/RecorderControls";
import { useAuth } from "../../../src/hooks/useAuth";

export default function ChatPage() {
  const { user } = useAuth();
  if (!user) return <div className="p-8 text-lg">Пожалуйста, войдите в систему для доступа к чату.</div>;
  return (
    <div className="flex h-full min-h-[80vh] gap-6">
      <div className="w-1/3 min-w-[280px] max-w-xs">
        <ChatList user={user} />
      </div>
      <div className="flex-1 flex flex-col">
        <ChatWindow user={user} />
        <div className="mt-4 flex gap-2">
          <RecorderControls user={user} />
          <NewChatModal user={user} />
        </div>
      </div>
    </div>
  );
} 