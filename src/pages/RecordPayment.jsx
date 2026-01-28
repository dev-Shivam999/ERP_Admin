import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, User, IndianRupee, Calendar as CalendarIcon, Receipt, Search, CheckCircle, AlertCircle, Clock, Sparkles, Send, BookOpen } from 'lucide-react';
import { recordPayment, searchStudents, setSelectedStudent, clearError, fetchPendingFees, fetchFeeMetadata, fetchStudentFees, fetchStudentPayments, collectFee } from '../store/slices/feesSlice';

const RecordPayment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, collectLoading, searchLoading, searchResults = [], selectedStudent, studentFees = [], studentPayments = [] } = useSelector((state) => state.fees || {});

    const [studentSearch, setStudentSearch] = useState('');
    const [feeTypes, setFeeTypes] = useState([]);
    const [manualEntry, setManualEntry] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);

    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        paymentMode: 'cash',
        feeType: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        paymentDate: new Date().toISOString().split('T')[0],
        remarks: '',
        studentFeeId: null
    });

    useEffect(() => {
        const loadMetadata = async () => {
            const res = await dispatch(fetchFeeMetadata());
            if (res.payload?.feeTypes) {
                setFeeTypes(res.payload.feeTypes);
                if (res.payload.feeTypes.length > 0) {
                    setPaymentForm(prev => ({ ...prev, feeType: res.payload.feeTypes[0].name.toLowerCase() }));
                }
            }
        };
        loadMetadata();

        if (error) {
            alert(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const runSearch = (term) => {
        const q = String(term || '').trim();
        if (!q) {
            setShowSearchDropdown(false);
            return;
        }
        dispatch(searchStudents(q));
        setShowSearchDropdown(true);
    };

    useEffect(() => {
        const q = studentSearch.trim();
        if (q.length < 2) {
            setShowSearchDropdown(false);
            return;
        }

        const t = setTimeout(() => {
            runSearch(q);
        }, 350);

        return () => clearTimeout(t);
    }, [studentSearch]);

    useEffect(() => {
        if (studentSearch.trim() && searchResults?.length) {
            setShowSearchDropdown(true);
        }
    }, [searchResults, studentSearch]);

    const selectStudent = async (student) => {
        dispatch(setSelectedStudent(student));
        setStudentSearch(student?.admission_number || `${student?.first_name || ''} ${student?.last_name || ''}`.trim());
        setShowSearchDropdown(false);
        if (student?.id) {
            dispatch(fetchStudentFees(student.id));
            dispatch(fetchStudentPayments(student.id));
        }
    };

    const selectDue = (due) => {
        setPaymentForm({
            ...paymentForm,
            amount: due.amount_pending,
            feeType: (due.fee_type_name || 'tuition').toLowerCase(),
            month: due.month || due.period_month,
            year: due.year || due.period_year,
            studentFeeId: due.id
        });
        setManualEntry(false);
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!paymentForm.amount || !selectedStudent) {
            alert('Selection incomplete: Missing student or quantum.');
            return;
        }

        let result;
        if (paymentForm.studentFeeId) {
            result = await dispatch(collectFee({
                studentId: selectedStudent.id,
                studentFeeIds: [paymentForm.studentFeeId],
                amount: paymentForm.amount,
                paymentMode: paymentForm.paymentMode,
                paymentDate: paymentForm.paymentDate,
                remarks: paymentForm.remarks
            }));
        } else {
            result = await dispatch(recordPayment({
                studentId: selectedStudent.id,
                amount: paymentForm.amount,
                paymentMode: paymentForm.paymentMode,
                feeType: paymentForm.feeType,
                month: `${paymentForm.year}-${String(paymentForm.month).padStart(2, '0')}`,
                remarks: paymentForm.remarks,
                paymentDate: paymentForm.paymentDate
            }));
        }

        if (result.meta.requestStatus === 'fulfilled') {
            alert('Payment successfully recorded.');
            dispatch(fetchPendingFees({}));
            navigate('/fees');
        }
    };

    const activeDues = studentFees.filter(f => f.amount_pending > 0);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="page-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/fees')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h2 className="page-title" style={{ margin: 0 }}>Record Student Payment</h2>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {/* Search Card */}
                <div className="card" style={{ overflow: 'visible' }}>
                    <div className="card-body" style={{ position: 'relative', overflow: 'visible' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label className="form-label">Search Student</label>
                                <div style={{ position: 'relative' }}>
                                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} size={20} />
                                    <input
                                        type="text"
                                        className="form-input"
                                        style={{ paddingLeft: '40px' }}
                                        placeholder="Enter Admission Number or Name..."
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                        onFocus={() => studentSearch.trim() && setShowSearchDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowSearchDropdown(false), 150)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                runSearch(studentSearch);
                                            }
                                        }}
                                    />

                                    {showSearchDropdown && studentSearch.trim() && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 8px)',
                                            left: 0,
                                            right: 0,
                                            background: '#fff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.12)',
                                            overflow: 'hidden',
                                            zIndex: 50
                                        }}>
                                            {searchLoading ? (
                                                <div style={{ padding: '0.9rem 1rem', color: '#64748b' }}>Searching…</div>
                                            ) : (searchResults?.length ? (
                                                <div style={{ maxHeight: '280px', overflow: 'auto' }}>
                                                    {searchResults.slice(0, 10).map((s) => (
                                                        <button
                                                            key={s.id}
                                                            type="button"
                                                            onClick={() => selectStudent(s)}
                                                            style={{
                                                                width: '100%',
                                                                textAlign: 'left',
                                                                padding: '0.85rem 1rem',
                                                                border: 0,
                                                                background: 'transparent',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <div style={{ fontWeight: 700, color: '#111827' }}>
                                                                {s.first_name} {s.last_name}
                                                                <span style={{ marginLeft: '0.5rem', fontWeight: 700, color: '#4f46e5' }}>
                                                                    ({s.admission_number})
                                                                </span>
                                                            </div>
                                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                                {s.class_name} {s.section_name ? `- ${s.section_name}` : ''}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{ padding: '0.9rem 1rem', color: '#b45309', background: '#fff7ed' }}>
                                                    No students found.
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn-primary"
                                disabled={!studentSearch.trim()}
                                style={{ height: '42px', padding: '0 1.25rem' }}
                                onClick={() => runSearch(studentSearch)}
                            >
                                {searchLoading ? 'Searching…' : 'Search'}
                            </button>
                            <button
                                type="button"
                                className="btn-secondary"
                                disabled={!selectedStudent}
                                style={{ height: '42px', padding: '0 2rem' }}
                                onClick={() => selectedStudent?.id && dispatch(fetchStudentFees(selectedStudent.id))}
                                title={!selectedStudent ? 'Select a student first' : 'Refresh dues'}
                            >
                                {loading ? 'Refreshing…' : 'Refresh Dues'}
                            </button>
                        </div>

                        {selectedStudent && (
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1.25rem',
                                background: '#f8fafc',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.25rem'
                            }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: '#4f46e5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <User size={30} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 0.25rem 0', color: '#111827', fontSize: '1.125rem' }}>
                                        {selectedStudent.first_name} {selectedStudent.last_name}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
                                        <span style={{ color: '#4f46e5', fontWeight: 600 }}>ID: {selectedStudent.admission_number}</span>
                                        <span style={{ color: '#64748b' }}>{selectedStudent.class_name} - {selectedStudent.section_name}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Outstanding Balance</p>
                                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#e11d48' }}>
                                        ₹{activeDues.reduce((s, f) => s + parseFloat(f.amount_pending), 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                    {/* Pending Dues List */}
                    <div className="card">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={20} /> Pending Dues
                            </h3>
                            <button
                                onClick={() => setManualEntry(!manualEntry)}
                                className="btn-secondary"
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                            >
                                {manualEntry ? 'Switch to Selection' : 'Custom Entry'}
                            </button>
                        </div>
                        <div className="card-body">
                            {selectedStudent ? (
                                <>
                                    {activeDues.length === 0 && (
                                        <div style={{
                                            padding: '1.25rem',
                                            borderRadius: '12px',
                                            background: '#fef3c7',
                                            border: '1px solid #fcd34d',
                                            marginBottom: '1.5rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.5rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e', fontWeight: 700 }}>
                                                <AlertCircle size={18} />
                                                No recorded dues found
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#b45309' }}>
                                                The system shows no unpaid fee records for this student.
                                            </p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, color: '#92400e' }}>
                                                Expected monthly fee: ₹{parseFloat(selectedStudent.expected_monthly_fee || 0).toLocaleString()}
                                            </p>
                                            <button
                                                className="btn-primary"
                                                style={{ marginTop: '0.25rem', padding: '0.5rem 1rem', fontSize: '0.875rem', width: 'fit-content', background: '#d97706', borderColor: '#d97706' }}
                                                onClick={() => {
                                                    setPaymentForm({
                                                        ...paymentForm,
                                                        amount: selectedStudent.expected_monthly_fee,
                                                        feeType: 'tuition',
                                                        month: new Date().getMonth() + 1,
                                                        year: new Date().getFullYear(),
                                                        studentFeeId: null
                                                    });
                                                    setManualEntry(true);
                                                }}
                                            >
                                                Use Expected Fee
                                            </button>
                                        </div>
                                    )}

                                    {activeDues.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {activeDues.map((due) => (
                                                <div
                                                    key={due.id}
                                                    onClick={() => selectDue(due)}
                                                    style={{
                                                        padding: '1rem',
                                                        borderRadius: '12px',
                                                        border: `2px solid ${paymentForm.studentFeeId === due.id ? '#4f46e5' : '#f1f5f9'}`,
                                                        background: paymentForm.studentFeeId === due.id ? '#eef2ff' : '#fff',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '1rem',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ margin: 0, fontWeight: 600 }}>{due.fee_type_name}</p>
                                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                                                            {months[(due.month || due.period_month) - 1]} {due.year || due.period_year}
                                                        </p>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <p style={{ margin: 0, fontWeight: 700, color: '#e11d48' }}>
                                                            ₹{parseFloat(due.amount_pending).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                            <CheckCircle size={48} style={{ marginBottom: '1rem', color: '#10b981', opacity: 0.5 }} />
                                            <p>Record is clear.</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                    <Search size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                    <p>Search for a student to view their dues.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Collect Payment</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Fee Type</label>
                                    <select
                                        className="form-select"
                                        value={paymentForm.feeType}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, feeType: e.target.value })}
                                        disabled={!manualEntry}
                                    >
                                        {feeTypes.map(type => <option key={type.id} value={type.name.toLowerCase()}>{type.name}</option>)}
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Amount (₹)</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1.25rem', fontWeight: 600 }}>₹</span>
                                        <input
                                            type="number"
                                            className="form-input"
                                            style={{ paddingLeft: '30px', fontSize: '1.5rem', height: '56px', fontWeight: 700 }}
                                            placeholder="0.00"
                                            value={paymentForm.amount}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Payment Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={paymentForm.paymentDate}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Payment Mode</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                        {['cash', 'online', 'cheque'].map(mode => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => setPaymentForm({ ...paymentForm, paymentMode: mode })}
                                                style={{
                                                    padding: '0.75rem',
                                                    borderRadius: '8px',
                                                    border: `1px solid ${paymentForm.paymentMode === mode ? '#4f46e5' : '#e2e8f0'}`,
                                                    background: paymentForm.paymentMode === mode ? '#4f46e5' : '#f8fafc',
                                                    color: paymentForm.paymentMode === mode ? 'white' : '#64748b',
                                                    textTransform: 'capitalize',
                                                    cursor: 'pointer',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Remarks</label>
                                    <textarea
                                        className="form-input"
                                        style={{ minHeight: '60px' }}
                                        placeholder="Optional notes..."
                                        value={paymentForm.remarks}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ height: '52px', fontSize: '1.1rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    disabled={collectLoading || !selectedStudent || !paymentForm.amount}
                                >
                                    {collectLoading ? 'Processing...' : (
                                        <>
                                            <Save size={20} /> Submit Payment
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Recent Payments */}
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="card-title" style={{ margin: 0 }}>Recent Payments</h3>
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            Showing latest {Math.min(10, studentPayments.length || 0)} records
                        </span>
                    </div>
                    <div className="card-body">
                        {!selectedStudent && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                <Search size={36} style={{ marginBottom: '0.6rem', opacity: 0.5 }} />
                                <div>Select a student to view their payment history.</div>
                            </div>
                        )}

                        {selectedStudent && (!studentPayments || studentPayments.length === 0) && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                <CheckCircle size={36} style={{ marginBottom: '0.6rem', color: '#10b981', opacity: 0.6 }} />
                                <div>No payments recorded yet.</div>
                            </div>
                        )}

                        {selectedStudent && studentPayments && studentPayments.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {studentPayments.slice(0, 10).map((p) => (
                                    <div key={p.id} style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '10px',
                                        padding: '0.9rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '1rem'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#111827' }}>{p.fee_type_name || p.fee_type || 'Fee'}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                                {p.payment_date || p.created_at ? new Date(p.payment_date || p.created_at).toLocaleDateString() : ''}
                                                {p.payment_mode ? ` • ${p.payment_mode}` : ''}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 800, color: '#16a34a' }}>₹{parseFloat(p.amount || 0).toLocaleString()}</div>
                                            {p.receipt_number && <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Receipt: {p.receipt_number}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecordPayment;
