import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import {
  UserGroupIcon,
  EyeIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const PrivacySettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    profileVisibility: 'public', // public, friends, private
    showOnlineStatus: true,
    showLastSeen: true,
    allowFriendRequests: true,
    allowMessages: true,
  });
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();

  const handleSave = () => {
    // Mock save
    setSuccess(true);
    setTimeout(() => {
      onClose();
      setSuccess(false);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className={`relative rounded-lg shadow-xl max-w-md w-full mx-auto p-6 z-10 transition-colors duration-300 ${document.documentElement.classList.contains('dark') ? 'bg-slate-800 text-slate-100' : 'bg-white text-gray-900'}`}>
          <Dialog.Title className="text-lg font-bold mb-4">{t('Privacy Settings')}</Dialog.Title>
          {success ? (
            <div className="text-green-600 text-center py-4">{t('Settings saved successfully')}</div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t('Profile Visibility')}</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="public"
                      name="profileVisibility"
                      value="public"
                      checked={settings.profileVisibility === 'public'}
                      onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
                      className="h-4 w-4 text-primary-600"
                    />
                    <label htmlFor="public" className="ml-2 flex items-center">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-2" />
                      {t('Public')}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="friends"
                      name="profileVisibility"
                      value="friends"
                      checked={settings.profileVisibility === 'friends'}
                      onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
                      className="h-4 w-4 text-primary-600"
                    />
                    <label htmlFor="friends" className="ml-2 flex items-center">
                      <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
                      {t('Friends Only')}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="private"
                      name="profileVisibility"
                      value="private"
                      checked={settings.profileVisibility === 'private'}
                      onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
                      className="h-4 w-4 text-primary-600"
                    />
                    <label htmlFor="private" className="ml-2 flex items-center">
                      <EyeIcon className="h-5 w-5 text-gray-400 mr-2" />
                      {t('Private')}
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <EyeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium">{t('Show Online Status')}</p>
                      <p className="text-xs text-gray-500">{t('Let others see when you are online')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, showOnlineStatus: !settings.showOnlineStatus })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.showOnlineStatus ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <EyeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium">{t('Show Last Seen')}</p>
                      <p className="text-xs text-gray-500">{t('Let others see when you were last active')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, showLastSeen: !settings.showLastSeen })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.showLastSeen ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.showLastSeen ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium">{t('Allow Friend Requests')}</p>
                      <p className="text-xs text-gray-500">{t('Let others send you friend requests')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, allowFriendRequests: !settings.allowFriendRequests })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.allowFriendRequests ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.allowFriendRequests ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium">{t('Allow Messages')}</p>
                      <p className="text-xs text-gray-500">{t('Let others send you messages')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, allowMessages: !settings.allowMessages })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.allowMessages ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.allowMessages ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-slate-200"
                >
                  {t('Cancel')}
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded bg-accent-500 text-white hover:bg-accent-600 dark:bg-primary-600 dark:hover:bg-primary-700"
                >
                  {t('Save Changes')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default PrivacySettingsModal; 