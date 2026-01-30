import axios from 'axios';

// Use relative '/api' for production (nginx proxy) or full URL for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle responses
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error);
    }
);

// Auth APIs
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    getCurrentUser: () => api.get('/auth/me'),
    adminResetPassword: (targetUserId, newPassword) => api.post('/auth/reset-password-admin', { targetUserId, newPassword }),
    updateUserPermissions: (targetUserId, permissions) => api.post('/auth/update-permissions-admin', { targetUserId, permissions }),
};

// Student APIs
export const studentAPI = {
    getAll: (params) => api.get('/students', { params }),
    getById: (id) => api.get(`/students/${id}`),
    create: (data) => api.post('/students', data),
    update: (id, data) => api.put(`/students/${id}`, data),
    delete: (id) => api.delete(`/students/${id}`),
    promote: (data) => api.post('/students/promote', data),
};

// Attendance APIs
export const attendanceAPI = {
    markAttendance: (data) => api.post('/attendance/mark', data),
    getClassAttendance: (classId, sectionId, date) =>
        api.get(`/attendance/class/${classId}/${sectionId}/${date}`),
    getStudentAttendance: (studentId, params) =>
        api.get(`/attendance/student/${studentId}`, { params }),
    getSummary: (date) => api.get(`/attendance/summary/${date}`),
    getLowAttendance: (threshold) =>
        api.get('/attendance/low-attendance', { params: { threshold } }),
};

// Fee APIs
export const feeAPI = {
    getStudentFees: (studentId) => api.get(`/fees/student/${studentId}`),
    collectFee: (data) => api.post('/fees/collect', data),
    getReceipt: (receiptNumber) => api.get(`/fees/receipt/${receiptNumber}`),
    getPending: (params) => api.get('/fees/pending', { params }),
    getDefaulters: () => api.get('/fees/defaulters'),
    getDailyCollection: (date) => api.get('/fees/collection/daily', { params: { date } }),
    getMonthlyCollection: (month, year) =>
        api.get('/fees/collection/monthly', { params: { month, year } }),
    generateFees: (data) => api.post('/fees/generate', data),
    applyDiscount: (data) => api.post('/fees/discount', data),
};

// Homework APIs
export const homeworkAPI = {
    getByClass: (classId, sectionId, date) => api.get(`/homework/class/${classId}/${sectionId}`, { params: { date } }),
    getStatus: (homeworkId) => api.get(`/homework/status/${homeworkId}`),
    updateStatus: (data) => api.post('/homework/update-status', data),
};

// Payroll APIs
export const payrollAPI = {
    getPayrollByMonth: (month, year) => api.get(`/payroll/monthly?month=${month}&year=${year}`),
    processPayroll: (data) => api.post('/payroll/process', data),
};

// Exam APIs
export const examAPI = {
    getAll: () => api.get('/exams'),
    getById: (id) => api.get(`/exams/${id}`),
    create: (data) => api.post('/exams', data),
    generateAdmitCards: (id, data) => api.post(`/exams/${id}/admit-cards/generate`, data),
    issueAdmitCard: (id, data) => api.post(`/exams/${id}/admit-cards/issue`, data),
    getStudentsStatus: (id, params) => api.get(`/exams/${id}/admit-card-status`, { params }),
    getAdmitCard: (id, params) => api.get(`/exams/${id}/admit-card`, { params }),
};

// Certificate APIs
export const certificateAPI = {
    getPending: () => api.get('/certificates/pending'),
    getToday: () => api.get('/certificates/today'),
    updateStatus: (id, data) => api.put(`/certificates/${id}/status`, data),
    delete: (id) => api.delete(`/certificates/${id}`),
    getData: (id) => api.get(`/certificates/${id}/data`),
};

export default api;
