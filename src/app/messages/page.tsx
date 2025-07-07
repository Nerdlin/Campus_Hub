"use client";
import React, { useState, useEffect } from "react";
import { 
  ChatBubbleLeftRightIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { chatApi } from "@/lib/api";
import ChatWindow from "@/components/ChatWindow";
import NewChatModal from "@/components/NewChatModal";
import UserProfileModal from "@/components/modals/UserProfileModal";
import SectionTitle from "@/components/ui/SectionTitle";
import { useAuth } from "@/hooks/useAuth";

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  online?: boolean;
  unread?: number;
  lastMessage?: string;
  members?: string[];
}

interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  role?: string;
}

const BOT_USER = {
  id: 'bot',
  name: 'ChatGPT Бот',
  avatar: 'https://cdn.openai.com/chatgpt/icon.png',
  online: true,
};
const BOT_CHAT = {
  id: 'bot-chat',
  name: 'ChatGPT Бот',
  avatar: BOT_USER.avatar,
  online: true,
  members: ['bot'],
  lastMessage: '',
};

export default function MessagesPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Получение чатов
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    chatApi.getChats(user.id as string).then((serverChats) => {
      let chatsList = serverChats || [];
      // Если нет чата с ботом, добавляем его локально
      if (!chatsList.some(c => c.members && c.members.includes('bot'))) {
        chatsList = [BOT_CHAT, ...chatsList];
      }
      setChats(chatsList);
    }).finally(() => setLoading(false));
  }, [user?.id]);

  // Поиск по чатам
  const filteredChats = chats.filter(chat =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Открыть чат
  const handleSelectChat = (chat: Chat) => setSelectedChat(chat);

  // Создать чат
  const handleCreateChat = () => setIsNewChatModalOpen(true);

  // Выбрать пользователя для нового чата
  const handleSelectUser = async (selectedUser: UserProfile) => {
    if (!user?.id || !selectedUser.id) return;
    try {
      if (selectedUser.id === 'bot') {
        // Чат с ботом — просто выбираем его
        setSelectedChat(BOT_CHAT);
        setIsNewChatModalOpen(false);
        if (!chats.some(c => c.id === BOT_CHAT.id)) {
          setChats(prev => [BOT_CHAT, ...prev]);
        }
        return;
      }
      const newChat = await chatApi.createChat([user.id, selectedUser.id]);
      setChats(prev => [newChat, ...prev]);
      setSelectedChat(newChat);
      setIsNewChatModalOpen(false);
    } catch {
      alert('Ошибка при создании чата');
    }
  };

  return (
    <div className="p-8">
      <SectionTitle>
        <span className="flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
          Сообщения
        </span>
        <div className="text-sm text-gray-400 font-normal">Общение с преподавателями и студентами</div>
      </SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Список чатов */}
        <div className="lg:col-span-1">
          <div className="bg-[#232834] rounded-lg p-4">
            {/* Заголовок и поиск */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Чаты</h3>
                <button
                  onClick={handleCreateChat}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  Новый чат
                </button>
              </div>
              {/* Поиск */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск чатов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            {/* Статистика */}
            <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
              <span className="flex items-center gap-1">
                <UserGroupIcon className="h-3 w-3" />
                Активные чаты
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                Непрочитанные
              </span>
            </div>
            {/* Список чатов */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-gray-400 text-center py-8">Загрузка...</div>
              ) : filteredChats.length === 0 ? (
                <div className="text-gray-400 text-center py-8">Чаты не найдены</div>
              ) : filteredChats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800 hover:bg-blue-700/30 transition group ${selectedChat?.id === chat.id ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <img
                    src={chat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}`}
                    alt={chat.name}
                    className={`w-10 h-10 rounded-full border-2 ${chat.online ? 'border-green-400' : 'border-gray-600'}`}
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-white group-hover:text-blue-300">{chat.name}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[160px]">{chat.lastMessage || ''}</div>
                  </div>
                  {chat.unread ? (
                    <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">{chat.unread}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Окно чата */}
        <div className="lg:col-span-2">
          <div className="bg-[#232834] rounded-lg h-96">
            {selectedChat ? (
              <ChatWindow
                chat={selectedChat}
                onClose={() => setSelectedChat(null)}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">
                    Выберите чат для начала общения
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Выберите из существующих бесед или начните новую
                  </p>
                  <button
                    onClick={handleCreateChat}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Создать новый чат
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Модальные окна */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSelectUser={handleSelectUser}
        currentUserId={user?.id}
      />
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
} 