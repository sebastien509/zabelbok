// src/services/exercises.js
import { api } from './api';

export const getAllExercises = () => api.get('/exercises/');
export const getExercise = (id) => api.get(`/exercises/${id}`);
export const createExerciseWithQuestions = (payload) => api.post('/exercises/full', payload);
export const updateExercise = (id, payload) => api.put(`/exercises/${id}`, payload);
export const deleteExercise = (id) => api.delete(`/exercises/${id}`);
export const submitExercise = (exercise_id, payload) => api.post(`/exercises/${exercise_id}/submit`, payload);
export const gradeExerciseSubmission = (submission_id, payload) => api.post(`/exercises/submission/${submission_id}/grade`, payload);
export const verifyExerciseAttempt = (exerciseId) => api.get(`/exercises/${exerciseId}/verify`);
export const getExerciseSubmissionsByStudent = (studentId) => 
    api.get(`/results/exercise/submissions/student/${studentId}`);
export const getExerciseSubmissionsByExercise = (exercise_id) => 
    api.get(`/results/submissions/exercise/${exercise_id}`);
export const publishExerciseSubmission = (submissionId) => 
    api.put(`/results/exercise/${submissionId}/publish`);
export const getMyExerciseSubmissions = () => 
    api.get('/results/exercise');
