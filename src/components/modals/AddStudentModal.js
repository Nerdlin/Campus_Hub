import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getUsers } from '../../api/userApi'; // Assuming getUsers API is available

const AddStudentModal = ({ isOpen, onClose, subject, onAddStudent }) => {
  const { t } = useTranslation();
  const [allStudents, setAllStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchStudents = async () => {
        setLoading(true);
        try {
          // Fetch all users and filter for students not already in the current subject
          const users = await getUsers();
          const studentsNotInSubject = users.filter(
            user => user.role === 'student' && !subject?.students.some(s => s.id === user.id)
          );
          setAllStudents(studentsNotInSubject);
        } catch (error) {
          console.error('Error fetching students:', error);
          // Handle error
        } finally {
          setLoading(false);
        }
      };
      fetchStudents();
    } else {
      // Reset state when modal is closed
      setSearchTerm('');
      setSelectedStudentId('');
      setAllStudents([]);
    }
  }, [isOpen, subject]); // Re-fetch when modal opens or subject changes

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStudentSelect = (e) => {
    setSelectedStudentId(e.target.value);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !subject) return;

    setAdding(true);
    try {
      await onAddStudent(subject.id, selectedStudentId);
      // onClose(); // Parent component should close modal on success
    } catch (error) {
      console.error('Error adding student:', error);
      // Handle error (e.g., show toast)
    } finally {
      setAdding(false);
    }
  };

  // Filter students based on search term
  const filteredStudents = allStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center">
                  {t('Add Student to {{subjectName}}', { subjectName: subject?.name })}
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </Dialog.Title>
                <div className="mt-4">
                  <form onSubmit={handleAddStudent} className="space-y-4">
                    <div>
                      <label htmlFor="student-search" className="block text-sm font-medium text-gray-700">{t('Search Students')}</label>
                      <input
                        type="text"
                        id="student-search"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder={t('Search by name or email')}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        disabled={loading || adding}
                      />
                    </div>

                    {loading ? (
                      <p>{t('Loading students...')}</p>
                    ) : filteredStudents.length > 0 ? (
                      <div>
                        <label htmlFor="student-select" className="block text-sm font-medium text-gray-700">{t('Select Student')}</label>
                        <select
                          id="student-select"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          value={selectedStudentId}
                          onChange={handleStudentSelect}
                          required
                          disabled={adding}
                        >
                          <option value="">{t('-- Select a student --')}</option>
                          {filteredStudents.map(student => (
                            <option key={student.id} value={student.id}>
                              {student.name} ({student.email})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (searchTerm ? (
                      <p className="text-sm text-gray-500">{t('No students found matching your search.')}</p>
                    ) : (
                      <p className="text-sm text-gray-500">{t('No students available to add to this subject.')}</p>
                    ))
                    }

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={onClose}
                        disabled={adding}
                      >
                        {t('Cancel')}
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!selectedStudentId || adding}
                      >
                        {adding ? t('Adding...') : t('Add Student')}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddStudentModal; 