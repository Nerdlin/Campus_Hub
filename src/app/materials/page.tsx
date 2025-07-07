"use client";
import React, { useState, useEffect } from "react";
import { 
  DocumentIcon, 
  PhotoIcon, 
  VideoCameraIcon, 
  MusicalNoteIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  DocumentTextIcon,
  PresentationChartBarIcon,
  TableCellsIcon
} from "@heroicons/react/24/outline";
import { materialsApi } from "@/lib/api";
import FileCard from "@/components/ui/FileCard";
import FilterBar from "@/components/ui/FilterBar";
import SectionTitle from "@/components/ui/SectionTitle";
import { useAuth } from "@/hooks/useAuth";

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  date: string;
  sender: string;
  file: string;
  chatId: string;
  chatName: string;
}

export default function MaterialsPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [uploading, setUploading] = useState(false);

  const filters = [
    { label: "Все файлы", value: "all" },
    { label: "Документы", value: "document" },
    { label: "Изображения", value: "image" },
    { label: "Видео", value: "video" },
    { label: "Аудио", value: "audio" },
    { label: "Презентации", value: "presentation" },
    { label: "Таблицы", value: "spreadsheet" }
  ];

  // Загрузка файлов
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const filesData = await materialsApi.getFiles();
      setFiles(filesData);
      setFilteredFiles(filesData);
    } catch (err) {
      console.error("Ошибка загрузки файлов:", err);
      setError("Не удалось загрузить файлы");
      // Для демонстрации используем мок данные
      const mockFiles: FileItem[] = [
        {
          id: "1",
          name: "Лекция по математике.pdf",
          type: "application/pdf",
          size: 2048576,
          date: "2024-01-15T10:30:00Z",
          sender: "teacher1",
          file: "lecture1.pdf",
          chatId: "chat1",
          chatName: "Математика"
        },
        {
          id: "2",
          name: "Лабораторная работа.docx",
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          size: 512000,
          date: "2024-01-14T14:20:00Z",
          sender: "teacher2",
          file: "lab1.docx",
          chatId: "chat2",
          chatName: "Физика"
        },
        {
          id: "3",
          name: "Презентация проекта.pptx",
          type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          size: 1536000,
          date: "2024-01-13T09:15:00Z",
          sender: "student1",
          file: "presentation.pptx",
          chatId: "chat3",
          chatName: "Проектная работа"
        },
        {
          id: "4",
          name: "График занятий.xlsx",
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          size: 256000,
          date: "2024-01-12T16:45:00Z",
          sender: "admin1",
          file: "schedule.xlsx",
          chatId: "chat4",
          chatName: "Общие"
        },
        {
          id: "5",
          name: "Фото с практики.jpg",
          type: "image/jpeg",
          size: 1024000,
          date: "2024-01-11T11:30:00Z",
          sender: "student2",
          file: "photo.jpg",
          chatId: "chat5",
          chatName: "Практика"
        }
      ];
      setFiles(mockFiles);
      setFilteredFiles(mockFiles);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация и поиск
  useEffect(() => {
    let filtered = files;

    // Поиск по названию
    if (searchQuery) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.chatName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по типу
    if (selectedFilter !== "all") {
      filtered = filtered.filter(file => {
        const type = file.type.toLowerCase();
        switch (selectedFilter) {
          case "document":
            return type.includes("pdf") || type.includes("word") || type.includes("text");
          case "image":
            return type.includes("image");
          case "video":
            return type.includes("video");
          case "audio":
            return type.includes("audio");
          case "presentation":
            return type.includes("presentation") || type.includes("powerpoint");
          case "spreadsheet":
            return type.includes("spreadsheet") || type.includes("excel");
          default:
            return true;
        }
      });
    }

    setFilteredFiles(filtered);
  }, [files, searchQuery, selectedFilter]);

  // Получить иконку для файла
  const getFileIcon = (type: string) => {
    const fileType = type.toLowerCase();
    
    if (fileType.includes("image")) return <PhotoIcon className="h-6 w-6" />;
    if (fileType.includes("video")) return <VideoCameraIcon className="h-6 w-6" />;
    if (fileType.includes("audio")) return <MusicalNoteIcon className="h-6 w-6" />;
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) return <PresentationChartBarIcon className="h-6 w-6" />;
    if (fileType.includes("spreadsheet") || fileType.includes("excel")) return <TableCellsIcon className="h-6 w-6" />;
    if (fileType.includes("pdf")) return <DocumentTextIcon className="h-6 w-6" />;
    if (fileType.includes("word") || fileType.includes("document")) return <DocumentIcon className="h-6 w-6" />;
    
    return <DocumentIcon className="h-6 w-6" />;
  };

  // Форматирование размера файла
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

  // Получить цвет для карточки файла
  const getFileColor = (type: string) => {
    const fileType = type.toLowerCase();
    
    if (fileType.includes("image")) return "#10b981"; // green
    if (fileType.includes("video")) return "#f59e0b"; // amber
    if (fileType.includes("audio")) return "#8b5cf6"; // purple
    if (fileType.includes("presentation")) return "#ef4444"; // red
    if (fileType.includes("spreadsheet")) return "#06b6d4"; // cyan
    if (fileType.includes("pdf")) return "#dc2626"; // red
    if (fileType.includes("word") || fileType.includes("document")) return "#2563eb"; // blue
    
    return "#6b7280"; // gray
  };

  // Обработка клика по файлу (скачивание)
  const handleFileClick = async (file: FileItem) => {
    try {
      await materialsApi.downloadFile(file.file, file.name);
    } catch (err) {
      console.error("Ошибка скачивания файла:", err);
      // Fallback - открыть в новой вкладке
      window.open(materialsApi.getFileUrl(file.file), "_blank");
    }
  };

  // Загрузка файла
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await materialsApi.uploadFile(file);
      await loadFiles(); // Перезагружаем список файлов
    } catch (err) {
      console.error("Ошибка загрузки файла:", err);
      setError("Не удалось загрузить файл");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <SectionTitle 
        title="Материалы" 
        subtitle="Управление учебными материалами и файлами"
        icon={<FolderIcon className="h-6 w-6" />}
      />

      {/* Поиск и фильтры */}
      <div className="mb-6 space-y-4">
        {/* Поиск */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по названию файла или чату..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#232834] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Фильтры */}
        <FilterBar
          filters={filters}
          value={selectedFilter}
          onChange={setSelectedFilter}
        />

        {/* Загрузка файла — только для teacher/admin */}
        {user && (user.role === 'teacher' || user.role === 'admin') && (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
              <ArrowUpTrayIcon className="h-5 w-5" />
              {uploading ? "Загрузка..." : "Загрузить файл"}
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <span className="text-sm text-gray-400">
              {filteredFiles.length} файлов найдено
            </span>
          </div>
        )}

        {/* Для студентов — только количество файлов */}
        {user && user.role === 'student' && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {filteredFiles.length} файлов найдено
            </span>
          </div>
        )}
      </div>

      {/* Ошибка */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* Список файлов */}
      <div className="space-y-3">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <FolderIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Файлы не найдены
            </h3>
            <p className="text-gray-500">
              {searchQuery || selectedFilter !== "all" 
                ? "Попробуйте изменить параметры поиска или фильтры"
                : (user && (user.role === 'teacher' || user.role === 'admin')
                  ? "Загрузите первый файл, чтобы начать работу"
                  : "Ожидайте, когда преподаватель или администратор добавит материалы")
              }
            </p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <FileCard
              key={file.id}
              icon={getFileIcon(file.type)}
              name={file.name}
              date={formatDate(file.date)}
              size={formatFileSize(file.size)}
              status={file.chatName}
              color={getFileColor(file.type)}
              onClick={() => handleFileClick(file)}
            />
          ))
        )}
      </div>
    </div>
  );
} 