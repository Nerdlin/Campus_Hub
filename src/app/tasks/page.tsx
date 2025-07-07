"use client";
import React, { useState, useEffect } from "react";
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  PlusIcon,
  CalendarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  FlagIcon
} from "@heroicons/react/24/outline";
import ActivityCard from "@/components/ui/ActivityCard";
import FilterBar from "@/components/ui/FilterBar";
import SectionTitle from "@/components/ui/SectionTitle";

interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  priority: "low" | "medium" | "high";
  assignedBy: string;
  assignedTo: string[];
  attachments?: string[];
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters = [
    { label: "Все задачи", value: "all" },
    { label: "Ожидающие", value: "pending" },
    { label: "В работе", value: "in_progress" },
    { label: "Завершенные", value: "completed" },
    { label: "Просроченные", value: "overdue" }
  ];

  // Загрузка задач
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      // В реальном приложении здесь был бы API вызов
      // const tasksData = await tasksApi.getTasks();
      
      // Мок данные для демонстрации
      const mockTasks: Task[] = [
        {
          id: "1",
          title: "Лабораторная работа по физике",
          description: "Выполнить эксперимент с маятником и написать отчет",
          subject: "Физика",
          dueDate: "2024-01-20T23:59:00Z",
          status: "pending",
          priority: "high",
          assignedBy: "Иванов И.И.",
          assignedTo: ["student1", "student2"],
          attachments: ["lab_manual.pdf"],
          createdAt: "2024-01-15T10:00:00Z"
        },
        {
          id: "2",
          title: "Домашнее задание по математике",
          description: "Решить задачи 1-15 из учебника, стр. 45-47",
          subject: "Математика",
          dueDate: "2024-01-18T23:59:00Z",
          status: "in_progress",
          priority: "medium",
          assignedBy: "Петрова А.С.",
          assignedTo: ["student1"],
          createdAt: "2024-01-14T14:30:00Z"
        },
        {
          id: "3",
          title: "Эссе по литературе",
          description: "Написать эссе на тему 'Образ главного героя в романе'",
          subject: "Литература",
          dueDate: "2024-01-16T23:59:00Z",
          status: "completed",
          priority: "medium",
          assignedBy: "Сидорова М.В.",
          assignedTo: ["student1"],
          attachments: ["essay_requirements.docx"],
          createdAt: "2024-01-12T09:15:00Z"
        },
        {
          id: "4",
          title: "Проект по информатике",
          description: "Создать веб-сайт с использованием HTML, CSS и JavaScript",
          subject: "Информатика",
          dueDate: "2024-01-22T23:59:00Z",
          status: "in_progress",
          priority: "high",
          assignedBy: "Козлов Д.А.",
          assignedTo: ["student1", "student3"],
          attachments: ["project_requirements.pdf", "design_mockup.png"],
          createdAt: "2024-01-10T16:45:00Z"
        },
        {
          id: "5",
          title: "Контрольная работа по истории",
          description: "Подготовиться к контрольной работе по теме 'Вторая мировая война'",
          subject: "История",
          dueDate: "2024-01-17T23:59:00Z",
          status: "overdue",
          priority: "high",
          assignedBy: "Морозова Е.П.",
          assignedTo: ["student1"],
          attachments: ["study_materials.pdf"],
          createdAt: "2024-01-08T11:20:00Z"
        },
        {
          id: "6",
          title: "Презентация по биологии",
          description: "Подготовить презентацию на тему 'Экосистемы'",
          subject: "Биология",
          dueDate: "2024-01-25T23:59:00Z",
          status: "pending",
          priority: "low",
          assignedBy: "Волкова Н.К.",
          assignedTo: ["student1"],
          createdAt: "2024-01-15T13:00:00Z"
        }
      ];
      
      setTasks(mockTasks);
      setFilteredTasks(mockTasks);
    } catch (err) {
      console.error("Ошибка загрузки задач:", err);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация и поиск
  useEffect(() => {
    let filtered = tasks;

    // Поиск по названию или описанию
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по статусу
    if (selectedFilter !== "all") {
      filtered = filtered.filter(task => task.status === selectedFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, selectedFilter]);

  // Получить иконку для статуса
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case "overdue":
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
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

  // Получить текст статуса
  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Завершено";
      case "in_progress":
        return "В работе";
      case "overdue":
        return "Просрочено";
      default:
        return "Ожидает";
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

  // Проверить, просрочена ли задача
  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  // Обработка изменения статуса задачи
  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <SectionTitle 
        title="Задачи" 
        subtitle="Управление учебными заданиями и проектами"
        icon={<AcademicCapIcon className="h-6 w-6" />}
      />

      {/* Поиск и фильтры */}
      <div className="mb-6 space-y-4">
        {/* Поиск */}
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск по названию, описанию или предмету..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-4 py-3 bg-[#232834] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Фильтры */}
        <FilterBar
          filters={filters}
          value={selectedFilter}
          onChange={setSelectedFilter}
        />

        {/* Статистика */}
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{filteredTasks.length} задач найдено</span>
          <span>•</span>
          <span>{tasks.filter(t => t.status === "pending").length} ожидают</span>
          <span>•</span>
          <span>{tasks.filter(t => t.status === "in_progress").length} в работе</span>
          <span>•</span>
          <span>{tasks.filter(t => t.status === "completed").length} завершено</span>
          <span>•</span>
          <span className="text-red-400">{tasks.filter(t => t.status === "overdue").length} просрочено</span>
        </div>
      </div>

      {/* Список задач */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Задачи не найдены
            </h3>
            <p className="text-gray-500">
              {searchQuery || selectedFilter !== "all" 
                ? "Попробуйте изменить параметры поиска или фильтры"
                : "Создайте первую задачу, чтобы начать работу"
              }
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <ActivityCard
              key={task.id}
              icon={getStatusIcon(task.status)}
              title={task.title}
              description={task.description}
              date={formatDate(task.dueDate)}
              status={getStatusText(task.status)}
              color={getPriorityColor(task.priority)}
              onClick={() => console.log("Открыть задачу:", task.id)}
              metadata={[
                { label: "Предмет", value: task.subject, icon: <AcademicCapIcon className="h-4 w-4" /> },
                { label: "Приоритет", value: getPriorityText(task.priority), icon: <FlagIcon className="h-4 w-4" /> },
                { label: "Срок", value: formatDate(task.dueDate), icon: <CalendarIcon className="h-4 w-4" /> },
                { label: "От", value: task.assignedBy, icon: <UserGroupIcon className="h-4 w-4" /> }
              ]}
              actions={[
                {
                  label: "Завершить",
                  onClick: () => handleStatusChange(task.id, "completed"),
                  disabled: task.status === "completed"
                },
                {
                  label: "В работу",
                  onClick: () => handleStatusChange(task.id, "in_progress"),
                  disabled: task.status === "in_progress"
                }
              ]}
            />
          ))
        )}
      </div>
    </div>
  );
} 