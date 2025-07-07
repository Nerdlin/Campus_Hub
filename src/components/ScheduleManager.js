import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ScheduleManager = ({ currentUser }) => {
  const [schedules, setSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ subjectId: '', teacherId: '', day: '', time: '' });
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('subject');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchSchedules();
    fetchSubjects();
    fetchTeachers();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:4000/api/schedules');
      setSchedules(response.data);
    } catch (e) {
      setError('Не удалось загрузить расписание.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/subjects', {
        params: { requestingUserId: currentUser?.id },
      });
      setSubjects(response.data);
    } catch (e) {
      setSubjects([]);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/users');
      setTeachers(response.data.filter(u => u.role === 'teacher'));
    } catch (e) {
      setTeachers([]);
    }
  };

  const openCreateModal = () => {
    setForm({ subjectId: '', teacherId: '', day: '', time: '' });
    setEditMode(false);
    setModalOpen(true);
  };

  const openEditModal = (schedule) => {
    setForm({ subjectId: schedule.subjectId, teacherId: schedule.teacherId, day: schedule.day, time: schedule.time });
    setEditingId(schedule.id);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editMode) {
        await axios.put(`http://localhost:4000/api/schedules/${editingId}`, form);
      } else {
        await axios.post('http://localhost:4000/api/schedules', form);
      }
      setModalOpen(false);
      fetchSchedules();
    } catch (e) {
      setError('Ошибка при сохранении расписания.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить это расписание?')) return;
    setDeletingId(id);
    setError(null);
    try {
      await axios.delete(`http://localhost:4000/api/schedules/${id}`);
      fetchSchedules();
    } catch (e) {
      setError('Ошибка при удалении расписания.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const subject = subjects.find(s => s.id === schedule.subjectId)?.name || '';
    const teacher = teachers.find(t => t.id === schedule.teacherId)?.name || '';
    return (
      subject.toLowerCase().includes(search.toLowerCase()) ||
      teacher.toLowerCase().includes(search.toLowerCase()) ||
      (schedule.day || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    let valA, valB;
    if (sortBy === 'subject') {
      valA = (subjects.find(s => s.id === a.subjectId)?.name || '').toLowerCase();
      valB = (subjects.find(s => s.id === b.subjectId)?.name || '').toLowerCase();
    } else if (sortBy === 'teacher') {
      valA = (teachers.find(t => t.id === a.teacherId)?.name || '').toLowerCase();
      valB = (teachers.find(t => t.id === b.teacherId)?.name || '').toLowerCase();
    } else if (sortBy === 'day') {
      valA = (a.day || '').toLowerCase();
      valB = (b.day || '').toLowerCase();
    } else {
      valA = '';
      valB = '';
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedSchedules.length / pageSize);
  const paginatedSchedules = sortedSchedules.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-2 items-center mb-4">
        <input
          type="text"
          placeholder="Поиск по предмету, преподавателю или дню..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 px-2 py-1"
        />
        <button onClick={openCreateModal} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Добавить расписание</button>
      </div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">{error}</div>}
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => {
                if (sortBy === 'subject') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                setSortBy('subject');
              }}>
                Предмет {sortBy === 'subject' && (sortDir === 'asc' ? '▲' : '▼')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => {
                if (sortBy === 'teacher') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                setSortBy('teacher');
              }}>
                Преподаватель {sortBy === 'teacher' && (sortDir === 'asc' ? '▲' : '▼')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => {
                if (sortBy === 'day') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                setSortBy('day');
              }}>
                День {sortBy === 'day' && (sortDir === 'asc' ? '▲' : '▼')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Время</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedSchedules.map(schedule => (
              <tr key={schedule.id}>
                <td className="px-6 py-4 whitespace-nowrap">{subjects.find(s => s.id === schedule.subjectId)?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{teachers.find(t => t.id === schedule.teacherId)?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{schedule.day}</td>
                <td className="px-6 py-4 whitespace-nowrap">{schedule.time}</td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded" onClick={() => openEditModal(schedule)}>Редактировать</button>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" onClick={() => handleDelete(schedule.id)} disabled={deletingId === schedule.id}>{deletingId === schedule.id ? 'Удаление...' : 'Удалить'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editMode ? 'Редактировать расписание' : 'Добавить расписание'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Предмет</label>
                <select value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                  <option value="">Выберите предмет</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Преподаватель</label>
                <select value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                  <option value="">Выберите преподавателя</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">День</label>
                <input type="text" value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Время</label>
                <input type="text" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Отмена</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="flex justify-center gap-2 mt-4">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50">Назад</button>
        <span>Страница {page} из {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50">Вперёд</button>
      </div>
    </div>
  );
};

export default ScheduleManager; 