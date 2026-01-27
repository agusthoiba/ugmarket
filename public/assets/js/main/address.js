document.addEventListener('DOMContentLoaded', async function() {

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