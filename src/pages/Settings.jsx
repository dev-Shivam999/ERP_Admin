import { useDispatch, useSelector } from 'react-redux';
import { Save, School, Bell, Lock, Palette, Database, Users, Globe, Plus, RefreshCw, Trash2 } from 'lucide-react';
import {
    fetchFeeMetadata, createFeeType, deleteFeeType, fetchFeeStructures, updateFeeStructures, initializeFeeStructures
} from '../store/slices/feesSlice';
import { useEffect, useState } from 'react';

const Settings = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { feeStructures = [] } = useSelector((state) => state.fees || {});

    const [activeTab, setActiveTab] = useState('school');
    const [saving, setSaving] = useState(false);
    const [metadata, setMetadata] = useState({ classes: [], feeTypes: [] });
    const [showFeeTypeModal, setShowFeeTypeModal] = useState(false);
    const [newFeeType, setNewFeeType] = useState({ name: '', description: '', isRecurring: true });

    // School Settings
    const [schoolSettings, setSchoolSettings] = useState({
        schoolName: 'Demo Public School',
        schoolCode: 'DPS001',
        affiliationNo: 'CBSE/AFF/2024',
        boardType: 'cbse',
        schoolType: 'co-ed',
        email: 'info@demopublicschool.com',
        phone: '9876543210',
        alternatePhone: '',
        website: '',
        address: '',
        city: '',
        state: 'Uttar Pradesh',
        pincode: '',
        establishedYear: '',
        principalName: '',
        logo: null,
    });

    // Academic Settings
    const [academicSettings, setAcademicSettings] = useState({
        currentSession: '2024-25',
        sessionStartMonth: '4', // April
        sessionEndMonth: '3', // March
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        schoolStartTime: '08:00',
        schoolEndTime: '14:00',
        periodDuration: 40, // minutes
        classesOffered: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
        streamsFor11_12: ['Science', 'Commerce', 'Arts/Humanities'],
    });

    // Notification Settings
    const [notificationSettings, setNotificationSettings] = useState({
        smsEnabled: true,
        whatsappEnabled: true,
        emailEnabled: false,
        attendanceAlert: true,
        feeReminder: true,
        examResultNotification: true,
        holidayNotification: true,
        generalAnnouncement: true,
    });

    // Fee Settings
    const [feeSettings, setFeeSettings] = useState({
        lateFeeEnabled: true,
        lateFeeAmount: 50,
        lateFeeAfterDays: 10,
        feeReminderDays: [5, 10, 15],
        paymentModes: ['cash', 'online', 'cheque'],
        onlinePaymentGateway: 'razorpay',
        feeStructure: [],
    });

    useEffect(() => {
        dispatch(fetchFeeStructures());
        dispatch(fetchFeeMetadata()).then(res => {
            if (res.payload) setMetadata(res.payload);
        });
    }, [dispatch]);

    useEffect(() => {
        if (feeStructures.length > 0) {
            // Group flat fee structures by class for tabular display
            const grouped = Object.values(feeStructures.reduce((acc, fee) => {
                if (!acc[fee.class_name]) {
                    acc[fee.class_name] = { class: fee.class_name, items: {} };
                }
                acc[fee.class_name].items[fee.fee_type_name.toLowerCase()] = {
                    id: fee.id,
                    amount: fee.amount
                };
                return acc;
            }, {}));
            setFeeSettings(prev => ({ ...prev, feeStructure: grouped }));
        }
    }, [feeStructures]);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (activeTab === 'fees') {
                // Flatten grouped data back to individual records for API
                const flattened = feeSettings.feeStructure.flatMap(cls =>
                    Object.values(cls.items).map(item => ({
                        id: item.id,
                        amount: item.amount
                    }))
                );
                await dispatch(updateFeeStructures(flattened)).unwrap();
            }
            alert('Settings saved successfully!');
        } catch (error) {
            alert(error || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleInitializeFees = async () => {
        if (!confirm('This will create ₹0 fee records for all classes. Continue?')) return;
        setSaving(true);
        try {
            const res = await dispatch(initializeFeeStructures()).unwrap();
            alert(res.message || 'Fee structures initialized successfully');
            dispatch(fetchFeeStructures());
        } catch (error) {
            alert(error || 'Failed to initialize');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteFeeType = async (id, name) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This will also remove it from all class structures.`)) return;
        setSaving(true);
        try {
            await dispatch(deleteFeeType(id)).unwrap();
            alert('Fee type deleted successfully');
            dispatch(fetchFeeMetadata()).then(res => {
                if (res.payload) setMetadata(res.payload);
            });
            dispatch(fetchFeeStructures());
        } catch (error) {
            alert(error || 'Failed to delete fee type');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateFeeType = async () => {
        if (!newFeeType.name) return alert('Name is required');
        setSaving(true);
        try {
            await dispatch(createFeeType(newFeeType)).unwrap();
            alert('Fee type created successfully');
            setShowFeeTypeModal(false);
            setNewFeeType({ name: '', description: '', isRecurring: true });
            dispatch(fetchFeeMetadata()).then(res => {
                if (res.payload) setMetadata(res.payload);
            });
            dispatch(initializeFeeStructures()); // Initialize records for new type
        } catch (error) {
            alert(error || 'Failed to create fee type');
        } finally {
            setSaving(false);
        }
    };



    const tabs = [
        { id: 'school', label: 'School Info', icon: School },
        { id: 'academic', label: 'Academic Settings', icon: Globe },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'fees', label: 'Fee Settings', icon: Database },
        { id: 'users', label: 'Users & Roles', icon: Users },
        { id: 'security', label: 'Security', icon: Lock },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Horizontal Navigation */}
            <div className="card" style={{ position: 'sticky', top: '80px', zIndex: 10 }}>
                <div className="card-body" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.625rem',
                                padding: '0.75rem 1.25rem',
                                border: 'none',
                                background: activeTab === tab.id ? '#eef2ff' : 'transparent',
                                color: activeTab === tab.id ? '#4f46e5' : '#374151',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab.id ? 600 : 500,
                                transition: 'all 0.2s ease',
                                flexShrink: 0
                            }}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div>
                {/* School Info Tab */}
                {activeTab === 'school' && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">🏫 School Information</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">School Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={schoolSettings.schoolName}
                                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                                        placeholder="School name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">School Code</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={schoolSettings.schoolCode}
                                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, schoolCode: e.target.value }))}
                                        placeholder="School code"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Affiliation Number</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={schoolSettings.affiliationNo}
                                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, affiliationNo: e.target.value }))}
                                        placeholder="CBSE/State affiliation no"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Board Type</label>
                                    <select
                                        className="form-select"
                                        value={schoolSettings.boardType}
                                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, boardType: e.target.value }))}
                                    >
                                        <option value="cbse">CBSE</option>
                                        <option value="icse">ICSE</option>
                                        <option value="state">State Board</option>
                                        <option value="ib">IB</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">School Type</label>
                                    <select
                                        className="form-select"
                                        value={schoolSettings.schoolType}
                                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, schoolType: e.target.value }))}
                                    >
                                        <option value="co-ed">Co-Education</option>
                                        <option value="boys">Boys Only</option>
                                        <option value="girls">Girls Only</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={schoolSettings.email}
                                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="School email"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={schoolSettings.phone}
                                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, phone: e.target.value }))}
                                        placeholder="Contact number"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <textarea
                                    className="form-input"
                                    value={schoolSettings.address}
                                    onChange={(e) => setSchoolSettings(prev => ({ ...prev, address: e.target.value }))}
                                    placeholder="Full school address"
                                    rows={2}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">City</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={schoolSettings.city}
                                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, city: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">State</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={schoolSettings.state}
                                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, state: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Pincode</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={schoolSettings.pincode}
                                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, pincode: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                    <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Academic Tab */}
                {activeTab === 'academic' && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">📚 Academic Settings</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Current Session</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={academicSettings.currentSession}
                                        onChange={(e) => setAcademicSettings(prev => ({ ...prev, currentSession: e.target.value }))}
                                        placeholder="e.g., 2024-25"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Session Start Month</label>
                                    <select
                                        className="form-select"
                                        value={academicSettings.sessionStartMonth}
                                        onChange={(e) => setAcademicSettings(prev => ({ ...prev, sessionStartMonth: e.target.value }))}
                                    >
                                        <option value="1">January</option>
                                        <option value="4">April</option>
                                        <option value="6">June</option>
                                        <option value="7">July</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Session End Month</label>
                                    <select
                                        className="form-select"
                                        value={academicSettings.sessionEndMonth}
                                        onChange={(e) => setAcademicSettings(prev => ({ ...prev, sessionEndMonth: e.target.value }))}
                                    >
                                        <option value="12">December</option>
                                        <option value="3">March</option>
                                        <option value="5">May</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">School Start Time</label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={academicSettings.schoolStartTime}
                                        onChange={(e) => setAcademicSettings(prev => ({ ...prev, schoolStartTime: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">School End Time</label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={academicSettings.schoolEndTime}
                                        onChange={(e) => setAcademicSettings(prev => ({ ...prev, schoolEndTime: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Period Duration (min)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={academicSettings.periodDuration}
                                        onChange={(e) => setAcademicSettings(prev => ({ ...prev, periodDuration: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Working Days</label>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                        <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={academicSettings.workingDays.includes(day)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setAcademicSettings(prev => ({ ...prev, workingDays: [...prev.workingDays, day] }));
                                                    } else {
                                                        setAcademicSettings(prev => ({ ...prev, workingDays: prev.workingDays.filter(d => d !== day) }));
                                                    }
                                                }}
                                            />
                                            {day.charAt(0).toUpperCase() + day.slice(1)}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Streams for Class 11 & 12</label>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {['Science', 'Commerce', 'Arts/Humanities', 'Vocational'].map(stream => (
                                        <label key={stream} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={academicSettings.streamsFor11_12.includes(stream)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setAcademicSettings(prev => ({ ...prev, streamsFor11_12: [...prev.streamsFor11_12, stream] }));
                                                    } else {
                                                        setAcademicSettings(prev => ({ ...prev, streamsFor11_12: prev.streamsFor11_12.filter(s => s !== stream) }));
                                                    }
                                                }}
                                            />
                                            {stream}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                    <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">🔔 Notification Settings</h3>
                        </div>
                        <div className="card-body">
                            <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Notification Channels</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                                {[
                                    { key: 'smsEnabled', label: 'SMS', icon: '📱' },
                                    { key: 'whatsappEnabled', label: 'WhatsApp', icon: '💬' },
                                    { key: 'emailEnabled', label: 'Email', icon: '📧' },
                                ].map(channel => (
                                    <div key={channel.key} style={{
                                        padding: '1rem',
                                        border: `2px solid ${notificationSettings[channel.key] ? '#4f46e5' : '#e5e7eb'}`,
                                        borderRadius: '12px',
                                        background: notificationSettings[channel.key] ? '#eef2ff' : '#fff',
                                        cursor: 'pointer',
                                    }} onClick={() => setNotificationSettings(prev => ({ ...prev, [channel.key]: !prev[channel.key] }))}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{channel.icon}</div>
                                        <div style={{ fontWeight: 500 }}>{channel.label}</div>
                                        <div style={{ fontSize: '0.875rem', color: notificationSettings[channel.key] ? '#059669' : '#6b7280' }}>
                                            {notificationSettings[channel.key] ? '✓ Enabled' : 'Disabled'}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Notification Types</h4>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {[
                                    { key: 'attendanceAlert', label: 'Attendance Alerts', desc: 'Notify parents when student is absent' },
                                    { key: 'feeReminder', label: 'Fee Reminders', desc: 'Send payment reminders before due date' },
                                    { key: 'examResultNotification', label: 'Exam Results', desc: 'Notify when results are published' },
                                    { key: 'holidayNotification', label: 'Holiday Notifications', desc: 'Inform about holidays and schedule changes' },
                                    { key: 'generalAnnouncement', label: 'General Announcements', desc: 'School announcements and updates' },
                                ].map(item => (
                                    <label key={item.key} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '1rem',
                                        background: '#f9fafb',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{item.label}</div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.desc}</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings[item.key]}
                                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                    </label>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                    <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Fee Settings Tab */}
                {activeTab === 'fees' && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">💰 Fee Settings</h3>
                        </div>
                        <div className="card-body">
                            <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Late Fee Configuration</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={feeSettings.lateFeeEnabled}
                                        onChange={(e) => setFeeSettings(prev => ({ ...prev, lateFeeEnabled: e.target.checked }))}
                                    />
                                    Enable Late Fee
                                </label>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Late Fee Amount (₹)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={feeSettings.lateFeeAmount}
                                        onChange={(e) => setFeeSettings(prev => ({ ...prev, lateFeeAmount: e.target.value }))}
                                        disabled={!feeSettings.lateFeeEnabled}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Apply After (Days)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={feeSettings.lateFeeAfterDays}
                                        onChange={(e) => setFeeSettings(prev => ({ ...prev, lateFeeAfterDays: e.target.value }))}
                                        disabled={!feeSettings.lateFeeEnabled}
                                    />
                                </div>
                            </div>

                            <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Payment Modes</h4>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                                {['cash', 'online', 'cheque', 'dd', 'neft'].map(mode => (
                                    <label key={mode} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1rem',
                                        border: `2px solid ${feeSettings.paymentModes.includes(mode) ? '#4f46e5' : '#e5e7eb'}`,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={feeSettings.paymentModes.includes(mode)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFeeSettings(prev => ({ ...prev, paymentModes: [...prev.paymentModes, mode] }));
                                                } else {
                                                    setFeeSettings(prev => ({ ...prev, paymentModes: prev.paymentModes.filter(m => m !== mode) }));
                                                }
                                            }}
                                        />
                                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                    </label>
                                ))}
                            </div>

                            {/* Class-wise Fee Structure */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <h4 style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                    📚 Class-wise Fee Structure
                                </h4>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => setShowFeeTypeModal(true)}
                                        className="btn-secondary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                    >
                                        <Plus size={16} /> Add Fee Type
                                    </button>
                                    <button
                                        onClick={handleInitializeFees}
                                        className="btn-secondary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                        title="Create records for all classes with ₹0"
                                    >
                                        <RefreshCw size={16} /> Initialize All
                                    </button>
                                </div>
                            </div>
                            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                                <table className="table" style={{ minWidth: '1200px' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ position: 'sticky', left: 0, background: '#f9fafb', zIndex: 1 }}>Class</th>
                                            {metadata.feeTypes.map(type => (
                                                <th key={type.id}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                                        <span>{type.name} (₹{type.is_recurring ? '/mo' : ''})</span>
                                                        <button
                                                            onClick={() => handleDeleteFeeType(type.id, type.name)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#ef4444',
                                                                cursor: 'pointer',
                                                                padding: '4px',
                                                                borderRadius: '4px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'background 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                                            title={`Delete ${type.name}`}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </th>
                                            ))}
                                            <th style={{ background: '#eef2ff', fontWeight: 600 }}>Total Annual</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {feeSettings.feeStructure?.map((item, index) => (
                                            <tr key={item.class}>
                                                <td style={{ position: 'sticky', left: 0, background: '#fff', fontWeight: 500, zIndex: 1 }}>
                                                    {item.class}
                                                </td>
                                                {metadata.feeTypes.map(type => {
                                                    const key = type.name.toLowerCase();
                                                    return (
                                                        <td key={type.id}>
                                                            <input
                                                                type="number"
                                                                className="form-input"
                                                                style={{ width: '100px', padding: '0.4rem' }}
                                                                value={item.items[key]?.amount || 0}
                                                                onChange={(e) => {
                                                                    const newStructure = [...feeSettings.feeStructure];
                                                                    if (!newStructure[index].items[key]) {
                                                                        // If it doesn't exist, we can't edit it yet (should initialize first)
                                                                        return;
                                                                    }
                                                                    newStructure[index].items[key].amount = parseFloat(e.target.value) || 0;
                                                                    setFeeSettings(prev => ({ ...prev, feeStructure: newStructure }));
                                                                }}
                                                            />
                                                        </td>
                                                    );
                                                })}
                                                <td style={{ background: '#eef2ff', fontWeight: 600, color: '#4f46e5' }}>
                                                    ₹{Object.values(item.items).reduce((acc, current) => {
                                                        // This is a simplified calculation, we should check frequency in real app
                                                        // For now, assume recurring is monthly (x12) and non-recurring is once
                                                        const type = metadata.feeTypes.find(t => t.name.toLowerCase() === current.key);
                                                        const multiplier = type?.is_recurring ? 12 : 1;
                                                        return acc + (parseFloat(current.amount) * multiplier);
                                                    }, 0).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(!feeSettings.feeStructure || feeSettings.feeStructure.length === 0) && (
                                    <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '8px', border: '2px dashed #e5e7eb' }}>
                                        <Database size={48} style={{ color: '#9ca3af', marginBottom: '1rem', opacity: 0.3 }} />
                                        <p style={{ color: '#4b5563', fontSize: '1.1rem', marginBottom: '1rem' }}>No fee structures found for the current academic year.</p>
                                        <button onClick={handleInitializeFees} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <RefreshCw size={18} /> Initialize Fee Structures
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                                💡 <strong>Tip:</strong> Tuition and Transport fees are monthly. Total Annual shows the complete yearly fee.
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                    <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">👥 Users & Roles</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                                <Users size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p>User management coming soon...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">🔒 Security Settings</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                                <Lock size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p>Security settings coming soon...</p>
                            </div>
                        </div>
                    </div>
                )}


                {/* Add Fee Type Modal */}
                {showFeeTypeModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    }}>
                        <div style={{
                            backgroundColor: '#fff', padding: '2rem', borderRadius: '12px',
                            width: '400px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                        }}>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                ✨ Add New Fee Type
                            </h3>
                            <div className="form-group">
                                <label className="form-label">Fee Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Bus Fee, Lab Fee"
                                    value={newFeeType.name}
                                    onChange={(e) => setNewFeeType(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-input"
                                    placeholder="Brief description..."
                                    value={newFeeType.description}
                                    onChange={(e) => setNewFeeType(prev => ({ ...prev, description: e.target.value }))}
                                    rows={2}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={newFeeType.isRecurring}
                                        onChange={(e) => setNewFeeType(prev => ({ ...prev, isRecurring: e.target.checked }))}
                                    />
                                    Monthly Recurring Fee
                                </label>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button className="btn btn-outline" onClick={() => setShowFeeTypeModal(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleCreateFeeType} disabled={saving}>
                                    {saving ? 'Creating...' : 'Create Fee Type'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
