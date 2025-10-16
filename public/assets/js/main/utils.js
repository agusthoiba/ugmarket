function uploadImage(files, label, formId = 'uploadForm') {

  let widthResult = 0;
  let heightResult = 0;
  let ratioDiv = 1;

    // Validate required parameters
    if (!files || !label) {
        console.error('Files and label are required parameters');
        return false;
    }

    // Get form element
    const form = document.getElementById(formId);
    if (!form) {
        console.error(`Form with ID "${formId}" not found`);
        return false;
    }

    let imageOriField = form.querySelector(`[name="image_ori_${label}"]`);
    if (!imageOriField) {
        console.error(`Input field with name "image_ori_${label}" not found`);
        return false;
    }

    // Reset the original image field
    imageOriField.value = '';

    if (files.length === 0) {
        console.warn('No files selected');
        alert('Image required');
        return false;
    }

    for (const file of files) {
        console.log('Processing file:', file);

        if (file.size > (25 * 1024 * 1024)) {
            alert('Image tidak boleh lebih dari 25 MB');
            return false;
        }

        const fileTypeAllowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
        if (!fileTypeAllowed.includes(file.type)) {
            alert('Image harus jpg,png,webp, atau heic');
            return false;
        }

        const img = document.createElement("img");
        img.classList.add("ori");
        img.file = file;

    var reader = new FileReader();
    reader.onload = (function (aImg) {
      return function (e) {
        aImg.src = e.target.result;
        img.onload = function () {

            console.log("img.src: ", img.src)
            $(`#image_ori_${label}`).val(img.src)

          var options = { debug: true, width: 200, height: 200 };
          smartcrop.crop(img, options, function (result) {
            var canvas = document.createElement('canvas');
            var crop = result.topCrop;
            var ctx = canvas.getContext('2d');
            canvas.width = options.width;
            canvas.height = options.height;
            ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);

            //$('.image-upload').prepend('<li class="thumb-image" id="thumb_image_0"></li>');
            
            $(`#thumb_image_${label}`).append(img);
            $(`#thumb_image_${label}`).removeClass("pickfile-container")
            $(`#thumb_image_${label}`).find('.ori').css({ display: 'none' });
            $(`#thumb_image_${label}`).append('<img class="preview">');

            var dataURL = canvas.toDataURL(file.type);
            var imgPrev = $(`#thumb_image_${label}`).find('.preview')[0];
            imgPrev.style['vertical-align'] = 'baseline';
            imgPrev.src = dataURL;
            imgPrev.width = 100;
            imgPrev.heigth = 100;
            // $(`#thumb_image_${label}`).append('<textarea style="display: none" >' + imgPrev.src + '"</textarea>');
          })
        }
      }
    })(img);
    reader.readAsDataURL(file);
    }
}

function browseFile(e, label) {
  console.log('browseFile called with label:', label);
    const fileInput = document.querySelector(`#upload_image_${label}`);
    if (!fileInput) {
        console.error(`File input #upload_image_${label} not found`);
        return;
    }

    fileInput.click();
    
    if (e) {
        e.preventDefault();
    }
}