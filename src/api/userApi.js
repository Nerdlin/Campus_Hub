// userApi.js — API для работы с пользователями
// Все функции используют fetch к http://localhost:4000

const API_URL = 'http://localhost:4000/api';

/** Получить всех пользователей (с поиском, фильтрацией) */
export async function getUsers({ search = '', exclude = '' } = {}) {
  const params = new URLSearchParams({ search, exclude });
  const res = await fetch(`${API_URL}/users?${params}`);
  if (!res.ok) throw new Error('Ошибка получения пользователей');
  return res.json();
}

/** Зарегистрировать пользователя */
export async function registerUser({ name, email, password }) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  if (!res.ok) throw new Error('Ошибка регистрации');
  return res.json();
}

/** Удалить пользователя (только admin) */
export async function deleteUser(userId) {
  const res = await fetch(`${API_URL}/admin/users/${userId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Ошибка удаления пользователя');
  return res.json();
}

/** Получить статистику для админа */
export async function getAdminStats() {
  const res = await fetch(`${API_URL}/admin/stats`);
  if (!res.ok) throw new Error('Ошибка получения статистики');
  return res.json();
}

/** Получить расписание пользователя */
export async function getUserSchedule(userId) {
  const res = await fetch(`${API_URL}/users/${userId}/schedule`);
  if (!res.ok) throw new Error('Ошибка получения расписания');
  return res.json();
}

/** Обновить пользователя (имя, email, пароль и т.д.) */
export async function updateUser(userId, data) {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Ошибка обновления пользователя');
  return res.json();
} 