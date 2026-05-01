$(function () {

 
    console.log('contact js load')
    'use strict'
    var forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        console.log('form', form)
        form.addEventListener('submit', function (event) {
          // event.preventDefault()
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }
  
          form.classList.add('was-validated')

          console.log('this',  $( this ));
        }, false)
      })
});

function onlyNumberKey(evt) {
          
  // Only ASCII character in that range allowed
  var ASCIICode = (evt.which) ? evt.which : evt.keyCode
  if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
      return false;
  return true;
}
