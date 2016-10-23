$(document).ready(function(){
    console.log('something');
    $('.carousel').slick({
      dots: true,
      infinite: true,
      slidesToShow: 4,
      slidesToScroll: 3
    });
});
