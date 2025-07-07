"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { userApi, gradeApi } from '@/lib/api';
import SectionTitle from '@/components/ui/SectionTitle';
import ProgressBar from '@/components/ui/ProgressBar';
import ActivityCard from '@/components/ui/ActivityCard';
import ScheduleCard from '@/components/ui/ScheduleCard';
import { AcademicCapIcon, CalendarIcon, BookOpenIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import '@/styles/hide-scrollbar.css';

interface Grade {
  id: string;
  subject: string;
  value: number;
  type: string;
  date: string;
  completed?: boolean;
}

interface ScheduleItem {
  id: string;
  subject: string;
  time: string;
  location: string;
  type: string;
  date: string;
}

const quickActions = [
  { label: 'Журнал оценок', icon: <AcademicCapIcon className="w-5 h-5" />, href: '/grades', color: '#2563eb' },
  { label: 'Расписание занятий', icon: <CalendarIcon className="w-5 h-5" />, href: '/schedule', color: '#22c55e' },
  { label: 'Учебные материалы', icon: <BookOpenIcon className="w-5 h-5" />, href: '/materials', color: '#eab308' },
  { label: 'Задания', icon: <CheckCircleIcon className="w-5 h-5" />, href: '/tasks', color: '#7c3aed' },
];

const activityMock = [
  { icon: <AcademicCapIcon className="w-5 h-5" />, title: 'Получена оценка', description: 'Отлично (5) за лабораторную работу №3 по React', time: '2 часа назад', color: '#22c55e' },
  { icon: <CheckCircleIcon className="w-5 h-5" />, title: 'Новое задание', description: 'Курсовая работа по информационным системам', time: '5 часов назад', color: '#eab308' },
  { icon: <BookOpenIcon className="w-5 h-5" />, title: 'Загружены материалы', description: 'Лекция 15: Нормализация баз данных', time: '1 день назад', color: '#2563eb' },
];

const scheduleMock = [
  { time: '12:00 – 13:30', title: 'Базы данных', type: 'лекция', location: 'Ауд. 205', teacher: 'проф. Иванов А.И.', status: 'Завершено', color: '#2563eb' },
  { time: '14:00 – 15:30', title: 'Веб-программирование', type: 'лаб', location: 'Комп. класс 1', teacher: 'ст. пр. Сидоров М.Н.', status: 'Предстоит', color: '#eab308' },
  { time: '16:00 – 17:30', title: 'Математический анализ', type: 'семинар', location: 'Ауд. 301', teacher: 'доц. Петров В.С.', status: 'Предстоит', color: '#22c55e' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          const [gradesData, scheduleData] = await Promise.all([
            gradeApi.getGrades(user.id),
            userApi.getUserSchedule(user.id)
          ]);
          setGrades(Array.isArray(gradesData) ? gradesData : []);
          setSchedule(Array.isArray(scheduleData) ? scheduleData : []);
        } catch (error) {
          setGrades([]);
          setSchedule([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setGrades([]);
        setSchedule([]);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Метрики
  const gpa = grades.length ? (grades.reduce((acc, g) => acc + (g.value || 0), 0) / grades.length).toFixed(2) : '0.00';
  const attendance = user?.attendanceRate || 95;
  const assignmentsDone = grades.filter(g => g.type === 'assignment' && g.completed).length;
  const credits = 145; // TODO: из user/grades

  return (
    <div className="space-y-8">
      {/* Приветствие и аналитика */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Добро пожаловать, <span className="text-red-400">{user?.name}!</span></h1>
          <div className="text-gray-400 text-lg">Студент · {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#232834] rounded-xl px-6 py-4 flex flex-col items-center">
            <div className="text-2xl font-bold">22°C</div>
            <div className="text-gray-400 text-sm">Алматы</div>
          </div>
        </div>
      </div>

      {/* Карточки метрик */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#232834] rounded-xl p-6 flex flex-col gap-2 min-w-0">
          <div className="text-gray-400 text-sm truncate">Средний балл (GPA)</div>
          <div className="text-3xl font-bold truncate">{gpa}</div>
          <div className="w-full max-w-full overflow-hidden">
            <ProgressBar percent={parseFloat(gpa) * 25} color="#2563eb" label="GPA" />
          </div>
        </div>
        <div className="bg-[#232834] rounded-xl p-6 flex flex-col gap-2 min-w-0">
          <div className="text-gray-400 text-sm truncate">Посещаемость</div>
          <div className="text-3xl font-bold truncate">{attendance}%</div>
          <div className="w-full max-w-full overflow-hidden">
            <ProgressBar percent={attendance} color="#a21caf" label="Attendance" />
          </div>
        </div>
        <div className="bg-[#232834] rounded-xl p-6 flex flex-col gap-2 min-w-0">
          <div className="text-gray-400 text-sm truncate">Выполненные задания</div>
          <div className="text-3xl font-bold truncate">{assignmentsDone}</div>
          <div className="w-full max-w-full overflow-hidden">
            <ProgressBar percent={assignmentsDone * 10} color="#22c55e" label="Assignments" />
          </div>
        </div>
        <div className="bg-[#232834] rounded-xl p-6 flex flex-col gap-2 min-w-0">
          <div className="text-gray-400 text-sm truncate">Кредиты ECTS</div>
          <div className="text-3xl font-bold truncate">{credits}</div>
          <div className="w-full max-w-full overflow-hidden">
            <ProgressBar percent={Math.min(credits / 2.4, 100)} color="#eab308" label="ECTS" />
          </div>
        </div>
      </div>

      {/* Быстрые действия и расписание на сегодня */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <SectionTitle>Быстрые действия</SectionTitle>
          <div className="flex flex-wrap gap-4">
            {quickActions.map(action => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
                style={{ background: action.color }}
              >
                {action.icon}
                {action.label}
              </a>
            ))}
          </div>
          <SectionTitle>Последняя активность</SectionTitle>
          <div className="bg-[#232834] rounded-xl p-4 space-y-2">
            {activityMock.map((a, i) => (
              <ActivityCard key={i} {...a} />
            ))}
          </div>
        </div>
        <div>
          <SectionTitle>Расписание на сегодня</SectionTitle>
          <div className="bg-[#232834] rounded-xl p-4 space-y-4">
            {scheduleMock.map((s, i) => (
              <ScheduleCard key={i} {...s} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 