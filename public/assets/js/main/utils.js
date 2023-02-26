function uploadImage(files, label, widthResult, heightResult, ratioDiv) {
    console.log('files', files);
    console.log('label', label)

    let imageOriLabel = `image_ori_${label}`;
    console.log('imageOriLabel --', imageOriLabel)

    document.forms["band"][imageOriLabel].innerHTML = '';
  
    if (files.length === 0) {
      console.log(files);
      alert('Image required');
      return false;
    }
  
    for (var i = 0; i < files.length; i++) {
      var file = files[i];

      console.log('file satuan', file)

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
            /*if (widthResult == 0) {
                widthResult = img.width;
            } */

            var options = { debug: true, width: widthResult, height: heightResult };
            smartcrop.crop(img, options, function (result) {
              var canvas = document.createElement('canvas');
              var crop = result.topCrop;
              var ctx = canvas.getContext('2d');
              canvas.width = options.width;
              canvas.height = options.height;
              ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
  
              //$('.image-upload').prepend('<li class="thumb-image" id="thumb_image_0"></li>');
              
              var thumbId = '#thumb_image_'+label+'_0';

              console.log('thumbId', thumbId)

              $(thumbId).append(img);
              $(thumbId).removeClass("pickfile-container")
              $(thumbId).find('.ori').css({ display: 'none' });
              $(thumbId).append('<img class="preview">');

              document.forms["band"][imageOriLabel].innerHTML = img.src

              var dataURL = canvas.toDataURL(file.type);
              var imgPrev = $(thumbId).find('.preview')[0];
              imgPrev.style['vertical-align'] = 'baseline';
              imgPrev.src = dataURL;
              imgPrev.width = widthResult / ratioDiv;
              imgPrev.heigth = heightResult / ratioDiv;
              $(thumbId).append('<textarea style="display: none" name="image_thumbnail">' + imgPrev.src + '"</textarea>');
            })
          }
        }
      })(img);
      reader.readAsDataURL(file);
    }
  }
  
  function browseFile(e, obj, label) {
    $('#upload_image_'+label).click();
    //e.preventDefault();
  }