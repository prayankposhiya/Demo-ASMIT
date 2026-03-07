import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

export const useCustomerDetail = (id, isAuthenticated) => {
    const [customer, setCustomer] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyPagination, setHistoryPagination] = useState({ totalData: 0, totalPage: 0, currentPage: 1, pageSize: 5 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCustomer = useCallback(async () => {
        if (!id) return;
        try {
            const response = await api.get(`/customers/${id}`);
            if (response.data.success) {
                setCustomer(response.data.data);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching customer info:', err);
            setError(err.response?.data?.error || err.message);
        }
    }, [id]);

    const fetchHistory = useCallback(async (page = 1) => {
        if (!id) return;
        try {
            const response = await api.get(`/customer-history/${id}?page=${page}&pageSize=${historyPagination.pageSize}`);
            if (response.data.success) {
                setHistory(response.data.data.data);
                setHistoryPagination({
                    totalData: response.data.data.totalData,
                    totalPage: response.data.data.totalPage,
                    currentPage: response.data.data.currentPage,
                    pageSize: response.data.data.pageSize
                });
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching customer history:', err);
            setError(err.response?.data?.error || err.message);
        }
    }, [id, historyPagination.pageSize]);

    const fetchData = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            await Promise.all([fetchCustomer(), fetchHistory(historyPagination.currentPage)]);
        } finally {
            setLoading(false);
        }
    }, [fetchCustomer, fetchHistory, id, historyPagination.currentPage]);

    useEffect(() => {
        if (isAuthenticated && id) {
            fetchData();
        }
    }, [isAuthenticated, id, fetchData]);

    const setHistoryPage = (page) => {
        setHistoryPagination(prev => ({ ...prev, currentPage: page }));
    };

    const addHistory = async (values) => {
        const response = await api.post(`/customer-history/${id}`, values);
        if (response.data.success) {
            await fetchHistory(historyPagination.currentPage);
        }
        return response;
    };

    const updateHistory = async (historyId, values) => {
        const response = await api.put(`/customer-history/${historyId}`, values);
        if (response.data.success) {
            await fetchHistory(historyPagination.currentPage);
        }
        return response;
    };

    const deleteHistory = async (historyId) => {
        const response = await api.delete(`/customer-history/${historyId}`);
        if (response.data.success) {
            await fetchHistory(1);
        }
        return response;
    };

    return {
        customer,
        history,
        historyPagination,
        loading,
        error,
        fetchData,
        fetchCustomer,
        fetchHistory,
        setHistoryPage,
        addHistory,
        updateHistory,
        deleteHistory
    };
};
