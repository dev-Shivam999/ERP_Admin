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
        <div className="flex items-center justify-center min-vh-100 bg-slate-50">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
                    <div className="absolute top-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="text-indigo-600 font-black tracking-widest text-[10px] uppercase">Retrieving Data Matrix...</div>
            </div>
        </div>
    );

    if (!selectedStudent) return (
        <div className="p-12 text-center max-w-lg mx-auto mt-24 bg-white rounded-[3rem] shadow-2xl border border-slate-100">
            <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-rose-500"><AlertCircle size={48} /></div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Record Lost</h2>
            <p className="text-slate-400 mt-4 font-bold uppercase text-xs tracking-widest leading-relaxed">The student profile could not be localized.</p>
            <button onClick={() => navigate('/fees')} className="mt-10 w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm tracking-widest hover:bg-indigo-700 transition-all shadow-xl">RETRIEVE DIRECTORY</button>
        </div>
    );

    const totalDue = totals?.totalDue ?? studentFees.reduce((sum, f) => sum + parseFloat(f.amount_due || 0), 0);
    const totalPaid = totals?.totalPaid ?? studentFees.reduce((sum, f) => sum + parseFloat(f.amount_paid || 0), 0);
    const totalPending = totals?.totalPending ?? studentFees.reduce((sum, f) => sum + parseFloat(f.amount_pending || 0), 0);
    const paidPercentage = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="page-content" style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem' }}>
            {/* Header / Navigation */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
                <button
                    onClick={() => navigate('/fees')}
                    className="flex items-center gap-3 px-6 py-3 text-slate-600 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-100 font-black text-xs uppercase tracking-widest"
                >
                    <ArrowLeft size={20} /> Operational Grid
                </button>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={handleGenerateFees}
                        disabled={isGenerating}
                        className="flex items-center gap-2.5 px-6 py-3 bg-white text-indigo-600 rounded-2xl font-black border border-indigo-100 hover:bg-slate-50 transition-all shadow-sm text-xs uppercase tracking-widest"
                    >
                        {isGenerating ? <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={20} />}
                        Sync Ledger
                    </button>
                    <button className="flex items-center gap-2.5 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 text-xs uppercase tracking-widest">
                        <Download size={20} /> Snapshot
                    </button>
                </div>
            </div>

            {/* Profile Overview Card - Advanced Premium Style */}
            <div className="relative overflow-hidden mb-12 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-white" style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
            }} id="student-profile-card">
                <div className="absolute top-0 right-0 p-32 opacity-[0.02] pointer-events-none rotate-12"><IndianRupee size={300} /></div>

                <div className="p-12 flex flex-col xl:flex-row justify-between items-center gap-12 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-indigo-600 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                            <div className="w-44 h-44 rounded-[3rem] bg-gradient-to-br from-slate-900 via-indigo-900 to-indigo-600 flex items-center justify-center text-white relative z-10 shadow-2xl border-4 border-white">
                                {selectedStudent.photo_url ? (
                                    <img src={selectedStudent.photo_url} alt="Profile" className="w-full h-full object-cover rounded-[2.8rem]" />
                                ) : (
                                    <User size={80} />
                                )}
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-6">{selectedStudent.student_name}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                                <span className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.25em] shadow-xl">
                                    {selectedStudent.admission_number}
                                </span>
                                <span className="px-6 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] font-black tracking-widest text-indigo-600 uppercase">
                                    {selectedStudent.class_name} • SECTION {selectedStudent.section_name}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-10 w-full xl:min-w-[450px]">
                        <div className="w-full">
                            <div className="flex justify-between items-end mb-4 px-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Financial Integrity</span>
                                <span className="text-3xl font-black text-indigo-600 leading-none">{paidPercentage}%</span>
                            </div>
                            <div className="h-7 bg-white rounded-3xl overflow-hidden p-1.5 shadow-inner border border-slate-100">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-700 via-indigo-500 to-emerald-400 rounded-2xl transition-all duration-1500 ease-out shadow-lg"
                                    style={{ width: `${paidPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-5">
                            <div className="bg-white p-7 rounded-[2rem] border border-slate-50 shadow-sm text-center transform hover:scale-105 transition-all">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Owed</p>
                                <div className="text-2xl font-black text-slate-900 tracking-tight">₹{totalDue.toLocaleString()}</div>
                            </div>
                            <div className="bg-emerald-50/40 p-7 rounded-[2rem] border border-emerald-100 shadow-sm text-center transform hover:scale-105 transition-all">
                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-3">Liquidated</p>
                                <div className="text-2xl font-black text-emerald-700 tracking-tight">₹{totalPaid.toLocaleString()}</div>
                            </div>
                            <div className="bg-rose-50/40 p-7 rounded-[2rem] border border-rose-100 shadow-sm text-center transform hover:scale-105 transition-all">
                                <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-3">Deficit</p>
                                <div className="text-2xl font-black text-rose-700 tracking-tight">₹{totalPending.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Operational Matrix Tables */}
            <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden mb-20 min-h-[600px]">
                <div className="flex border-b border-slate-100 px-12 pt-6">
                    <button
                        onClick={() => setActiveTab('fees')}
                        className={`py-8 px-12 font-black text-[11px] tracking-[0.4em] transition-all relative uppercase ${activeTab === 'fees' ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-400'}`}
                    >
                        <div className="flex items-center gap-3">
                            <BookOpen size={22} /> System Ledger
                        </div>
                        {activeTab === 'fees' && <div className="absolute bottom-0 left-0 right-0 h-2 bg-indigo-600 rounded-t-3xl shadow-[0_-10px_30px_rgba(79,70,229,0.3)]"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`py-8 px-12 font-black text-[11px] tracking-[0.4em] transition-all relative uppercase ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-400'}`}
                    >
                        <div className="flex items-center gap-3">
                            <TrendingUp size={22} /> Audit Trail
                        </div>
                        {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-2 bg-indigo-600 rounded-t-3xl shadow-[0_-10px_30px_rgba(79,70,229,0.3)]"></div>}
                    </button>
                </div>

                <div className="p-12">
                    {activeTab === 'fees' && (
                        <div className="overflow-auto">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className="text-left font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] pb-10 pl-8">Component</th>
                                        <th className="text-left font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] pb-10 px-6">Cycle</th>
                                        <th className="text-right font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] pb-10 px-6">Liability (₹)</th>
                                        <th className="text-right font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] pb-10 px-6">Liquid (₹)</th>
                                        <th className="text-right font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] pb-10 px-6">Balance (₹)</th>
                                        <th className="text-center font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] pb-10 px-6">Status</th>
                                        <th className="text-center font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] pb-10 pr-8">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentFees.length > 0 ? studentFees.map(fee => (
                                        <tr key={fee.id} className="group hover:bg-slate-50/50 transition-all border-b border-slate-50 last:border-none">
                                            <td className="py-8 pl-8 pr-4">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-800 text-sm tracking-tighter mb-1.5">{fee.fee_type_name || 'Class Tuition'}</span>
                                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">Record Core: {fee.id.split('-')[0]}</span>
                                                </div>
                                            </td>
                                            <td className="py-8 px-6 font-black text-slate-500 text-xs uppercase tracking-tighter">
                                                {months[fee.month - 1] || 'Cycle'} {fee.year}
                                            </td>
                                            <td className="py-8 px-6 text-right font-black text-slate-900 text-sm tracking-tight">₹{parseFloat(fee.amount_due).toLocaleString()}</td>
                                            <td className="py-8 px-6 text-right font-black text-emerald-600 text-sm tracking-tight">₹{parseFloat(fee.amount_paid).toLocaleString()}</td>
                                            <td className="py-8 px-6 text-right font-black text-rose-600 text-sm tracking-tight">₹{parseFloat(fee.amount_pending).toLocaleString()}</td>
                                            <td className="py-8 px-6 text-center">
                                                <span className={`inline-flex items-center px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] shadow-sm ${fee.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                                                        fee.status === 'partial' ? 'bg-amber-50 text-amber-600' :
                                                            'bg-rose-50 text-rose-600'
                                                    }`}>
                                                    <span className="w-1.5 h-1.5 rounded-full mr-2 current-bg-color opacity-50"></span>
                                                    {fee.status}
                                                </span>
                                            </td>
                                            <td className="py-8 pr-8 pl-4 text-center">
                                                <div className="flex items-center justify-center gap-5">
                                                    {fee.amount_pending > 0 && (
                                                        <button
                                                            onClick={() => handleQuickPay(fee)}
                                                            className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200"
                                                        >
                                                            Settle
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEditFee(fee)}
                                                        className="p-3.5 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all shadow-none hover:shadow-lg"
                                                    >
                                                        <Edit2 size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={7} className="py-40 text-center">
                                                <div className="flex flex-col items-center opacity-30 grayscale">
                                                    <Clock size={64} className="mb-8" />
                                                    <h3 className="text-2xl font-black uppercase tracking-[0.3em]">Ledger Empty</h3>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-4">Automated dues have not been propagated.</p>
                                                    <button onClick={handleGenerateFees} className="mt-14 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl transition-all hover:scale-105">Trigger Growth Cycle</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="overflow-auto px-4">
                            {studentPayments.length > 0 ? (
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-left font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] pb-10 pl-6">Checksum ID</th>
                                            <th className="text-left font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] pb-10 px-6">Timestamp</th>
                                            <th className="text-right font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] pb-10 px-6">Flow Result (₹)</th>
                                            <th className="text-left font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] pb-10 px-6">Protocol</th>
                                            <th className="text-center font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] pb-10 pr-6">Proofing</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentPayments.map((payment) => (
                                            <tr key={payment.id} className="group hover:bg-slate-50/50 transition-all border-b border-slate-50 last:border-none">
                                                <td className="py-10 pl-6 pr-4 font-mono text-[10px] font-black text-indigo-600 tracking-tighter">#{payment.receipt_number}</td>
                                                <td className="py-10 px-6 font-black text-slate-600 text-xs">{new Date(payment.payment_date).toLocaleDateString(undefined, { dateStyle: 'full' })}</td>
                                                <td className="py-10 px-6 text-right font-black text-slate-950 text-2xl tracking-tighter">₹{parseFloat(payment.amount_paid).toLocaleString()}</td>
                                                <td className="py-10 px-6">
                                                    <span className="px-5 py-2 bg-white border border-slate-100 rounded-[1rem] text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 shadow-sm">{payment.payment_mode}</span>
                                                </td>
                                                <td className="py-10 pr-6 pl-4 text-center">
                                                    <button
                                                        onClick={() => printReceipt(payment)}
                                                        className="px-8 py-4 bg-white border-2 border-slate-50 text-slate-900 rounded-[1.5rem] hover:bg-slate-950 hover:text-white transition-all shadow-sm font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-3 mx-auto"
                                                    >
                                                        <Printer size={20} /> PRINT PDF
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="py-40 text-center opacity-20">
                                    <div className="w-32 h-32 bg-slate-100 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                                        <TrendingUp size={64} />
                                    </div>
                                    <h3 className="text-3xl font-black uppercase tracking-[0.3em]">No Signal</h3>
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] mt-5">Inbound transactional flow is currently at zero.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Adjustment Terminal Modal */}
            {editFee && (
                <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center z-[100] px-8">
                    <div className="bg-white rounded-[5rem] p-16 w-full max-w-2xl shadow-[0_80px_150px_-30px_rgba(0,0,0,0.8)] border border-white animate-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-8 mb-16">
                            <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 shadow-inner">
                                <Edit2 size={48} />
                            </div>
                            <div>
                                <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3">Logic Override</h3>
                                <p className="text-[11px] text-indigo-600 font-black uppercase tracking-[0.4em]">Ledger Reconciliation Terminal</p>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 pl-2">Revised Quantum Owed (₹)</label>
                                <div className="relative group">
                                    <span className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-300 font-black text-4xl group-focus-within:text-indigo-600 transition-colors">₹</span>
                                    <input
                                        type="number"
                                        className="w-full pl-24 pr-10 py-9 bg-slate-50 border-4 border-slate-50 rounded-[2.5rem] focus:ring-0 focus:border-indigo-600 focus:bg-white transition-all font-black text-5xl text-slate-900 shadow-inner"
                                        value={editFee.amount_due}
                                        onChange={(e) => setEditFee({ ...editFee, amount_due: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center gap-4 mt-8 px-6">
                                    <AlertCircle size={22} className="text-indigo-600" />
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                        PROTECTION LOCK: Value cannot be lower than ₹{editFee.amount_paid} (Verified Inbound).
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 pl-2">Revised Maturity Date</label>
                                <input
                                    type="date"
                                    className="w-full px-10 py-9 bg-slate-50 border-4 border-slate-50 rounded-[2.5rem] focus:ring-0 focus:border-indigo-600 focus:bg-white transition-all font-black text-2xl text-slate-900 shadow-inner"
                                    value={editFee.dueDate}
                                    onChange={(e) => setEditFee({ ...editFee, dueDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-8 mt-20">
                            <button
                                onClick={() => setEditFee(null)}
                                className="flex-1 py-7 bg-slate-100 text-slate-500 font-black rounded-[2.5rem] hover:bg-slate-200 transition-all text-xs tracking-[0.3em] uppercase"
                            >
                                ABORT
                            </button>
                            <button
                                onClick={handleUpdateFee}
                                className="flex-1 py-7 bg-indigo-600 text-white font-black rounded-[2.5rem] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 text-xs tracking-[0.2em] uppercase"
                            >
                                <Send size={24} /> Sync Ledger
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentFeeDetails;
