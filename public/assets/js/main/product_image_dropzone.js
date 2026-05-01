Dropzone.autoDiscover = false;

// ─── Product form (account) ───────────────────────────────────────────────

var _prodImgPaths = [];

function _initFormImages() {
  document.querySelectorAll('#prod-img-grid .prod-img-slot[data-path]').forEach(function (slot) {
    if (slot.dataset.path) _prodImgPaths.push(slot.dataset.path);
  });
  _syncProdInput();
}

function handleProdImgUpload(input) {
  var file = input.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function (e) {
    var addBtn = document.getElementById('prod-img-add');
    var slot = document.createElement('div');
    slot.className = 'prod-img-slot prod-img-uploading';
    slot.innerHTML =
      '<img src="' + e.target.result + '" alt="Uploading">' +
      '<span class="prod-img-spinner"></span>' +
      '<button type="button" class="prod-img-remove" onclick="removeProdImg(this)">×</button>';
    addBtn.parentNode.insertBefore(slot, addBtn);

    var fd = new FormData();
    fd.append('image', file);

    fetch('/account/upload', { method: 'POST', body: fd })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        console.log("data", data);
        var path = (data.url || '').split('/').pop();
        slot.dataset.path = path;
        slot.classList.remove('prod-img-uploading');
        var spinner = slot.querySelector('.prod-img-spinner');
        if (spinner) spinner.remove();
        _prodImgPaths.push(path);
        _syncProdInput();
      })
      .catch(function () {
        slot.remove();
        alert('Upload gagal, coba lagi.');
      });

    input.value = '';
  };
  reader.readAsDataURL(file);
}

function removeProdImg(btn) {
  var slot = btn.closest('.prod-img-slot');
  var path = slot.dataset.path;
  if (path) {
    var i = _prodImgPaths.indexOf(path);
    if (i > -1) _prodImgPaths.splice(i, 1);
    _syncProdInput();
  }
  slot.remove();
}

function _syncProdInput() {
  var el = document.getElementById('prod_images_path');
  if (el) el.value = _prodImgPaths.join(',');
}

// ─── Product cards (public list) ─────────────────────────────────────────
// Initializes on each .product-image[data-product-id] card.

function initProductImageDropzone(el) {
  console.log("Initializing Dropzone for:", el);
  if (el._dropzone) return;

  var existingImg = el.querySelector("img");
  var existingSrc = existingImg ? existingImg.src : null;
  var productId   = el.dataset.productId;

  var dz = new Dropzone(el, {
    url: "/account/upload",
    method: "post",
    paramName: "image",
    params: { prod_id: productId },
    acceptedFiles: "image/jpeg,image/png,image/webp,image/heic,image/heif",
    maxFilesize: 25,
    maxFiles: 1,
    addRemoveLinks: true,
    dictDefaultMessage: "",
    dictRemoveFile: "✕",
    clickable: true,

    init: function () {
      var self = this;
      if (existingSrc) {
        var mockFile = { name: "current-image", size: 0, accepted: true };
        self.emit("addedfile", mockFile);
        self.emit("thumbnail", mockFile, existingSrc);
        self.emit("complete", mockFile);
        self.files.push(mockFile);
      }
    },

    success: function (file, response) {
      el.dataset.uploadedUrl = response.url || response.path || "";
    },

    error: function (file, message) {
      console.error("Upload error [prod " + productId + "]:", message);
      this.removeFile(file);
    },
  });

  el._dropzone = dz;
  return dz;
}

// ─── Boot ─────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", function () {
  // Form (account product add/edit)
  _initFormImages();

  // Product cards (public list)
  document.querySelectorAll(".product-image[data-product-id]").forEach(initProductImageDropzone);
});

// Called by product_list_new.js after lazy-loading more cards
window.initNewProductImageDropzones = function (container) {
  (container || document).querySelectorAll(".product-image[data-product-id]").forEach(function (el) {
    if (!el._dropzone) initProductImageDropzone(el);
  });
};
