// Slug generation helper
function generateSlug(name) {
  const slugInput = document.getElementById('slug');
  if (!slugInput) return;
  // Only auto-generate if slug field is empty or was previously auto-generated
  if (slugInput.value && slugInput.dataset.userEdited !== 'true') return;
  
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  slugInput.value = slug;
}

// Mark slug as user-edited when user manually changes it
document.addEventListener('DOMContentLoaded', function() {
  const slugInput = document.getElementById('slug');
  if (slugInput) {
    slugInput.addEventListener('input', function() {
      this.dataset.userEdited = 'true';
    });
  }
});

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

  function validateBankCode(bankCode) {
    // Bank is optional: an empty selection is allowed.
    if (!bankCode || bankCode.trim().length === 0) {
      return '';
    }
    return '';
  }

  function validateBankAccountNumber(accountNumber) {
    // Account number is optional: only validate the format when filled.
    if (!accountNumber || accountNumber.trim().length === 0) {
      return '';
    }
    if (!/^\d{6,20}$/.test(accountNumber.trim())) {
      return 'Nomor rekening harus berupa angka 6-20 digit';
    }
    return '';
  }

  function validateBankAccountName(accountName) {
    // Account name is optional: only validate the length when filled.
    if (!accountName || accountName.trim().length === 0) {
      return '';
    }
    if (accountName.trim().length < 3) {
      return 'Nama pemilik rekening minimal 3 karakter';
    }
    if (accountName.trim().length > 100) {
      return 'Nama pemilik rekening maksimal 100 karakter';
    }
    return '';
  }

  function validateSellerType(sellerType) {
    if (!sellerType || sellerType.trim().length === 0) {
      return 'Tipe seller harus dipilih';
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
    const sellerTypeInput = document.getElementById('sel_type');
    const hpInput = document.getElementById('hp');
    const descriptionInput = document.getElementById('description');
    const postalCodeInput = document.getElementById('zipcode');
    const bankCodeInput = document.getElementById('bank_code');
    const bankAccountNumberInput = document.getElementById('bank_account_number');
    const bankAccountNameInput = document.getElementById('bank_account_name');
    //const latInput = document.getElementById('address_lat');
    //const lngInput = document.getElementById('address_lng');

    // Real-time validation for seller type
    if (sellerTypeInput) {
      sellerTypeInput.addEventListener('change', function() {
        const error = validateSellerType(this.value);
        if (error) {
          showError(this, error);
        } else {
          clearError(this);
        }
      });
    }

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

    // Toggle: use phone number from user profile
    const useUserHpCheckbox = document.getElementById('useUserHp');
    if (useUserHpCheckbox) {
      const userHp = useUserHpCheckbox.dataset.userHp;
      let previousHp = hpInput.value;

      useUserHpCheckbox.addEventListener('change', function() {
        if (this.checked) {
          previousHp = hpInput.value;
          hpInput.value = userHp;
          // Trigger validation
          const error = validatePhone(hpInput.value);
          if (!error) {
            clearError(hpInput);
          }
        } else {
          hpInput.value = previousHp;
          const error = validatePhone(hpInput.value);
          if (!error) {
            clearError(hpInput);
          }
        }
      });
    }

    // Toggle: use address from user profile
    const useProfileAddressCheckbox = document.getElementById('useProfileAddress');
    if (useProfileAddressCheckbox) {
      const provinceSelect = document.getElementById('province');
      const citySelect = document.getElementById('city');
      const districtSelect = document.getElementById('district');
      const villageSelect = document.getElementById('village');
      const streetInput = document.getElementById('street');
      const zipcodeInput = document.getElementById('zipcode');

      // Store previous seller address values before toggle
      let previousAddress = {
        province: provinceSelect.value,
        city: citySelect.value,
        district: districtSelect.value,
        village: villageSelect.value,
        street: streetInput.value,
        zipcode: zipcodeInput.value
      };

      useProfileAddressCheckbox.addEventListener('change', function() {
        if (this.checked) {
          // Save current seller address values
          previousAddress = {
            province: provinceSelect.value,
            city: citySelect.value,
            district: districtSelect.value,
            village: villageSelect.value,
            street: streetInput.value,
            zipcode: zipcodeInput.value
          };

          // Get user profile address values from hidden inputs
          const userProvince = document.getElementById('user_address_province_id').value;
          const userCity = document.getElementById('user_address_city_id').value;
          const userDistrict = document.getElementById('user_address_district_id').value;
          const userVillage = document.getElementById('user_address_village_id').value;
          const userStreet = document.getElementById('user_address_street').value;
          const userZipcode = document.getElementById('user_address_zipcode').value;

          // Set street and zipcode
          streetInput.value = userStreet;
          zipcodeInput.value = userZipcode;

          // Set province and cascade to city, district, village
          if (userProvince) {
            provinceSelect.value = userProvince;
            // Trigger change event to cascade
            const changeEvent = new Event('change');
            provinceSelect.dispatchEvent(changeEvent);

            // After cascade, set city, district, village
            setTimeout(() => {
              if (userCity) {
                citySelect.value = userCity;
                citySelect.dispatchEvent(changeEvent);
              }
              setTimeout(() => {
                if (userDistrict) {
                  districtSelect.value = userDistrict;
                  districtSelect.dispatchEvent(changeEvent);
                }
                setTimeout(() => {
                  if (userVillage) {
                    villageSelect.value = userVillage;
                  }
                }, 300);
              }, 300);
            }, 300);
          }

          // Disable address fields
          provinceSelect.disabled = true;
          citySelect.disabled = true;
          districtSelect.disabled = true;
          villageSelect.disabled = true;
          streetInput.disabled = true;
          zipcodeInput.disabled = true;

        } else {
          // Restore previous seller address values
          provinceSelect.disabled = false;
          citySelect.disabled = false;
          districtSelect.disabled = false;
          villageSelect.disabled = false;
          streetInput.disabled = false;
          zipcodeInput.disabled = false;

          streetInput.value = previousAddress.street;
          zipcodeInput.value = previousAddress.zipcode;

          if (previousAddress.province) {
            provinceSelect.value = previousAddress.province;
            const changeEvent = new Event('change');
            provinceSelect.dispatchEvent(changeEvent);

            setTimeout(() => {
              if (previousAddress.city) {
                citySelect.value = previousAddress.city;
                citySelect.dispatchEvent(changeEvent);
              }
              setTimeout(() => {
                if (previousAddress.district) {
                  districtSelect.value = previousAddress.district;
                  districtSelect.dispatchEvent(changeEvent);
                }
                setTimeout(() => {
                  if (previousAddress.village) {
                    villageSelect.value = previousAddress.village;
                  }
                }, 300);
              }, 300);
            }, 300);
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

    // Real-time validation for bank code
    if (bankCodeInput) {
      const validateBankCodeField = function () {
        const error = validateBankCode(bankCodeInput.value);
        if (error) {
          showError(bankCodeInput, error);
        } else {
          clearError(bankCodeInput);
        }
      };

      // Select2 (initialised at the bottom of this file) emits its change
      // event through jQuery only, so the field must be validated through
      // jQuery as well as the native event.
      bankCodeInput.addEventListener('change', validateBankCodeField);
      if (window.jQuery) {
        $(bankCodeInput).on('change', validateBankCodeField);
      }
    }

    // Real-time validation for bank account number
    if (bankAccountNumberInput) {
      bankAccountNumberInput.addEventListener('blur', function() {
        const error = validateBankAccountNumber(this.value);
        if (error) {
          showError(this, error);
        } else {
          clearError(this);
        }
      });

      bankAccountNumberInput.addEventListener('input', function() {
        // Only allow digits
        this.value = this.value.replace(/\D/g, '').substring(0, 20);

        if (this.classList.contains('is-invalid')) {
          const error = validateBankAccountNumber(this.value);
          if (!error) {
            clearError(this);
          }
        }
      });
    }

    // Real-time validation for bank account name
    if (bankAccountNameInput) {
      bankAccountNameInput.addEventListener('blur', function() {
        const error = validateBankAccountName(this.value);
        if (error) {
          showError(this, error);
        } else {
          clearError(this);
        }
      });

      bankAccountNameInput.addEventListener('input', function() {
        if (this.classList.contains('is-invalid')) {
          const error = validateBankAccountName(this.value);
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

      // Validate seller type
      const sellerTypeError = validateSellerType(sellerTypeInput ? sellerTypeInput.value : '');
      if (sellerTypeError) {
        if (sellerTypeInput) {
          showError(sellerTypeInput, sellerTypeError);
        }
        console.log('Seller type validation error:', sellerTypeError);
        isValid = false;
      } else if (sellerTypeInput) {
        clearError(sellerTypeInput);
      }

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

      // Validate bank code
      const bankCodeError = validateBankCode(bankCodeInput.value);
      if (bankCodeError) {
        showError(bankCodeInput, bankCodeError);
        console.log('Bank code validation error:', bankCodeError);
        isValid = false;
      } else {
        clearError(bankCodeInput);
      }

      // Validate bank account number
      const bankAccountNumberError = validateBankAccountNumber(bankAccountNumberInput.value);
      if (bankAccountNumberError) {
        showError(bankAccountNumberInput, bankAccountNumberError);
        console.log('Bank account number validation error:', bankAccountNumberError);
        isValid = false;
      } else {
        clearError(bankAccountNumberInput);
      }

      // Validate bank account name
      const bankAccountNameError = validateBankAccountName(bankAccountNameInput.value);
      if (bankAccountNameError) {
        showError(bankAccountNameInput, bankAccountNameError);
        console.log('Bank account name validation error:', bankAccountNameError);
        isValid = false;
      } else {
        clearError(bankAccountNameInput);
      }

      console.log('Form validation result:', isValid);

      if (isValid) {
        // Re-enable disabled fields before submit so their values are included
        const useProfileAddressCheckbox = document.getElementById('useProfileAddress');
        if (useProfileAddressCheckbox && useProfileAddressCheckbox.checked) {
          document.getElementById('province').disabled = false;
          document.getElementById('city').disabled = false;
          document.getElementById('district').disabled = false;
          document.getElementById('village').disabled = false;
          document.getElementById('street').disabled = false;
          document.getElementById('zipcode').disabled = false;
        }
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
          sel_type: sellerTypeInput ? sellerTypeInput.value : '',
          slug: document.getElementById('slug')?.value.trim() || '',
          hp: hpInput.value.trim(),
          description: descriptionInput.value.trim(),
          street: document.getElementById('street')?.value || '',
          province: document.getElementById('province')?.value || '',
          city: document.getElementById('city')?.value || '',
          district: document.getElementById('district')?.value || '',
          village: document.getElementById('village')?.value || '',
          zipcode: postalCodeInput.value.trim(),
          bank_code: bankCodeInput.value.trim(),
          bank_account_number: bankAccountNumberInput.value.trim(),
          bank_account_name: bankAccountNameInput.value.trim(),
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

// Enhance the bank dropdown with Select2, like the other account forms.
// Select2 is loaded at the bottom of the page (after this file), so the
// initialisation runs on jQuery ready once every script has been parsed.
$(function () {
  $('#bank_code').select2();
});
