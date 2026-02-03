import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Receipt, IndianRupee, Download, Filter, Eye, Printer, Save, Settings, BookOpen, Shirt, Bus, Sparkles, Calendar } from 'lucide-react';
import { fetchFeePayments, fetchPendingFees, recordPayment, clearError, searchStudentByAdmission, fetchFeeStructures, generateFees } from '../store/slices/feesSlice';
import { fetchClasses } from '../store/slices/academicSlice';

const Fees = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pendingFees = [], payments = [], feeSummary, feeStructures = [], loading, error } = useSelector((state) => state.fees || {});
    const { classes = [] } = useSelector((state) => state.academic || {});

    const [activeTab, setActiveTab] = useState('collection'); // 'collection', 'structure', 'reports'
    const [search, setSearch] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [studentSearch, setStudentSearch] = useState('');
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [genForm, setGenForm] = useState({
        classIds: [], // Multi-selection
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const handleSearchStudent = async (e) => {
        e.preventDefault();
        if (!studentSearch.trim()) return;

        const result = await dispatch(searchStudentByAdmission(studentSearch));
        if (result.meta.requestStatus === 'fulfilled' && result.payload) {
            navigate(`/fees/student/${result.payload.id}`);
        } else {
            alert('Student not found!');
        }
    };

    // Dynamic fee structures are fetched from API


    const [paymentForm, setPaymentForm] = useState({
        studentId: '',
        amount: '',
        paymentMode: 'cash',
        feeType: 'tuition',
        month: new Date().toISOString().slice(0, 7),
        remarks: '',
    });

    useEffect(() => {
       const fetch = async () => {
     await Promise.allSettled ([  dispatch(fetchPendingFees({ search })),
        dispatch(fetchFeePayments()),
        dispatch(fetchFeeStructures())])
       }
       fetch();
        // dispatch(fetchClasses());
    }, [dispatch, search]);

    const handleGenerateBulk = async () => {
        if (!genForm.classIds || genForm.classIds.length === 0) return alert('Select at least one Class');

        try {
            const res = await dispatch(generateFees({
                classIds: genForm.classIds,
                month: genForm.month,
                year: genForm.year
            })).unwrap();
            alert(`Fees generated for ${res.createdCount} records`);
            setShowGenerateModal(false);
            dispatch(fetchPendingFees({}));
        } catch (error) {
            alert(error || 'Failed to generate fees');
        }
    };

    useEffect(() => {
        if (error) {
            alert(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    // Modal payment logic removed in favor of separate page


    const getTotalFee = (structure) => {
        return structure.tuitionFee + structure.admissionFee + structure.annualFee +
            structure.examFee + structure.bookFee + structure.dressFee +
            structure.transportFee + structure.otherFee;
    };

    const filteredPayments = payments.filter((p) => {
        const name = `${p.student_name || ''} ${p.admission_number || ''}`.toLowerCase();
        const matchSearch = name.includes(search.toLowerCase());
        const matchClass = !classFilter || p.class_name === classFilter;
        const matchStatus = !statusFilter || p.status === statusFilter;
        return matchSearch && matchClass && matchStatus;
    });

    const totalCollected = payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const totalPending = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    return (
        <>
            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card" onClick={() => navigate('/fees/details/today')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon warning">
                        <IndianRupee size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>₹{(feeSummary?.today_collection || 0).toLocaleString('en-IN')}</h3>
                        <p>Today's Collection</p>
                    </div>
                </div>
                <div className="stat-card" onClick={() => navigate('/fees/details/yearly')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon success">
                        <IndianRupee size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>₹{(feeSummary?.total_collected_year || 0).toLocaleString('en-IN')}</h3>
                        <p>Total Collection (Year)</p>
                    </div>
                </div>
                <div className="stat-card" onClick={() => navigate('/fees/details/pending')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon danger">
                        <IndianRupee size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>₹{(feeSummary?.total_pending_all || 0).toLocaleString('en-IN')}</h3>
                        <p>Total Pending Fees</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <Receipt size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{payments.length}</h3>
                        <p>Transactions</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-body" style={{ padding: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[
                            { id: 'collection', label: '💰 Fee Collection', icon: IndianRupee },
                            { id: 'structure', label: '⚙️ Fee Structure', icon: Settings },
                            { id: 'reports', label: '📊 Reports', icon: Receipt },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    border: 'none',
                                    background: activeTab === tab.id ? '#4f46e5' : 'transparent',
                                    color: activeTab === tab.id ? '#fff' : '#374151',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: activeTab === tab.id ? 600 : 400,
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fee Collection Tab */}
            {activeTab === 'collection' && (
                <>
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <div className="card-body">
                            <div className="filters">
                                <div className="search-box">
                                    <Search />
                                    <input
                                        type="text"
                                        placeholder="Search by name or admission no..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                <select
                                    className="form-select"
                                    style={{ width: '150px' }}
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="partial">Partial</option>
                                </select>

                                <button className="btn btn-primary" onClick={() => navigate('/fees/record-payment')}>
                                    <Plus size={18} /> Record Payment
                                </button>

                                <form onSubmit={handleSearchStudent} className="flex gap-2">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Find Student (Adm No)..."
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                        style={{ width: '200px' }}
                                    />
                                    <button type="submit" className="btn btn-outline">
                                        Go
                                    </button>
                                </form>

                                <button className="btn btn-outline" onClick={() => setShowGenerateModal(true)}>
                                    <Sparkles size={18} /> Bulk Generate
                                </button>
                                <button className="btn btn-outline">
                                    <Download size={18} /> Export
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Recent Fee Payments</h3>
                        </div>
                        <div className="table-container">
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                                    Loading payments...
                                </div>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Student Name</th>
                                            <th>Admission No</th>
                                            <th>Class</th>
                                            <th>Section</th>
                                            <th className="text-right">Total Due</th>
                                            <th className="text-right">Total Paid</th>
                                            <th className="text-right">Pending</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingFees.length > 0 ? (
                                            pendingFees.map((student) => {
                                                const isPaid = parseFloat(student.total_pending || 0) <= 0;
                                                return (
                                                    <tr key={student.student_id}>
                                                        <td><strong>{student.student_name}</strong></td>
                                                        <td>{student.admission_number}</td>
                                                        <td>{student.class_name}</td>
                                                        <td>{student.section_name}</td>
                                                        <td className="text-right">₹{parseFloat(student.total_due).toLocaleString('en-IN')}</td>
                                                        <td className="text-right text-green-600">₹{parseFloat(student.total_paid).toLocaleString('en-IN')}</td>
                                                        <td className="text-right" style={{ color: isPaid ? '#10b981' : '#ef4444' }}>
                                                            <strong>
                                                                {isPaid ? '✓ Complete' : `₹${parseFloat(student.total_pending).toLocaleString('en-IN')}`}
                                                            </strong>
                                                        </td>
                                                        <td className="text-center">
                                                            <button
                                                                className={`btn btn-sm ${isPaid ? 'btn-outline' : 'btn-primary'}`}
                                                                onClick={() => navigate(`/fees/student/${student.student_id}`)}
                                                            >
                                                                {isPaid ? 'View' : 'Submit Fees'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={8} style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                                                    No students found with pending fees
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </>
            )
            }

            {/* Fee Structure Tab */}
            {
                activeTab === 'structure' && (
                    <div className="card">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3 className="card-title">📋 Class-wise Fee Structure (₹)</h3>
                            <p className="text-sm text-gray-500">Edit from Settings</p>
                        </div>
                        <div className="card-body" style={{ padding: 0 }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th style={{ position: 'sticky', left: 0, background: '#f9fafb', zIndex: 1 }}>Class</th>
                                            <th style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <IndianRupee size={16} />
                                                    <span>Tuition Fee</span>
                                                    <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>(Monthly)</span>
                                                </div>
                                            </th>
                                            <th style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <span>🎓 Admission</span>
                                                    <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>(One Time)</span>
                                                </div>
                                            </th>
                                            <th style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <span>📅 Annual Fee</span>
                                                    <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>(Yearly)</span>
                                                </div>
                                            </th>
                                            <th style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <span>📝 Exam Fee</span>
                                                    <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>(Per Exam)</span>
                                                </div>
                                            </th>
                                            <th style={{ textAlign: 'center', background: '#fef3c7' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <BookOpen size={16} />
                                                    <span>Book Fee</span>
                                                    <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>(Optional)</span>
                                                </div>
                                            </th>
                                            <th style={{ textAlign: 'center', background: '#fef3c7' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <Shirt size={16} />
                                                    <span>Dress Fee</span>
                                                    <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>(Optional)</span>
                                                </div>
                                            </th>
                                            <th style={{ textAlign: 'center', background: '#fef3c7' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <Bus size={16} />
                                                    <span>Transport</span>
                                                    <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>(Monthly/Opt)</span>
                                                </div>
                                            </th>
                                            <th style={{ textAlign: 'center', background: '#fef3c7' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <span>🎒 Other</span>
                                                    <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>(Optional)</span>
                                                </div>
                                            </th>
                                            <th style={{ textAlign: 'center', background: '#dcfce7' }}>
                                                <strong>Total Annual</strong>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.values(feeStructures.reduce((acc, fee) => {
                                            if (!acc[fee.class_name]) {
                                                acc[fee.class_name] = { class: fee.class_name, total: 0, items: {} };
                                            }
                                            acc[fee.class_name].items[fee.fee_type_name.toLowerCase()] = fee.amount;
                                            acc[fee.class_name].total += parseFloat(fee.amount);
                                            return acc;
                                        }, {})).map((fee) => (
                                            <tr key={fee.class}>
                                                <td style={{ position: 'sticky', left: 0, background: '#fff', fontWeight: 600, zIndex: 1 }}>
                                                    {fee.class}
                                                </td>
                                                <td className="text-right">₹{(fee.items['tuition fee'] || 0).toLocaleString()}</td>
                                                <td className="text-right">₹{(fee.items['admission fee'] || 0).toLocaleString()}</td>
                                                <td className="text-right">₹{(fee.items['annual fee'] || 0).toLocaleString()}</td>
                                                <td className="text-right">₹{(fee.items['exam fee'] || 0).toLocaleString()}</td>
                                                <td className="text-right" style={{ background: '#fffbeb' }}>₹{(fee.items['book fee'] || 0).toLocaleString()}</td>
                                                <td className="text-right" style={{ background: '#fffbeb' }}>₹{(fee.items['dress fee'] || 0).toLocaleString()}</td>
                                                <td className="text-right" style={{ background: '#fffbeb' }}>₹{(fee.items['transport fee'] || 0).toLocaleString()}</td>
                                                <td className="text-right" style={{ background: '#fffbeb' }}>₹{(fee.items['other fee'] || 0).toLocaleString()}</td>
                                                <td style={{ background: '#dcfce7', textAlign: 'right', fontWeight: 600 }}>
                                                    ₹{fee.total.toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ padding: '1rem', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    <strong>Note:</strong> Yellow highlighted columns are optional fees. Total Annual = (Tuition × 12) + Admission + Annual + (Exam × 2) + Books + Dress + (Transport × 12) + Other
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Reports Tab */}
            {
                activeTab === 'reports' && (
                    <div className="card">
                        <div className="card-body" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                            <Receipt size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p>Fee Reports coming soon...</p>
                            <p style={{ fontSize: '0.875rem' }}>Class-wise collection, pending dues, monthly reports</p>
                        </div>
                    </div>
                )
            }

            {/* Bulk Generate Modal */}
            {showGenerateModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: '#fff', padding: '2rem', borderRadius: '12px',
                        width: '500px', maxWidth: '95%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                    }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🚀 Bulk Fee Generation
                        </h3>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label className="form-label" style={{ margin: 0 }}>Select Classes</label>
                                <button
                                    className="btn btn-sm btn-outline"
                                    onClick={() => {
                                        if (genForm.classIds.length === classes.length) {
                                            setGenForm(p => ({ ...p, classIds: [] }));
                                        } else {
                                            setGenForm(p => ({ ...p, classIds: classes.map(c => c.id) }));
                                        }
                                    }}
                                >
                                    {genForm.classIds.length === classes.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                            <div style={{
                                maxHeight: '200px',
                                overflowY: 'auto',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '1rem',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.5rem'
                            }}>
                                {classes.map(c => (
                                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={genForm.classIds.includes(c.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setGenForm(p => ({ ...p, classIds: [...p.classIds, c.id] }));
                                                } else {
                                                    setGenForm(p => ({ ...p, classIds: p.classIds.filter(id => id !== c.id) }));
                                                }
                                            }}
                                        />
                                        {c.name}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Month</label>
                                <select
                                    className="form-select"
                                    value={genForm.month}
                                    onChange={(e) => setGenForm(p => ({ ...p, month: parseInt(e.target.value) }))}
                                >
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Year</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={genForm.year}
                                    onChange={(e) => setGenForm(p => ({ ...p, year: parseInt(e.target.value) }))}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef3c7', borderRadius: '8px', color: '#92400e', fontSize: '0.875rem' }}>
                            <strong>Note:</strong> This will create fee records for all active students in the selected group for the specified month. Existing records will not be overwritten.
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                            <button className="btn btn-outline" onClick={() => setShowGenerateModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleGenerateBulk} disabled={loading}>
                                <Sparkles size={16} /> {loading ? 'Processing...' : 'Generate Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Fees;
