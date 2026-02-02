import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
    'dashboard/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/dashboard/stats');
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch stats');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch dashboard stats');
        }
    }
);

const initialState = {
    stats: {
        totalStudents: 0,
        attendance: { present: 0, absent: 0, total: 0 },
        todayCollection: { total: 0, cash: 0, online: 0, cheque: 0, transactions: 0 },
        pendingFees: 0,
        yearlyCollection: 0,
        totalTeachers: 0,
        recentAdmissions: [],
        feeDefaulters: [],
    },
    loading: false,
    error: null,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
