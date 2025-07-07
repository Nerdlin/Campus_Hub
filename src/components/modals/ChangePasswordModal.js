import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { LockClosedIcon } from '@heroicons/react/24/outline';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t('Please fill all fields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('Passwords do not match'));
      return;
    }

    // Mock password change
    setSuccess(true);
    setTimeout(() => {
      onClose();
      setSuccess(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className={`relative rounded-lg shadow-xl max-w-md w-full mx-auto p-6 z-10 transition-colors duration-300 ${document.documentElement.classList.contains('dark') ? 'bg-slate-800 text-slate-100' : 'bg-white text-gray-900'}`}>
          <Dialog.Title className="text-lg font-bold mb-4">{t('Change Password')}</Dialog.Title>
          {success ? (
            <div className="text-green-600 text-center py-4">{t('Password successfully changed')}</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              <div>
                <label className="block text-sm font-medium mb-1">{t('Current Password')}</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <LockClosedIcon className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    className="w-full border rounded-md px-10 py-2 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('New Password')}</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <LockClosedIcon className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    className="w-full border rounded-md px-10 py-2 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('Confirm New Password')}</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <LockClosedIcon className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    className="w-full border rounded-md px-10 py-2 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-slate-200"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-accent-500 text-white hover:bg-accent-600 dark:bg-primary-600 dark:hover:bg-primary-700"
                >
                  {t('Change Password')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default ChangePasswordModal; 