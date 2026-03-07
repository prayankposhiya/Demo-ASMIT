import React, { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import './Appointments.css';
import { useNotification } from '../context/NotificationContext';
import { useAppointments } from '../hooks/useAppointments';
import Pagination from './Pagination';
import { useRoles } from '../hooks/useRoles';

const Appointments = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { appointments, pagination, loading, addAppointment, markComplete, setPage } = useAppointments(auth.isAuthenticated);
    const [showAddForm, setShowAddForm] = useState(false);
    const { roles, isAdmin } = useRoles();
    const userSub = auth?.user?.profile?.sub;

    const validationSchema = Yup.object({
        customer_id: Yup.number().positive('Must be a positive number').required('Customer ID is required'),
        subject: Yup.string().required('Subject is required'),
        date: Yup.string().required('Date is required'),
        time: Yup.string().required('Time is required'),
        description: Yup.string(),
    });

    const formik = useFormik({
        initialValues: {
            customer_id: '',
            subject: '',
            date: '',
            time: '',
            description: ''
        },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            try {
                const response = await addAppointment(values);
                if (response.data.success) {
                    showNotification('Appointment added successfully!', 'success');
                    resetForm();
                    setShowAddForm(false);
                }
            } catch (error) {
                console.error('Error adding appointment:', error);
                showNotification('Error adding appointment: ' + (error.response?.data?.error || error.message), 'error');
            }
        },
    });

    const getStatusColor = (dateStr) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const apptDate = new Date(dateStr);
        apptDate.setHours(0, 0, 0, 0);

        if (apptDate < today) return 'past';
        if (apptDate.getTime() === today.getTime()) return 'today';
        return 'future';
    };

    const handleMarkComplete = async (id) => {
        try {
            const response = await markComplete(id);
            if (response.data.success) {
                showNotification('Appointment marked as complete', 'success');
            }
        } catch (error) {
            console.error('Error completing appointment:', error);
            showNotification('Error completing appointment: ' + (error.response?.data?.error || error.message), 'error');
        }
    };

    return (
        <div className="appointments-page">
            <div className="appointments-header">
                <h1>Upcoming Appointments</h1>
                <button className="add-appt-btn" onClick={() => setShowAddForm(!showAddForm)}>
                    {showAddForm ? 'Cancel' : '+ Add Appointment'}
                </button>
            </div>

            {showAddForm && (
                <form className="add-appt-form" onSubmit={formik.handleSubmit}>
                    <div className="form-field">
                        <input
                            type="number"
                            name="customer_id"
                            placeholder="Customer ID"
                            {...formik.getFieldProps('customer_id')}
                            className={(formik.touched.customer_id || formik.submitCount > 0) && formik.errors.customer_id ? 'input-error' : ''}
                        />
                        {(formik.touched.customer_id || formik.submitCount > 0) && formik.errors.customer_id && <div className="error-message">{formik.errors.customer_id}</div>}
                    </div>
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
                    <div className="form-field full-width">
                        <textarea
                            name="description"
                            placeholder="Description"
                            {...formik.getFieldProps('description')}
                        />
                    </div>
                    <button type="submit" className="submit-appt-btn" disabled={formik.isSubmitting}>
                        {formik.isSubmitting ? 'Saving...' : 'Save Appointment'}
                    </button>
                </form>
            )}

            {loading ? (
                <p>Loading appointments...</p>
            ) : (
                <div className="appointments-table-container">
                    <table className="appointments-table">
                        <thead>
                            <tr>
                                <th>Customer ID</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(appt => (
                                <tr key={appt.history_id} className={`status-${getStatusColor(appt.date)}`}>
                                    <td>{appt.customer_id}</td>
                                    <td>{appt.first_name}</td>
                                    <td>{appt.last_name}</td>
                                    <td>{new Date(appt.date).toLocaleDateString()}</td>
                                    <td>{appt.time}</td>
                                    <td>{appt.description}</td>
                                    <td className="actions-cell">
                                        <button
                                            className="view-detail-btn"
                                            onClick={() => navigate(`/customers/${appt.customer_id}`)}
                                        >
                                            View Customer Detail
                                        </button>
                                        {(isAdmin || appt.created_by === userSub) && (
                                            <button
                                                className="complete-btn"
                                                onClick={() => handleMarkComplete(appt.history_id)}
                                            >
                                                Complete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination pagination={pagination} onPageChange={setPage} />
                </div>
            )}
        </div>
    );
};

export default Appointments;
