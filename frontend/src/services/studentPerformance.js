// services/studentPerformance.js
import { api } from "./api";

export const getStudentPerformance = async (studentId) => {
  try {
    const response = await api.get(`/progress/student/${studentId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch student performance');
  }
};

export const getQuizSubmissionsByStudent = async (studentId) => {
  try {
    const response = await api.get(`/results/quiz/submissions/${studentId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch quiz submissions');
  }
};

export const getExerciseSubmissionsByStudent = async (studentId) => {
  try {
    const response = await api.get(`/results/exercise/submissions/student/${studentId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch exercise submissions');
  }
};

export const gradeQuizSubmission = async (submissionId, data) => {
  try {
    const response = await api.post(`/results/quiz/${submissionId}/grade`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to grade quiz submission');
  }
};

export const gradeExerciseSubmission = async (submissionId, data) => {
  try {
    const response = await api.post(`/exercise/submission/${submissionId}/grade`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to grade exercise submission');
  }
};

export const getQuizSubmissionsByQuiz = async (quizId) => {
  try {
    const response = await api.get(`/results/quiz-submissions/${quizId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch quiz submissions');
  }
};

export const getExerciseSubmissionsByExercise = async (exerciseId) => {
  try {
    const response = await api.get(`/results/submissions/exercise/${exerciseId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch exercise submissions');
  }
};

export const publishQuizResult = async (resultId) => {
  try {
    const response = await api.put(`/results/quiz/${resultId}/publish`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to publish quiz result');
  }
};

export const publishExerciseSubmission = async (submissionId) => {
  try {
    const response = await api.put(`/results/exercise/${submissionId}/publish`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to publish exercise submission');
  }
};

export const getLatestSubmissions = async () => {
  try {
    const response = await api.get('/results/professor/latest-submissions');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch latest submissions');
  }
};

export default {
  getStudentPerformance,
  getQuizSubmissionsByStudent,
  getExerciseSubmissionsByStudent,
  gradeQuizSubmission,
  gradeExerciseSubmission,
  getQuizSubmissionsByQuiz,
  getExerciseSubmissionsByExercise,
  publishQuizResult,
  publishExerciseSubmission,
  getLatestSubmissions
};