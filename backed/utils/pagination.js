const formatPaginatedResponse = (data, totalData, currentPage, pageSize) => {
    const totalPage = Math.ceil(totalData / pageSize);

    return {
        totalData,
        pageSize,
        data,
        currentPage,
        totalPage
    };
};

module.exports = { formatPaginatedResponse };
