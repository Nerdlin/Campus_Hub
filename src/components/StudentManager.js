import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

const StudentManager = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectStudents, setSubjectStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingSubjectStudents, setLoadingSubjectStudents] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { fetchSubjects(); fetchStudents(); }, []);
  useEffect(() => { if (selectedSubject) { fetchSubjectStudents(); } }, [selectedSubject]);

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:4000/api/subjects');
      setSubjects(response.data);
    } catch (error) {
      setError('Не удалось загрузить список предметов.');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:4000/api/users');
      setStudents(response.data.filter(u => u.role === 'student'));
    } catch (error) {
      setError('Не удалось загрузить список студентов.');
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchSubjectStudents = async () => {
    setLoadingSubjectStudents(true);
    setError(null);
    try {
      const subject = subjects.find(s => s.id === selectedSubject);
      if (subject) {
        const studentDetails = await Promise.all(
          subject.students.map(async (studentId) => {
            try {
              const response = await axios.get(`http://localhost:4000/api/users/${studentId}`);
              return response.data;
            } catch (err) {
              return null;
            }
          })
        );
        setSubjectStudents(studentDetails.filter(s => s !== null));
      }
    } catch (error) {
      setError('Не удалось загрузить список студентов для предмета.');
      setSubjectStudents([]);
    } finally {
      setLoadingSubjectStudents(false);
    }
  };

  const handleAddStudent = async (studentId) => {
    setError(null);
    try {
      await axios.post(`http://localhost:4000/api/subjects/${selectedSubject}/students`, { studentId, userId: user.id });
      fetchSubjectStudents();
      setIsModalOpen(false);
    } catch (error) {
      setError(`Не удалось добавить студента: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student from the subject?')) return;
    setError(null);
    try {
      await axios.delete(`http://localhost:4000/api/subjects/${selectedSubject}/students/${studentId}`);
      fetchSubjectStudents();
    } catch (error) {
      setError(`Не удалось удалить студента: ${error.response?.data?.error || error.message}`);
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
        <h2 className="text-2xl font-bold">Student Management</h2>
        <button onClick={() => { setIsModalOpen(true); setError(null); }} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" disabled={!selectedSubject}>Add Student</button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Subject</label>
        {loadingSubjects ? (
          <p>Loading subjects...</p>
        ) : (
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
        )}
      </div>
      {selectedSubject && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loadingSubjectStudents ? (
            <p className="p-4">Loading students...</p>
          ) : subjectStudents.length === 0 ? (
            <p className="p-4">No students in this subject.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjectStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleRemoveStudent(student.id)} className="text-red-500 hover:text-red-600">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Student to Subject</h3>
            <div className="space-y-4">
              {loadingStudents ? (
                <p>Loading students...</p>
              ) : (
                <ul>
                  {students.map((student) => (
                    <li key={student.id} className="flex items-center justify-between py-2">
                      <span>{student.name} ({student.email})</span>
                      <button onClick={() => handleAddStudent(student.id)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Add</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => { setIsModalOpen(false); setError(null); }} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManager; 