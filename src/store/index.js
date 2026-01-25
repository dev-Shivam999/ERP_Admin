import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import studentsReducer from './slices/studentsSlice';
import feesReducer from './slices/feesSlice';
import attendanceReducer from './slices/attendanceSlice';
import teachersReducer from './slices/teachersSlice';
import examsReducer from './slices/examsSlice';
import calendarReducer from './slices/calendarSlice';
import academicReducer from './slices/academicSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        dashboard: dashboardReducer,
        students: studentsReducer,
        fees: feesReducer,
        attendance: attendanceReducer,
        teachers: teachersReducer,
        exams: examsReducer,
        calendar: calendarReducer,
        academic: academicReducer,
    },
});

export default store;
