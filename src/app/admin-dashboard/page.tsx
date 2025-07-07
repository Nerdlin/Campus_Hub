"use client";
import React, { useEffect, useState } from "react";
import { getUsers, registerUser, deleteUser, updateUser, getAdminStats } from "../../api/userApi";
import EditUserModal from "../../components/modals/EditUserModal";
import SectionTitle from "../../components/ui/SectionTitle";
import FilterBar from "../../components/ui/FilterBar";
import ModernModal from "../../components/ui/ModernModal";
import { PlusCircleIcon, TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Фильтры для FilterBar (например, фильтр по ролям)
  const roleFilters = [
    { label: "Все", value: "" },
    { label: "Студенты", value: "student" },
    { label: "Преподаватели", value: "teacher" },
    { label: "Админы", value: "admin" },
  ];
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [usersRes, statsRes] = await Promise.all([
        getUsers(),
        getAdminStats()
      ]);
      setUsers(usersRes);
      setStats(statsRes);
    } catch (e) {
      setError("Ошибка загрузки данных");
    }
  }

  async function handleDeleteUser(userId: any) {
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

  async function handleEditUserSave(userId: any, data: any) {
    setLoading(true);
    try {
      await updateUser(userId, data);
      setShowEditModal(false);
      fetchData();
    } catch (e) {
      setError("Ошибка обновления пользователя");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(createData);
      setShowCreateModal(false);
      setCreateData({ name: "", email: "", password: "" });
      fetchData();
    } catch (e) {
      setError("Ошибка создания пользователя");
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = (users as any[]).filter(u =>
    (u.name || "").toLowerCase().includes(search.toLowerCase()) &&
    (roleFilter === "" || u.role === roleFilter)
  );

  return (
    <div className="p-6 space-y-8">
      <SectionTitle>Админ-панель</SectionTitle>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-gray-500">Студентов</div>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-gray-500">Преподавателей</div>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-gray-500">Предметов</div>
            <div className="text-2xl font-bold">{stats.totalSubjects}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-gray-500">Средний GPA</div>
            <div className="text-2xl font-bold">{stats.averageGPA?.toFixed(2) || 0}</div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mt-8">
        <SectionTitle>Пользователи</SectionTitle>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          <PlusCircleIcon className="h-5 w-5" /> Новый пользователь
        </button>
      </div>
      <FilterBar filters={roleFilters} value={roleFilter} onChange={setRoleFilter} />
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Поиск по имени или email..."
        className="w-full p-2 border rounded mb-4"
      />
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white dark:bg-gray-900 divide-y divide-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left">Имя</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Роль</th>
              <th className="px-4 py-2 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b dark:border-gray-700">
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.role}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button onClick={() => { setEditUser(user); setShowEditModal(true); }} className="text-blue-600 hover:text-blue-800"><PencilSquareIcon className="h-5 w-5" /></button>
                  <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="h-5 w-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Модалка редактирования пользователя */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={editUser}
        onSave={handleEditUserSave}
      />
      {/* Модалка создания пользователя */}
      <ModernModal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Создать пользователя">
        <form onSubmit={handleCreateUser} className="space-y-4 p-4">
          <h2 className="text-xl font-bold">Создать пользователя</h2>
          <input type="text" placeholder="Имя" value={createData.name} onChange={e => setCreateData({ ...createData, name: e.target.value })} className="w-full p-2 border rounded" required />
          <input type="email" placeholder="Email" value={createData.email} onChange={e => setCreateData({ ...createData, email: e.target.value })} className="w-full p-2 border rounded" required />
          <input type="password" placeholder="Пароль" value={createData.password} onChange={e => setCreateData({ ...createData, password: e.target.value })} className="w-full p-2 border rounded" required />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-gray-200 rounded">Отмена</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Создать</button>
          </div>
        </form>
      </ModernModal>
    </div>
  );
} 