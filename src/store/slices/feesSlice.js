import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchTodayCollection = createAsyncThunk(
    'fees/fetchTodayCollection',
    async (_, { rejectWithValue }) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await api.get('/fees/collection/daily', { params: { date: today } });
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch collection');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch today collection');
        }
    }
);

export const fetchStudentFees = createAsyncThunk(
    'fees/fetchStudentFees',
    async (studentId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/fees/student/${studentId}`);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch student fees');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch student fees');
        }
    }
);

export const searchStudentByAdmission = createAsyncThunk(
    'fees/searchStudent',
    async (searchTerm, { rejectWithValue }) => {
        try {
            const response = await api.get('/students', { params: { search: searchTerm } });
            if (response.success) {
                const students = response.data.students || response.data || [];
                return students.length > 0 ? students[0] : null;
            }
            return rejectWithValue(response.message || 'Failed to search student');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to search student');
        }
    }
);

export const searchStudents = createAsyncThunk(
    'fees/searchStudents',
    async (searchTerm, { rejectWithValue }) => {
        try {
            if (!String(searchTerm || '').trim()) return [];
            const response = await api.get('/students', { params: { search: searchTerm } });
            if (response.success) {
                return response.data.students || response.data || [];
            }
            return rejectWithValue(response.message || 'Failed to search students');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to search students');
        }
    }
);

export const collectFee = createAsyncThunk(
    'fees/collect',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/fees/collect', data);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to collect fee');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to collect fee');
        }
    }
);

export const fetchDefaulters = createAsyncThunk(
    'fees/fetchDefaulters',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/fees/defaulters');
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch defaulters');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch defaulters');
        }
    }
);

export const fetchPendingFees = createAsyncThunk(
    'fees/fetchPendingFees',
    async (params, { rejectWithValue }) => {
        try {
            const response = await api.get('/fees/pending', { params });
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch pending fees');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch pending fees');
        }
    }
);

export const fetchFeePayments = createAsyncThunk(
    'fees/fetchFeePayments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/fees/payments');
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch payments');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch fee payments');
        }
    }
);

export const fetchStudentPayments = createAsyncThunk(
    'fees/fetchStudentPayments',
    async (studentId, { rejectWithValue }) => {
        try {
            const response = await api.get('/fees/payments', { params: { studentId } });
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch student payments');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch student payments');
        }
    }
);

export const fetchFeeStructures = createAsyncThunk(
    'fees/fetchFeeStructures',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/fees/structures');
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch fee structures');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch fee structures');
        }
    }
);

export const recordPayment = createAsyncThunk(
    'fees/recordPayment',
    async (paymentData, { rejectWithValue }) => {
        try {
            const response = await api.post('/fees/payments', paymentData);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to record payment');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to record payment');
        }
    }
);

export const updateStudentFee = createAsyncThunk(
    'fees/updateStudentFee',
    async ({ id, ...data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/fees/${id}`, data);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to update fee');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update fee');
        }
    }
);

export const updateFeeStructures = createAsyncThunk(
    'fees/updateFeeStructures',
    async (structures, { rejectWithValue }) => {
        try {
            const response = await api.put('/fees/structures', { structures });
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to update fee structures');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update fee structures');
        }
    }
);

export const initializeFeeStructures = createAsyncThunk(
    'fees/initializeFeeStructures',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post('/fees/structures/initialize');
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to initialize fee structures');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to initialize fee structures');
        }
    }
);

export const fetchFeeMetadata = createAsyncThunk(
    'fees/fetchFeeMetadata',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/fees/metadata');
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch fee metadata');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch fee metadata');
        }
    }
);

export const createFeeType = createAsyncThunk(
    'fees/createFeeType',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/fees/types', data);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to create fee type');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create fee type');
        }
    }
);

