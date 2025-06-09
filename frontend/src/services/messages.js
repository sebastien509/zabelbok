export const getContacts = () => api.get('/messages/contacts');
export const getThreads = () => api.get('/messages/threads');
export const getThreadMessages = (threadId) => api.get(`/messages/thread/${threadId}`);
export const sendMessage = (payload) => api.post('/messages/send', payload);