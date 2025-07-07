import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GradeManager = ({ currentUser }) => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ studentId: '', subjectId: '', value: '' });
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('student');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchGrades();
    fetchStudents();
    fetchSubjects();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:4000/api/grades');
      setGrades(response.data);
    } catch (e) {
      setError('Не удалось загрузить оценки.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/users');
      setStudents(response.data.filter(u => u.role === 'student'));
    } catch (e) {
      setStudents([]);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/subjects');
      setSubjects(response.data);
    } catch (e) {
      setSubjects([]);
    }
  };

  const openCreateModal = () => {
    setForm({ studentId: '', subjectId: '', value: '' });
    setEditMode(false);
    setModalOpen(true);
  };

  const openEditModal = (grade) => {
    setForm({ studentId: grade.studentId, subjectId: grade.subjectId, value: grade.value });
    setEditingId(grade.id);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editMode) {
        await axios.put(`http://localhost:4000/api/grades/${editingId}`, form);
      } else {
        await axios.post('http://localhost:4000/api/grades', form);
      }
      setModalOpen(false);
      fetchGrades();
    } catch (e) {
      setError('Ошибка при сохранении оценки.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить эту оценку?')) return;
    setDeletingId(id);
    setError(null);
    try {
      await axios.delete(`http://localhost:4000/api/grades/${id}`);
      fetchGrades();
    } catch (e) {
      setError('Ошибка при удалении оценки.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredGrades = grades.filter(grade => {
    const student = students.find(s => s.id === grade.studentId)?.name || '';
    const subject = subjects.find(s => s.id === grade.subjectId)?.name || '';
    return (
      student.toLowerCase().includes(search.toLowerCase()) ||
      subject.toLowerCase().includes(search.toLowerCase())
    );
  });

  const sortedGrades = [...filteredGrades].sort((a, b) => {
    let valA, valB;
    if (sortBy === 'student') {
      valA = (students.find(s => s.id === a.studentId)?.name || '').toLowerCase();
      valB = (students.find(s => s.id === b.studentId)?.name || '').toLowerCase();
    } else if (sortBy === 'subject') {
      valA = (subjects.find(s => s.id === a.subjectId)?.name || '').toLowerCase();
      valB = (subjects.find(s => s.id === b.subjectId)?.name || '').toLowerCase();
    } else {
      valA = '';
      valB = '';
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedGrades.length / pageSize);
  const paginatedGrades = sortedGrades.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-2 items-center mb-4">
        <input
          type="text"
          placeholder="Поиск по студенту или предмету..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 px-2 py-1"
        />
        <button onClick={openCreateModal} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Добавить оценку</button>
      </div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">{error}</div>}
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => {
                if (sortBy === 'student') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                setSortBy('student');
              }}>
                Студент {sortBy === 'student' && (sortDir === 'asc' ? '▲' : '▼')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => {
                if (sortBy === 'subject') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                setSortBy('subject');
              }}>
                Предмет {sortBy === 'subject' && (sortDir === 'asc' ? '▲' : '▼')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Оценка</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedGrades.map(grade => (
              <tr key={grade.id}>
                <td className="px-6 py-4 whitespace-nowrap">{students.find(s => s.id === grade.studentId)?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{subjects.find(s => s.id === grade.subjectId)?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{grade.value}</td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded" onClick={() => openEditModal(grade)}>Редактировать</button>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" onClick={() => handleDelete(grade.id)} disabled={deletingId === grade.id}>{deletingId === grade.id ? 'Удаление...' : 'Удалить'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editMode ? 'Редактировать оценку' : 'Добавить оценку'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Студент</label>
                <select value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                  <option value="">Выберите студента</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>
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
                <label className="block text-sm font-medium text-gray-700">Оценка</label>
                <input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
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

export default GradeManager; 