import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchClasses = createAsyncThunk(
    'academic/fetchClasses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/academic/classes');
            if (response.success) return response.data;
            return rejectWithValue(response.message);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createClass = createAsyncThunk(
    'academic/createClass',
    async (classData, { rejectWithValue }) => {
        try {
            const response = await api.post('/academic/classes', classData);
            if (response.success) return response.data;
            return rejectWithValue(response.message);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateClass = createAsyncThunk(
    'academic/updateClass',
    async ({ id, ...classData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/academic/classes/${id}`, classData);
            if (response.success) return response.data;
            return rejectWithValue(response.message);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteClass = createAsyncThunk(
    'academic/deleteClass',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/academic/classes/${id}`);
            if (response.success) return id;
            return rejectWithValue(response.message);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchSectionsByClass = createAsyncThunk(
    'academic/fetchSections',
    async (classId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/academic/sections/${classId}`);
            if (response.success) return { classId, sections: response.data };
            return rejectWithValue(response.message);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createSection = createAsyncThunk(
    'academic/createSection',
    async (sectionData, { rejectWithValue }) => {
        try {
            const response = await api.post('/academic/sections', sectionData);
            if (response.success) return response.data;
            return rejectWithValue(response.message);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    classes: [],
    subjects: [],
    sectionsByClass: {},
    loading: false,
    error: null,
};

const academicSlice = createSlice({
    name: 'academic',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchClasses.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchClasses.fulfilled, (state, action) => {
                state.loading = false;
                state.classes = action.payload;
            })
            .addCase(fetchClasses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createClass.fulfilled, (state, action) => {
                state.classes.push(action.payload);
            })
            .addCase(updateClass.fulfilled, (state, action) => {
                const index = state.classes.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.classes[index] = action.payload;
                }
            })
            .addCase(deleteClass.fulfilled, (state, action) => {
                state.classes = state.classes.filter(c => c.id !== action.payload);
            })
            .addCase(fetchSectionsByClass.fulfilled, (state, action) => {
                state.sectionsByClass[action.payload.classId] = action.payload.sections;
            })
            .addCase(createSection.fulfilled, (state, action) => {
                const classId = action.payload.class_id;
                if (!state.sectionsByClass[classId]) state.sectionsByClass[classId] = [];
                state.sectionsByClass[classId].push(action.payload);
            })
            .addCase(fetchSubjects.fulfilled, (state, action) => {
                state.subjects = action.payload;
            })
            .addCase(createSubject.fulfilled, (state, action) => {
                state.subjects.push(action.payload);
            });
    }
});

export const fetchSubjects = createAsyncThunk(
    'academic/fetchSubjects',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/academic/subjects');
            if (response.success) return response.data;
            return rejectWithValue(response.message);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createSubject = createAsyncThunk(
    'academic/createSubject',
    async (subjectData, { rejectWithValue }) => {
        try {
            const response = await api.post('/academic/subjects', subjectData);
            if (response.success) return response.data;
            return rejectWithValue(response.message);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const { clearError } = academicSlice.actions;
export default academicSlice.reducer;
