'use client';

import React, { useContext } from 'react';
import { FaTachometerAlt, FaCalendarAlt, FaTrophy, FaBook, FaTasks, FaProjectDiagram, FaClipboardCheck, FaBullhorn, FaChalkboardTeacher, FaComments, FaUserCog, FaUsers, FaUserGraduate, FaSignOutAlt, FaBars, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarContext } from '../app/ClientRoot';

const getSidebarConfig = (role: 'student' | 'teacher' | 'admin') => {
  if (role === 'admin') {
    return {
      label: 'Admin Hub',
      icon: <FaUserCog />,
      sections: [
        {
          title: 'АДМИНИСТРИРОВАНИЕ',
          items: [
            { label: 'Дашборд', icon: <FaTachometerAlt />, href: '/admin-dashboard' },
            { label: 'Пользователи', icon: <FaUsers />, href: '/users' },
            { label: 'Предметы', icon: <FaBook />, href: '/subjects' },
            { label: 'Оценки', icon: <FaTrophy />, href: '/grades' },
            { label: 'Расписание', icon: <FaCalendarAlt />, href: '/schedule' },
            { label: 'Настройки', icon: <FaUserCog />, href: '/settings' },
          ],
        },
        {
          title: 'КОММУНИКАЦИЯ',
          items: [
            { label: 'Объявления', icon: <FaBullhorn />, href: '/announcements' },
            { label: 'Сообщения', icon: <FaComments />, href: '/messages' },
          ],
        },
      ],
    };
  }
  if (role === 'teacher') {
    return {
      label: 'Teacher Hub',
      icon: <FaChalkboardTeacher />,
      sections: [
        {
          title: 'ОСНОВНОЕ',
          items: [
            { label: 'Дашборд', icon: <FaTachometerAlt />, href: '/teacher-dashboard' },
            { label: 'Расписание', icon: <FaCalendarAlt />, href: '/schedule' },
            { label: 'Оценки', icon: <FaTrophy />, href: '/grades' },
            { label: 'Мои предметы', icon: <FaBook />, href: '/subjects' },
            { label: 'Студенты', icon: <FaUserGraduate />, href: '/students' },
            { label: 'Настройки', icon: <FaUserCog />, href: '/settings' },
          ],
        },
        {
          title: 'КОММУНИКАЦИЯ',
          items: [
            { label: 'Объявления', icon: <FaBullhorn />, href: '/announcements' },
            { label: 'Сообщения', icon: <FaComments />, href: '/messages' },
          ],
        },
      ],
    };
  }
  // student
  return {
    label: 'Student Hub',
    icon: <FaUserGraduate />,
    sections: [
      {
        title: 'ОСНОВНОЕ',
        items: [
          { label: 'Дашборд', icon: <FaTachometerAlt />, href: '/student-dashboard' },
          { label: 'Расписание', icon: <FaCalendarAlt />, href: '/schedule' },
          { label: 'Оценки', icon: <FaTrophy />, href: '/grades' },
          { label: 'Материалы', icon: <FaBook />, href: '/materials' },
          { label: 'Задания', icon: <FaTasks />, href: '/tasks' },
          { label: 'Проекты', icon: <FaProjectDiagram />, href: '/projects' },
          { label: 'Тестирование', icon: <FaClipboardCheck />, href: '/testing' },
          { label: 'Настройки', icon: <FaUserCog />, href: '/settings' },
        ],
      },
      {
        title: 'КОММУНИКАЦИЯ',
        items: [
          { label: 'Объявления', icon: <FaBullhorn />, href: '/announcements' },
          { label: 'Сообщения', icon: <FaComments />, href: '/messages' },
        ],
      },
    ],
  };
};

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useContext(SidebarContext);
  const router = useRouter();

  if (!user) {
    return null; // Don't show sidebar if not authenticated
  }

  const { label, icon, sections } = getSidebarConfig(user.role);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-gray-800">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2 text-xl font-bold text-white">
              <span className="bg-red-600 rounded p-2">{icon}</span>
              <span>{label}</span>
            </div>
            <button className="text-white">
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-8 px-4 py-4">
            {sections.map(section => (
              <div key={section.title}>
                <div className="text-xs text-gray-400 mb-2 font-semibold tracking-widest">{section.title}</div>
                <ul className="space-y-1">
                  {section.items.map(item => (
                    <li key={item.label}>
                      <Link 
                        href={item.href} 
                        className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                          pathname === item.href 
                            ? 'bg-red-600 text-white' 
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-base">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors w-full rounded"
              >
                <FaSignOutAlt className="text-lg" />
                <span>Выйти</span>
              </button>
            </div>
          </nav>
          <div className="p-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">{user.name}</div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex lg:fixed lg:inset-y-0 lg:flex-col transition-all duration-300 ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}>
        <div className="flex min-h-0 flex-1 flex-col bg-gray-800 border-r border-gray-700 transition-all duration-300" style={{width: collapsed ? 80 : 256}}>
          <div className="flex h-16 items-center px-4 justify-between">
            <div className={`flex items-center gap-2 text-xl font-bold text-white transition-all duration-300 ${collapsed ? 'justify-center w-full' : ''}`}> 
              <span className="bg-red-600 rounded p-2">{icon}</span>
              {!collapsed && <span>{label}</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                {theme === 'dark' ? '🌞' : '🌙'}
              </button>
            </div>
          </div>
          <nav className="flex-1 space-y-8 px-4 py-4">
            {sections.map(section => (
              <div key={section.title}>
                {!collapsed && <div className="text-xs text-gray-400 mb-2 font-semibold tracking-widest">{section.title}</div>}
                <ul className="space-y-1">
                  {section.items.map(item => (
                    <li key={item.label}>
                      <Link 
                        href={item.href} 
                        className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                          pathname === item.href 
                            ? 'bg-red-600 text-white' 
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        } ${collapsed ? 'justify-center' : ''}`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        {!collapsed && <span className="text-base">{item.label}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className={`flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors w-full rounded ${collapsed ? 'justify-center' : ''}`}
              >
                <FaSignOutAlt className="text-lg" />
                {!collapsed && <span>Выйти</span>}
              </button>
            </div>
          </nav>
          <div className="p-4 border-t border-gray-700">
            {!collapsed && <div className="text-sm text-gray-400">{user.name}</div>}
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button
          className="p-2 bg-gray-800 text-white rounded-md"
        >
          <FaBars className="h-6 w-6" />
        </button>
      </div>
    </>
  );
};

export default Sidebar; 