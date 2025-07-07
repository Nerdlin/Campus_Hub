import React, { useState, useEffect } from 'react';
import { userApi } from '@/lib/api';

const botUser = {
  id: 'bot',
  name: 'ChatGPT Бот',
  avatar: 'https://cdn.openai.com/chatgpt/icon.png',
  online: true,
};

export default function NewChatModal({ isOpen, onClose, onSelectUser, currentUserId }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    userApi.getUsers().then(data => {
      setUsers(data.filter(u => u.id !== currentUserId));
      setLoading(false);
    });
  }, [isOpen, currentUserId]);

  if (!isOpen) return null;
  const filtered = [botUser, ...users].filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) && u.id !== currentUserId
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-[#232834] rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Новый чат</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-400 transition">✕</button>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск пользователя..."
          className="w-full mb-4 px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {loading && <div className="text-gray-400 text-sm text-center py-4">Загрузка...</div>}
          {!loading && filtered.length === 0 && <div className="text-gray-400 text-sm text-center py-4">Пользователи не найдены</div>}
          {filtered.map(user => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-700 hover:bg-blue-700/30 transition"
            >
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className={`w-10 h-10 rounded-full border-2 ${user.online ? 'border-green-400' : 'border-gray-600'}`}
              />
              <div className="flex-1 text-left">
                <div className="font-medium text-white">{user.name}</div>
                <div className="text-xs text-gray-400">{user.online ? 'В сети' : 'Не в сети'}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 