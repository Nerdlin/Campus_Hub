"use client";
import React, { useState, useEffect } from "react";
import { 
  MegaphoneIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  CalendarIcon,
  AcademicCapIcon,
  FlagIcon,
  EyeIcon,
  BookmarkIcon
} from "@heroicons/react/24/outline";
import AnnouncementCard from "@/components/ui/AnnouncementCard";
import FilterBar from "@/components/ui/FilterBar";
import SectionTitle from "@/components/ui/SectionTitle";
import { useAuth } from "@/hooks/useAuth";
import { announcementsApi } from "@/lib/api";
import ModernModal from "@/components/ui/ModernModal";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "important" | "event";
  priority: "low" | "medium" | "high";
  author: string;
  authorRole: string;
  targetAudience: string[];
  createdAt: string;
  expiresAt?: string;
  attachments?: string[];
  readBy: string[];
  isPinned: boolean;
}

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "info",
    priority: "low",
    expiresAt: "",
  });

  const filters = [
    { label: "Все объявления", value: "all" },
    { label: "Информация", value: "info" },
    { label: "Предупреждения", value: "warning" },
    { label: "Важное", value: "important" },
    { label: "События", value: "event" }
  ];

  // Загрузка объявлений
  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const announcementsData = await announcementsApi.getAnnouncements();
      setAnnouncements(announcementsData);
      setFilteredAnnouncements(announcementsData);
    } catch (err) {
      console.error("Ошибка загрузки объявлений:", err);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация и поиск
  useEffect(() => {
    let filtered = announcements;

    // Поиск по названию или содержанию
    if (searchQuery) {
      filtered = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по типу
    if (selectedFilter !== "all") {
      filtered = filtered.filter(announcement => announcement.type === selectedFilter);
    }

    // Фильтр по непрочитанным
    if (showOnlyUnread) {
      filtered = filtered.filter(announcement => !announcement.readBy.includes("student1")); // текущий пользователь
    }

    // Сортируем: сначала закрепленные, потом по дате создания
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredAnnouncements(filtered);
  }, [announcements, searchQuery, selectedFilter, showOnlyUnread]);

  // Получить иконку для типа объявления
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "important":
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      case "event":
        return <CalendarIcon className="h-5 w-5 text-green-500" />;
      default:
        return <MegaphoneIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Получить цвет для приоритета
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444"; // red
      case "medium":
        return "#f59e0b"; // amber
      case "low":
        return "#10b981"; // green
      default:
        return "#6b7280"; // gray
    }
  };

  // Получить текст типа объявления
  const getTypeText = (type: string) => {
    switch (type) {
      case "important":
        return "Важное";
      case "warning":
        return "Предупреждение";
      case "info":
        return "Информация";
      case "event":
        return "Событие";
      default:
        return "Объявление";
    }
  };

  // Получить текст приоритета
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Высокий";
      case "medium":
        return "Средний";
      case "low":
        return "Низкий";
      default:
        return "Не указан";
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Проверить, истекло ли объявление
  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  // Обработка отметки как прочитанное
  const handleMarkAsRead = (announcementId: string) => {
    setAnnouncements(prevAnnouncements =>
      prevAnnouncements.map(announcement =>
        announcement.id === announcementId
          ? { ...announcement, readBy: [...announcement.readBy, "student1"] }
          : announcement
      )
    );
  };

  // Обработка закрепления/открепления
  const handleTogglePin = (announcementId: string) => {
    setAnnouncements(prevAnnouncements =>
      prevAnnouncements.map(announcement =>
        announcement.id === announcementId
          ? { ...announcement, isPinned: !announcement.isPinned }
          : announcement
      )
    );
  };

  // CRUD actions
  const handleOpenModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditAnnouncement(announcement);
      setForm({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        priority: announcement.priority,
        expiresAt: announcement.expiresAt || "",
      });
    } else {
      setEditAnnouncement(null);
      setForm({ title: "", content: "", type: "info", priority: "low", expiresAt: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditAnnouncement(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (editAnnouncement) {
        await announcementsApi.updateAnnouncement(editAnnouncement.id, form);
      } else {
        await announcementsApi.createAnnouncement({ ...form, author: user?.name, authorRole: user?.role });
      }
      await loadAnnouncements();
      handleCloseModal();
    } catch (err) {
      console.error("Ошибка сохранения объявления:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Удалить объявление?")) return;
    try {
      await announcementsApi.deleteAnnouncement(id);
      await loadAnnouncements();
    } catch (err) {
      console.error("Ошибка удаления объявления:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <SectionTitle 
        title="Объявления" 
        subtitle="Важные новости и уведомления"
        icon={<MegaphoneIcon className="h-6 w-6" />}
      />

      {/* Кнопка добавить для teacher/admin */}
      {user && (user.role === 'teacher' || user.role === 'admin') && (
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => handleOpenModal()}
        >
          + Добавить объявление
        </button>
      )}

      {/* Поиск и фильтры */}
      <div className="mb-6 space-y-4">
        {/* Поиск */}
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск по названию, содержанию или автору..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-4 py-3 bg-[#232834] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Фильтры */}
        <div className="flex flex-wrap gap-4">
          <FilterBar
            filters={filters}
            value={selectedFilter}
            onChange={setSelectedFilter}
          />
          
          {/* Переключатель непрочитанных */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyUnread}
              onChange={(e) => setShowOnlyUnread(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Только непрочитанные</span>
          </label>
        </div>

        {/* Статистика */}
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{filteredAnnouncements.length} объявлений найдено</span>
          <span>•</span>
          <span>{announcements.filter(a => !a.readBy.includes("student1")).length} непрочитанных</span>
          <span>•</span>
          <span>{announcements.filter(a => a.isPinned).length} закрепленных</span>
          <span>•</span>
          <span className="text-red-400">{announcements.filter(a => isExpired(a.expiresAt)).length} истекших</span>
        </div>
      </div>

      {/* Список объявлений */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12">
            <MegaphoneIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Объявления не найдены
            </h3>
            <p className="text-gray-500">
              {searchQuery || selectedFilter !== "all" || showOnlyUnread
                ? "Попробуйте изменить параметры поиска или фильтры"
                : "Новых объявлений пока нет"
              }
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <div key={announcement.id} className="relative group">
              <AnnouncementCard
                icon={getTypeIcon(announcement.type)}
                title={announcement.title}
                content={announcement.content}
                author={announcement.author}
                date={formatDate(announcement.createdAt)}
                type={getTypeText(announcement.type)}
                color={getPriorityColor(announcement.priority)}
                isPinned={announcement.isPinned}
                isRead={announcement.readBy.includes(user?.id || "")}
                isExpired={isExpired(announcement.expiresAt)}
                metadata={[
                  { label: "Приоритет", value: getPriorityText(announcement.priority), icon: <FlagIcon className="h-4 w-4" /> },
                  { label: "Автор", value: announcement.author, icon: <UserGroupIcon className="h-4 w-4" /> },
                  { label: "Создано", value: formatDate(announcement.createdAt), icon: <CalendarIcon className="h-4 w-4" /> },
                  ...(announcement.expiresAt ? [{ label: "Истекает", value: formatDate(announcement.expiresAt), icon: <ClockIcon className="h-4 w-4" /> }] : [])
                ]}
                actions={[
                  {
                    label: announcement.readBy.includes("student1") ? "Отметить непрочитанным" : "Отметить прочитанным",
                    onClick: () => handleMarkAsRead(announcement.id),
                    icon: announcement.readBy.includes("student1") ? <EyeIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />
                  },
                  {
                    label: announcement.isPinned ? "Открепить" : "Закрепить",
                    onClick: () => handleTogglePin(announcement.id),
                    icon: <BookmarkIcon className="h-4 w-4" />
                  }
                ]}
              />
              {/* Кнопки редактировать/удалить для teacher/admin */}
              {user && (user.role === 'teacher' || user.role === 'admin') && (
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                    onClick={() => handleOpenModal(announcement)}
                  >
                    Редактировать
                  </button>
                  <button
                    className="px-2 py-1 bg-red-600 text-white rounded"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {/* Модалка создания/редактирования */}
      <ModernModal open={showModal} onClose={handleCloseModal} title={editAnnouncement ? "Редактировать объявление" : "Новое объявление"}>
        <div className="space-y-4">
          <input
            name="title"
            value={form.title}
            onChange={handleFormChange}
            placeholder="Заголовок"
            className="w-full p-2 rounded border"
          />
          <textarea
            name="content"
            value={form.content}
            onChange={handleFormChange}
            placeholder="Текст объявления"
            className="w-full p-2 rounded border"
          />
          <select name="type" value={form.type} onChange={handleFormChange} className="w-full p-2 rounded border">
            <option value="info">Информация</option>
            <option value="warning">Предупреждение</option>
            <option value="important">Важное</option>
            <option value="event">Событие</option>
          </select>
          <select name="priority" value={form.priority} onChange={handleFormChange} className="w-full p-2 rounded border">
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
          <input
            name="expiresAt"
            type="date"
            value={form.expiresAt}
            onChange={handleFormChange}
            className="w-full p-2 rounded border"
          />
          <div className="flex justify-end gap-2">
            <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-300 rounded">Отмена</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Сохранить</button>
          </div>
        </div>
      </ModernModal>
    </div>
  );
} 