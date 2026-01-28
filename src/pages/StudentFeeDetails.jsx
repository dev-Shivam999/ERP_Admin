import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchStudentFees, fetchStudentPayments, collectFee, recordPayment, updateStudentFee, clearError, initializeFeeStructures } from '../store/slices/feesSlice';
import { IndianRupee, Calendar, Receipt, Edit2, Download, Save, ArrowLeft, Printer, User, BookOpen, Clock, CheckCircle, AlertCircle, TrendingUp, Sparkles, Send } from 'lucide-react';

const StudentFeeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedStudent, studentFees = [], studentPayments = [], loading, error, lastReceipt, totals } = useSelector((state) => state.fees);

    const [activeTab, setActiveTab] = useState('fees'); // 'fees', 'history', 'collect'
    const [editFee, setEditFee] = useState(null); // Fee being edited
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchStudentFees(id));
            dispatch(fetchStudentPayments(id));
        }
    }, [id, dispatch]);

    const handleEditFee = (fee) => {
        setEditFee({ ...fee, dueDate: fee.due_date ? fee.due_date.split('T')[0] : '' });
    };

    const handleUpdateFee = async () => {
        if (!editFee) return;

        const result = await dispatch(updateStudentFee({
            id: editFee.id,
            amount: editFee.amount_due,
            dueDate: editFee.dueDate
        }));

        if (result.meta.requestStatus === 'fulfilled') {
            setEditFee(null);
            dispatch(fetchStudentFees(id));
            alert('Fee updated successfully');
        }
    };

    const handleQuickPay = async (fee) => {
        if (window.confirm(`Record full payment of ₹${parseFloat(fee.amount_pending).toLocaleString()} for ${fee.fee_type_name || 'Generic Fee'}?`)) {
            const data = {
                studentId: id,
                studentFeeIds: [fee.id],
                amount: fee.amount_pending,
                paymentMode: 'cash',
                paymentDate: new Date().toISOString()
            };
            const result = await dispatch(collectFee(data));
            if (result.meta.requestStatus === 'fulfilled') {
                dispatch(fetchStudentFees(id));
                dispatch(fetchStudentPayments(id));
            }
        }
    };

    const handleGenerateFees = async () => {
        setIsGenerating(true);
        try {
            await dispatch(initializeFeeStructures());
            dispatch(fetchStudentFees(id));
            alert('Ledger entries synchronized');
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const printReceipt = (receipt) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return alert('Allow popups for receipts');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Receipt ${receipt.receipt_number}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1f2937; }
                        .receipt-card { max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 40px; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                        .header { text-align: center; border-bottom: 2px dashed #94a3b8; padding-bottom: 24px; margin-bottom: 24px; }
                        .sh-name { font-size: 26px; font-weight: 900; color: #4f46e5; margin: 0; }
                        .sh-tag { font-size: 13px; color: #64748b; margin-top: 5px; font-weight: 700; }
                        .row { display: flex; justify-content: space-between; margin-bottom: 12px; }
                        .label { color: #64748b; font-weight: 600; }
                        .value { font-weight: 800; }
                        .total-row { background: #f8fafc; padding: 20px; border-radius: 12px; margin-top: 24px; }
                        .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #94a3b8; }
                    </style>
                </head>
                <body>
                    <div class="receipt-card">
                        <div class="header">
                            <h1 class="sh-name">ACADEMIC PRO ERP</h1>
                            <p class="sh-tag">OFFICIAL FEE RECEIPT</p>
                        </div>
                        <div class="row"><span class="label">Receipt No.</span> <span class="value">#${receipt.receipt_number}</span></div>
                        <div class="row"><span class="label">Date</span> <span class="value">${new Date(receipt.payment_date).toLocaleDateString()}</span></div>
                        <div class="row"><span class="label">Student</span> <span class="value">${selectedStudent?.student_name}</span></div>
                        <div class="row"><span class="label">Admission No.</span> <span class="value">${selectedStudent?.admission_number}</span></div>
                        <div class="row"><span class="label">Class</span> <span class="value">${selectedStudent?.class_name} • ${selectedStudent?.section_name}</span></div>
                        
                        <div class="total-row">
                            <div class="row" style="margin-bottom: 0;">
                                <span class="label" style="font-size: 16px;">Total Paid</span>
                                <span class="value" style="font-size: 22px; color: #10b981;">₹${parseFloat(receipt.amount_paid).toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        ${receipt.remarks ? `<div class="row" style="margin-top:20px;"><span class="label">Remarks</span> <span class="value">${receipt.remarks}</span></div>` : ''}
                        
                        <div class="footer">
                            <p>Computer generated document. No signature required.</p>
                            <p>Thank you for your academic support.</p>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 500);
    };

    if (loading && !selectedStudent) return (
        <div className="page-content">
            <div className="card">
                <div className="card-body" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: 18,
                        height: 18,
                        border: '3px solid #e5e7eb',
                        borderTopColor: '#4f46e5',
                        borderRadius: '999px',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <div style={{ color: '#64748b', fontWeight: 700 }}>Loading student fees…</div>
                </div>
            </div>
        </div>
    );

    if (!selectedStudent) return (
        <div className="page-content">
            <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
                <div className="card-body" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{
                        width: 72,
                        height: 72,
                        margin: '0 auto 1rem',
                        borderRadius: 16,
                        background: '#fff1f2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#e11d48'
                    }}>
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="page-title" style={{ marginBottom: '0.5rem' }}>Student not found</h2>
                    <p style={{ margin: 0, color: '#64748b' }}>Please go back and search again.</p>
                    <button onClick={() => navigate('/fees')} className="btn-primary" style={{ marginTop: '1.25rem' }}>
                        Back to Fees
                    </button>
                </div>
            </div>
        </div>
    );

    const totalDue = totals?.totalDue ?? studentFees.reduce((sum, f) => sum + parseFloat(f.amount_due || 0), 0);
    const totalPaid = totals?.totalPaid ?? studentFees.reduce((sum, f) => sum + parseFloat(f.amount_paid || 0), 0);
    const totalPending = totals?.totalPending ?? studentFees.reduce((sum, f) => sum + parseFloat(f.amount_pending || 0), 0);
    const paidPercentage = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const paidByType = studentPayments.reduce((acc, p) => {
        const key = p.fee_type_name || p.fee_type || 'Other';
        acc[key] = (acc[key] || 0) + parseFloat(p.amount || 0);
        return acc;
    }, {});

    const pendingByType = studentFees.reduce((acc, f) => {
        const pending = parseFloat(f.amount_pending || 0);
        if (pending <= 0) return acc;
        const key = f.fee_type_name || f.fee_type || 'Other';
        acc[key] = (acc[key] || 0) + pending;
        return acc;
    }, {});

    return (
        <div className="page-content">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/fees')}
                        className="btn-secondary"
                        style={{ height: 42, padding: '0 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, borderRadius: 10 }}
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h2 className="page-title" style={{ margin: 0 }}>Student Fees</h2>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleGenerateFees}
                        disabled={isGenerating}
                        className="btn-secondary"
                        style={{ height: 42, padding: '0 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, borderRadius: 10 }}
                    >
                        <Sparkles size={18} />
                        {isGenerating ? 'Syncing…' : 'Sync ledger'}
                    </button>
                </div>
            </div>

            {/* Student card */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: 56,
                            height: 56,
                            borderRadius: 14,
                            background: '#4f46e5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            overflow: 'hidden'
                        }}>
                            {selectedStudent.photo_url ? (
                                <img src={selectedStudent.photo_url} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={26} />
                            )}
                        </div>
                        <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>{selectedStudent.student_name}</div>
                            <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
                                ID: {selectedStudent.admission_number} • {selectedStudent.class_name}{selectedStudent.section_name ? ` - ${selectedStudent.section_name}` : ''}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Paid</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#16a34a' }}>₹{Number(totalPaid).toLocaleString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Pending</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#e11d48' }}>₹{Number(totalPending).toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="card" style={{ gridColumn: 'span 4' }}>
                    <div className="card-body">
                        <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.85rem' }}>Total Due</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#111827' }}>₹{Number(totalDue).toLocaleString()}</div>
                    </div>
                </div>
                <div className="card" style={{ gridColumn: 'span 4' }}>
                    <div className="card-body">
                        <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.85rem' }}>Total Paid</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#16a34a' }}>₹{Number(totalPaid).toLocaleString()}</div>
                    </div>
                </div>
                <div className="card" style={{ gridColumn: 'span 4' }}>
                    <div className="card-body">
                        <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.85rem' }}>Total Pending</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#e11d48' }}>₹{Number(totalPending).toLocaleString()}</div>
                    </div>
                </div>
                <div className="card" style={{ gridColumn: 'span 12' }}>
                    <div className="card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                            <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.85rem' }}>Paid progress</div>
                            <div style={{ fontWeight: 900, color: '#4f46e5' }}>{paidPercentage}%</div>
                        </div>
                        <div style={{ height: 10, background: '#e2e8f0', borderRadius: 999 }}>
                            <div style={{ height: 10, width: `${paidPercentage}%`, background: '#4f46e5', borderRadius: 999, transition: 'width 250ms ease' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="card" style={{ gridColumn: 'span 6' }}>
                    <div className="card-header">
                        <h3 className="card-title" style={{ margin: 0 }}>Paid by fee type</h3>
                    </div>
                    <div className="card-body">
                        {Object.keys(paidByType).length === 0 ? (
                            <div style={{ color: '#94a3b8' }}>No payments yet.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {Object.entries(paidByType).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                        <div style={{ fontWeight: 700, color: '#334155' }}>{k}</div>
                                        <div style={{ fontWeight: 900, color: '#16a34a' }}>₹{Number(v).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="card" style={{ gridColumn: 'span 6' }}>
                    <div className="card-header">
                        <h3 className="card-title" style={{ margin: 0 }}>Pending by fee type</h3>
                    </div>
                    <div className="card-body">
                        {Object.keys(pendingByType).length === 0 ? (
                            <div style={{ color: '#94a3b8' }}>No pending dues.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {Object.entries(pendingByType).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                        <div style={{ fontWeight: 700, color: '#334155' }}>{k}</div>
                                        <div style={{ fontWeight: 900, color: '#e11d48' }}>₹{Number(v).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>Details</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            type="button"
                            className={activeTab === 'fees' ? 'btn-primary' : 'btn-secondary'}
                            onClick={() => setActiveTab('fees')}
                            style={{ height: 40, padding: '0 0.95rem', fontSize: '0.875rem', fontWeight: 700, borderRadius: 10 }}
                        >
                            Fee details
                        </button>
                        <button
                            type="button"
                            className={activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}
                            onClick={() => setActiveTab('history')}
                            style={{ height: 40, padding: '0 0.95rem', fontSize: '0.875rem', fontWeight: 700, borderRadius: 10 }}
                        >
                            Payment history
                        </button>
                    </div>
                </div>

                <div className="card-body">
                    {activeTab === 'fees' && (
                        <>
                            {studentFees.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                    <Clock size={40} style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
                                    <div style={{ fontWeight: 700 }}>No fee records found.</div>
                                    <button onClick={handleGenerateFees} className="btn-primary" style={{ marginTop: '1rem' }}>
                                        Sync Ledger
                                    </button>
                                </div>
                            ) : (
                                <div style={{ overflow: 'auto' }}>
                                    <table className="w-full">
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b', fontSize: '0.8rem' }}>Fee Type</th>
                                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b', fontSize: '0.8rem' }}>Period</th>
                                                <th style={{ textAlign: 'right', padding: '0.75rem', color: '#64748b', fontSize: '0.8rem' }}>Due</th>
                                                <th style={{ textAlign: 'right', padding: '0.75rem', color: '#64748b', fontSize: '0.8rem' }}>Paid</th>
                                                <th style={{ textAlign: 'right', padding: '0.75rem', color: '#64748b', fontSize: '0.8rem' }}>Pending</th>
                                                <th style={{ textAlign: 'center', padding: '0.75rem', color: '#64748b', fontSize: '0.8rem' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentFees.map((fee) => (
                                                <tr key={fee.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#111827' }}>
                                                        {fee.fee_type_name || 'Fee'}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.75rem', color: '#64748b', fontWeight: 600 }}>
                                                        {months[(fee.month || 1) - 1]} {fee.year}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: 800 }}>
                                                        ₹{Number(fee.amount_due || 0).toLocaleString()}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>
                                                        ₹{Number(fee.amount_paid || 0).toLocaleString()}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: 800, color: '#e11d48' }}>
                                                        ₹{Number(fee.amount_pending || 0).toLocaleString()}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                            {Number(fee.amount_pending || 0) > 0 && (
                                                                <button className="btn-primary" type="button" onClick={() => handleQuickPay(fee)} style={{ height: 34, padding: '0 0.75rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: 10 }}>
                                                                    Pay
                                                                </button>
                                                            )}
                                                            <button className="btn-secondary" type="button" onClick={() => handleEditFee(fee)} style={{ height: 34, padding: '0 0.6rem', borderRadius: 10 }}>
                                                                <Edit2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'history' && (
                        <>
                            {studentPayments.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                    <Receipt size={40} style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
                                    <div style={{ fontWeight: 700 }}>No payments recorded.</div>
                                </div>
                            ) : (
                                <div style={{ overflow: 'auto' }}>
                                    <table className="w-full">
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b', fontSize: '0.8rem' }}>Receipt</th>
                                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b', fontSize: '0.8rem' }}>Date</th>
                                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b', fontSize: '0.8rem' }}>Mode</th>
                                                <th style={{ textAlign: 'right', padding: '0.75rem', color: '#64748b', fontSize: '0.8rem' }}>Amount</th>
                                                <th style={{ textAlign: 'center', padding: '0.75rem', color: '#64748b', fontSize: '0.8rem' }}>Receipt</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentPayments.map((payment) => (
                                                <tr key={payment.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 800, color: '#4f46e5' }}>
                                                        #{payment.receipt_number || payment.id}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.75rem', color: '#64748b', fontWeight: 600 }}>
                                                        {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : ''}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'capitalize' }}>
                                                        {payment.payment_mode || '-'}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: 900, color: '#16a34a' }}>
                                                        ₹{Number(payment.amount_paid || payment.amount || 0).toLocaleString()}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                                                        <button className="btn-secondary" type="button" onClick={() => printReceipt(payment)} style={{ height: 34, padding: '0 0.75rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                                            <Printer size={16} /> Print
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Edit fee modal */}
            {editFee && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.55)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: 720 }}>
                        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 className="card-title" style={{ margin: 0 }}>Edit fee</h3>
                            <button type="button" className="btn-secondary" onClick={() => setEditFee(null)} style={{ height: 40, padding: '0 0.95rem', borderRadius: 10, fontWeight: 700 }}>Close</button>
                        </div>
                        <div className="card-body" style={{ display: 'grid', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Amount due (₹)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={editFee.amount_due}
                                    onChange={(e) => setEditFee({ ...editFee, amount_due: e.target.value })}
                                />
                                <div style={{ marginTop: '0.35rem', color: '#64748b', fontSize: '0.85rem' }}>
                                    Amount due cannot be less than already paid (₹{Number(editFee.amount_paid || 0).toLocaleString()}).
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Due date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={editFee.dueDate}
                                    onChange={(e) => setEditFee({ ...editFee, dueDate: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                <button type="button" className="btn-secondary" onClick={() => setEditFee(null)} style={{ height: 40, padding: '0 0.95rem', borderRadius: 10, fontWeight: 700 }}>Cancel</button>
                                <button type="button" className="btn-primary" onClick={handleUpdateFee} style={{ height: 40, padding: '0 0.95rem', borderRadius: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Save size={18} /> Save changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentFeeDetails;
