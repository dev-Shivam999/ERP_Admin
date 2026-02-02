import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchHolidays = createAsyncThunk(
    'calendar/fetchHolidays',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/calendar/holidays', { params });
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch holidays');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createHoliday = createAsyncThunk(
    'calendar/createHoliday',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/calendar/holidays', data);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to create holiday');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchEvents = createAsyncThunk(
    'calendar/fetchEvents',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/calendar/events', { params });
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch events');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createEvent = createAsyncThunk(
    'calendar/createEvent',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/calendar/events', data);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to create event');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteHoliday = createAsyncThunk(
    'calendar/deleteHoliday',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/calendar/holidays/${id}`);
            if (response.success) {
                return id;
            }
            return rejectWithValue(response.message || 'Failed to delete holiday');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteEvent = createAsyncThunk(
    'calendar/deleteEvent',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/calendar/events/${id}`);
            if (response.success) {
                return id;
            }
            return rejectWithValue(response.message || 'Failed to delete event');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    holidays: [],
    events: [],
    selectedMonth: new Date().getMonth(),
    selectedYear: new Date().getFullYear(),
    loading: false,
    error: null,
};

const calendarSlice = createSlice({
    name: 'calendar',
    initialState,
    reducers: {
        setSelectedMonth: (state, action) => {
            state.selectedMonth = action.payload;
        },
        setSelectedYear: (state, action) => {
            state.selectedYear = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchHolidays.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchHolidays.fulfilled, (state, action) => {
                state.loading = false;
                state.holidays = action.payload.holidays || action.payload || [];
            })
            .addCase(fetchHolidays.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createHoliday.fulfilled, (state, action) => {
                state.holidays.push(action.payload);
            })
            .addCase(deleteHoliday.fulfilled, (state, action) => {
                state.holidays = state.holidays.filter(h => h.id !== action.payload);
            })
            .addCase(fetchEvents.fulfilled, (state, action) => {
                state.events = action.payload.events || action.payload || [];
            })
            .addCase(createEvent.fulfilled, (state, action) => {
                state.events.push(action.payload);
            })
            .addCase(deleteEvent.fulfilled, (state, action) => {
                state.events = state.events.filter(e => e.id !== action.payload);
            });
    },
});

export const { setSelectedMonth, setSelectedYear, clearError } = calendarSlice.actions;
export default calendarSlice.reducer;
