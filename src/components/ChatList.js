import React from 'react';

const mockChats = [
  {
    id: '1',
    name: 'Алексей Иванов',
    lastMessage: 'Добрый день! Когда сдавать проект?',
    unread: 2,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    online: true,
  },
  {
    id: '2',
    name: 'Группа Математика',
    lastMessage: 'Завтра контрольная!',
    unread: 0,
    avatar: '',
    online: false,
  },
  {
    id: '3',
    name: 'Преподаватель Петрова',
    lastMessage: 'Жду ваши отчёты до пятницы.',
    unread: 1,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    online: false,
  },
];

export default function ChatList({ onSelectChat, searchQuery }) {
  // Фильтрация по поиску
  const filtered = mockChats.filter(chat =>
    chat.name.toLowerCase().includes((searchQuery || '').toLowerCase())
  );
  return (
    <div className="space-y-2">
      {filtered.length === 0 && (
        <div className="text-gray-400 text-sm text-center py-4">Чаты не найдены</div>
      )}
      {filtered.map(chat => (
        <button
          key={chat.id}
          onClick={() => onSelectChat(chat)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800 hover:bg-blue-700/30 transition group"
        >
          <img
            src={chat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}`}
            alt={chat.name}
            className={`w-10 h-10 rounded-full border-2 ${chat.online ? 'border-green-400' : 'border-gray-600'}`}
          />
          <div className="flex-1 text-left">
            <div className="font-medium text-white group-hover:text-blue-300">{chat.name}</div>
            <div className="text-xs text-gray-400 truncate max-w-[160px]">{chat.lastMessage}</div>
          </div>
          {chat.unread > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">{chat.unread}</span>
          )}
        </button>
      ))}
    </div>
  );
} 