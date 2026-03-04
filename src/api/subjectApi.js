import { subjectApi as coreSubjectApi, userApi as coreUserApi } from '../lib/api';

export async function getTeacherSubjects(teacherId) {
  const subjects = await coreSubjectApi.getSubjects();
  return subjects.filter((s) => String(s.teacherId || '') === String(teacherId));
}

export async function getStudentSubjects(studentId) {
  const subjects = await coreSubjectApi.getSubjects();
  return subjects.filter((s) => (s.students || []).some((st) => String(st.id) === String(studentId)));
}

export async function addStudentToSubject(subjectId, studentId) {
  const [subjects, users] = await Promise.all([coreSubjectApi.getSubjects(), coreUserApi.getUsers()]);
  const subject = subjects.find((s) => String(s.id) === String(subjectId));
  if (!subject) throw new Error('Предмет не найден');

  const student = users.find((u) => String(u.id) === String(studentId));
  if (!student) throw new Error('Студент не найден');

  const students = Array.isArray(subject.students) ? [...subject.students] : [];
  if (!students.some((st) => String(st.id) === String(studentId))) {
    students.push({ id: student.id, name: student.name, grades: [] });
  }

  return coreSubjectApi.updateSubject(String(subjectId), { ...subject, students });
}

export async function removeStudentFromSubject(subjectId, studentId) {
  const subjects = await coreSubjectApi.getSubjects();
  const subject = subjects.find((s) => String(s.id) === String(subjectId));
  if (!subject) throw new Error('Предмет не найден');

  const students = (subject.students || []).filter((st) => String(st.id) !== String(studentId));
  return coreSubjectApi.updateSubject(String(subjectId), { ...subject, students });
}

