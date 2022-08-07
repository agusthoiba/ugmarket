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
    
            window.location.assign(uri.toString());
        });
    });

    $('input[name=price]').on('change', function () {
        var that = $('input[name=price]');
        console.log(that)

        $('#alert-price').hide();

        var uri = new URI(window.location.href);
        var priceMin = $('#price-min').val();
        var priceMax = $('#price-max').val();

        that.each(function() {
            if ($(this).val() != '') {
                var re = /[0-9]/g;
                if (re.exec($(this).val()) == null) {
                    $(this).val('')
                }
            }
        });

        if (priceMin != '' && priceMax != '') {
            if (parseInt(priceMin) > parseInt(priceMax)) {
                $('#alert-price').text('Nilai min harus lebih kecil dari maks').show();
            }
        }

        uri.setQuery({
            price_min: priceMin,
            price_max: priceMax
        });
    
        console.log('uri price', uri.toString())
    
        window.location.assign(uri.toString());
    });

    $('#filter_hide').click(function() {
        console.log('aku clik hide')
        $('#sidebar').css('display', 'none');
        $(this).css('display', 'none');
    })

    $('#filter_view').click(function() {
        $('#sidebar').css('display', 'block');
        $('#filter_hide').css('display', 'block');
    })

    $('.category .group-title-icon').click(function() {
        var that = $(this);

        if ($('.category .group-wrapper').css('display') == 'none') {
            $('.category .group-wrapper').css('display', 'block');
            that.html('<path d="M3 7h9v1H3z" fill="currentColor" fill-rule="evenodd"></path>');
        } else {
            $('.category .group-wrapper').css('display', 'none');
            that.html('<path d="M8 7V3H7v4H3v1h4v4h1V8h4V7H8z" fill="currentColor" fill-rule="evenodd"></path>');
        }

    });

    $('.price .group-title-icon').click(function() {
        var that = $(this);

        if ($('.price .group-wrapper').css('display') == 'none') {
            $('.price .group-wrapper').css('display', 'block');
            that.html('<path d="M3 7h9v1H3z" fill="currentColor" fill-rule="evenodd"></path>');
        } else {
            $('.price .group-wrapper').css('display', 'none');
            that.html('<path d="M8 7V3H7v4H3v1h4v4h1V8h4V7H8z" fill="currentColor" fill-rule="evenodd"></path>');
        }
    });

    $('.size .group-title-icon').click(function() {
        var that = $(this);

        if ($('.size .group-wrapper').css('display') == 'none') {
            $('.size .group-wrapper').css('display', 'block');
            that.html('<path d="M3 7h9v1H3z" fill="currentColor" fill-rule="evenodd"></path>');
        } else {
            $('.size .group-wrapper').css('display', 'none');
            that.html('<path d="M8 7V3H7v4H3v1h4v4h1V8h4V7H8z" fill="currentColor" fill-rule="evenodd"></path>');
        }
    });

    $('.condition .group-title-icon').click(function() {
        var that = $(this);

        if ($('.condition .group-wrapper').css('display') == 'none') {
            $('.condition .group-wrapper').css('display', 'block');
            that.html('<path d="M3 7h9v1H3z" fill="currentColor" fill-rule="evenodd"></path>');
        } else {
            $('.condition .group-wrapper').css('display', 'none');
            that.html('<path d="M8 7V3H7v4H3v1h4v4h1V8h4V7H8z" fill="currentColor" fill-rule="evenodd"></path>');
        }
    });
});
