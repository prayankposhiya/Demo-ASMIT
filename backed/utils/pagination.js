/**
 * Pagination helper to standardize paginated responses.
 * 
 * @param {Array} data - The array of data for the current page
 * @param {number} totalData - total number of records in the database
 * @param {number} currentPage - current page number
 * @param {number} pageSize - number of records per page
 * @returns {Object} Structured paginated object
 */
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
