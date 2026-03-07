import React, { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNotification } from '../context/NotificationContext';
import { useUsers } from '../hooks/useUsers';
import Pagination from './Pagination';
import './Users.css';
import { useRoles } from '../hooks/useRoles';

const Users = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { users, pagination, loading, addUser, updateUser, deleteUser, setPage } = useUsers(auth.isAuthenticated);
    const [showForm, setShowForm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const validationSchema = Yup.object({
        first_name: Yup.string().required('First name is required'),
        last_name: Yup.string().required('Last name is required'),
        email: Yup.string().email('Invalid email address'),
        phone: Yup.string().matches(/^[0-9+() -]*$/, 'Invalid phone number'),
    });

    const formik = useFormik({
        initialValues: { id: '', first_name: '', last_name: '', email: '', phone: '' },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values, { resetForm }) => {
            try {
                const response = values.id
                    ? await updateUser(values.id, values)
                    : await addUser(values);

                if (response.data.success) {
                    showNotification(`Customer ${values.id ? 'updated' : 'added'} successfully!`, 'success');
                    resetForm();
                    setShowForm(false);
                }
            } catch (error) {
                console.error(`Error ${values.id ? 'updating' : 'adding'} user:`, error);
                showNotification(`Error: ${error.response?.data?.error || error.message}`, 'error');
            }
        },
    });

    const { isAdmin } = useRoles();

    const handleEditClick = (user) => {
        formik.setValues({
            id: user.id || '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            phone: user.phone || ''
        });
        setShowForm(true);
    };

    const handleAddClick = () => {
        formik.resetForm();
        setShowForm(true);
    };

    const handleDeleteClick = (userId) => {
        setDeleteId(userId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await deleteUser(deleteId);
            if (response.data.success) {
                showNotification('Customer deleted successfully', 'success');
                setShowDeleteModal(false);
                setDeleteId(null);
            } else {
                showNotification('Failed to delete customer', 'error');
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
            showNotification(`Error: ${error.response?.data?.error || error.message}`, 'error');
        }
    };

    return (
        <div className="users-page">
            <div className="users-header">
                <h1>Customers</h1>
                {isAdmin && (
                    <button
                        className="add-user-btn"
                        onClick={() => showForm ? setShowForm(false) : handleAddClick()}
                    >
                        {showForm ? 'Cancel' : '+ Add Customer'}
                    </button>
                )}
            </div>

            {showForm && (
                <form className={`add-user-form ${formik.values.id ? 'edit-form' : ''}`} onSubmit={formik.handleSubmit}>
                    <h3>{formik.values.id ? `Edit Customer #${formik.values.id}` : 'Add New Customer'}</h3>
                    <div className="form-grid">
                        <div className="form-field">
                            <input
                                type="text"
                                name="first_name"
                                placeholder="First Name"
                                {...formik.getFieldProps('first_name')}
                                className={(formik.touched.first_name || formik.submitCount > 0) && formik.errors.first_name ? 'input-error' : ''}
                            />
                            {(formik.touched.first_name || formik.submitCount > 0) && formik.errors.first_name && <div className="error-message">{formik.errors.first_name}</div>}
                        </div>
                        <div className="form-field">
                            <input
                                type="text"
                                name="last_name"
                                placeholder="Last Name"
                                {...formik.getFieldProps('last_name')}
                                className={(formik.touched.last_name || formik.submitCount > 0) && formik.errors.last_name ? 'input-error' : ''}
                            />
                            {(formik.touched.last_name || formik.submitCount > 0) && formik.errors.last_name && <div className="error-message">{formik.errors.last_name}</div>}
                        </div>
                        <div className="form-field">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                {...formik.getFieldProps('email')}
                                className={(formik.touched.email || formik.submitCount > 0) && formik.errors.email ? 'input-error' : ''}
                            />
                            {(formik.touched.email || formik.submitCount > 0) && formik.errors.email && <div className="error-message">{formik.errors.email}</div>}
                        </div>
                        <div className="form-field">
                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone"
                                {...formik.getFieldProps('phone')}
                                className={(formik.touched.phone || formik.submitCount > 0) && formik.errors.phone ? 'input-error' : ''}
                            />
                            {(formik.touched.phone || formik.submitCount > 0) && formik.errors.phone && <div className="error-message">{formik.errors.phone}</div>}
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-user-btn" disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? 'Saving...' : (formik.values.id ? 'Update Customer' : 'Save Customer')}
                        </button>
                        <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </form>
            )}

            {loading ? (
                <p>Loading customers...</p>
            ) : (
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td className="user-name-cell">{user.first_name} {user.last_name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="actions-cell">
                                        <button
                                            className="view-detail-btn"
                                            onClick={() => navigate(`/customers/${user.id}`)}
                                            title="View Detail"
                                        >
                                            🔍
                                        </button>
                                        {isAdmin && (
                                            <>
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => handleEditClick(user)}
                                                    title="Edit Customer"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDeleteClick(user.id)}
                                                    title="Delete Customer"
                                                >
                                                    🗑️
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination pagination={pagination} onPageChange={setPage} />
                </div>
            )}

            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-card delete-modal">
                        <div className="modal-icon">⚠️</div>
                        <h2>Delete Customer?</h2>
                        <p>This action cannot be undone. All history associated with this customer will be permanently removed.</p>
                        <div className="modal-actions">
                            <button className="confirm-delete-btn" onClick={confirmDelete}>Yes, Delete</button>
                            <button className="cancel-modal-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
