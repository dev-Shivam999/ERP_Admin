import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchStudents = createAsyncThunk(
    'students/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/students', { params });
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch students');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch students');
        }
    }
);

export const fetchStudentById = createAsyncThunk(
    'students/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/students/${id}`);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch student');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch student');
        }
    }
);

export const createStudent = createAsyncThunk(
    'students/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/students', data);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to create student');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create student');
        }
    }
);

export const updateStudent = createAsyncThunk(
    'students/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/students/${id}`, data);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to update student');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update student');
        }
    }
);

export const deleteStudent = createAsyncThunk(
    'students/delete',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/students/${id}`);
            if (response.success) {
                return id;
            }
            return rejectWithValue(response.message || 'Failed to delete student');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete student');
        }
    }
);

const initialState = {
    students: [],
    selectedStudent: null,
    pagination: { page: 1, limit: 10, total: 0 },
    loading: false,
    error: null,
};

const studentsSlice = createSlice({
    name: 'students',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setSelectedStudent: (state, action) => {
            state.selectedStudent = action.payload;
        },
        clearSelectedStudent: (state) => {
            state.selectedStudent = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all students
            .addCase(fetchStudents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudents.fulfilled, (state, action) => {
                state.loading = false;
                state.students = action.payload.students || action.payload || [];
                if (action.payload.pagination) {
                    state.pagination = action.payload.pagination;
                }
            })
            .addCase(fetchStudents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch student by ID
            .addCase(fetchStudentById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStudentById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedStudent = action.payload;
            })
            .addCase(fetchStudentById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create student
            .addCase(createStudent.pending, (state) => {
                state.loading = true;
            })
            .addCase(createStudent.fulfilled, (state, action) => {
                state.loading = false;
                state.students.unshift(action.payload);
            })
            .addCase(createStudent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update student
            .addCase(updateStudent.fulfilled, (state, action) => {
                const index = state.students.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.students[index] = action.payload;
                }
            })
            // Delete student
            .addCase(deleteStudent.fulfilled, (state, action) => {
                state.students = state.students.filter(s => s.id !== action.payload);
            });
    },
});

export const { clearError, setSelectedStudent, clearSelectedStudent } = studentsSlice.actions;
export default studentsSlice.reducer;