export const deleteFeeType = createAsyncThunk(
    'fees/deleteFeeType',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/fees/types/${id}`);
            if (response.success) {
                return id;
            }
            return rejectWithValue(response.message || 'Failed to delete fee type');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete fee type');
        }
    }
);

export const generateFees = createAsyncThunk(
    'fees/generateFees',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/fees/generate', data);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to generate fees');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to generate fees');
        }
    }
);

const initialState = {
    todayCollection: {
        total: 0,
        cash: 0,
        online: 0,
        cheque: 0,
        transactions: 0,
    },
    selectedStudent: null,
    studentFees: [],
    searchResults: [],
    payments: [],
    studentPayments: [],
    pendingFees: [],
    feeSummary: {
        today_collection: 0,
        total_collected_year: 0,
        total_pending_all: 0
    },
    defaulters: [],
    feeStructures: [],
    lastReceipt: null,
    totals: null,
    loading: false,
    searchLoading: false,
    collectLoading: false,
    error: null,
};

const feesSlice = createSlice({
    name: 'fees',
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
            state.studentFees = [];
            state.studentPayments = [];
            state.searchResults = [];
        },
        clearLastReceipt: (state) => {
            state.lastReceipt = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch pending fees
            .addCase(fetchPendingFees.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPendingFees.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingFees = action.payload.students || action.payload || [];
                state.feeSummary = action.payload.summary || state.feeSummary;
            })
            .addCase(fetchPendingFees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch today's collection
            .addCase(fetchTodayCollection.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTodayCollection.fulfilled, (state, action) => {
                state.loading = false;
                state.todayCollection = action.payload;
            })
            .addCase(fetchTodayCollection.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Search student
            .addCase(searchStudentByAdmission.pending, (state) => {
                state.searchLoading = true;
            })
            .addCase(searchStudentByAdmission.fulfilled, (state, action) => {
                state.searchLoading = false;
                state.selectedStudent = action.payload;
            })
            .addCase(searchStudentByAdmission.rejected, (state, action) => {
                state.searchLoading = false;
                state.error = action.payload;
            })
            // Search students (list)
            .addCase(searchStudents.pending, (state) => {
                state.searchLoading = true;
            })
            .addCase(searchStudents.fulfilled, (state, action) => {
                state.searchLoading = false;
                state.searchResults = action.payload || [];
            })
            .addCase(searchStudents.rejected, (state, action) => {
                state.searchLoading = false;
                state.searchResults = [];
                state.error = action.payload;
            })
            // Fetch student fees
            .addCase(fetchStudentFees.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStudentFees.fulfilled, (state, action) => {
                state.loading = false;
                state.studentFees = action.payload.fees || action.payload || [];
                state.totals = action.payload.totals || null;
                if (action.payload.student) {
                    state.selectedStudent = { ...state.selectedStudent, ...action.payload.student };
                }
            })
            .addCase(fetchStudentFees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Collect fee
            .addCase(collectFee.pending, (state) => {
                state.collectLoading = true;
            })
            .addCase(collectFee.fulfilled, (state, action) => {
                state.collectLoading = false;
                state.lastReceipt = action.payload;
            })
            .addCase(collectFee.rejected, (state, action) => {
                state.collectLoading = false;
                state.error = action.payload;
            })
            // Fetch defaulters
            .addCase(fetchDefaulters.fulfilled, (state, action) => {
                state.defaulters = action.payload;
            })
            // Fetch fee payments
            .addCase(fetchFeePayments.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFeePayments.fulfilled, (state, action) => {
                state.loading = false;
                state.payments = action.payload || [];
            })
            .addCase(fetchFeePayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch student payments
            .addCase(fetchStudentPayments.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStudentPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.studentPayments = action.payload || [];
            })
            .addCase(fetchStudentPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Record payment
            .addCase(recordPayment.pending, (state) => {
                state.collectLoading = true;
            })
            .addCase(recordPayment.fulfilled, (state, action) => {
                state.collectLoading = false;
                state.payments = [action.payload, ...state.payments];
                state.lastReceipt = action.payload;
            })
            .addCase(recordPayment.rejected, (state, action) => {
                state.collectLoading = false;
                state.error = action.payload;
            })
            // Update student fee
            .addCase(updateStudentFee.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateStudentFee.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateStudentFee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch fee structures
            .addCase(fetchFeeStructures.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFeeStructures.fulfilled, (state, action) => {
                state.loading = false;
                state.feeStructures = action.payload || [];
            })
            .addCase(fetchFeeStructures.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Generate fees
            .addCase(generateFees.pending, (state) => {
                state.loading = true;
            })
            .addCase(generateFees.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(generateFees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch fee metadata
            .addCase(fetchFeeMetadata.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFeeMetadata.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(fetchFeeMetadata.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create fee type
            .addCase(createFeeType.pending, (state) => {
                state.loading = true;
            })
            .addCase(createFeeType.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createFeeType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete fee type
            .addCase(deleteFeeType.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteFeeType.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deleteFeeType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, setSelectedStudent, clearSelectedStudent, clearLastReceipt } = feesSlice.actions;
export default feesSlice.reducer;
