import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import './CustomerDetail.css';
import { ADMIN } from '../../config/constants';
import { normalizeRole } from '../../config/utils';
import { useNotification } from '../context/NotificationContext';
import { useCustomerDetail } from '../hooks/useCustomerDetail';
import Pagination from './Pagination';

const CustomerDetail = () => {
    const { id } = useParams();
    const auth = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const {
        customer,
        history,
        historyPagination,
        loading,
        addHistory,
        updateHistory,
        deleteHistory,
        setHistoryPage
    } = useCustomerDetail(id, auth.isAuthenticated);

    const [activeTab, setActiveTab] = useState('info'); // 'info' or 'history'
    const [showForm, setShowForm] = useState(false);
    const userRole = normalizeRole(auth?.user?.profile);
    const userSub = auth?.user?.profile?.sub;
    const [deleteHistoryId, setDeleteHistoryId] = useState(null);
    const [showDeleteHistoryModal, setShowDeleteHistoryModal] = useState(false);

    const validationSchema = Yup.object({
        subject: Yup.string().required('Subject is required'),
        art: Yup.string().required('Type is required'),
        date: Yup.string().required('Date is required'),
        time: Yup.string().required('Time is required'),
        description: Yup.string(),
    });

    const formik = useFormik({
        initialValues: {
            id: '',
            subject: '',
            art: 'appointment',
            date: '',
            time: '',
            description: ''
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values, { resetForm }) => {
            try {
                const isEditing = !!values.id;
                const response = isEditing
                    ? await updateHistory(values.id, values)
                    : await addHistory(values);

                if (response.data.success) {
                    showNotification(`History entry ${isEditing ? 'updated' : 'added'} successfully!`, 'success');
                    resetForm();
                    setShowForm(false);
                }
            } catch (error) {
                console.error(`Error ${values.id ? 'updating' : 'adding'} history:`, error);
                showNotification(`Error: ${error.response?.data?.error || error.message}`, 'error');
            }
        },
    });

    const handleEditHistoryClick = (item) => {
        formik.setValues({
            id: item.id || '',
            subject: item.subject || '',
            art: item.art || 'appointment',
            date: item.date ? item.date.split('T')[0] : '',
            time: item.time || '',
            description: item.description || ''
        });
        setShowForm(true);
    };

    const handleDeleteHistoryClick = (historyId) => {
        setDeleteHistoryId(historyId);
        setShowDeleteHistoryModal(true);
    };

    const confirmDeleteHistory = async () => {
        try {
            const response = await deleteHistory(deleteHistoryId);
            if (response.data.success) {
                showNotification('History entry deleted successfully', 'success');
                setShowDeleteHistoryModal(false);
                setDeleteHistoryId(null);
            }
        } catch (error) {
            console.error('Error deleting history:', error);
            showNotification(`Error: ${error.response?.data?.error || error.message}`, 'error');
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
                            <button className="add-history-btn" onClick={() => setShowForm(!showForm)}>
                                {showForm ? 'Cancel' : '+ Add History Entry'}
                            </button>
                        </div>

                        {showForm && (
                            <form className={`add-history-form ${formik.values.id ? 'edit-form' : ''}`} onSubmit={formik.handleSubmit}>
                                <h3>{formik.values.id ? 'Edit Interaction Entry' : 'Add History Entry'}</h3>
                                <div className="form-row">
                                    <div className="form-field">
                                        <input
                                            type="text"
                                            name="subject"
                                            placeholder="Subject"
                                            {...formik.getFieldProps('subject')}
                                            className={(formik.touched.subject || formik.submitCount > 0) && formik.errors.subject ? 'input-error' : ''}
                                        />
                                        {(formik.touched.subject || formik.submitCount > 0) && formik.errors.subject && <div className="error-message">{formik.errors.subject}</div>}
                                    </div>
                                    <div className="form-field">
                                        <select name="art" {...formik.getFieldProps('art')}>
                                            <option value="appointment">Appointment</option>
                                            <option value="service">Service</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-field">
                                        <input
                                            type="date"
                                            name="date"
                                            {...formik.getFieldProps('date')}
                                            className={(formik.touched.date || formik.submitCount > 0) && formik.errors.date ? 'input-error' : ''}
                                        />
                                        {(formik.touched.date || formik.submitCount > 0) && formik.errors.date && <div className="error-message">{formik.errors.date}</div>}
                                    </div>
                                    <div className="form-field">
                                        <input
                                            type="time"
                                            name="time"
                                            {...formik.getFieldProps('time')}
                                            className={(formik.touched.time || formik.submitCount > 0) && formik.errors.time ? 'input-error' : ''}
                                        />
                                        {(formik.touched.time || formik.submitCount > 0) && formik.errors.time && <div className="error-message">{formik.errors.time}</div>}
                                    </div>
                                </div>
                                <textarea
                                    name="description"
                                    placeholder="Description"
                                    {...formik.getFieldProps('description')}
                                />
                                <div className="form-actions">
                                    <button type="submit" className="submit-history-btn" disabled={formik.isSubmitting}>
                                        {formik.isSubmitting ? 'Saving...' : (formik.values.id ? 'Update Entry' : 'Save Entry')}
                                    </button>
                                    {formik.values.id && (
                                        <button type="button" className="cancel-history-btn" onClick={() => setShowForm(false)}>Cancel</button>
                                    )}
                                </div>
                            </form>
                        )}

                        <div className="history-list">
                            {history.length === 0 ? (
                                <p className="no-history">No history entries found.</p>
                            ) : (
                                history.map(item => (
                                    <div key={item.id} className={`history-item ${item.completed ? 'completed' : ''}`}>
                                        <div className="item-actions">
                                            {(userRole === ADMIN || item.created_by === userSub) && (
                                                <>
                                                    <button
                                                        className="edit-icon-btn"
                                                        onClick={() => handleEditHistoryClick(item)}
                                                        title="Edit Entry"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="delete-icon-btn"
                                                        onClick={() => handleDeleteHistoryClick(item.id)}
                                                        title="Delete Entry"
                                                    >
                                                        🗑️
                                                    </button>
                                                </>
                                            )}
                                        </div>
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
                            <Pagination pagination={historyPagination} onPageChange={setHistoryPage} />
                        </div>
                    </div>
                )}
            </div>

            {showDeleteHistoryModal && (
                <div className="modal-overlay">
                    <div className="modal-card delete-modal">
                        <div className="modal-icon">⚠️</div>
                        <h2>Delete History Entry?</h2>
                        <p>Are you sure you want to remove this interaction record? This cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="confirm-delete-btn" onClick={confirmDeleteHistory}>Yes, Delete</button>
                            <button className="cancel-modal-btn" onClick={() => setShowDeleteHistoryModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDetail;
