import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

export default function AdminPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [creatingTeacher, setCreatingTeacher] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchTeachers();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:4000/api/admin/stats', { params: { userId: user.id } });
      setStats(response.data);
    } catch (error) {
      setError('Не удалось загрузить статистику.');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:4000/api/users');
      setTeachers(response.data.filter(u => u.role === 'teacher'));
    } catch (error) {
      setError('Не удалось загрузить список преподавателей.');
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setCreatingTeacher(true);
    setError(null);
    try {
      await axios.post('http://localhost:4000/api/admin/create-teacher', { ...formData, userId: user.id });
      fetchTeachers();
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '' });
    } catch (error) {
      setError(`Не удалось создать преподавателя: ${error.response?.data?.error || error.message}`);
    } finally {
      setCreatingTeacher(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg onClick={() => setError(null)} className="fill-current h-6 w-6 text-red-500 cursor-pointer" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15L6.306 6.053a1.2 1.2 0 1 1 1.697-1.697l2.757 3.152 2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 3.03 2.651a1.2 1.2 0 0 1 0 1.697z"/></svg>
          </span>
        </div>
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <button
          onClick={() => { setIsModalOpen(true); setError(null); }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={creatingTeacher}
        >
          {creatingTeacher ? 'Creating...' : 'Create Teacher'}
        </button>
      </div>
      {loadingStats ? (
        <p>Loading stats...</p>
      ) : stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-600">Total Students</h3>
            <p className="text-3xl font-bold">{stats.totalStudents}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-600">Total Teachers</h3>
            <p className="text-3xl font-bold">{stats.totalTeachers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-600">Total Subjects</h3>
            <p className="text-3xl font-bold">{stats.totalSubjects}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-600">Average GPA</h3>
            <p className="text-3xl font-bold">{stats.averageGPA.toFixed(2)}</p>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Top Students</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GPA</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats?.topStudents.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.gpa.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Teachers</h3>
        </div>
        {loadingTeachers ? (
          <p className="p-4">Loading teachers...</p>
        ) : teachers.length === 0 ? (
          <p className="p-4">No teachers found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{teacher.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{teacher.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{teacher.subjects?.length || 0} subjects</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New Teacher</h3>
            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setError(null); }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={creatingTeacher}
                >
                  {creatingTeacher ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 