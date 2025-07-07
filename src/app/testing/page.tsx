"use client";
import React, { useState, useEffect } from "react";
import { 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  FlagIcon,
  PlayIcon,
  EyeIcon,
  DocumentCheckIcon
} from "@heroicons/react/24/outline";
import ActivityCard from "@/components/ui/ActivityCard";
import FilterBar from "@/components/ui/FilterBar";
import SectionTitle from "@/components/ui/SectionTitle";

interface Test {
  id: string;
  title: string;
  description: string;
  subject: string;
  type: "quiz" | "exam" | "assignment" | "practice";
  status: "upcoming" | "active" | "completed" | "missed";
  duration: number; // в минутах
  totalQuestions: number;
  maxScore: number;
  startDate: string;
  endDate: string;
  instructor: string;
  instructions?: string;
  attachments?: string[];
  createdAt: string;
  score?: number;
  timeSpent?: number;
}

export default function TestingPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters = [
    { label: "Все тесты", value: "all" },
    { label: "Предстоящие", value: "upcoming" },
    { label: "Активные", value: "active" },
    { label: "Завершенные", value: "completed" },
    { label: "Пропущенные", value: "missed" }
  ];

  // Загрузка тестов
  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      // В реальном приложении здесь был бы API вызов
      // const testsData = await testsApi.getTests();
      
      // Мок данные для демонстрации
      const mockTests: Test[] = [
        {
          id: "1",
          title: "Контрольная работа по математике",
          description: "Тест по теме 'Дифференциальные уравнения'",
          subject: "Математика",
          type: "exam",
          status: "upcoming",
          duration: 90,
          totalQuestions: 20,
          maxScore: 100,
          startDate: "2024-01-20T10:00:00Z",
          endDate: "2024-01-20T11:30:00Z",
          instructor: "Петрова А.С.",
          instructions: "Разрешено использование калькулятора. Запрещены телефоны и интернет.",
          attachments: ["test_instructions.pdf"],
          createdAt: "2024-01-15T10:00:00Z"
        },
        {
          id: "2",
          title: "Практический тест по физике",
          description: "Решение задач по механике",
          subject: "Физика",
          type: "practice",
          status: "active",
          duration: 60,
          totalQuestions: 15,
          maxScore: 50,
          startDate: "2024-01-18T14:00:00Z",
          endDate: "2024-01-18T15:00:00Z",
          instructor: "Иванов И.И.",
          instructions: "Решите задачи, показав все этапы решения",
          createdAt: "2024-01-16T14:30:00Z"
        },
        {
          id: "3",
          title: "Тест по литературе",
          description: "Анализ произведений русской классики",
          subject: "Литература",
          type: "quiz",
          status: "completed",
          duration: 45,
          totalQuestions: 25,
          maxScore: 100,
          startDate: "2024-01-15T09:00:00Z",
          endDate: "2024-01-15T09:45:00Z",
          instructor: "Сидорова М.В.",
          score: 85,
          timeSpent: 42,
          createdAt: "2024-01-14T09:15:00Z"
        },
        {
          id: "4",
          title: "Экзамен по информатике",
          description: "Программирование на Python",
          subject: "Информатика",
          type: "exam",
          status: "upcoming",
          duration: 120,
          totalQuestions: 30,
          maxScore: 100,
          startDate: "2024-01-25T13:00:00Z",
          endDate: "2024-01-25T15:00:00Z",
          instructor: "Козлов Д.А.",
          instructions: "Разрешено использование IDE. Интернет запрещен.",
          attachments: ["exam_rules.pdf", "sample_code.py"],
          createdAt: "2024-01-17T16:45:00Z"
        },
        {
          id: "5",
          title: "Домашнее задание по истории",
          description: "Эссе по теме 'Вторая мировая война'",
          subject: "История",
          type: "assignment",
          status: "missed",
          duration: 0,
          totalQuestions: 1,
          maxScore: 50,
          startDate: "2024-01-10T00:00:00Z",
          endDate: "2024-01-12T23:59:00Z",
          instructor: "Морозова Е.П.",
          instructions: "Напишите эссе объемом 3-5 страниц",
          attachments: ["essay_requirements.docx"],
          createdAt: "2024-01-08T11:20:00Z"
        },
        {
          id: "6",
          title: "Тест по биологии",
          description: "Основы генетики",
          subject: "Биология",
          type: "quiz",
          status: "completed",
          duration: 30,
          totalQuestions: 20,
          maxScore: 40,
          startDate: "2024-01-16T10:00:00Z",
          endDate: "2024-01-16T10:30:00Z",
          instructor: "Волкова Н.К.",
          score: 36,
          timeSpent: 28,
          createdAt: "2024-01-15T13:00:00Z"
        }
      ];
      
      setTests(mockTests);
      setFilteredTests(mockTests);
    } catch (err) {
      console.error("Ошибка загрузки тестов:", err);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация и поиск
  useEffect(() => {
    let filtered = tests;

    // Поиск по названию или описанию
    if (searchQuery) {
      filtered = filtered.filter(test =>
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по статусу
    if (selectedFilter !== "all") {
      filtered = filtered.filter(test => test.status === selectedFilter);
    }

    setFilteredTests(filtered);
  }, [tests, searchQuery, selectedFilter]);

  // Получить иконку для статуса
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "active":
        return <PlayIcon className="h-5 w-5 text-blue-500" />;
      case "upcoming":
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case "missed":
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Получить цвет для типа теста
  const getTestTypeColor = (type: string) => {
    switch (type) {
      case "exam":
        return "#ef4444"; // red
      case "quiz":
        return "#10b981"; // green
      case "assignment":
        return "#f59e0b"; // amber
      case "practice":
        return "#8b5cf6"; // purple
      default:
        return "#6b7280"; // gray
    }
  };

  // Получить текст статуса
  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Завершен";
      case "active":
        return "Активен";
      case "upcoming":
        return "Предстоящий";
      case "missed":
        return "Пропущен";
      default:
        return "Неизвестно";
    }
  };

  // Получить текст типа теста
  const getTestTypeText = (type: string) => {
    switch (type) {
      case "exam":
        return "Экзамен";
      case "quiz":
        return "Тест";
      case "assignment":
        return "Задание";
      case "practice":
        return "Практика";
      default:
        return "Неизвестно";
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

  // Форматирование времени
  const formatDuration = (minutes: number) => {
    if (minutes === 0) return "Без ограничений";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins} минут`;
  };

  // Обработка начала теста
  const handleStartTest = (testId: string) => {
    console.log("Начать тест:", testId);
    // Здесь будет логика перехода к тесту
  };

  // Обработка просмотра результатов
  const handleViewResults = (testId: string) => {
    console.log("Просмотреть результаты:", testId);
    // Здесь будет логика просмотра результатов
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
        title="Тестирование" 
        subtitle="Управление тестами, экзаменами и заданиями"
        icon={<DocumentTextIcon className="h-6 w-6" />}
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
          <span>{filteredTests.length} тестов найдено</span>
          <span>•</span>
          <span>{tests.filter(t => t.status === "upcoming").length} предстоящих</span>
          <span>•</span>
          <span>{tests.filter(t => t.status === "active").length} активных</span>
          <span>•</span>
          <span>{tests.filter(t => t.status === "completed").length} завершено</span>
          <span>•</span>
          <span className="text-red-400">{tests.filter(t => t.status === "missed").length} пропущено</span>
        </div>
      </div>

      {/* Список тестов */}
      <div className="space-y-4">
        {filteredTests.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Тесты не найдены
            </h3>
            <p className="text-gray-500">
              {searchQuery || selectedFilter !== "all" 
                ? "Попробуйте изменить параметры поиска или фильтры"
                : "Ожидайте назначения тестов от преподавателей"
              }
            </p>
          </div>
        ) : (
          filteredTests.map((test) => (
            <ActivityCard
              key={test.id}
              icon={getStatusIcon(test.status)}
              title={test.title}
              description={test.description}
              date={`${formatDate(test.startDate)} - ${formatDate(test.endDate)}`}
              status={test.score ? `${getStatusText(test.status)} • ${test.score}/${test.maxScore}` : getStatusText(test.status)}
              color={getTestTypeColor(test.type)}
              onClick={() => test.status === "active" ? handleStartTest(test.id) : handleViewResults(test.id)}
              metadata={[
                { label: "Предмет", value: test.subject, icon: <AcademicCapIcon className="h-4 w-4" /> },
                { label: "Тип", value: getTestTypeText(test.type), icon: <DocumentCheckIcon className="h-4 w-4" /> },
                { label: "Время", value: formatDuration(test.duration), icon: <ClockIcon className="h-4 w-4" /> },
                { label: "Вопросы", value: `${test.totalQuestions}`, icon: <ChartBarIcon className="h-4 w-4" /> },
                { label: "Преподаватель", value: test.instructor, icon: <UserGroupIcon className="h-4 w-4" /> }
              ]}
              actions={
                test.status === "active" ? [
                  {
                    label: "Начать тест",
                    onClick: () => handleStartTest(test.id),
                    icon: <PlayIcon className="h-4 w-4" />
                  }
                ] : test.status === "completed" ? [
                  {
                    label: "Результаты",
                    onClick: () => handleViewResults(test.id),
                    icon: <EyeIcon className="h-4 w-4" />
                  }
                ] : []
              }
            />
          ))
        )}
      </div>
    </div>
  );
} 