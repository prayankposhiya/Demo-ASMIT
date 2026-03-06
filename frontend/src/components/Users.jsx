import React, { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import './Users.css';
import { ADMIN } from '../../config/constants';
import { normalizeRole } from '../../config/utils';

const Users = () => {
    const auth = useAuth();
    console.log(auth, "authuser");
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({ first_name: '', last_name: '', email: '', phone: '' });
    const [editingUser, setEditingUser] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const userRole = normalizeRole(auth?.user?.profile)
    console.log(userRole, "userRole");
    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/customers', {
                headers: {
                    'Authorization': `Bearer ${auth.user?.id_token}`
                }
            });
            const data = await response.json();
            console.log(data, "datatat");
            setUsers(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth.isAuthenticated) {
            fetchUsers();
        }
    }, [auth.isAuthenticated]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (showEditForm) {
            setEditingUser(prev => ({ ...prev, [name]: value }));
        } else {
            setNewUser(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log(newUser, "authuser");
            const response = await fetch('http://localhost:8000/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.user?.id_token}`
                },
                body: JSON.stringify(newUser)
            });
            if (response.ok) {
                fetchUsers();
                setNewUser({ first_name: '', last_name: '', email: '', phone: '' });
                setShowAddForm(false);
            }
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    const handleEditClick = (user) => {
        setEditingUser({ ...user });
        setShowEditForm(true);
        setShowAddForm(false);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8000/api/customers/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.user?.id_token}`
                },
                body: JSON.stringify(editingUser)
            });
            if (response.ok) {
                fetchUsers();
                setEditingUser(null);
                setShowEditForm(false);
            }
        } catch (error) {
            console.error('Error updating customer:', error);
        }
    };

    const handleDeleteClick = (userId) => {
        setDeleteId(userId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/customers/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${auth.user?.id_token}`
                }
            });
            if (response.ok) {
                fetchUsers();
                setShowDeleteModal(false);
                setDeleteId(null);
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to delete customer');
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
        }
    };

    return (
        <div className="users-page">
            <div className="users-header">
                <h1>Customers</h1>
                {userRole === ADMIN && (
                    <button className="add-user-btn" onClick={() => { setShowAddForm(!showAddForm); setShowEditForm(false); }}>
                        {showAddForm ? 'Cancel' : '+ Add Customer'}
                    </button>
                )}
            </div>

            {showAddForm && (
                <form className="add-user-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="first_name"
                        placeholder="First Name"
                        value={newUser.first_name}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="last_name"
                        placeholder="Last Name"
                        value={newUser.last_name}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={handleInputChange}
                    />
                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone"
                        value={newUser.phone}
                        onChange={handleInputChange}
                    />
                    <button type="submit" className="submit-user-btn">Save Customer</button>
                </form>
            )}

            {showEditForm && (
                <form className="add-user-form edit-form" onSubmit={handleEditSubmit}>
                    <h3>Edit Customer #{editingUser.id}</h3>
                    <div className="form-grid">
                        <input
                            type="text"
                            name="first_name"
                            placeholder="First Name"
                            value={editingUser.first_name}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="text"
                            name="last_name"
                            placeholder="Last Name"
                            value={editingUser.last_name}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={editingUser.email || ''}
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone"
                            value={editingUser.phone || ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-user-btn">Update Customer</button>
                        <button type="button" className="cancel-btn" onClick={() => setShowEditForm(false)}>Cancel</button>
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
                                        {userRole === ADMIN && (
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
