import React, { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import './Appointments.css';

const Appointments = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAppointment, setNewAppointment] = useState({
        customer_id: '',
        subject: '',
        date: '',
        time: '',
        description: ''
    });

    const fetchAppointments = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/appointments', {
                headers: {
                    'Authorization': `Bearer ${auth.user?.id_token}`
                }
            });
            const data = await response.json();
            setAppointments(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth.isAuthenticated) {
            fetchAppointments();
        }
    }, [auth.isAuthenticated]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAppointment(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8000/api/customer-history/${newAppointment.customer_id}/history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.user?.id_token}`
                },
                body: JSON.stringify({
                    ...newAppointment,
                    art: 'appointment'
                })
            });
            if (response.ok) {
                fetchAppointments();
                setNewAppointment({ customer_id: '', subject: '', date: '', time: '', description: '' });
                setShowAddForm(false);
            }
        } catch (error) {
            console.error('Error adding appointment:', error);
        }
    };

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
            const response = await fetch(`http://localhost:8000/api/appointments/${id}/complete`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${auth.user?.id_token}`
                }
            });
            if (response.ok) {
                fetchAppointments();
            }
        } catch (error) {
            console.error('Error completing appointment:', error);
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
                <form className="add-appt-form" onSubmit={handleSubmit}>
                    <input
                        type="number"
                        name="customer_id"
                        placeholder="Customer ID"
                        value={newAppointment.customer_id}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="subject"
                        placeholder="Subject"
                        value={newAppointment.subject}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="date"
                        name="date"
                        value={newAppointment.date}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="time"
                        name="time"
                        value={newAppointment.time}
                        onChange={handleInputChange}
                        required
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={newAppointment.description}
                        onChange={handleInputChange}
                    />
                    <button type="submit" className="submit-appt-btn">Save Appointment</button>
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
                                        <button
                                            className="complete-btn"
                                            onClick={() => handleMarkComplete(appt.history_id)}
                                        >
                                            Complete
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

export default Appointments;
