export const getAllBooks = () => api.get('/books/');
export const getBook = (id) => api.get(`/books/${id}`);
export const createBook = (payload) => api.post('/books/', payload);
export const addChapter = (book_id, payload) => api.post(`/books/${book_id}/chapters`, payload);
export const deleteBook = (id) => api.delete(`/books/${id}`);
export const deleteChapter = (chapter_id) => api.delete(`/books/chapters/${chapter_id}`);
