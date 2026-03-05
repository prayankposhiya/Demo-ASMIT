import React, { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import './Users.css';

const Users = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    console.log(auth?.user?.id_token, "authuser");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({ first_name: '', last_name: '', email: '', phone: '' });

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
        setNewUser(prev => ({ ...prev, [name]: value }));
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

    return (
        <div className="users-page">
            <div className="users-header">
                <h1>Customers</h1>
                <button className="add-user-btn" onClick={() => setShowAddForm(!showAddForm)}>
                    {showAddForm ? 'Cancel' : '+ Add Customer'}
                </button>
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
                                        >
                                            View Detail
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Users;
