import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchClasses = createAsyncThunk(
    'attendance/fetchClasses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/academic/classes');
            if (response.success) {
                return response.data;
            }
            return [];
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchSections = createAsyncThunk(
    'attendance/fetchSections',
    async (classId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/academic/sections/${classId}`);
            if (response.success) {
                return response.data;
            }
            return [];
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchClassAttendance = createAsyncThunk(
    'attendance/fetchClassAttendance',
    async ({ classId, sectionId, date, stream }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/attendance/class/${classId}/${sectionId}/${date}${stream ? `?stream=${stream}` : ''}`);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch attendance');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const markAttendance = createAsyncThunk(
    'attendance/markAttendance',
    async ({ classId, sectionId, date, attendance }, { rejectWithValue }) => {
        try {
            const response = await api.post('/attendance/mark', {
                classId,
                sectionId,
                date,
                attendance,
            });
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to mark attendance');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAttendanceSummary = createAsyncThunk(
    'attendance/fetchSummary',
    async (date, { rejectWithValue }) => {
        try {
            const response = await api.get(`/attendance/summary/${date}`);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch summary');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    classes: [],
    sections: [],
    selectedClass: null,
    selectedSection: null,
    selectedStream: null,
    selectedDate: new Date().toISOString().split('T')[0],
    students: [],
    summary: null,
    isMarked: false,
    loading: false,
    saving: false,
    error: null,
};

const attendanceSlice = createSlice({
    name: 'attendance',
    initialState,
    reducers: {
        setSelectedClass: (state, action) => {
            state.selectedClass = action.payload;
        },
        setSelectedSection: (state, action) => {
            state.selectedSection = action.payload;
        },
        setSelectedDate: (state, action) => {
            state.selectedDate = action.payload;
        },
        setSelectedStream: (state, action) => {
            state.selectedStream = action.payload;
        },
        updateStudentStatus: (state, action) => {
            const { studentId, status } = action.payload;
            const student = state.students.find(s => s.student_id === studentId);
            if (student) {
                student.status = status;
            }
        },
        markAllPresent: (state) => {
            state.students.forEach(s => {
                s.status = 'present';
            });
        },
        markAllAbsent: (state) => {
            state.students.forEach(s => {
                s.status = 'absent';
            });
        },
        clearError: (state) => {
            state.error = null;
        },
        clearAttendanceData: (state) => {
            state.students = [];
            state.isMarked = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchClasses.fulfilled, (state, action) => {
                state.classes = action.payload;
            })
            .addCase(fetchSections.fulfilled, (state, action) => {
                state.sections = action.payload;
            })
            .addCase(fetchClassAttendance.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchClassAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.students = action.payload.students || [];
                state.isMarked = action.payload.isMarked || false;
            })
            .addCase(fetchClassAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(markAttendance.pending, (state) => {
                state.saving = true;
            })
            .addCase(markAttendance.fulfilled, (state) => {
                state.saving = false;
                state.isMarked = true;
            })
            .addCase(markAttendance.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })
            .addCase(fetchAttendanceSummary.fulfilled, (state, action) => {
                state.summary = action.payload;
            });
    },
});

export const {
    setSelectedClass,
    setSelectedSection,
    setSelectedDate,
    setSelectedStream,
    updateStudentStatus,
    markAllPresent,
    markAllAbsent,
    clearError,
    clearAttendanceData,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
