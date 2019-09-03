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
  console.log('im here?')
  $('.dropdown-toggle').dropdown();

  /*$('.dropdown').hover(function() {
      $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(200);
    }, function() {
      $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(200);
    });
  var s = skrollr.init({forceHeight: false});*/

  $('#segbar_account').mouseenter(function() {
    $('#account_menu_popup').show();
  }).mouseleave(function() {
    $('#account_menu_popup').mouseleave(function() {
      $('#account_menu_popup').hide();
    })
  });
});
