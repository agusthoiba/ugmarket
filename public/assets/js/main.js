function submitAuth(e, obj) {
  var form = $('#auth_form')
  $.ajax({
    url: '/auth/login',
    data: form.serializeArray(),
    method: 'POST',
    error: function(err){
      console.error(err);
      $('#auth_alert_msg').text('An error occured while login or register');
      return false;
    },
    success: function(res){
      if (res.error) {
        $('#auth_alert_msg').text(res.error);
        return false;
      }

      window.location.assign('/');
    }
  })
}

$(document).ready(function(){
  $(".owl-carousel").owlCarousel({
    loop: true,
    navText:['<i class="fas fa-less-than fa-lg"></i>', '<i class="fas fa-greater-than fa-lg"></i>'],
    responsiveClass:true,
    responsive:{
        0:{
            items:2,
            nav:false
        },
        600:{
            items:4,
            nav:false
        },
        1000:{
            items:6,
            nav:true,
        }
    }
  });

  $('#segbar_account').mouseenter(function() {
    $('#account_menu_popup').show();
  }).mouseleave(function() {
    $('#account_menu_popup').mouseleave(function() {
      $('#account_menu_popup').hide();
    })
  });

  /*$('#search-form').submit(function(e) {
    e.preventDefault()

    var searchStr = ($('#search-input').val()).trim();

    window.location.assign(`/products?search=${searchStr}`);
  })*/
});

function searchProduct(e) {
  e.preventDefault()

 // try to find the form/input reliably
  const form = e.target && (e.target.tagName === 'FORM' ? e.target : e.target.closest && e.target.closest('form'));
  const input = (form && (form.querySelector('input[name="search"]') || form.querySelector('input[type="search"]') || form.querySelector('input'))) 
                || (e.target && (e.target.querySelector && e.target.querySelector('input')));

  const searchStr = input && input.value ? input.value.trim() : '';

  // if empty, do nothing (or you can redirect to /products)
  if (!searchStr) return;

  window.location.assign(`/products?search=${encodeURIComponent(searchStr)}`);
}
