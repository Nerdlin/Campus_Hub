import { userApi as coreUserApi } from '../lib/api';

export async function getUsers({ search = '', exclude = '' } = {}) {
  const users = await coreUserApi.getUsers();
  const q = String(search || '').toLowerCase();
  return users
    .filter((u) => (exclude ? u.id !== exclude : true))
    .filter((u) => {
      if (!q) return true;
      return String(u.name || '').toLowerCase().includes(q) || String(u.email || '').toLowerCase().includes(q);
    });
}

export async function registerUser({ name, email, password }) {
  return coreUserApi.createUser({ name, email, password });
}

export async function deleteUser(userId) {
  return coreUserApi.deleteUser(String(userId));
}

export async function getAdminStats() {
  return coreUserApi.getAdminStats();
}

export async function getUserSchedule(userId) {
  return coreUserApi.getUserSchedule(String(userId));
}

export async function updateUser(userId, data) {
  return coreUserApi.updateUser(String(userId), data || {});
}

