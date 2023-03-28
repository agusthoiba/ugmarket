function pagination(limit, page, total, basePath) {
    limit = parseInt(limit)
    page = parseInt(page)

    var totalPage = Math.ceil(total / limit);

    var res = {
        pagination: {
            limit: limit,
            page: page,
            total_page: totalPage,
            total: total,
            list: []
        }
    }

    if (totalPage > page) {
        res.pagination = Object.assign(res.pagination, {next_page: page + 1})
    }

    if (total <= limit) {
        res.pagination.list.push({
          link: `#`,
          no: 1,
          active: true
        });
    } else {
        for (let i = 1; i <= totalPage; i++) {
            // urlParams.set('page', i);
            res.pagination.list.push({
              link: `${basePath}?page=${i}`,
              no: i,
              active: res.pagination.page === i
            })
        }
    }
    return res;
}

module.exports = pagination;
