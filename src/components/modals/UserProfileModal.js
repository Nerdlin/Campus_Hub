import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
// Assuming you have an API function to get user details by ID
// import { getUserById } from '../api/userApi';

const UserProfileModal = ({ isOpen, onClose, userId }) => {
  const { t } = useTranslation();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // In a real app, fetch user data based on userId
  // For now, we can use mock data or a simple lookup if users array is available globally/via context

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setLoading(false);
        setUserProfile(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Replace with actual API call if available
        // const data = await getUserById(userId);

        // Mocking data fetch for now
        // In a real app, you'd fetch this from your backend
        const mockUsers = [
          { id: 'chatgpt', name: 'ChatGPT', avatar: 'https://cdn.openai.com/chatgpt/icon.png', role: 'bot', email: 'chatgpt@openai.com' },
          { id: 'user1', name: 'Nerdlin', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', role: 'student', email: 'nerdlin@example.com' },
          { id: 'user2', name: 'Test User', avatar: '', role: 'student', email: 'test@example.com' },
          // Add more mock users or use actual user data from context if available
        ];
        const data = mockUsers.find(u => u.id === userId);

        if (data) {
          setUserProfile(data);
        } else {
          setError(t('User not found'));
          setUserProfile(null);
        }
      } catch (err) {
        setError(t('Error fetching user profile:') + (err.message || 'Unknown Error'));
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
        fetchUserProfile();
    }

  }, [isOpen, userId]); // Fetch when modal opens or userId changes

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
                  {t('User Profile')}
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </Dialog.Title>
                <div className="mt-4">
                  {loading ? (
                    <p>{t('Loading...')}</p>
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : userProfile ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <img
                          className="h-16 w-16 rounded-full"
                          src={userProfile.avatar || 'https://via.placeholder.com/150'} // Default avatar
                          alt={userProfile.name}
                        />
                        <div>
                          <p className="text-xl font-semibold text-gray-900">{userProfile.name}</p>
                          <p className="text-sm text-gray-500">{userProfile.role}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{t('Email')}:</p>
                        <p className="mt-1 text-sm text-gray-900">{userProfile.email}</p>
                      </div>
                      {/* Add more profile details here as needed (e.g., subjects, grades, etc.) */}
                    </div>
                  ) : null}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default UserProfileModal; 