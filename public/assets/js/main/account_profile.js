document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('uploadForm');
    const usernameInput = document.getElementById('username');
    const nameInput = document.getElementById('name');
    const hpInput = document.getElementById('hp');
    
    function showError(element, message) {
        element.classList.add('is-invalid');
        const feedback = element.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = message;
        }
    }

    function clearError(element) {
        element.classList.remove('is-invalid');
        const feedback = element.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = '';
        }
    }

    function validateUsername(username) {
        if (!username || username.trim().length === 0) {
            return 'Username wajib diisi';
        }
        if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username.trim())) {
            return 'Gunakan 3-30 karakter: huruf, angka, simbol (-, _, .)';
        }
        return '';
    }

    function validateName(name) {
        if (!name || name.trim().length < 3) {
            return 'Nama harus diisi minimal 3 karakter';
        }
        if (name.trim().length > 50) {
            return 'Nama tidak boleh lebih dari 50 karakter';
        }
        return '';
    }

    function validateHP(hp) {
        const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
        if (!hp || !phoneRegex.test(hp.trim())) {
            return 'Nomor HP tidak valid. Gunakan format: 08xxxxxxxxxx';
        }
        return '';
    }

    // Add input event listeners for real-time validation
    usernameInput.addEventListener('input', function() {
        const error = validateUsername(this.value);
        if (error) {
            showError(this, error);
        } else {
            clearError(this);
        }
    });

    nameInput.addEventListener('input', function() {
        const error = validateName(this.value);
        if (error) {
            showError(this, error);
        } else {
            clearError(this);
        }
    });

    hpInput.addEventListener('input', function() {
        const error = validateHP(this.value);
        if (error) {
            showError(this, error);
        } else {
            clearError(this);
        }
    });

    // Form submission validation
    form.addEventListener('submit', function(e) {
        let isValid = true;

        // Validate username
        const usernameError = validateUsername(usernameInput.value);
        if (usernameError) {
            showError(usernameInput, usernameError);
            isValid = false;
        }

        // Validate name
        const nameError = validateName(nameInput.value);
        if (nameError) {
            showError(nameInput, nameError);
            isValid = false;
        }

        // Validate phone number
        const hpError = validateHP(hpInput.value);
        if (hpError) {
            showError(hpInput, hpError);
            isValid = false;
        }

        // Check if avatar is required and validate
        const avatarInput = document.querySelector('input[name="image_ori_avatar"]');
        if (avatarInput && avatarInput.value && !document.querySelector('.preview')) {
            isValid = false;
            alert('Harap unggah gambar avatar yang valid');
        }

        if (!isValid) {
            e.preventDefault();
        }
    });


    
// Handle cascading dropdowns for address
  const provinceSelect = document.getElementById('province');
  const citySelect = document.getElementById('city');
  const districtSelect = document.getElementById('district');
  const villageSelect = document.getElementById('village');


  const addresses = await loadAddress();

    // get initial values (supports data-selected on selects or hidden init_* inputs)
  const init = {
    province: provinceSelect.dataset.selected || document.getElementById('init_province')?.value || provinceSelect.value || '',
    city:     citySelect.dataset.selected     || document.getElementById('init_city')?.value     || citySelect.value     || '',
    district: districtSelect.dataset.selected || document.getElementById('init_district')?.value || districtSelect.value || '',
    village:  villageSelect.dataset.selected  || document.getElementById('init_village')?.value  || villageSelect.value  || ''
  };

  addresses.provinces.forEach(province => {
    const option = new Option(province.name, province.id);
    provinceSelect.add(option);
  });

  // helper to populate cities, districts and villages in order and select initial values if present
  function populateCities(provinceId, selectCityId = '') {
    citySelect.innerHTML = '<option value="">Pilih Kota/Kabupaten</option>';
    districtSelect.innerHTML = '<option value="">Pilih Kecamatan</option>';
    villageSelect.innerHTML = '<option value="">Pilih Kelurahan/Desa</option>';

    if (!provinceId) return;

    const cities = addresses.cities.filter(city => String(city.province_id) == String(provinceId));
    cities.forEach(city => citySelect.add(new Option(city.name, city.id)));

    if (selectCityId) {
      citySelect.value = selectCityId;
      populateDistricts(selectCityId, init.district);
    }
  }

  function populateDistricts(cityId, selectDistrictId = '') {
    districtSelect.innerHTML = '<option value="">Pilih Kecamatan</option>';
    villageSelect.innerHTML = '<option value="">Pilih Kelurahan/Desa</option>';

    if (!cityId) return;

    const districts = addresses.districts.filter(district => String(district.regency_id) == String(cityId));
    districts.forEach(d => districtSelect.add(new Option(d.name, d.id)));

    if (selectDistrictId) {
      districtSelect.value = selectDistrictId;
      populateVillages(selectDistrictId, init.village);
    }
  }

  async function populateVillages(districtId, selectVillageId = '') {
    villageSelect.innerHTML = '<option value="">Pilih Kelurahan/Desa</option>';
    if (!districtId) return;

    const villages = await loadVillages(districtId) || [];
    villages.forEach(v => villageSelect.add(new Option(v.name, v.id)));

    if (selectVillageId) {
      villageSelect.value = selectVillageId;
    }
  }

  // Add validation for zipcode
  const zipcodeInput = document.getElementById('zipcode');
  zipcodeInput.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').substr(0, 5);
    if (this.value.length === 5) {
      this.classList.remove('is-invalid');
    } else {
      this.classList.add('is-invalid');
    }
  });

    // if initial province exists, set and cascade populate
  if (init.province) {
    provinceSelect.value = init.province;
    populateCities(init.province, init.city);
  } else {
    // no initial province -> leave selects blank (or you can choose to preselect first option)
  }

    // event listeners remain: change handlers should use the helper functions
  provinceSelect.addEventListener('change', async function() {
    populateCities(this.value);
  });
  

  citySelect.addEventListener('change', async function() {
    populateDistricts(this.value);
  });

  districtSelect.addEventListener('change', async function() {
    await populateVillages(this.value);
  });
});


/**
 * Fetches the list of provinces, cities, and districts from the server
 * and parses the JSON response.
 *
 * @returns {Promise<void>} Resolves when the data is loaded, rejects when an error occurs.
 */
async function loadAddress() {
    try {
        const response = await fetch('/idn/address');
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        const dataJson = await response.json();
        const addresses = dataJson.data;

        return addresses;
    } catch (error) {
        console.error('Error loading provinces, cities, and districts:', error);
    }
}

async function loadVillages(districtId) {
    try {
        const response = await fetch(`/idn/villages/${districtId}`);
        return (await response.json()).data;
    } catch (error) {
        console.error('Error loading villages:', error);
    }
}

