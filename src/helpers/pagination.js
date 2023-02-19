function pagination(data, limit, page, total) {
    limit = parseInt(limit)
    page = parseInt(page)

    var totalPage = Math.ceil(data.length / limit);
    var idx = page - 1;
    var startIndex = idx  * limit;
    var endIndex = 0;
       
    if (data.length < limit) {
        endIndex = data.length;
    } else {
        endIndex = startIndex + limit;
        if (data.length < endIndex) {
            endIndex = data.length;
        }
    }

    var result = [];
    for(var i = startIndex; i < endIndex; i++){
        result.push(data[i]);
    }


    var res = {
        data: result,
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
              link: `/admin/band?page=${i}`,
              no: i,
              active: res.pagination.page === i
            })
        }
    }
    return res;
}

module.exports = pagination;
