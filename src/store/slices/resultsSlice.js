import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchResultSessions = createAsyncThunk(
    'results/fetchResultSessions',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/results/sessions', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch result sessions');
        }
    }
);

export const createResultSession = createAsyncThunk(
    'results/createResultSession',
    async (sessionData, { rejectWithValue }) => {
        try {
            const response = await api.post('/results/sessions', sessionData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create result session');
        }
    }
);

export const fetchStudentsForMarkEntry = createAsyncThunk(
    'results/fetchStudentsForMarkEntry',
    async ({ sessionId, classId, sectionId }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/results/sessions/${sessionId}/students`, {
                params: { classId, sectionId }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch students');
        }
    }
);

export const fetchSubjectsForClass = createAsyncThunk(
    'results/fetchSubjectsForClass',
    async (classId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/results/classes/${classId}/subjects`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch subjects');
        }
    }
);

export const enterStudentMarks = createAsyncThunk(
    'results/enterStudentMarks',
    async ({ sessionId, studentId, marks, classId, sectionId }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/results/sessions/${sessionId}/students/${studentId}/marks`, {
                marks,
                classId,
                sectionId
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to enter marks');
        }
    }
);

export const fetchStudentMarks = createAsyncThunk(
    'results/fetchStudentMarks',
    async ({ sessionId, studentId }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/results/sessions/${sessionId}/students/${studentId}/marks`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch student marks');
        }
    }
);

export const fetchClassResults = createAsyncThunk(
    'results/fetchClassResults',
    async ({ sessionId, classId, sectionId }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/results/sessions/${sessionId}/results`, {
                params: { classId, sectionId }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch class results');
        }
    }
);

export const publishResults = createAsyncThunk(
    'results/publishResults',
    async ({ sessionId, classIds, sendNotifications }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/results/sessions/${sessionId}/publish`, {
                classIds,
                sendNotifications
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to publish results');
        }
    }
);

export const fetchResultStatistics = createAsyncThunk(
    'results/fetchResultStatistics',
    async (sessionId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/results/sessions/${sessionId}/statistics`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
        }
    }
);

export const fetchMyResults = createAsyncThunk(
    'results/fetchMyResults',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/results/my-results');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch my results');
        }
    }
);

export const fetchStudentResult = createAsyncThunk(
    'results/fetchStudentResult',
    async ({ sessionId, studentId }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/results/sessions/${sessionId}/students/${studentId}/result`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch student result');
        }
    }
);

const initialState = {
    resultSessions: [],
    students: [],
    subjects: [],
    classResults: [],
    studentMarks: null,
    studentResult: null,
    myResults: [],
    statistics: null,
    loading: false,
    error: null,
    markEntryLoading: false,
    publishLoading: false,
};

const resultsSlice = createSlice({
    name: 'results',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearStudentMarks: (state) => {
            state.studentMarks = null;
        },
        clearClassResults: (state) => {
            state.classResults = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Result Sessions
            .addCase(fetchResultSessions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchResultSessions.fulfilled, (state, action) => {
                state.loading = false;
                state.resultSessions = action.payload;
            })
            .addCase(fetchResultSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create Result Session
            .addCase(createResultSession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createResultSession.fulfilled, (state, action) => {
                state.loading = false;
                state.resultSessions.unshift(action.payload);
            })
            .addCase(createResultSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Students for Mark Entry
            .addCase(fetchStudentsForMarkEntry.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudentsForMarkEntry.fulfilled, (state, action) => {
                state.loading = false;
                state.students = action.payload;
            })
            .addCase(fetchStudentsForMarkEntry.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Subjects for Class
            .addCase(fetchSubjectsForClass.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubjectsForClass.fulfilled, (state, action) => {
                state.loading = false;
                state.subjects = action.payload;
            })
            .addCase(fetchSubjectsForClass.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Enter Student Marks
            .addCase(enterStudentMarks.pending, (state) => {
                state.markEntryLoading = true;
                state.error = null;
            })
            .addCase(enterStudentMarks.fulfilled, (state, action) => {
                state.markEntryLoading = false;
                // Update the student in the list
                const studentIndex = state.students.findIndex(s => s.student_id === action.meta.arg.studentId);
                if (studentIndex !== -1) {
                    state.students[studentIndex].result_status = 'draft';
                }
            })
            .addCase(enterStudentMarks.rejected, (state, action) => {
                state.markEntryLoading = false;
                state.error = action.payload;
            })

            // Fetch Student Marks
            .addCase(fetchStudentMarks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudentMarks.fulfilled, (state, action) => {
                state.loading = false;
                state.studentMarks = action.payload;
            })
            .addCase(fetchStudentMarks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Class Results
            .addCase(fetchClassResults.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClassResults.fulfilled, (state, action) => {
                state.loading = false;
                state.classResults = action.payload;
            })
            .addCase(fetchClassResults.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Publish Results
            .addCase(publishResults.pending, (state) => {
                state.publishLoading = true;
                state.error = null;
            })
            .addCase(publishResults.fulfilled, (state, action) => {
                state.publishLoading = false;
                // Update session status
                const sessionIndex = state.resultSessions.findIndex(s => s.id === action.meta.arg.sessionId);
                if (sessionIndex !== -1) {
                    state.resultSessions[sessionIndex].status = 'published';
                }
            })
            .addCase(publishResults.rejected, (state, action) => {
                state.publishLoading = false;
                state.error = action.payload;
            })

            // Fetch Result Statistics
            .addCase(fetchResultStatistics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchResultStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.statistics = action.payload;
            })
            .addCase(fetchResultStatistics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch My Results (Mobile)
            .addCase(fetchMyResults.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyResults.fulfilled, (state, action) => {
                state.loading = false;
                state.myResults = action.payload;
            })
            .addCase(fetchMyResults.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Student Result
            .addCase(fetchStudentResult.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudentResult.fulfilled, (state, action) => {
                state.loading = false;
                state.studentResult = action.payload;
            })
            .addCase(fetchStudentResult.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearStudentMarks, clearClassResults } = resultsSlice.actions;
export default resultsSlice.reducer;