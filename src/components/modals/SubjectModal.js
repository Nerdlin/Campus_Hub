import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const SubjectModal = ({ isOpen, onClose, subjectToEdit, teachers, onSave }) => {
  const { t } = useTranslation();
  const [subjectData, setSubjectData] = useState({
    name: '',
    description: '',
    teacherId: '',
  });

  useEffect(() => {
    if (subjectToEdit) {
      setSubjectData({
        name: subjectToEdit.name || '',
        description: subjectToEdit.description || '',
        teacherId: subjectToEdit.teacherId || '',
      });
    } else {
      setSubjectData({
        name: '',
        description: '',
        teacherId: '',
      });
    }
  }, [subjectToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSubjectData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(subjectData);
  };

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
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  {subjectToEdit ? t('Edit Subject') : t('Add Subject')}
                </Dialog.Title>
                <div className="mt-2">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('Subject Name')}</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={subjectData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('Description')}</label>
                      <textarea
                        name="description"
                        id="description"
                        value={subjectData.description}
                        onChange={handleInputChange}
                        required
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                       <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700">{t('Teacher')}</label>
                        <select
                            name="teacherId"
                            id="teacherId"
                            value={subjectData.teacherId}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            <option value="">{t('Select Teacher')}</option>
                            {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={onClose}
                      >
                        {t('Cancel')}
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        {subjectToEdit ? t('Save Changes') : t('Add Subject')}
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

export default SubjectModal; 