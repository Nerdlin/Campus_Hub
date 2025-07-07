import React, { useState, useRef, useEffect } from 'react';
import { PaperClipIcon, MicrophoneIcon, XMarkIcon, FaceSmileIcon, TrashIcon, PencilIcon, UserGroupIcon, PlusIcon, BookmarkIcon, ArrowUturnRightIcon, ArrowTopRightOnSquareIcon, BellIcon } from '@heroicons/react/24/outline';
import { chatApi, userApi } from '@/lib/api';
import UserProfileModal from '@/components/modals/UserProfileModal';

const EMOJIS = ['👍', '😂', '🔥', '❤️', '😮', '😢', '👏', '🎉'];

export default function ChatWindow({ chat, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(null); // msg.id
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupUsers, setGroupUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [pinnedMsgId, setPinnedMsgId] = useState(null);
  const [forwardModal, setForwardModal] = useState(false);
  const [chatsList, setChatsList] = useState([]);
  const [forwardMsg, setForwardMsg] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [threadMsgId, setThreadMsgId] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [search, setSearch] = useState(''); // строка поиска
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isBotChat = chat.members?.includes('bot') || chat.id === 'bot-chat';

  // Загрузка сообщений
  useEffect(() => {
    chatApi.getMessages(chat.id).then(setMessages);
    if (chat.members?.length > 2) {
      userApi.getUsers().then(setAllUsers);
      setGroupUsers(chat.members || []);
    }
    // Для пересылки
    chatApi.getChats('me').then(setChatsList);
  }, [chat.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, threadMessages]);

  // Уведомление о новых сообщениях (имитация)
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // Отправка текстового сообщения
  const handleSend = async () => {
    if (!input.trim() && !file && !audioBlob) return;
    let sentMsg = null;
    if (file) {
      sentMsg = await chatApi.sendMessage(chat.id, { sender: 'me', file, replyTo: replyTo?.id });
      setFile(null);
    } else if (audioBlob) {
      const audioFile = new File([audioBlob], 'audio-message.webm', { type: 'audio/webm' });
      sentMsg = await chatApi.sendMessage(chat.id, { sender: 'me', file: audioFile, type: 'audio', replyTo: replyTo?.id });
      setAudioBlob(null);
    } else {
      sentMsg = { id: Date.now().toString(), sender: 'me', text: input, time: new Date().toLocaleTimeString() };
      setInput('');
    }
    setMessages(prev => [...prev, sentMsg]);
    setReplyTo(null);
    setShowNotification(true);
    // AI-бот: реальный ответ через OpenAI с историей
    if (isBotChat && sentMsg && sentMsg.text) {
      setTimeout(async () => {
        try {
          // Собираем последние 10 сообщений для истории
          const history = [...messages, sentMsg].slice(-10).map(m => ({
            role: m.sender === 'me' ? 'user' : 'assistant',
            content: m.text,
          }));
          const res = await fetch('/api/gpt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: sentMsg.text, history }),
          });
          const data = await res.json();
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: `🤖 ${data.text}`,
            time: new Date().toLocaleTimeString(),
          }]);
        } catch {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: 'Ошибка AI-бота',
            time: new Date().toLocaleTimeString(),
          }]);
        }
      }, 1000);
    }
  };

  // Выбор файла
  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  // Запись аудио
  const handleStartRecording = async () => {
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new window.MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      setAudioBlob(audioBlob);
      setIsRecording(false);
    };
    mediaRecorder.start();
  };
  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  // Просмотр профиля собеседника
  const handleViewProfile = async () => {
    const users = await userApi.getUsers();
    const other = users.find(u => chat.members?.includes(u.id) && u.id !== 'me');
    setProfileUser(other);
    setProfileModalOpen(true);
  };

  // Реакции
  const handleAddReaction = async (msgId, emoji) => {
    setMessages(prev => prev.map(m => m.id === msgId ? {
      ...m,
      reactions: { ...(m.reactions || {}), [emoji]: (m.reactions?.[emoji] || 0) + 1 }
    } : m));
    setShowEmojiPicker(null);
  };

  // Удаление сообщения
  const handleDelete = async (msgId) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
  };

  // Редактирование сообщения
  const handleEdit = (msg) => {
    setEditingMsgId(msg.id);
    setEditText(msg.text);
  };
  const handleSaveEdit = async (msgId) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: editText } : m));
    setEditingMsgId(null);
    setEditText('');
  };

  // Пин/закрепление сообщения
  const handlePin = (msgId) => {
    setPinnedMsgId(msgId);
  };

  // Пересылка сообщения
  const handleForward = (msg) => {
    setForwardMsg(msg);
    setForwardModal(true);
  };
  const handleForwardToChat = async (chatId) => {
    if (!forwardMsg) return;
    await chatApi.sendMessage(chatId, { sender: 'me', text: forwardMsg.text, file: forwardMsg.fileUrl ? forwardMsg.fileUrl : undefined });
    setForwardModal(false);
    setForwardMsg(null);
  };

  // Ответ/цитирование
  const handleReply = (msg) => {
    setReplyTo(msg);
  };

  // Вложенные ответы (thread)
  const handleOpenThread = (msgId) => {
    setThreadMsgId(msgId);
    setThreadMessages(messages.filter(m => m.replyTo === msgId));
  };
  const handleCloseThread = () => {
    setThreadMsgId(null);
    setThreadMessages([]);
  };

  // Групповой чат: добавление/удаление участников
  const handleAddUserToGroup = (userId) => {
    if (!groupUsers.includes(userId)) setGroupUsers([...groupUsers, userId]);
  };
  const handleRemoveUserFromGroup = (userId) => {
    setGroupUsers(groupUsers.filter(id => id !== userId));
  };

  // Фильтрация сообщений по поиску
  const filteredMessages = search.trim()
    ? messages.filter(m => (m.text || '').toLowerCase().includes(search.trim().toLowerCase()))
    : messages;

  // Подсветка совпадений
  function highlight(text, query) {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? <mark key={i} className="bg-yellow-300 dark:bg-yellow-700 text-black dark:text-white px-0.5 rounded">{part}</mark> : part
    );
  }

  return (
    <div className="flex flex-col h-96">
      {/* Закреплённое сообщение */}
      {pinnedMsgId && (
        <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 px-4 py-2 flex items-center gap-2 border-b border-yellow-400">
          <BookmarkIcon className="h-5 w-5" />
          <span className="truncate">{messages.find(m => m.id === pinnedMsgId)?.text || 'Сообщение закреплено'}</span>
          <button onClick={() => setPinnedMsgId(null)} className="ml-auto text-yellow-700 dark:text-yellow-200">Убрать</button>
        </div>
      )}
      {/* Уведомление о новом сообщении */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded shadow flex items-center gap-2">
          <BellIcon className="h-5 w-5" /> Новое сообщение!
        </div>
      )}
      {/* Заголовок чата */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleViewProfile}>
          <img src={chat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}`} alt={chat.name} className="w-10 h-10 rounded-full border-2 border-blue-400" />
          <div>
            <div className="font-semibold text-white flex items-center gap-2">
              {chat.name}
              {chat.members?.length > 2 && <UserGroupIcon className="h-5 w-5 text-blue-300" onClick={e => { e.stopPropagation(); setGroupModalOpen(true); }} />}
            </div>
            <div className="text-xs text-gray-400">{chat.online ? 'В сети' : 'Не в сети'}</div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-red-400 transition">✕</button>
      </div>
      {/* Строка поиска */}
      <div className="px-4 py-2 bg-gray-900 border-b border-gray-700">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по сообщениям..."
          className="w-full bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {/* Групповой чат: модалка участников */}
      {groupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-[#232834] rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">Участники группы <UserGroupIcon className="h-5 w-5" /></h2>
              <button onClick={() => setGroupModalOpen(false)} className="text-gray-400 hover:text-red-400 transition">✕</button>
            </div>
            <div className="mb-4">
              {groupUsers.map(uid => {
                const u = allUsers.find(u => u.id === uid);
                return (
                  <div key={uid} className="flex items-center gap-2 mb-2">
                    <img src={u?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || '')}`} alt={u?.name} className="w-8 h-8 rounded-full" />
                    <span className="text-white">{u?.name}</span>
                    <button onClick={() => handleRemoveUserFromGroup(uid)} className="text-red-400 ml-auto">Удалить</button>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <select className="flex-1 bg-gray-800 text-white rounded px-2 py-1" onChange={e => handleAddUserToGroup(e.target.value)}>
                <option value="">Добавить участника...</option>
                {allUsers.filter(u => !groupUsers.includes(u.id)).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <PlusIcon className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>
      )}
      {/* Пересылка сообщения: модалка */}
      {forwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-[#232834] rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">Переслать сообщение <ArrowTopRightOnSquareIcon className="h-5 w-5" /></h2>
              <button onClick={() => setForwardModal(false)} className="text-gray-400 hover:text-red-400 transition">✕</button>
            </div>
            <div className="mb-4 text-white">{forwardMsg?.text || 'Файл/вложение'}</div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {chatsList.map(c => (
                <button key={c.id} onClick={() => handleForwardToChat(c.id)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 hover:bg-blue-700/30 transition">
                  <img src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}`} alt={c.name} className="w-8 h-8 rounded-full" />
                  <span className="text-white">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Вложенные ответы (thread) */}
      {threadMsgId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-[#232834] rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">Ветка ответов <ArrowUturnRightIcon className="h-5 w-5" /></h2>
              <button onClick={handleCloseThread} className="text-gray-400 hover:text-red-400 transition">✕</button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {threadMessages.map(m => (
                <div key={m.id} className="bg-gray-700 text-white rounded px-3 py-2 mb-2">
                  {m.text}
                  <div className="text-xs text-gray-400 mt-1">{m.time || ''}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto px-4 py-2 bg-gray-800">
        {filteredMessages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} mb-2 group`}>
            <div className={`max-w-xs px-4 py-2 rounded-lg relative ${msg.sender === 'me' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
              {/* Редактирование */}
              {editingMsgId === msg.id ? (
                <div className="flex items-center gap-2">
                  <input value={editText} onChange={e => setEditText(e.target.value)} className="flex-1 bg-gray-900 text-white px-2 py-1 rounded" />
                  <button onClick={() => handleSaveEdit(msg.id)} className="text-green-400">Сохранить</button>
                  <button onClick={() => setEditingMsgId(null)} className="text-gray-400">Отмена</button>
                </div>
              ) : (
                <>
                  {/* Цитата/ответ */}
                  {msg.replyTo && (
                    <div className="text-xs text-blue-200 border-l-4 border-blue-400 pl-2 mb-1 cursor-pointer" onClick={() => handleOpenThread(msg.replyTo)}>
                      Ответ на: {messages.find(m => m.id === msg.replyTo)?.text || 'Сообщение'}
                    </div>
                  )}
                  {msg.type === 'audio' && msg.fileUrl ? (
                    <audio controls src={msg.fileUrl} className="w-full" />
                  ) : msg.fileUrl ? (
                    msg.type?.startsWith('image') ? (
                      <img src={msg.fileUrl} alt={msg.originalName} className="max-w-[180px] rounded mb-2" />
                    ) : (
                      <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-200 flex items-center gap-2">
                        <PaperClipIcon className="h-4 w-4" />
                        {msg.originalName || 'Файл'}
                      </a>
                    )
                  ) : null}
                  {msg.text && <div className="text-sm">{highlight(msg.text, search)}</div>}
                  <div className="flex items-center gap-2 mt-1">
                    {/* Реакции */}
                    <button onClick={() => setShowEmojiPicker(msg.id)} className="text-yellow-300 hover:text-yellow-400"><FaceSmileIcon className="h-5 w-5" /></button>
                    {showEmojiPicker === msg.id && (
                      <div className="absolute z-10 bottom-8 left-0 bg-gray-900 border border-gray-700 rounded shadow-lg p-2 flex gap-1">
                        {EMOJIS.map(e => (
                          <button key={e} onClick={() => handleAddReaction(msg.id, e)} className="text-xl hover:scale-125 transition-transform">{e}</button>
                        ))}
                      </div>
                    )}
                    {/* Показываем реакции */}
                    {msg.reactions && Object.entries(msg.reactions).map(([emoji, count]) => (
                      <span key={emoji} className="ml-1 text-lg">{emoji} {count}</span>
                    ))}
                    {/* Пин/закрепить */}
                    <button onClick={() => handlePin(msg.id)} className="text-yellow-500 hover:text-yellow-600"><BookmarkIcon className="h-4 w-4" /></button>
                    {/* Переслать */}
                    <button onClick={() => handleForward(msg)} className="text-blue-400 hover:text-blue-600"><ArrowTopRightOnSquareIcon className="h-4 w-4" /></button>
                    {/* Ответить */}
                    <button onClick={() => handleReply(msg)} className="text-green-400 hover:text-green-600"><ArrowUturnRightIcon className="h-4 w-4" /></button>
                    {/* Открыть thread */}
                    <button onClick={() => handleOpenThread(msg.id)} className="text-gray-400 hover:text-blue-400"><UserGroupIcon className="h-4 w-4" /></button>
                    {/* Редактировать/удалить только свои */}
                    {msg.sender === 'me' && (
                      <>
                        <button onClick={() => handleEdit(msg)} className="text-gray-300 hover:text-green-400"><PencilIcon className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(msg.id)} className="text-gray-300 hover:text-red-400"><TrashIcon className="h-4 w-4" /></button>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-300 text-right mt-1">{msg.time || ''}</div>
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Ввод сообщения */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900 rounded-b-lg">
        {replyTo && (
          <div className="bg-blue-900 text-blue-200 px-2 py-1 rounded flex items-center gap-2">
            <span className="truncate">Ответ на: {replyTo.text}</span>
            <button onClick={() => setReplyTo(null)} className="text-blue-300">✕</button>
          </div>
        )}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Введите сообщение..."
          className="flex-1 bg-gray-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="file"
          className="hidden"
          id="file-upload"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="cursor-pointer text-gray-400 hover:text-blue-400">
          <PaperClipIcon className="h-6 w-6" />
        </label>
        {isRecording ? (
          <button onClick={handleStopRecording} className="text-red-500"><XMarkIcon className="h-6 w-6" /></button>
        ) : (
          <button onClick={handleStartRecording} className="text-gray-400 hover:text-blue-400"><MicrophoneIcon className="h-6 w-6" /></button>
        )}
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Отправить
        </button>
      </div>
      {/* Модалка профиля */}
      {profileModalOpen && profileUser && (
        <UserProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} userId={profileUser.id} />
      )}
    </div>
  );
} 