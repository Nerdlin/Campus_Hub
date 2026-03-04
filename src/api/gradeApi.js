import { gradeApi as coreGradeApi, userApi as coreUserApi, __demoHelpers } from '../lib/api';

async function resolveGradeOwnerId(gradeId) {
  const users = await coreUserApi.getUsers();
  for (const user of users) {
    const grades = Array.isArray(user.grades) ? user.grades : [];
    if (grades.some((g) => g.id === gradeId)) return user.id;
  }

  // demo fallback when user grades were not hydrated
  const demoDb = __demoHelpers.readDemoDb();
  const ownerId = __demoHelpers.findGradeOwnerId(demoDb, gradeId);
  return ownerId;
}

export async function postGrade({ studentId, subjectId, value, teacherId }) {
  return coreGradeApi.postGrade(String(studentId), {
    subject: String(subjectId || 'Subject'),
    value: Number(value),
    type: 'exam',
    date: new Date().toISOString(),
    teacherId,
  });
}

export async function updateGrade(gradeId, data) {
  const ownerId = await resolveGradeOwnerId(String(gradeId));
  if (!ownerId) throw new Error('Не удалось определить владельца оценки');
  return coreGradeApi.updateGrade(ownerId, String(gradeId), {
    value: Number(data?.value ?? 0),
    type: String(data?.type || 'exam'),
    date: String(data?.date || new Date().toISOString()),
  });
}

export async function deleteGrade(gradeId) {
  const ownerId = await resolveGradeOwnerId(String(gradeId));
  if (!ownerId) throw new Error('Не удалось определить владельца оценки');
  return coreGradeApi.deleteGrade(ownerId, String(gradeId));
}

