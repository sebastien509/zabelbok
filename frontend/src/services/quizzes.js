import { api } from './api';

// Quiz Routes (quiz_bp)
export const getAllQuizzes = () => api.get('/quizzes/');
export const getQuiz = (id) => api.get(`/quizzes/${id}`);
export const createQuizWithQuestions = (payload) => api.post('/quizzes/full', payload);
export const updateQuiz = (id, payload) => api.put(`/quizzes/${id}`, payload);
export const deleteQuiz = (id) => api.delete(`/quizzes/${id}`);
export const deleteQuizQuestion = (question_id) => api.delete(`/quizzes/questions/${question_id}`);
export const submitQuiz = (quiz_id, payload) => api.post(`/quizzes/${quiz_id}/submit`, payload);
export const verifyQuizAttempt = (quizId) => api.get(`/quizzes/${quizId}/verify`);

// Result Routes (result_bp) - Quiz related
export const getQuizSubmissionsByStudent = (studentId) => 
    api.get(`/results/quiz/submissions/${studentId}`);
export const getQuizSubmissionsByQuiz = (quiz_id) => 
    api.get(`/results/quiz-submissions/${quiz_id}`);
export const gradeQuiz = (submissionId, payload) => 
    api.post(`/results/quiz/submission/${submissionId}/grade`, payload);
export const publishQuizResult = (resultId) => 
    api.put(`/results/quiz/${resultId}/publish`);
export const getMyQuizResults = () => 
    api.get('/results/quiz');

export const getMySubmittedQuizzes = () => api.get('/quizzes/submitted');
