function pagination(limit, page, total, basePath, maxPages = 15) {
    limit = parseInt(limit);
    page = parseInt(page);

    const totalPage = Math.ceil(total / limit);

    let startPage, endPage;
    if (totalPage <= maxPages) {
        // less than maxPages total pages so show all
        startPage = 1;
        endPage = totalPage;
    } else {
        // more than maxPages, calculate start and end
        const half = Math.floor(maxPages / 2);
        if (page <= half) {
            startPage = 1;
            endPage = maxPages;
        } else if (page + half >= totalPage) {
            startPage = totalPage - maxPages + 1;
            endPage = totalPage;
        } else {
            startPage = page - half;
            endPage = page + half;
            if (maxPages % 2 === 0) endPage -= 1; // adjust for even maxPages
        }
    }

    const list = [];
    for (let i = startPage; i <= endPage; i++) {
        list.push({
            link: `${basePath}${basePath.includes('?') ? '&' : '?'}page=${i}`,
            no: i,
            active: page === i
        });
    }

    const paginationObj = {
        limit: limit,
        page: page,
        total_page: totalPage,
        total: total,
        list: list
    };

    if (page < totalPage) {
        paginationObj.next_page = page + 1;
    }
    if (page > 1) {
        paginationObj.prev_page = page - 1;
    }
    if (startPage > 1) {
        paginationObj.first_page = 1;
    }
    if (endPage < totalPage) {
        paginationObj.last_page = totalPage;
    }

    return { pagination: paginationObj };
}

module.exports = pagination;
