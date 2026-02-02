import { useState, useEffect } from 'react';
import { Send, RefreshCw, Smartphone, User, Trash2 } from 'lucide-react';
import api from '../services/api';

const PushNotifications = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(null);
    const [testMessage, setTestMessage] = useState({ title: 'Test Notification', message: 'This is a test push notification from the admin panel.' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/notifications/fcm-users');
            console.log('API Response:', response);
            if (response.success) {
                console.log('Setting users:', response.data);
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch FCM users:', error);
            alert('Failed to fetch users with FCM tokens');
        } finally {
            setLoading(false);
        }
    };

    const sendTestNotification = async (userId, userName) => {
        if (!testMessage.title || !testMessage.message) {
            alert('Please enter a title and message');
            return;
        }

        setSending(userId);
        try {
            const response = await api.post('/notifications/send-test', {
                userId,
                title: testMessage.title,
                message: testMessage.message
            });

            if (response.success) {
                alert(`✅ Notification sent to ${userName}!`);
            }
        } catch (error) {
            console.error('Failed to send notification:', error);
            alert(error.response?.data?.message || 'Failed to send notification');
        } finally {
            setSending(null);
        }
    };

    const handleDeleteToken = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to remove the FCM token for ${userName}? They will no longer receive notifications until they login again.`)) {
            return;
        }

        try {
            const response = await api.post('/notifications/remove-token', { userId });
            if (response.success) {
                alert(`✅ Token removed for ${userName}`);
                fetchUsers(); // Refresh list
            }
        } catch (error) {
            console.error('Failed to remove token:', error);
            alert('Failed to remove token');
        }
    };

    const getRoleBadge = (role) => {
        const colors = {
            student: { bg: '#dbeafe', text: '#1d4ed8' },
            parent: { bg: '#fce7f3', text: '#be185d' },
            teacher: { bg: '#dcfce7', text: '#16a34a' },
            admin: { bg: '#fef3c7', text: '#d97706' },
        };
        const style = colors[role] || { bg: '#f3f4f6', text: '#6b7280' };
        return (
            <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                background: style.bg,
                color: style.text,
            }}>
                {role}
            </span>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div className="card">
                <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.5rem' }}>📱 Push Notification Testing</h2>
                        <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
                            Send test push notifications to users who have FCM tokens registered
                        </p>
                    </div>
                    <button className="btn btn-secondary" onClick={fetchUsers} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spin' : ''} /> Refresh
                    </button>
                </div>
            </div>

            {/* Test Message Configuration */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">📝 Test Message</h3>
                </div>
                <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Notification Title</label>
                            <input
                                type="text"
                                className="form-input"
                                value={testMessage.title}
                                onChange={(e) => setTestMessage(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter title..."
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Notification Message</label>
                            <input
                                type="text"
                                className="form-input"
                                value={testMessage.message}
                                onChange={(e) => setTestMessage(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Enter message..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Users List */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">👥 Users with FCM Tokens ({users.length})</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                            Loading users...
                        </div>
                    ) : users.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                            <Smartphone size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p style={{ fontWeight: 600 }}>No users with FCM tokens found</p>
                            <p style={{ fontSize: '14px' }}>Users need to log in from the mobile app to register their FCM token.</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#374151' }}>User</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#374151' }}>Role</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#374151' }}>Contact</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#374151' }}>FCM Token</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: '13px', color: '#374151' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: '50%',
                                                    background: '#e0e7ff',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 700,
                                                    color: '#4f46e5',
                                                    fontSize: '14px',
                                                }}>
                                                    {user.first_name?.[0] || <User size={16} />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#1f2937' }}>
                                                        {user.first_name} {user.last_name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px' }}>
                                            {user.email || user.phone || '-'}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <code style={{
                                                background: '#f3f4f6',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                color: '#374151',
                                                maxWidth: '200px',
                                                display: 'inline-block',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {user.fcm_token?.substring(0, 30)}...
                                            </code>
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    className="btn btn-danger"
                                                    style={{ padding: '6px 12px', fontSize: '13px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}
                                                    onClick={() => handleDeleteToken(user.id, `${user.first_name} ${user.last_name}`)}
                                                    disabled={sending === user.id}
                                                    title="Remove FCM Token"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ padding: '6px 12px', fontSize: '13px' }}
                                                    onClick={() => sendTestNotification(user.id, `${user.first_name} ${user.last_name}`)}
                                                    disabled={sending === user.id}
                                                >
                                                    {sending === user.id ? (
                                                        'Sending...'
                                                    ) : (
                                                        <><Send size={14} /> Send</>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PushNotifications;
