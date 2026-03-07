import React from 'react';
import './Pagination.css';

const Pagination = ({ pagination, onPageChange }) => {
    const { totalData, totalPage, currentPage, pageSize } = pagination;

    const getPageNumbers = () => {
        const pages = [];
        const showMax = 5;

        if (totalPage <= showMax) {
            for (let i = 1; i <= totalPage; i++) pages.push(i);
        } else {
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPage - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (currentPage < totalPage - 2) {
                pages.push('...');
            }

            if (!pages.includes(totalPage)) pages.push(totalPage);
        }
        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="pagination-container">
            <div className="pagination-info">
                Showing <span>{Math.min((currentPage - 1) * pageSize + 1, totalData)}</span> to <span>{Math.min(currentPage * pageSize, totalData)}</span> of <span>{totalData}</span> entries
            </div>
            <div className="pagination-controls">
                <button
                    className="pagination-btn arrow-btn"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    title="Previous Page"
                >
                    <span className="arrow">&lsaquo;</span> Prev
                </button>

                {pages.map((page, index) => (
                    page === '...' ? (
                        <span key={`dots-${index}`} className="pagination-ellipsis">&bull;&bull;&bull;</span>
                    ) : (
                        <button
                            key={page}
                            className={`pagination-btn num-btn ${currentPage === page ? 'active' : ''}`}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    )
                ))}

                <button
                    className="pagination-btn arrow-btn"
                    disabled={currentPage === totalPage || totalPage === 0}
                    onClick={() => onPageChange(currentPage + 1)}
                    title="Next Page"
                >
                    Next <span className="arrow">&rsaquo;</span>
                </button>
            </div>
        </div>
    );
};

export default Pagination;
