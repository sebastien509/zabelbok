import { api } from './api';

export const getExerciseSubmissionsByStudent = (studentId) => 
  api.get(`/exercises/submissions/student/${studentId}`);

export const getQuizSubmissionsByStudent = (studentId) => 
  api.get(`/quiz-submissions/student/${studentId}`);


export const getStudentPerformance = (studentId) =>
  api.get(`/progress/student/${studentId}`);
