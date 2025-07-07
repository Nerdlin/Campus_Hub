"use client";
import React, { useEffect, useState } from "react";
import { getUsers, deleteUser, updateUser } from "../../api/userApi";
import EditUserModal from "../../components/modals/EditUserModal";
import UserProfileModal from "../../components/modals/UserProfileModal";
import { PencilSquareIcon, TrashIcon, EyeIcon, ArrowPathIcon, LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";

const roleFilters = [
  { label: "Все", value: "" },
  { label: "Студенты", value: "student" },
  { label: "Преподаватели", value: "teacher" },
  { label: "Админы", value: "admin" },
];
const roleOptions = [
  { label: "Студент", value: "student" },
  { label: "Преподаватель", value: "teacher" },
  { label: "Админ", value: "admin" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editUser, setEditUser] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError("");
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e) {
      setError("Ошибка загрузки пользователей");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!window.confirm("Удалить пользователя?")) return;
    setLoading(true);
    try {
      await deleteUser(userId);
      setUsers(users => users.filter(u => u.id !== userId));
    } catch (e) {
      setError("Ошибка удаления пользователя");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditUserSave(userId: string, data: any) {
    setLoading(true);
    try {
      await updateUser(userId, data);
      setShowEditModal(false);
      fetchUsers();
    } catch (e) {
      setError("Ошибка обновления пользователя");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeRole(userId: string, newRole: string) {
    setLoading(true);
    try {
      await updateUser(userId, { role: newRole });
      fetchUsers();
    } catch (e) {
      setError("Ошибка смены роли");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleBlock(user: any) {
    setLoading(true);
    try {
      await updateUser(user.id, { blocked: !user.blocked });
      fetchUsers();
    } catch (e) {
      setError("Ошибка блокировки/разблокировки");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(userId: string) {
    if (!window.confirm("Сбросить пароль пользователя? Новый пароль будет отправлен на email.")) return;
    setLoading(true);
    try {
      // Здесь должен быть реальный вызов API для сброса пароля
      // await resetPassword(userId);
      setTimeout(() => {
        setLoading(false);
        alert("Пароль успешно сброшен (заглушка)");
      }, 800);
    } catch (e) {
      setError("Ошибка сброса пароля");
      setLoading(false);
    }
  }

  const filteredUsers = (users as any[]).filter(
    (u) =>
      (u.name || "").toLowerCase().includes(search.toLowerCase()) &&
      (roleFilter === "" || u.role === roleFilter)
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Пользователи</h1>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
      <div className="flex flex-wrap gap-2 mb-4">
        {roleFilters.map((f) => (
          <button
            key={f.value}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border-2 ${
              roleFilter === f.value
                ? "bg-blue-600 text-white border-blue-600 shadow"
                : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-blue-900 hover:text-white"
            }`}
            onClick={() => setRoleFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени или email..."
          className="ml-auto p-2 border rounded w-64"
        />
      </div>
      {loading ? (
        <div className="text-center text-gray-500 py-8">Загрузка...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white dark:bg-gray-900 divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left">Имя</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Роль</th>
                <th className="px-4 py-2 text-left">Статус</th>
                <th className="px-4 py-2 text-left">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-8">
                    Нет пользователей
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b dark:border-gray-700">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">
                      <select
                        value={user.role}
                        onChange={e => handleChangeRole(user.id, e.target.value)}
                        className="bg-gray-100 dark:bg-gray-800 border rounded px-2 py-1"
                      >
                        {roleOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      {user.blocked ? (
                        <span className="text-red-600 flex items-center gap-1"><LockClosedIcon className="h-4 w-4" /> Заблокирован</span>
                      ) : (
                        <span className="text-green-600 flex items-center gap-1"><LockOpenIcon className="h-4 w-4" /> Активен</span>
                      )}
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button onClick={() => { setProfileUser(user); setShowProfileModal(true); }} className="text-gray-600 hover:text-blue-600" title="Профиль"><EyeIcon className="h-5 w-5" /></button>
                      <button onClick={() => { setEditUser(user); setShowEditModal(true); }} className="text-blue-600 hover:text-blue-800" title="Редактировать"><PencilSquareIcon className="h-5 w-5" /></button>
                      <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-800" title="Удалить"><TrashIcon className="h-5 w-5" /></button>
                      <button onClick={() => handleResetPassword(user.id)} className="text-yellow-600 hover:text-yellow-800" title="Сбросить пароль"><ArrowPathIcon className="h-5 w-5" /></button>
                      <button onClick={() => handleToggleBlock(user)} className={user.blocked ? "text-green-600 hover:text-green-800" : "text-red-600 hover:text-red-800"} title={user.blocked ? "Разблокировать" : "Заблокировать"}>
                        {user.blocked ? <LockOpenIcon className="h-5 w-5" /> : <LockClosedIcon className="h-5 w-5" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Модалка редактирования пользователя */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={editUser}
        onSave={handleEditUserSave}
      />
      {/* Модалка профиля пользователя */}
      {showProfileModal && profileUser && (
        <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} userId={profileUser.id} />
      )}
    </div>
  );
} 