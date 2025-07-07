"use client";
import React, { useState, useEffect } from "react";
import { 
  FolderIcon, 
  UserGroupIcon, 
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  AcademicCapIcon,
  FlagIcon,
  UsersIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import ActivityCard from "@/components/ui/ActivityCard";
import FilterBar from "@/components/ui/FilterBar";
import SectionTitle from "@/components/ui/SectionTitle";

interface Project {
  id: string;
  title: string;
  description: string;
  subject: string;
  status: "planning" | "in_progress" | "review" | "completed" | "on_hold";
  priority: "low" | "medium" | "high";
  startDate: string;
  dueDate: string;
  progress: number;
  team: string[];
  mentor: string;
  attachments?: string[];
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters = [
    { label: "Все проекты", value: "all" },
    { label: "Планирование", value: "planning" },
    { label: "В работе", value: "in_progress" },
    { label: "На проверке", value: "review" },
    { label: "Завершенные", value: "completed" },
    { label: "Приостановлены", value: "on_hold" }
  ];

  // Загрузка проектов
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      // В реальном приложении здесь был бы API вызов
      // const projectsData = await projectsApi.getProjects();
      
      // Мок данные для демонстрации
      const mockProjects: Project[] = [
        {
          id: "1",
          title: "Веб-приложение для управления библиотекой",
          description: "Создание полнофункционального веб-приложения с базой данных, авторизацией и интерфейсом для управления книгами",
          subject: "Информатика",
          status: "in_progress",
          priority: "high",
          startDate: "2024-01-10T00:00:00Z",
          dueDate: "2024-02-15T23:59:00Z",
          progress: 65,
          team: ["student1", "student2", "student3"],
          mentor: "Козлов Д.А.",
          attachments: ["project_requirements.pdf", "design_mockup.fig"],
          createdAt: "2024-01-08T10:00:00Z"
        },
        {
          id: "2",
          title: "Исследование экологических проблем города",
          description: "Проведение анализа экологической ситуации и разработка рекомендаций по улучшению",
          subject: "Биология",
          status: "planning",
          priority: "medium",
          startDate: "2024-01-20T00:00:00Z",
          dueDate: "2024-03-01T23:59:00Z",
          progress: 15,
          team: ["student1", "student4"],
          mentor: "Волкова Н.К.",
          attachments: ["research_plan.docx"],
          createdAt: "2024-01-15T14:30:00Z"
        },
        {
          id: "3",
          title: "Математическая модель экономических процессов",
          description: "Разработка математической модели для анализа экономических показателей",
          subject: "Математика",
          status: "review",
          priority: "high",
          startDate: "2024-01-05T00:00:00Z",
          dueDate: "2024-01-25T23:59:00Z",
          progress: 90,
          team: ["student1"],
          mentor: "Петрова А.С.",
          attachments: ["model_description.pdf", "calculations.xlsx"],
          createdAt: "2024-01-03T09:15:00Z"
        },
        {
          id: "4",
          title: "Исторический анализ развития технологий",
          description: "Исследование влияния технологических революций на общественное развитие",
          subject: "История",
          status: "completed",
          priority: "low",
          startDate: "2023-12-01T00:00:00Z",
          dueDate: "2024-01-10T23:59:00Z",
          progress: 100,
          team: ["student1", "student5"],
          mentor: "Морозова Е.П.",
          attachments: ["final_report.pdf", "presentation.pptx"],
          createdAt: "2023-11-25T16:45:00Z"
        },
        {
          id: "5",
          title: "Физический эксперимент с электромагнитными волнами",
          description: "Проведение серии экспериментов и анализ результатов",
          subject: "Физика",
          status: "on_hold",
          priority: "medium",
          startDate: "2024-01-12T00:00:00Z",
          dueDate: "2024-02-28T23:59:00Z",
          progress: 30,
          team: ["student1", "student2"],
          mentor: "Иванов И.И.",
          attachments: ["experiment_protocol.pdf"],
          createdAt: "2024-01-10T11:20:00Z"
        },
        {
          id: "6",
          title: "Литературный анализ современной прозы",
          description: "Анализ стилистических особенностей современных авторов",
          subject: "Литература",
          status: "in_progress",
          priority: "medium",
          startDate: "2024-01-15T00:00:00Z",
          dueDate: "2024-02-10T23:59:00Z",
          progress: 45,
          team: ["student1"],
          mentor: "Сидорова М.В.",
          attachments: ["literature_review.docx"],
          createdAt: "2024-01-13T13:00:00Z"
        }
      ];
      
      setProjects(mockProjects);
      setFilteredProjects(mockProjects);
    } catch (err) {
      console.error("Ошибка загрузки проектов:", err);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация и поиск
  useEffect(() => {
    let filtered = projects;

    // Поиск по названию или описанию
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по статусу
    if (selectedFilter !== "all") {
      filtered = filtered.filter(project => project.status === selectedFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchQuery, selectedFilter]);

  // Получить иконку для статуса
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <ChartBarIcon className="h-5 w-5 text-blue-500" />;
      case "review":
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case "on_hold":
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <FolderIcon className="h-5 w-5 text-gray-500" />;
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
        return "Завершен";
      case "in_progress":
        return "В работе";
      case "review":
        return "На проверке";
      case "on_hold":
        return "Приостановлен";
      case "planning":
        return "Планирование";
      default:
        return "Неизвестно";
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
      year: "numeric"
    });
  };

  // Обработка изменения статуса проекта
  const handleStatusChange = (projectId: string, newStatus: Project["status"]) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId ? { ...project, status: newStatus } : project
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
        title="Проекты" 
        subtitle="Управление учебными проектами и исследованиями"
        icon={<FolderIcon className="h-6 w-6" />}
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
          <span>{filteredProjects.length} проектов найдено</span>
          <span>•</span>
          <span>{projects.filter(p => p.status === "planning").length} планируются</span>
          <span>•</span>
          <span>{projects.filter(p => p.status === "in_progress").length} в работе</span>
          <span>•</span>
          <span>{projects.filter(p => p.status === "review").length} на проверке</span>
          <span>•</span>
          <span>{projects.filter(p => p.status === "completed").length} завершено</span>
          <span>•</span>
          <span className="text-orange-400">{projects.filter(p => p.status === "on_hold").length} приостановлено</span>
        </div>
      </div>

      {/* Список проектов */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <FolderIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Проекты не найдены
            </h3>
            <p className="text-gray-500">
              {searchQuery || selectedFilter !== "all" 
                ? "Попробуйте изменить параметры поиска или фильтры"
                : "Создайте первый проект, чтобы начать работу"
              }
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <ActivityCard
              key={project.id}
              icon={getStatusIcon(project.status)}
              title={project.title}
              description={project.description}
              date={`${formatDate(project.startDate)} - ${formatDate(project.dueDate)}`}
              status={`${getStatusText(project.status)} • ${project.progress}%`}
              color={getPriorityColor(project.priority)}
              onClick={() => console.log("Открыть проект:", project.id)}
              metadata={[
                { label: "Предмет", value: project.subject, icon: <AcademicCapIcon className="h-4 w-4" /> },
                { label: "Приоритет", value: getPriorityText(project.priority), icon: <FlagIcon className="h-4 w-4" /> },
                { label: "Команда", value: `${project.team.length} участников`, icon: <UsersIcon className="h-4 w-4" /> },
                { label: "Руководитель", value: project.mentor, icon: <UserGroupIcon className="h-4 w-4" /> }
              ]}
              actions={[
                {
                  label: "Завершить",
                  onClick: () => handleStatusChange(project.id, "completed"),
                  disabled: project.status === "completed"
                },
                {
                  label: "В работу",
                  onClick: () => handleStatusChange(project.id, "in_progress"),
                  disabled: project.status === "in_progress"
                },
                {
                  label: "На проверку",
                  onClick: () => handleStatusChange(project.id, "review"),
                  disabled: project.status === "review"
                }
              ]}
            />
          ))
        )}
      </div>
    </div>
  );
} 