"use client";
import React, { useState, useEffect, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { getTeacherSubjects, addStudentToSubject, removeStudentFromSubject } from '../../api/subjectApi';
import { postGrade, updateGrade, deleteGrade } from '../../api/gradeApi';
import { getUserSchedule } from '../../api/userApi';
import GradeModal from '../../components/modals/GradeModal';
import { toast } from 'react-toastify';
import { Dialog, Transition } from '@headlessui/react';
import EditGradeModal from '../../components/modals/EditGradeModal';
import AddStudentModal from '../../components/modals/AddStudentModal';
import ScheduleModal from '../../components/modals/ScheduleModal';
import {
  AcademicCapIcon,
  ChartBarIcon,
  BookOpenIcon,
  UsersIcon,
  BookmarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusCircleIcon,
  TrashIcon,
  PencilIcon,
  CalendarIcon,
  ClockIcon,
  BellIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showEditGradeModal, setShowEditGradeModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) fetchSubjects();
  }, [user]);

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTeacherSubjects(user.id, user.id);
      setSubjects(data);
    } catch (e) {
      setError('Ошибка загрузки предметов');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (studentId) => {
    if (!selectedSubject) return;
    try {
      await addStudentToSubject(selectedSubject.id, studentId, user.id);
      toast.success('Студент добавлен!');
      fetchSubjects();
    } catch (e) {
      toast.error('Ошибка добавления студента');
    }
    setShowAddStudentModal(false);
  };

  const handleRemoveStudent = async (studentId) => {
    if (!selectedSubject) return;
    try {
      await removeStudentFromSubject(selectedSubject.id, studentId, user.id);
      toast.success('Студент удалён!');
      fetchSubjects();
    } catch (e) {
      toast.error('Ошибка удаления студента');
    }
  };

  const handlePostGrade = async (studentId, value) => {
    if (!selectedSubject) return;
    try {
      await postGrade({ studentId, subjectId: selectedSubject.id, value, teacherId: user.id });
      toast.success('Оценка выставлена!');
      fetchSubjects();
    } catch (e) {
      toast.error('Ошибка выставления оценки');
    }
    setShowGradeModal(false);
  };

  const handleUpdateGrade = async (gradeId, value) => {
    try {
      await updateGrade(gradeId, { value });
      toast.success('Оценка обновлена!');
      fetchSubjects();
    } catch (e) {
      toast.error('Ошибка обновления оценки');
    }
    setShowEditGradeModal(false);
  };

  const handleDeleteGrade = async (gradeId) => {
    try {
      await deleteGrade(gradeId);
      toast.success('Оценка удалена!');
      fetchSubjects();
    } catch (e) {
      toast.error('Ошибка удаления оценки');
    }
  };

  const handleShowSchedule = async () => {
    try {
      const data = await getUserSchedule(user.id);
      setSchedule(data);
      setShowScheduleModal(true);
    } catch (e) {
      toast.error('Ошибка загрузки расписания');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2"><AcademicCapIcon className="h-7 w-7" /> Панель преподавателя</h2>
        <button onClick={handleShowSchedule} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"><CalendarIcon className="h-5 w-5" /> Расписание</button>
      </div>
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>}
      {loading ? <div>Загрузка...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <div key={subject.id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2">
                <BookOpenIcon className="h-6 w-6 text-blue-400" />
                <span className="font-semibold text-lg">{subject.name}</span>
              </div>
              <div className="text-sm text-gray-500 mb-2">{subject.description}</div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{subject.students.length} студентов</span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">{subject.grades?.length || 0} оценок</span>
              </div>
              <div className="flex gap-2 mb-2">
                <button onClick={() => { setSelectedSubject(subject); setShowAddStudentModal(true); }} className="bg-green-500 text-white px-2 py-1 rounded flex items-center gap-1 text-sm"><PlusCircleIcon className="h-4 w-4" /> Добавить студента</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left">Студент</th>
                      <th className="px-2 py-1 text-left">Оценка</th>
                      <th className="px-2 py-1 text-left">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subject.students.map(student => (
                      <tr key={student.id}>
                        <td className="px-2 py-1 whitespace-nowrap">{student.name}</td>
                        <td className="px-2 py-1 whitespace-nowrap">
                          {student.grades && student.grades.length > 0 ? (
                            <span>{student.grades.map(g => g.value).join(', ')}</span>
                          ) : (
                            <span className="text-gray-400">Нет</span>
                          )}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap flex gap-1">
                          <button onClick={() => { setSelectedSubject(subject); setSelectedGrade({ studentId: student.id }); setShowGradeModal(true); }} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Поставить</button>
                          <button onClick={() => handleRemoveStudent(student.id)} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Удалить</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Модалки */}
      {showAddStudentModal && (
        <AddStudentModal isOpen={showAddStudentModal} onClose={() => setShowAddStudentModal(false)} onAdd={handleAddStudent} />
      )}
      {showGradeModal && (
        <GradeModal isOpen={showGradeModal} onClose={() => setShowGradeModal(false)} onSave={(value) => handlePostGrade(selectedGrade.studentId, value)} />
      )}
      {showEditGradeModal && (
        <EditGradeModal isOpen={showEditGradeModal} onClose={() => setShowEditGradeModal(false)} grade={selectedGrade} onSave={handleUpdateGrade} />
      )}
      {showScheduleModal && (
        <ScheduleModal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} schedule={schedule} />
      )}
    </div>
  );
} 