function pagination(data, limit, page){
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
            total_page: totalPage
        }
    }

    if (totalPage > page) {
        res.pagination = Object.assign(res.pagination, {next_page: page + 1})
    }
    
    return res;
}

module.exports = pagination;
