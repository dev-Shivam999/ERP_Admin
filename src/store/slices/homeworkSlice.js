import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { homeworkAPI } from '../../services/api';

// Async Thunks
export const fetchHomeworkByClass = createAsyncThunk(
    'homework/fetchByClass',
    async ({ classId, sectionId, date }, { rejectWithValue }) => {
        try {
            const response = await homeworkAPI.getByClass(classId, sectionId, date);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch homework');
        }
    }
);

export const fetchHomeworkStatus = createAsyncThunk(
    'homework/fetchStatus',
    async (homeworkId, { rejectWithValue }) => {
        try {
            const response = await homeworkAPI.getStatus(homeworkId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch status');
        }
    }
);

export const updateHomeworkStatus = createAsyncThunk(
    'homework/updateStatus',
    async (data, { rejectWithValue }) => {
        try {
            await homeworkAPI.updateStatus(data);
            return data; // Return data to optimistically update UI
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

const initialState = {
    homeworkList: [],
    selectedHomeworkStatus: [], // List of students and their status for selected homework
    loading: false,
    error: null,
};

const homeworkSlice = createSlice({
    name: 'homework',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedHomework: (state) => {
            state.selectedHomeworkStatus = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch By Class
            .addCase(fetchHomeworkByClass.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHomeworkByClass.fulfilled, (state, action) => {
                state.loading = false;
                state.homeworkList = action.payload;
            })
            .addCase(fetchHomeworkByClass.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Status
            .addCase(fetchHomeworkStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHomeworkStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedHomeworkStatus = action.payload;
            })
            .addCase(fetchHomeworkStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Status
            .addCase(updateHomeworkStatus.fulfilled, (state, action) => {
                // Optimistic update in selectedHomeworkStatus
                const { studentId, status } = action.payload;
                const index = state.selectedHomeworkStatus.findIndex(s => s.student_id === studentId);
                if (index !== -1) {
                    state.selectedHomeworkStatus[index].status = status;
                }
            });
    },
});

export const { clearError, clearSelectedHomework } = homeworkSlice.actions;
export default homeworkSlice.reducer;
