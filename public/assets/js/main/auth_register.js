document.addEventListener('DOMContentLoaded', async function () {
  

  function validateName(name) {
    if (!name || name.trim().length < 3) {
      return 'Nama minimal 3 karakter';
    }
    if (name.trim().length > 50) {
      return 'Nama maksimal 50 karakter';
    }
    return '';
  }

  function validateEmail(email) {
    // basic presence + length + simple format check
    if (!email || !email.toString().trim()) {
      return 'Email harus diisi';
    }
    const e = email.toString().trim();
    if (e.length > 254) {
      return 'Email terlalu panjang';
    }
    // simple, pragmatic email regex (covers most valid emails)
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(e)) {
      return 'Format email tidak valid';
    }
    return '';
  }


  function checkPasswordStrength(password) {
    const errors = [];
    const min = 6;
    const max = 20;

    if (typeof password !== 'string') password = '';

    if (password.length < min) {
      errors.push(`Minimal ${min} karakter`);
    }
    if (password.length > max) {
      errors.push(`Maksimal ${max} karakter`);
    }

    // Complexity rules
    //if (!/[a-z]/.test(password)) errors.push('Harus ada huruf kecil (a-z)');
    //if (!/[A-Z]/.test(password)) errors.push('Harus ada huruf kapital (A-Z)');
    //if (!/[0-9]/.test(password)) errors.push('Harus ada angka (0-9)');
    //if (!/[!@#$%^&*(),.?":{}|<>~_+\-=/\\[\];'`]/.test(password)) errors.push('Harus ada simbol (mis. !@#$%)');

    return errors;
  }

  function checkPasswordConfirmation(passconf, password) {
    if (typeof passconf !== 'string') passconf = ''
    if (typeof password !== 'string') password = ''

    if (passconf !== password) {
      return 'Konfirmasi password tidak sesuai'
    }

    return ''
  }

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

  const alertCl = document.getElementById("alert");

  async function register(payload) {
    try {
      const response = await fetch('/auth/register', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      const dataJson = await response.json();

      if (!response.ok) {
        console.error(`Response status: ${response.status}`)
        alertCl.classList.remove('d-none');
        alertCl.classList.add('d-block');
        alertCl.innerText = dataJson.error;
        // throw new Error("An Error occured")
      }

      console.log("dataJson: ", dataJson)

      return dataJson;
    } catch (error) {
      console.error('Error register', error);

      alertCl.classList.remove('d-none');
      alertCl.classList.add('d-block');
      alertCl.innerText = 'An error occured';
      // throw new Error("An Error occured: ", error)
    }
  }

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("auth_confirm_password");

  nameInput.addEventListener('input', function () {
    const error = validateName(this.value);
    if (error) {
      showError(this, error);
    } else {
      clearError(this);
    }
  });

  emailInput.addEventListener('input', function () {
    const error = validateEmail(this.value);
    if (error) {
      showError(this, error);
    } else {
      clearError(this);
    }
  });

  passwordInput.addEventListener("input", (e) => {
    const errors = checkPasswordStrength(e.target.value);

    const passwordFeedback = document.getElementById("passwordFeedback");

    if (errors.length) {
      passwordFeedback.innerText = errors.join(", ");
      passwordFeedback.setAttribute("style", "display:block;");
    } else {
      passwordFeedback.innerText = ""; // Clear feedback
    }
  });

  confirmPasswordInput.addEventListener("input", (e) => {
    const password = document.getElementById("password").value;
    const confirmPasswordFeedback = document.getElementById("confirmPasswordFeedback");

    if (e.target.value.length > 5 && e.target.value !== password) {
      confirmPasswordFeedback.innerText = "Konfirmasi password tidak sesuai";
      confirmPasswordFeedback.setAttribute("style", "display:block;");
    } else {
      confirmPasswordFeedback.innerText = ""; // Clear feedback
    }
  });




  document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault() // 
    let isValid = true;

        // Clear previous errors
    /*[nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
        clearError(input);
    });*/

    const btnRegister = document.getElementById("btn-register");
    btnRegister.disabled = true;
    btnRegister.style.opacity = 0.5; 

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("auth_confirm_password").value;

    // Validate name
    const nameError = validateName(nameInput.value);
    if (nameError) {
      showError(nameInput, nameError);
      isValid = false;
    }

    // Validate email
    const emailError = validateEmail(emailInput.value);
    if (emailError) {
      showError(emailInput, emailError);
      isValid = false;
    }

    // Validate Password
    const passwordError = checkPasswordStrength(password);
    if (passwordError.length) {
      showError(passwordInput, passwordError[0])
      isValid = false;
    }

    const passwordConfError = checkPasswordConfirmation(confirmPasswordInput.value, passwordInput.value);
    if (passwordConfError) {
      showError(confirmPasswordInput, passwordConfError)
      isValid = false;
    }

    const payload = {
      name: (nameInput.value).trim(),
      email: (emailInput.value).trim(),
      password: passwordInput.value,
      confirm_password: confirmPasswordInput.value
    }
    
    console.log("isValid:" , isValid)

    if (isValid) {
      try {
        const reg = await register(payload)
        window.location.assign('/auth/login?message=Registrasi berhasil! Cek email kamu untuk verifikasi akun.')

      } catch (error) {
        console.error(error)
      }
    }

        // Re-enable button if validation fails
    if (!isValid) {
        btnRegister.disabled = false;
        btnRegister.style.opacity = 1;
    }
  })

});
