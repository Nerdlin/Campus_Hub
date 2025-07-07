"use client";
import React, { useState, useEffect } from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { gradeApi } from '@/lib/api';
import PrivateRoute from '@/components/PrivateRoute';
import SectionTitle from '@/components/ui/SectionTitle';
import SubjectCard from '@/components/ui/SubjectCard';
import ProgressBar from '@/components/ui/ProgressBar';
import FilterBar from '@/components/ui/FilterBar';
import ModernModal from "@/components/ui/ModernModal";

interface Grade {
  id: string;
  subject: string;
  value: number;
  type: string;
  date: string;
  completed?: boolean;
}

export default function Grades() {
  return (
    <PrivateRoute>
      <GradesContent />
    </PrivateRoute>
  );
}

function GradesContent() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('Fall 2023');
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [editGrade, setEditGrade] = useState<Grade | null>(null);
  const [form, setForm] = useState({
    subject: '',
    value: '',
    type: '',
    date: new Date().toISOString().slice(0, 10)
  });

  const semesters = ['Fall 2023', 'Spring 2023', 'Fall 2022', 'Spring 2022'];

  useEffect(() => {
    const fetchGrades = async () => {
      if (user?.id) {
        try {
          const gradesData = await gradeApi.getGrades(user.id);
          setGrades(gradesData);
        } catch (error) {
          console.error('Error fetching grades:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchGrades();
  }, [user]);

  const handleOpenModal = (grade?: Grade) => {
    if (grade) {
      setEditGrade(grade);
      setForm({
        subject: grade.subject,
        value: grade.value.toString(),
        type: grade.type,
        date: grade.date
      });
    } else {
      setEditGrade(null);
      setForm({ subject: '', value: '', type: '', date: new Date().toISOString().slice(0, 10) });
    }
    setShowAddGrade(true);
  };

  const handleCloseModal = () => {
    setShowAddGrade(false);
    setEditGrade(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user?.id || !form.subject || !form.value || !form.type) return;
    try {
      if (editGrade) {
        await gradeApi.updateGrade(user.id, editGrade.id, {
          value: parseInt(form.value),
          type: form.type,
          date: form.date
        });
      } else {
        await gradeApi.postGrade(user.id, {
          subject: form.subject,
          value: parseInt(form.value),
          type: form.type,
          date: form.date
        });
      }
      const updatedGrades = await gradeApi.getGrades(user.id);
      setGrades(updatedGrades);
      handleCloseModal();
    } catch (error) {
      console.error('Error saving grade:', error);
    }
  };

  const handleDeleteGrade = async (gradeId: string) => {
    if (!user?.id) return;
    
    try {
      await gradeApi.deleteGrade(user.id, gradeId);
      const updatedGrades = await gradeApi.getGrades(user.id);
      setGrades(updatedGrades);
    } catch (error) {
      console.error('Error deleting grade:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <SectionTitle>
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-6 w-6" />
          <div>
            <div className="font-bold text-lg">Оценки</div>
            <div className="text-sm text-gray-400">Ваши академические достижения</div>
          </div>
        </div>
      </SectionTitle>
      {/* Кнопка добавить для teacher/admin */}
      {user && (user.role === 'teacher' || user.role === 'admin') && (
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => handleOpenModal()}
        >
          + Добавить оценку
        </button>
      )}
      <FilterBar
        filters={semesters.map(s => ({ label: s, value: s }))}
        value={selectedSemester}
        onChange={setSelectedSemester}
      />
      <div className="space-y-4">
        {grades.map((grade) => (
          <div key={grade.id} className="relative group">
            <div className="p-4 bg-[#232834] rounded-xl flex flex-col gap-1 shadow border-l-4 mb-2 border-blue-500">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white text-base">{grade.subject}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-900 text-blue-200">{grade.type}</span>
              </div>
              <div className="text-xs text-gray-400 mb-1">{grade.date}</div>
              <div className="text-lg text-white">{grade.value}</div>
            </div>
            {/* Кнопки редактировать/удалить для teacher/admin */}
            {user && (user.role === 'teacher' || user.role === 'admin') && (
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  className="px-2 py-1 bg-yellow-500 text-white rounded"
                  onClick={() => handleOpenModal(grade)}
                >
                  Редактировать
                </button>
                <button
                  className="px-2 py-1 bg-red-600 text-white rounded"
                  onClick={() => handleDeleteGrade(grade.id)}
                >
                  Удалить
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Модалка создания/редактирования */}
      <ModernModal open={showAddGrade} onClose={handleCloseModal} title={editGrade ? "Редактировать оценку" : "Новая оценка"}>
        <div className="space-y-4">
          <input
            name="subject"
            value={form.subject}
            onChange={handleFormChange}
            placeholder="Предмет"
            className="w-full p-2 rounded border"
          />
          <input
            name="value"
            type="number"
            value={form.value}
            onChange={handleFormChange}
            placeholder="Оценка"
            className="w-full p-2 rounded border"
          />
          <input
            name="type"
            value={form.type}
            onChange={handleFormChange}
            placeholder="Тип (экзамен, зачет и т.д.)"
            className="w-full p-2 rounded border"
          />
          <input
            name="date"
            type="date"
            value={form.date}
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