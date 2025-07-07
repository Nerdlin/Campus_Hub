"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { userApi } from '@/lib/api';
import PrivateRoute from '@/components/PrivateRoute';

export default function Profile() {
  return (
    <PrivateRoute>
      <ProfileContent />
    </PrivateRoute>
  );
}

function ProfileContent() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [editMajor, setEditMajor] = useState(user?.major || '');
  const [editYear, setEditYear] = useState(user?.year || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');
  const [editBanner, setEditBanner] = useState(user?.banner || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const studentInfo = user
    ? {
        name: user.name || 'Student',
        studentId: '2023001',
        major: 'Computer Science',
        year: '3rd Year',
        email: user.email,
        phone: '+1 (555) 123-4567',
        address: '123 University Ave, Campus City',
        gpa: '3.8',
        credits: '85',
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      }
    : {
        name: 'Student',
        studentId: '2023001',
        major: 'Computer Science',
        year: '3rd Year',
        email: 'student@university.edu',
        phone: '+1 (555) 123-4567',
        address: '123 University Ave, Campus City',
        gpa: '3.8',
        credits: '85',
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
      setEditPhone(user.phone || '');
      setEditAddress(user.address || '');
      setEditMajor(user.major || '');
      setEditYear(user.year || '');
      setEditAvatar(user.avatar || '');
      setEditBanner(user.banner || '');
    }
  }, [user]);

  const handleEdit = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditPhone(user?.phone || '');
    setEditAddress(user?.address || '');
    setEditMajor(user?.major || '');
    setEditYear(user?.year || '');
    setEditAvatar(user?.avatar || '');
    setEditBanner(user?.banner || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const updatedUser = {
        ...user,
        name: editName,
        email: editEmail,
        phone: editPhone,
        address: editAddress,
        major: editMajor,
        year: editYear,
        avatar: editAvatar,
        banner: editBanner,
      };
      const response = await userApi.updateUser(user.id, updatedUser);
      updateProfile(response);
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setError(`Не удалось сохранить профиль: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  if (!user) {
    return <p>Loading user data...</p>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Profile Header */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="relative h-56 bg-gradient-to-r from-blue-600 to-blue-400">
          {editBanner && (
            <img
              src={editBanner}
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={editAvatar || studentInfo.avatar}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-4 border-white"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer">
                    <PhotoIcon className="w-4 h-4" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Handle file upload
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setEditAvatar(e.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">{isEditing ? editName : studentInfo.name}</h1>
                <p className="text-blue-100">{studentInfo.major} • {studentInfo.year}</p>
              </div>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="absolute top-4 right-4 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Личная информация
            </h2>
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-sm rounded-md">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Имя
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{studentInfo.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{studentInfo.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Телефон
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{studentInfo.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Адрес
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{studentInfo.address}</p>
                )}
              </div>
            </div>
            {isEditing && (
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Отмена
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Academic Information */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Академическая информация
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <AcademicCapIcon className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Средний балл (GPA)</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{studentInfo.gpa}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <BuildingLibraryIcon className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Кредиты ECTS</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{studentInfo.credits}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <UserCircleIcon className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Студенческий ID</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{studentInfo.studentId}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 