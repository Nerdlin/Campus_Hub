"use client";
import React, { useState, useRef } from "react";
import ChangePasswordModal from "@/components/modals/ChangePasswordModal";
import TwoFactorAuthModal from "@/components/modals/TwoFactorAuthModal";
import PrivacySettingsModal from "@/components/modals/PrivacySettingsModal";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from '../../hooks/useAuth';
import ProfileBanner from "@/components/ui/ProfileBanner";
import { BellIcon, GlobeAltIcon, LockClosedIcon, UserCircleIcon, PencilIcon } from "@heroicons/react/24/outline";
import { userApi } from "@/lib/api";

const LANGUAGES = [
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
];

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { theme } = useTheme();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('lang') || "ru");
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : { email: true, push: false };
  });
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return <div className="p-8 text-lg">Пожалуйста, войдите в систему для доступа к настройкам.</div>;

  // Сохранение профиля
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      let avatarUrl = profile.avatar;
      if (avatarFile) {
        // Загрузка аватара через userApi (или другой API)
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        // Предполагается, что API возвращает url
        const res = await userApi.updateUser(user.id, { avatar: avatarFile });
        avatarUrl = res.avatar || avatarUrl;
      }
      const updated = { ...profile, avatar: avatarUrl };
      await userApi.updateUser(user.id, updated);
      updateProfile(updated);
      setEditMode(false);
    } catch {
      alert('Ошибка сохранения профиля');
    } finally {
      setSaving(false);
    }
  };

  // Смена аватара
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfile((p) => ({ ...p, avatar: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Смена языка
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    localStorage.setItem('lang', e.target.value);
  };

  // Смена уведомлений
  const handleNotificationChange = (type: 'email' | 'push', value: boolean) => {
    const updated = { ...notifications, [type]: value };
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-[#232834] rounded-2xl shadow-2xl p-0 text-white overflow-hidden">
      {/* Профиль */}
      <div className="relative">
        <ProfileBanner
          avatar={profile.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(profile.name)}
          name={profile.name}
          status={user.role === 'admin' ? 'Администратор' : user.role === 'teacher' ? 'Преподаватель' : 'Студент'}
        />
        <button
          className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
          onClick={() => setEditMode((v) => !v)}
        >
          <PencilIcon className="h-5 w-5" />
        </button>
      </div>
      {editMode && (
        <div className="px-8 pb-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleAvatarChange}
              />
              <img
                src={profile.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(profile.name)}
                alt="avatar"
                className="w-16 h-16 rounded-full border-2 border-blue-400 object-cover cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              />
              <div>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  placeholder="Имя"
                />
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email"
                />
              </div>
            </div>
            <button
              className="bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600 transition self-end"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      )}
      <div className="divide-y divide-gray-700">
        {/* Тема */}
        <section className="flex items-center justify-between py-6 px-8">
          <div className="flex items-center gap-3">
            <UserCircleIcon className="h-6 w-6 text-blue-400" />
            <span className="font-medium">Тема интерфейса</span>
          </div>
          <ThemeToggle />
        </section>
        {/* Язык */}
        <section className="flex items-center justify-between py-6 px-8">
          <div className="flex items-center gap-3">
            <GlobeAltIcon className="h-6 w-6 text-green-400" />
            <span className="font-medium">Язык</span>
          </div>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </section>
        {/* Уведомления */}
        <section className="flex items-center justify-between py-6 px-8">
          <div className="flex items-center gap-3">
            <BellIcon className="h-6 w-6 text-yellow-400" />
            <span className="font-medium">Уведомления</span>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={e => handleNotificationChange('email', e.target.checked)}
                className="accent-blue-500"
              />
              <span className="text-sm">Email</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={e => handleNotificationChange('push', e.target.checked)}
                className="accent-blue-500"
              />
              <span className="text-sm">Push</span>
            </label>
          </div>
        </section>
        {/* Безопасность */}
        <section className="flex items-center justify-between py-6 px-8">
          <div className="flex items-center gap-3">
            <LockClosedIcon className="h-6 w-6 text-pink-400" />
            <span className="font-medium">Сменить пароль</span>
          </div>
          <button className="bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600 transition" onClick={() => setIsPasswordModalOpen(true)}>Изменить</button>
        </section>
        {/* 2FA */}
        <section className="flex items-center justify-between py-6 px-8">
          <div className="flex items-center gap-3">
            <LockClosedIcon className="h-6 w-6 text-purple-400" />
            <span className="font-medium">Двухфакторная аутентификация</span>
          </div>
          <button className="bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600 transition" onClick={() => setIs2FAModalOpen(true)}>Настроить</button>
        </section>
        {/* Приватность */}
        <section className="flex items-center justify-between py-6 px-8">
          <div className="flex items-center gap-3">
            <LockClosedIcon className="h-6 w-6 text-teal-400" />
            <span className="font-medium">Приватность</span>
          </div>
          <button className="bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600 transition" onClick={() => setIsPrivacyModalOpen(true)}>Настроить</button>
        </section>
      </div>
      {isPasswordModalOpen && <ChangePasswordModal isOpen={true} onClose={() => setIsPasswordModalOpen(false)} />}
      {is2FAModalOpen && <TwoFactorAuthModal isOpen={true} onClose={() => setIs2FAModalOpen(false)} />}
      {isPrivacyModalOpen && <PrivacySettingsModal isOpen={true} onClose={() => setIsPrivacyModalOpen(false)} />}
    </div>
  );
} 