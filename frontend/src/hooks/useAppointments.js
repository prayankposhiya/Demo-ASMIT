import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

export const useAppointments = (isAuthenticated) => {
    const [appointments, setAppointments] = useState([]);
    const [pagination, setPagination] = useState({ totalData: 0, totalPage: 0, currentPage: 1, pageSize: 10 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAppointments = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get(`/appointments?page=${page}&pageSize=${pagination.pageSize}`);
            if (response.data.success) {
                setAppointments(response.data.data.data);
                setPagination({
                    totalData: response.data.data.totalData,
                    totalPage: response.data.data.totalPage,
                    currentPage: response.data.data.currentPage,
                    pageSize: response.data.data.pageSize
                });
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    }, [pagination.pageSize]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchAppointments(pagination.currentPage);
        }
    }, [isAuthenticated, fetchAppointments, pagination.currentPage]);

    const setPage = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const addAppointment = async (values) => {
        const response = await api.post(`/customer-history/${values.customer_id}`, {
            ...values,
            art: 'appointment'
        });
        if (response.data.success) {
            await fetchAppointments(pagination.currentPage);
        }
        return response;
    };

    const markComplete = async (id) => {
        const response = await api.patch(`/appointments/${id}/complete`);
        if (response.data.success) {
            await fetchAppointments(pagination.currentPage);
        }
        return response;
    };

    return {
        appointments,
        pagination,
        loading,
        error,
        fetchAppointments,
        setPage,
        addAppointment,
        markComplete
    };
};
