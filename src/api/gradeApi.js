// gradeApi.js — API для работы с оценками
// Все функции используют fetch к http://localhost:4000

const API_URL = 'http://localhost:4000/api';

/** Поставить оценку студенту по предмету */
export async function postGrade({ studentId, subjectId, value, teacherId }) {
  const res = await fetch(`${API_URL}/grades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, subjectId, value, teacherId })
  });
  if (!res.ok) throw new Error('Ошибка выставления оценки');
  return res.json();
}

/** Обновить оценку */
export async function updateGrade(gradeId, data) {
  const res = await fetch(`${API_URL}/grades/${gradeId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Ошибка обновления оценки');
  return res.json();
}

/** Удалить оценку */
export async function deleteGrade(gradeId) {
  const res = await fetch(`${API_URL}/grades/${gradeId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Ошибка удаления оценки');
  return res.json();
} 