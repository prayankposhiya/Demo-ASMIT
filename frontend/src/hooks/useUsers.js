import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

export const useUsers = (isAuthenticated) => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ totalData: 0, totalPage: 0, currentPage: 1, pageSize: 10 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get(`/customers?page=${page}&pageSize=${pagination.pageSize}`);
            if (response.data.success) {
                setUsers(response.data.data.data);
                setPagination({
                    totalData: response.data.data.totalData,
                    totalPage: response.data.data.totalPage,
                    currentPage: response.data.data.currentPage,
                    pageSize: response.data.data.pageSize
                });
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, pagination.pageSize]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUsers(pagination.currentPage);
        }
    }, [isAuthenticated, fetchUsers, pagination.currentPage]);

    const setPage = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const addUser = async (values) => {
        const response = await api.post('/customers', values);
        if (response.data.success) {
            await fetchUsers(pagination.currentPage);
        }
        return response;
    };

    const updateUser = async (id, values) => {
        const response = await api.put(`/customers/${id}`, values);
        if (response.data.success) {
            await fetchUsers(pagination.currentPage);
        }
        return response;
    };

    const deleteUser = async (id) => {
        const response = await api.delete(`/customers/${id}`);
        if (response.data.success) {
            await fetchUsers(1); // Go back to page 1 on delete? Or stay? Stay but re-fetch.
        }
        return response;
    };

    return {
        users,
        pagination,
        loading,
        error,
        fetchUsers,
        setPage,
        addUser,
        updateUser,
        deleteUser
    };
};
