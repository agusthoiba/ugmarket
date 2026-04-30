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

    const imageAllowed = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!imageAllowed.includes(file.type)) {
      console.log(file.type);
      alert('Image harus jpg,png,webp, or heic');
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

function setFieldError(inputId, feedbackId, msg) {
  var el = inputId ? document.getElementById(inputId) : null;
  var fb = document.getElementById(feedbackId);
  if (msg) {
    if (el) el.classList.add('is-invalid');
    if (fb) { fb.textContent = msg; fb.style.display = 'block'; }
  } else {
    if (el) el.classList.remove('is-invalid');
    if (fb) { fb.textContent = ''; fb.style.display = 'none'; }
  }
}

function clearFieldError(inputId, feedbackId) {
  setFieldError(inputId, feedbackId, null);
}

function validateProdForm() {
  var valid = true;
  var firstError = null;

  function setError(inputId, feedbackId, msg) {
    setFieldError(inputId, feedbackId, msg);
    if (msg) {
      if (!firstError) firstError = document.getElementById(inputId);
      valid = false;
    }
  }

  // Nama Barang: required, max 100 chars
  var nameVal = document.getElementById('name').value.trim();
  if (!nameVal) {
    setError('name', 'name-validation', 'Nama barang wajib diisi');
  } else if (nameVal.length > 100) {
    setError('name', 'name-validation', 'Nama barang maksimal 100 karakter');
  } else {
    setError('name', 'name-validation', null);
  }

  // Kategori: required
  var category = document.getElementById('category');
  if (!category.value) {
    setError('category', 'category-validation', 'Kategori wajib dipilih');
  } else {
    setError('category', 'category-validation', null);
  }

  // Band / Artis: required
  var band = document.getElementById('band');
  if (!band.value) {
    setError('band', 'band-validation', 'Band / Artis wajib dipilih');
  } else {
    setError('band', 'band-validation', null);
  }

  // Harga Satuan: required, must be > 0
  var priceEl = document.getElementById('price');
  var priceVal = parseFloat(priceEl.value);
  if (!priceEl.value || isNaN(priceVal) || priceVal <= 0) {
    setError('price', 'price-validation', 'Harga satuan wajib diisi dan harus lebih dari 0');
  } else {
    setError('price', 'price-validation', null);
  }

  // Gambar Produk: min 1 image
  var prodImgFb = document.getElementById('prod-img-validation');
  var prodImagesPath = document.getElementById('prod_images_path');
  if (!prodImagesPath.value.trim()) {
    prodImgFb.textContent = 'Minimal 1 gambar produk wajib diupload';
    prodImgFb.style.display = 'block';
    if (!firstError) firstError = document.getElementById('prod-img-grid');
    valid = false;
  } else {
    prodImgFb.textContent = '';
    prodImgFb.style.display = 'none';
  }

  // Tokopedia: optional, but if filled must be a valid tokopedia URL
  var linkTokped = document.getElementById('marketplaces-tokopedia');
  if (linkTokped.value.trim()) {
    var uriTokped = new URI(linkTokped.value.trim());
    if (!['tokopedia.com', 'www.tokopedia.com'].includes(uriTokped.hostname())) {
      setError('marketplaces-tokopedia', 'marketplaces-tokopedia-validation', 'Harus URL tokopedia');
    } else {
      setError('marketplaces-tokopedia', 'marketplaces-tokopedia-validation', null);
    }
  } else {
    setError('marketplaces-tokopedia', 'marketplaces-tokopedia-validation', null);
  }

  // Shopee: optional, but if filled must be shopee.co.id
  var linkShopee = document.getElementById('marketplaces-shopee');
  if (linkShopee.value.trim()) {
    var uriShopee = new URI(linkShopee.value.trim());
    if (uriShopee.hostname() !== 'shopee.co.id') {
      setError('marketplaces-shopee', 'marketplaces-shopee-validation', 'Harus URL shopee.co.id');
    } else {
      setError('marketplaces-shopee', 'marketplaces-shopee-validation', null);
    }
  } else {
    setError('marketplaces-shopee', 'marketplaces-shopee-validation', null);
  }

  if (firstError) {
    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return valid;
}

function submitProd(e, obj) {
  if (!validateProdForm()) return false;

  var type = obj.data('type');
  $('input[name="is_visible"]').val(type);
  $('#add_product').submit();
}

$(function () {
  $('#category').select2();
  $('#band').select2();

  $('#name').on('input', function() {
    var val = this.value.trim();
    if (!val) setFieldError('name', 'name-validation', 'Nama barang wajib diisi');
    else if (val.length > 100) setFieldError('name', 'name-validation', 'Nama barang maksimal 100 karakter');
    else clearFieldError('name', 'name-validation');
  });

  $('#category').on('change', function() {
    if (!this.value) setFieldError('category', 'category-validation', 'Kategori wajib dipilih');
    else clearFieldError('category', 'category-validation');
  });

  $('#band').on('change', function() {
    if (!this.value) setFieldError('band', 'band-validation', 'Band / Artis wajib dipilih');
    else clearFieldError('band', 'band-validation');
  });

  $('#price').on('input', function() {
    var val = parseFloat(this.value);
    if (!this.value || isNaN(val) || val <= 0) setFieldError('price', 'price-validation', 'Harga satuan wajib diisi dan harus lebih dari 0');
    else clearFieldError('price', 'price-validation');
  });

  $('#marketplaces-tokopedia').on('input', function() {
    if (this.value.trim()) {
      var uri = new URI(this.value.trim());
      if (!['tokopedia.com', 'www.tokopedia.com'].includes(uri.hostname())) setFieldError('marketplaces-tokopedia', 'marketplaces-tokopedia-validation', 'Harus URL tokopedia');
      else clearFieldError('marketplaces-tokopedia', 'marketplaces-tokopedia-validation');
    } else {
      clearFieldError('marketplaces-tokopedia', 'marketplaces-tokopedia-validation');
    }
  });

  $('#marketplaces-shopee').on('input', function() {
    if (this.value.trim()) {
      var uri = new URI(this.value.trim());
      if (uri.hostname() !== 'shopee.co.id') setFieldError('marketplaces-shopee', 'marketplaces-shopee-validation', 'Harus URL shopee.co.id');
      else clearFieldError('marketplaces-shopee', 'marketplaces-shopee-validation');
    } else {
      clearFieldError('marketplaces-shopee', 'marketplaces-shopee-validation');
    }
  });

  var prodImgGrid = document.getElementById('prod-img-grid');
  if (prodImgGrid) {
    new MutationObserver(function() {
      var paths = document.getElementById('prod_images_path').value.trim();
      if (!paths) setFieldError(null, 'prod-img-validation', 'Minimal 1 gambar produk wajib diupload');
      else clearFieldError(null, 'prod-img-validation');
    }).observe(prodImgGrid, { childList: true });
  }
})
