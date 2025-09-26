function checkPasswordStrength(password) {
  const regex = {
    length: /.{6,}/
  };

  const errors = [];
  if (!regex.length.test(password)) errors.push("Setidaknya 6 karakter");

  return errors;
}

document.getElementById("password").addEventListener("input", (e) => {
  const errors = checkPasswordStrength(e.target.value);

  const passwordFeedback = document.getElementById("passwordFeedback");
  
  if (errors.length) {
    passwordFeedback.innerText = errors.join(", ");
    passwordFeedback.setAttribute("style", "display:block;");
  } else {
      passwordFeedback.innerText = ""; // Clear feedback
  }
});

document.getElementById("auth_confirm_password").addEventListener("input", (e) => {
  const password = document.getElementById("password").value;
  const confirmPasswordFeedback = document.getElementById("confirmPasswordFeedback");

  if (e.target.value.length > 5 && e.target.value !== password) {
    confirmPasswordFeedback.innerText = "Konfirmasi password tidak sesuai";
    confirmPasswordFeedback.setAttribute("style", "display:block;");
  } else {
    confirmPasswordFeedback.innerText = ""; // Clear feedback
  }
});
