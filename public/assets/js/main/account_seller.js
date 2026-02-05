// Validation functions
  function validateSellerName(name) {
    if (!name || name.trim().length === 0) {
      return 'Nama toko harus diisi';
    }
    if (name.trim().length < 3) {
      return 'Nama toko minimal 3 karakter';
    }
    if (name.trim().length > 50) {
      return 'Nama toko maksimal 50 karakter';
    }
    return '';
  }

  function validatePhone(phone) {
    if (!phone || phone.trim().length === 0) {
      return 'Nomor HP/WhatsApp harus diisi';
    }
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    if (!phoneRegex.test(phone.trim())) {
      return 'Format nomor HP tidak valid (contoh: 08xxxxxxxxxx)';
    }
    return '';
  }

  function validateDescription(desc) {
    if (!desc || desc.trim().length === 0) {
      return 'Deskripsi harus diisi';
    }
    if (desc.trim().length < 10) {
      return 'Deskripsi minimal 10 karakter';
    }
    if (desc.trim().length > 500) {
      return 'Deskripsi maksimal 500 karakter';
    }
    return '';
  }

  function validatePostalCode(postalCode) {
   /*if (!postalCode || postalCode.trim().length === 0) {
      return 'Kode pos harus diisi';
    }*/
    if (postalCode.trim().length > 0) {
        if (!/^\d{5}$/.test(postalCode.trim())) {
            return 'Kode pos harus 5 digit angka';
        }
    }
    return '';
  }

  function validateCoordinates(lat, lng) {
    if (!lat || !lng) {
      return 'Silakan pilih lokasi pada peta';
    }
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      return 'Koordinat tidak valid';
    }
    return '';
  }

  // Helper functions for error display
  function showError(element, message) {
    element.classList.add('is-invalid');
    const feedback = element.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
      feedback.textContent = message;
      feedback.style.display = 'block';
    }
  }

  function clearError(element) {
    element.classList.remove('is-invalid');
    const feedback = element.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
      feedback.textContent = '';
      feedback.style.display = 'none';
    }
  }

  // Initialize validation on DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('uploadForm');
    const nameInput = document.getElementById('name');
    const hpInput = document.getElementById('hp');
    const descriptionInput = document.getElementById('description');
    const postalCodeInput = document.getElementById('zipcode');
    //const latInput = document.getElementById('address_lat');
    //const lngInput = document.getElementById('address_lng');

    // Real-time validation for name
    if (nameInput) {
      nameInput.addEventListener('blur', function() {
        const error = validateSellerName(this.value);
        if (error) {
          showError(this, error);
        } else {
          clearError(this);
        }
      });

      nameInput.addEventListener('input', function() {
        if (this.classList.contains('is-invalid')) {
          const error = validateSellerName(this.value);
          if (!error) {
            clearError(this);
          }
        }
      });
    }

    // Real-time validation for phone
    if (hpInput) {
      hpInput.addEventListener('blur', function() {
        const error = validatePhone(this.value);
        if (error) {
          showError(this, error);
        } else {
          clearError(this);
        }
      });

      hpInput.addEventListener('input', function() {
        if (this.classList.contains('is-invalid')) {
          const error = validatePhone(this.value);
          if (!error) {
            clearError(this);
          }
        }
      });
    }

    // Real-time validation for description
    /*if (descriptionInput) {
      descriptionInput.addEventListener('blur', function() {
        const error = validateDescription(this.value);
        if (error) {
          showError(this, error);
        } else {
          clearError(this);
        }
      });

      descriptionInput.addEventListener('input', function() {
        if (this.classList.contains('is-invalid')) {
          const error = validateDescription(this.value);
          if (!error) {
            clearError(this);
          }
        }
      });
    }*/

    // Real-time validation for postal code
    if (postalCodeInput) {
      postalCodeInput.addEventListener('blur', function() {
        const error = validatePostalCode(this.value);
        if (error) {
          showError(this, error);
        } else {
          clearError(this);
        }
      });

      postalCodeInput.addEventListener('input', function() {
        // Only allow digits
        this.value = this.value.replace(/\D/g, '').substring(0, 5);
        
        if (this.classList.contains('is-invalid')) {
          const error = validatePostalCode(this.value);
          if (!error) {
            clearError(this);
          }
        }
      });
    }

    // Form submission validation
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      let isValid = true;

      // Validate name
      const nameError = validateSellerName(nameInput.value);
      if (nameError) {
        showError(nameInput, nameError);
        console.log('Name validation error:', nameError);
        isValid = false;
      } else {
        clearError(nameInput);
      }

      // Validate phone
      const phoneError = validatePhone(hpInput.value);
      if (phoneError) {
        showError(hpInput, phoneError);
        console.log('Phone validation error:', phoneError);
        isValid = false;
      } else {
        clearError(hpInput);
      }

      // Validate postal code
      const postalError = validatePostalCode(postalCodeInput.value);
      if (postalError) {
        showError(postalCodeInput, postalError);
        console.log('Postal code validation error:', postalError);
        isValid = false;
      } else {
        clearError(postalCodeInput);
      }

      console.log('Form validation result:', isValid);

      if (isValid) {
        // Submit via API
        submitSellerForm();
      }
    });

    // Submit form via API
    async function submitSellerForm() {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Menyimpan...';

      const alertContainer = document.getElementById('alert');

      try {
        const formData = new FormData(form);

        const payload = {
          name: nameInput.value.trim(),
          hp: hpInput.value.trim(),
          description: descriptionInput.value.trim(),
          street: document.getElementById('street')?.value || '',
          province: document.getElementById('province')?.value || '',
          city: document.getElementById('city')?.value || '',
          district: document.getElementById('district')?.value || '',
          village: document.getElementById('village')?.value || '',
          zipcode: postalCodeInput.value.trim(),
          image_banner: document.getElementById('image_ori_banner')?.value || '',
          image_ori_avatar: document.getElementById('image_ori_avatar')?.value || '',
        };

        const response = await fetch('/account/seller', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('API Error:', result);
          // Show error in alert container
          showAlert(alertContainer, result.error || result.message || 'Terjadi kesalahan saat menyimpan data', 'danger');
          
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit';
          return;
        }
        
        // Redirect or refresh page
        
        // Show success state first
        submitBtn.disabled = true;
        submitBtn.textContent = 'Success';
        submitBtn.classList.remove('btn-default');
        submitBtn.classList.add('btn-success');
        showAlert(alertContainer, 'Data toko berhasil disimpan!', 'success');
        
        // Return to default state after 5 seconds
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit';
          submitBtn.classList.remove('btn-success');
          submitBtn.classList.add('btn-default');
        }, 5000);

      } catch (error) {
        console.error('Error submitting form:', error);
        
        // Show error in alert container
        showAlert(alertContainer, error.message || 'Terjadi kesalahan saat menyimpan data', 'danger');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      }
    }

    // Helper function to show alert message
    function showAlert(container, message, type = 'danger') {
      const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
      //const icon = type === 'success' ? '✓' : '✕';
        
      container.classList.remove('d-none');
      container.classList.add('d-block');
      container.classList.remove('alert-success');
      container.classList.add(alertClass);
      container.innerText = message;

      // Auto-dismiss after 5 seconds for success messages
      if (type === 'success') {
        setTimeout(() => {
          container.classList.remove('d-none');
          container.classList.add('d-block');
          container.classList.remove('alert-danger');
          container.classList.add(alertClass);
          container.innerText = message;
        }, 5000);
      }
    }
  });
