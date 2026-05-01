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
    console.log(" fileInput: ", fileInput)
    if (!fileInput) {
        console.error(`File input #upload_image_${label} not found`);
        return;
    }

    fileInput.click();
    
    if (e) {
        e.preventDefault();
    }
}



async function uploadImageAdvance(files, fieldName, ratio = null, width = null, height = null, widthPreview = 100) {
  if (!files || files.length === 0) {
    console.error('No files selected');
    return;
  }

  const file = files[0];
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  // Validate file type
  if (!validTypes.includes(file.type)) {
    alert('Format file tidak didukung. Gunakan JPG, PNG, WebP, HEIC, atau HEIF');
    return;
  }

  // Validate file size
  if (file.size > maxSize) {
    alert('Ukuran file terlalu besar (max 5MB)');
    return;
  }

  // Validate dimensions if ratio or width/height provided
  if (ratio || width || height) {
    const img = new Image();
    img.onload = async function() {
      const validation = validateImageDimensions(this.width, this.height, ratio, width, height, fieldName);
      if (!validation.valid) {
        alert(validation.message);
        return;
      }
      await processUpload(file, fieldName, widthPreview);
    };
    img.onerror = function() {
      alert('Gagal membaca file gambar');
    };
    img.src = URL.createObjectURL(file);
  } else {
    await processUpload(file, fieldName, widthPreview);
  }
}

function validateImageDimensions(imgWidth, imgHeight, ratio, minWidth, minHeight, fieldName) {
  // Check aspect ratio if provided
  if (ratio) {
    const [ratioWidth, ratioHeight] = ratio.split(':').map(Number);
    const expectedRatio = ratioWidth / ratioHeight;
    const actualRatio = imgWidth / imgHeight;
    const tolerance = 0.05; // 5% tolerance

    if (Math.abs(actualRatio - expectedRatio) > tolerance) {
      return {
        valid: false,
        message: `Rasio gambar harus ${ratio}. Gambar Anda: ${(actualRatio).toFixed(2)}`
      };
    }
  }

  // Check minimum width if provided
  if (minWidth && imgWidth < minWidth) {
    return {
      valid: false,
      message: `Lebar gambar minimal ${minWidth}px. Gambar Anda: ${imgWidth}px`
    };
  }

  // Check minimum height if provided
  if (minHeight && imgHeight < minHeight) {
    return {
      valid: false,
      message: `Tinggi gambar minimal ${minHeight}px. Gambar Anda: ${imgHeight}px`
    };
  }

  return { valid: true };
}

async function processUpload(file, fieldName, widthPreview = 100)  {
  const formData = new FormData();
  formData.append('image', file);
  //formData.append('upload_preset', 'YOUR_UPLOAD_PRESET');
  //formData.append('folder', `ugmarket/${fieldName}`);

  // Display loading spinner in thumbnail container
  const thumbContainer = document.getElementById(`thumb_image_${fieldName}`);
  thumbContainer.classList.remove("pickfile-container");
  if (thumbContainer) {
    thumbContainer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100px;">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
  }

  const url = '/account/upload';
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.error) {
      alert(`Upload error: ${data.error.message}`);
      // Clear the spinner on error
      if (thumbContainer) {
        thumbContainer.innerHTML = '';
      }
      return;
    }

    // Store image URL and display preview
    const imageUrl = data.url;

    // Update hidden input with original image ID
    const hiddenInput = document.getElementById(`image_ori_${fieldName}`);
    if (hiddenInput) {
      hiddenInput.value = imageUrl;
    }

    // Display preview
    if (thumbContainer) {
      thumbContainer.innerHTML = `
        <img class="preview" width="${widthPreview}" height="auto" src="${imageUrl}" alt="Preview" style="object-fit: cover;">
      `;
    }
    console.log(`thumbContainer: `, thumbContainer);
    console.log(`Image uploaded successfully: ${imageUrl}`);
  } catch (error) {
    console.error('Upload error:', error);
    alert('Gagal upload gambar. Silakan coba lagi.');
    // Clear the spinner on error
    if (thumbContainer) {
      thumbContainer.classList.add("pickfile-container");
      thumbContainer.innerHTML = '';
    }
  }
}

function removeImage(fieldName) {
  const hiddenInput = document.getElementById(`image_ori_${fieldName}`);
  if (hiddenInput) {
    hiddenInput.value = '';
  }

  const thumbContainer = document.getElementById(`thumb_image_${fieldName}_0`);
  if (thumbContainer) {
    thumbContainer.innerHTML = `<button type="button" class="btn btn-secondary">Upload ${fieldName}</button>`;
  }
}
/*function validation(payload, type = 'string') {
  const schema = joi.object({
    name: joi.string().alphanum().min(3).max(30).required(),
    email: joi.string().email({ tlds: { allow: false } }),
    //password: joi.string().min(6).required(),
  });

  let errors = []

  const { error, value } = schema.validate(data);

  if (error) {
    alert("Validation error: " + error.details[0].message);
  } else {
    console.log("Valid data:", value);
  }
}*/