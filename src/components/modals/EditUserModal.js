import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';

const EditUserModal = ({ isOpen, onClose, user, onSave }) => {
  const { t } = useTranslation();
  const [editData, setEditData] = useState({ name: '', email: '', password: '' }); // Добавляем password для демонстрации
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEditData({ name: user.name || '', email: user.email || '', password: '' }); // Не предзаполняем пароль
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(user.id, editData);
      // onClose(); // Закрываем модалку после сохранения
    } catch (error) {
      console.error('Error saving user:', error);
      // Обработка ошибки
    } finally {
      setSaving(false);
    }
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
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center">
                  {t('Edit User')}
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </Dialog.Title>
                <div className="mt-4">
                  <form onSubmit={handleSave} className="space-y-4">
                    <div>
                      <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">{t('Name')}</label>
                      <input
                        type="text"
                        name="name"
                        id="edit-name"
                        value={editData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        disabled={saving}
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        id="edit-email"
                        value={editData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        disabled={saving}
                      />
                    </div>
                    {/* Добавьте другие поля для редактирования по мере необходимости (например, роль) */}

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={onClose}
                        disabled={saving}
                      >
                        {t('Cancel')}
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={saving}
                      >
                        {saving ? t('Saving...') : t('Save Changes')}
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

export default EditUserModal; 