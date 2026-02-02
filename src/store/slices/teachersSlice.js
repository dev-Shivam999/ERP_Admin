import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchTeachers = createAsyncThunk(
    'teachers/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/teachers', { params });
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch teachers');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchTeacherById = createAsyncThunk(
    'teachers/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/teachers/${id}`);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch teacher');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createTeacher = createAsyncThunk(
    'teachers/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/teachers', data);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to create teacher');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateTeacher = createAsyncThunk(
    'teachers/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/teachers/${id}`, data);
            if (response.success) {
                return { id, ...response.data };
            }
            return rejectWithValue(response.message || 'Failed to update teacher');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteTeacher = createAsyncThunk(
    'teachers/delete',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/teachers/${id}`);
            if (response.success) {
                return id;
            }
            return rejectWithValue(response.message || 'Failed to delete teacher');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    teachers: [],
    selectedTeacher: null,
    loading: false,
    error: null,
    pagination: { page: 1, total: 0, totalPages: 1 },
};

const teachersSlice = createSlice({
    name: 'teachers',
    initialState,
    reducers: {
        setSelectedTeacher: (state, action) => {
            state.selectedTeacher = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTeachers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTeachers.fulfilled, (state, action) => {
                state.loading = false;
                state.teachers = action.payload.teachers || action.payload || [];
                if (action.payload.pagination) {
                    state.pagination = action.payload.pagination;
                }
            })
            .addCase(fetchTeachers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchTeacherById.fulfilled, (state, action) => {
                state.selectedTeacher = action.payload;
            })
            .addCase(createTeacher.fulfilled, (state, action) => {
                state.teachers.unshift(action.payload);
            })
            .addCase(createTeacher.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(updateTeacher.fulfilled, (state, action) => {
                const index = state.teachers.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.teachers[index] = { ...state.teachers[index], ...action.payload };
                }
            })
            .addCase(deleteTeacher.fulfilled, (state, action) => {
                state.teachers = state.teachers.filter(t => t.id !== action.payload);
            });
    },
});

export const { setSelectedTeacher, clearError } = teachersSlice.actions;
export default teachersSlice.reducer;
