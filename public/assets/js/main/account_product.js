function uploadImageProduct(files, obj) {
  console.log(files);
  console.log(obj);

  if (files.length === 0) {
    console.log(files);
    alert('Image required');
    return false;
  }

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var imageType = /^image\//;

    if (file.size > (25 * 1024 * 1024)) {
      console.log(file.size);
      alert('Image tidak boleh lebih dari 25 MB');
      return false;
    }

    if (file.type != 'image/jpeg' && file.type != 'image/png') {
      console.log(file.type);
      alert('Image harus jpg atau png');
      return false;
    }

    var img = document.createElement("img");
    img.classList.add("ori");
    img.file = file;

    var reader = new FileReader();
    reader.onload = (function (aImg) {
      return function (e) {
        aImg.src = e.target.result;
        img.onload = function () {
          var options = { debug: true, width: 200, height: 200 };
          smartcrop.crop(img, options, function (result) {
            var canvas = document.createElement('canvas');
            var crop = result.topCrop;
            var ctx = canvas.getContext('2d');
            canvas.width = options.width;
            canvas.height = options.height;
            ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);

            //$('.image-upload').prepend('<li class="thumb-image" id="thumb_image_0"></li>');
            
            $('#thumb_image_0').append(img);
            $('#thumb_image_0').removeClass("pickfile-container")
            $('#thumb_image_0').find('.ori').css({ display: 'none' });
            $('#thumb_image_0').append('<img class="preview">');


            $('#image_ori').val(img.src)

            var dataURL = canvas.toDataURL(file.type);
            var imgPrev = $('#thumb_image_0').find('.preview')[0];
            imgPrev.style['vertical-align'] = 'baseline';
            imgPrev.src = dataURL;
            imgPrev.width = 100;
            imgPrev.heigth = 100;
            $('#thumb_image_0').append('<textarea style="display: none" name="image_thumbnail">' + imgPrev.src + '"</textarea>');
          })
        }
      }
    })(img);
    reader.readAsDataURL(file);
  }
}

function browseFile(e, obj) {
  $('#upload_image').click();
  //e.preventDefault();
}

function submitProd(e, obj) {
  var type = obj.data('type');

  var linkTokpedValidation =  document.getElementById("marketplaces-tokopedia-validation");
  var linkBlValidation =  document.getElementById("marketplaces-bukalapak-validation");

  // Tokopedia Link
  var linkTokped = document.getElementById("marketplaces-tokopedia");
  
  if (linkTokped.value != '') {
    var uriTokped = new URI(linkTokped.value.trim());

    if (!['tokopedia.com', 'www.tokopedia.com'].includes(uriTokped.hostname())) {
      linkTokpedValidation.innerHTML = 'Harus URL tokopedia';
      linkTokpedValidation.style.display = "block";
      e.preventDefault()
      return false;
    } else {
      linkTokpedValidation.style.display = "none";
    }
  }

   // Bukalapak Link
   var linkBL = document.getElementById("marketplaces-bukalapak");
   
  if (linkBL.value != '') {
    var uriBL = new URI(linkBL.value.trim());
  
    if (!['bukalapak.com', 'www.bukalapak.com'].includes(uriBL.hostname())) {
      linkBlValidation.innerHTML = 'Harus URL bukalapak';
      linkBlValidation.style.display = "block";
      e.preventDefault()
      return false;
    }
  }

  $('input[name="is_visible"]').val(type);
  $('#add_product').submit();
}

$(function () {
  $('#category').select2();
  $('#band').select2();
})
