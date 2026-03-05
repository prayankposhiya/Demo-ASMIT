import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import './CustomerDetail.css';

const CustomerDetail = () => {
    const { id } = useParams();
    const auth = useAuth();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info'); // 'info' or 'history'
    const [showAddHistory, setShowAddHistory] = useState(false);
    const [newHistory, setNewHistory] = useState({
        subject: '',
        art: 'appointment',
        date: '',
        time: '',
        description: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const headers = { 'Authorization': `Bearer ${auth.user?.id_token}` };

            // Fetch customer info
            const custRes = await fetch(`http://localhost:8000/api/customers/${id}`, { headers });
            const custData = await custRes.json();
            setCustomer(custData);

            // Fetch history
            const histRes = await fetch(`http://localhost:8000/api/customer-history/${id}/history`, { headers });
            const histData = await histRes.json();
            setHistory(histData);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching customer detail:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth.isAuthenticated && id) {
            fetchData();
        }
    }, [auth.isAuthenticated, id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewHistory(prev => ({ ...prev, [name]: value }));
    };

    const handleAddHistory = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8000/api/customer-history/${id}/history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.user?.id_token}`
                },
                body: JSON.stringify(newHistory)
            });
            if (response.ok) {
                fetchData();
                setNewHistory({ subject: '', art: 'appointment', date: '', time: '', description: '' });
                setShowAddHistory(false);
            }
        } catch (error) {
            console.error('Error adding history:', error);
        }
    };

    if (loading) return <div className="detail-loading">Loading customer details...</div>;
    if (!customer) return <div className="detail-error">Customer not found.</div>;

    return (
        <div className="customer-detail-page">
            <div className="detail-header">
                <button className="back-btn" onClick={() => navigate('/appointments')}>← Back to Appointments</button>
                <h1>{customer.first_name} {customer.last_name}</h1>
                <p className="customer-id-tag">ID: #{customer.id}</p>
            </div>

            <div className="detail-tabs">
                <button
                    className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab('info')}
                >
                    Customer Info
                </button>
                <button
                    className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'info' && (
                    <div className="info-card">
                        <div className="info-grid">
                            <div className="info-item">
                                <label>First Name</label>
                                <p>{customer.first_name}</p>
                            </div>
                            <div className="info-item">
                                <label>Last Name</label>
                                <p>{customer.last_name}</p>
                            </div>
                            <div className="info-item">
                                <label>Email</label>
                                <p>{customer.email || 'N/A'}</p>
                            </div>
                            <div className="info-item">
                                <label>Phone</label>
                                <p>{customer.phone || 'N/A'}</p>
                            </div>
                            <div className="info-item">
                                <label>Customer Since</label>
                                <p>{new Date(customer.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="history-section">
                        <div className="section-header">
                            <h2>Interaction History</h2>
                            <button className="add-history-btn" onClick={() => setShowAddHistory(!showAddHistory)}>
                                {showAddHistory ? 'Cancel' : '+ Add History Entry'}
                            </button>
                        </div>

                        {showAddHistory && (
                            <form className="add-history-form" onSubmit={handleAddHistory}>
                                <div className="form-row">
                                    <input
                                        type="text"
                                        name="subject"
                                        placeholder="Subject"
                                        value={newHistory.subject}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <select name="art" value={newHistory.art} onChange={handleInputChange}>
                                        <option value="appointment">Appointment</option>
                                        <option value="service">Service</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="form-row">
                                    <input
                                        type="date"
                                        name="date"
                                        value={newHistory.date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        type="time"
                                        name="time"
                                        value={newHistory.time}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <textarea
                                    name="description"
                                    placeholder="Description"
                                    value={newHistory.description}
                                    onChange={handleInputChange}
                                />
                                <button type="submit" className="submit-history-btn">Save Entry</button>
                            </form>
                        )}

                        <div className="history-list">
                            {history.length === 0 ? (
                                <p className="no-history">No history entries found.</p>
                            ) : (
                                history.map(item => (
                                    <div key={item.id} className={`history-item ${item.completed ? 'completed' : ''}`}>
                                        <div className="item-header">
                                            <span className={`art-badge ${item.art}`}>{item.art}</span>
                                            <span className="item-date">{new Date(item.date).toLocaleDateString()} at {item.time}</span>
                                        </div>
                                        <h3>{item.subject}</h3>
                                        <p>{item.description}</p>
                                        <div className="item-footer">
                                            <span className="created-by text-sm text-gray-400">Recorded by: {item.created_by}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDetail;
