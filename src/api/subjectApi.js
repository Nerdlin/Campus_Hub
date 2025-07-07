// subjectApi.js — API для работы с предметами
// Все функции используют fetch к http://localhost:4000

const API_URL = 'http://localhost:4000/api';

/** Получить предметы преподавателя */
export async function getTeacherSubjects(teacherId, requestingUserId) {
  const params = new URLSearchParams({ requestingUserId });
  const res = await fetch(`${API_URL}/teachers/${teacherId}/subjects?${params}`);
  if (!res.ok) throw new Error('Ошибка получения предметов преподавателя');
  return res.json();
}

/** Получить предметы студента */
export async function getStudentSubjects(studentId, requestingUserId) {
  const params = new URLSearchParams({ requestingUserId });
  const res = await fetch(`${API_URL}/students/${studentId}/subjects?${params}`);
  if (!res.ok) throw new Error('Ошибка получения предметов студента');
  return res.json();
}

/** Добавить студента в предмет (teacher/admin) */
export async function addStudentToSubject(subjectId, studentId, userId) {
  const res = await fetch(`${API_URL}/subjects/${subjectId}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, userId })
  });
  if (!res.ok) throw new Error('Ошибка добавления студента');
  return res.json();
}

/** Удалить студента из предмета (teacher/admin) */
export async function removeStudentFromSubject(subjectId, studentId, userId) {
  const res = await fetch(`${API_URL}/subjects/${subjectId}/students/${studentId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  if (!res.ok) throw new Error('Ошибка удаления студента');
  return res.json();
} 