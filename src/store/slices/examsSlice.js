import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchExams = createAsyncThunk(
    'exams/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/exams', { params });
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch exams');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createExam = createAsyncThunk(
    'exams/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/exams', data);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to create exam');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateExam = createAsyncThunk(
    'exams/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/exams/${id}`, data);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to update exam');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteExam = createAsyncThunk(
    'exams/delete',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/exams/${id}`);
            if (response.success) {
                return id;
            }
            return rejectWithValue(response.message || 'Failed to delete exam');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchExamSchedule = createAsyncThunk(
    'exams/fetchSchedule',
    async (examId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/exams/${examId}/schedule`);
            if (response.success) {
                return { examId, schedule: response.data };
            }
            return rejectWithValue(response.message || 'Failed to fetch schedule');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchExamStats = createAsyncThunk(
    'exams/fetchStats',
    async (examId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/exams/${examId}/stats`);
            if (response.success) {
                return { examId, stats: response.data };
            }
            return rejectWithValue(response.message || 'Failed to fetch stats');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchExamResults = createAsyncThunk(
    'exams/fetchResults',
    async ({ examId, classId }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/exams/${examId}/results`, { params: { classId } });
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch results');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const saveMarks = createAsyncThunk(
    'exams/saveMarks',
    async ({ examScheduleId, marks }, { rejectWithValue }) => {
        try {
            const response = await api.post('/exams/marks', { examScheduleId, marks });
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to save marks');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const publishResults = createAsyncThunk(
    'exams/publish',
    async (examId, { rejectWithValue }) => {
        try {
            const response = await api.post(`/exams/${examId}/publish`);
            if (response.success) {
                return { examId, ...response.data };
            }
            return rejectWithValue(response.message || 'Failed to publish results');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchExamById = createAsyncThunk(
    'exams/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/exams/${id}`);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch exam');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    exams: [],
    selectedExam: null,
    results: [],
    examStats: {},
    examSchedules: {},
    loading: false,
    saving: false,
    error: null,
};

const examsSlice = createSlice({
    name: 'exams',
    initialState,
    reducers: {
        setSelectedExam: (state, action) => {
            state.selectedExam = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearResults: (state) => {
            state.results = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExams.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchExams.fulfilled, (state, action) => {
                state.loading = false;
                state.exams = action.payload.exams || action.payload || [];
            })
            .addCase(fetchExams.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createExam.pending, (state) => {
                state.loading = true;
            })
            .addCase(createExam.fulfilled, (state, action) => {
                state.loading = false;
                state.exams.unshift(action.payload);
            })
            .addCase(createExam.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateExam.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateExam.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.exams.findIndex(e => e.id === action.payload.id);
                if (index !== -1) {
                    state.exams[index] = { ...state.exams[index], ...action.payload };
                }
            })
            .addCase(updateExam.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteExam.fulfilled, (state, action) => {
                state.exams = state.exams.filter(e => e.id !== action.payload);
            })
            .addCase(fetchExamById.fulfilled, (state, action) => {
                state.selectedExam = action.payload;
            })
            .addCase(fetchExamResults.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchExamResults.fulfilled, (state, action) => {
                state.loading = false;
                state.results = action.payload;
            })
            .addCase(fetchExamResults.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(saveMarks.pending, (state) => {
                state.saving = true;
            })
            .addCase(saveMarks.fulfilled, (state) => {
                state.saving = false;
            })
            .addCase(saveMarks.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })
            .addCase(publishResults.fulfilled, (state, action) => {
                const exam = state.exams.find(e => e.id === action.payload.examId);
                if (exam) {
                    exam.is_published = true;
                }
            })
            .addCase(fetchExamStats.fulfilled, (state, action) => {
                state.examStats[action.payload.examId] = action.payload.stats;
            })
            .addCase(fetchExamSchedule.fulfilled, (state, action) => {
                state.examSchedules[action.payload.examId] = action.payload.schedule;
            });
    },
});

export const { setSelectedExam, clearError, clearResults } = examsSlice.actions;
export default examsSlice.reducer;
