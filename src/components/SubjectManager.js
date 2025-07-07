import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

const SubjectManager = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:4000/api/subjects');
      setSubjects(response.data);
    } catch (error) {
      setError('Не удалось загрузить список предметов.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingSubject) {
        await axios.put(`http://localhost:4000/api/subjects/${editingSubject.id}`, { ...formData, userId: user.id });
      } else {
        await axios.post('http://localhost:4000/api/subjects', { ...formData, teacherId: user.id });
      }
      fetchSubjects();
      setIsModalOpen(false);
      setEditingSubject(null);
      setFormData({ name: '', description: '' });
    } catch (error) {
      setError(`Не удалось сохранить предмет: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({ name: subject.name, description: subject.description });
    setIsModalOpen(true);
  };

  const handleDelete = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    setError(null);
    try {
      await axios.delete(`http://localhost:4000/api/subjects/${subjectId}`);
      fetchSubjects();
    } catch (error) {
      setError(`Не удалось удалить предмет: ${error.response?.data?.error || error.message}`);
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
        <h2 className="text-2xl font-bold">Subjects Management</h2>
        <button
          onClick={() => { setEditingSubject(null); setFormData({ name: '', description: '' }); setIsModalOpen(true); setError(null); }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Subject
        </button>
      </div>
      {loading ? (
        <p>Loading subjects...</p>
      ) : subjects.length === 0 ? (
        <p>No subjects found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div key={subject.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold">{subject.name}</h3>
              <p className="text-gray-600 mt-2">{subject.description}</p>
              <div className="mt-4 flex space-x-2">
                <button onClick={() => handleEdit(subject)} className="text-blue-500 hover:text-blue-600">Edit</button>
                <button onClick={() => handleDelete(subject.id)} className="text-red-500 hover:text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingSubject ? 'Edit Subject' : 'Add Subject'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" rows="3" />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => { setIsModalOpen(false); setError(null); }} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">{editingSubject ? 'Save Changes' : 'Add Subject'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManager; 