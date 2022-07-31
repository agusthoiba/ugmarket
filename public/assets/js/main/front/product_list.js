$(function () {
    console.log('product list js load')

    var url = new URI(window.location.href);;
    $( "#sort-select" ).change(function() {
        $("#sort-select option:selected" ).each(function() {
            var sortVal = $( this ).val();

            console.log('sortVal', sortVal)
            url.setSearch('sort', sortVal);
            window.location.href = url.toString();
        });
    })

    $('input[type=checkbox]').on('click', function () {
        var that = $( "input:checked" );
        var n = that.length;
        
    
        var filter = {
            condition: [],
            categories: []
        };
    
        that.each(function() {
            if ($(this)[0].checked) {
                if ($( this ).attr('name') == 'condition') {
                    filter.condition.push($( this ).val())
                }
    
                if ($( this ).attr('name') == 'categories') {
                    filter.categories.push($( this ).val())
                }
            }
            console.log('filter', filter.condition.join(','),  filter.categories.join(','))
            
            var uri = new URI(window.location.href);
            if (filter.condition.length > 0) {
                uri.setQuery({
                    condition: filter.condition.join(',')
                });
            }
    
            if (filter.categories.length > 0) {
                uri.setQuery({
                    categories: filter.categories.join(',') 
                });
            }

            console.log('uri', uri.toString())
    
            window.location.href = uri.toString();
        });
    });
});
