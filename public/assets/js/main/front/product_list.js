$(function () {
    console.log('product list js load')

    $('input[type=checkbox]').on('click', function () {
        var that = $( "input:checked" );
        var n = that.length;
        
        console.log('length', n)
        console.log(that.attr('name'), that.val())
    
        var filter = {
            condition: [],
            categories: []
        };
    
        that.each(function() {
            console.log('val', $(this).attr('name'),  $(this).val())
            if ($(this)[0].checked) {
                if ($( this ).attr('name') == 'condition') {
                    filter.condition.push($( this ).val())
                }
    
                if ($( this ).attr('name') == 'categories') {
                    filter.categories.push($( this ).val())
                    var liChild = $( this ).find( "li" );
                    console.log('liChild', liChild)
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
    
            window.location.assign(uri.toString());
        });
    });
});

