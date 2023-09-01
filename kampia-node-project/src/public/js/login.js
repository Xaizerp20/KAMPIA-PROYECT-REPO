const form = document.querySelector('.login__form');
const inputs = document.querySelectorAll('.login__input');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let isValid = true;

  inputs.forEach((input) => {
    if (!input.value) {
      input.style.border = '1px solid red';
      isValid = false;
    } else {
      input.style.border = '1px solid green';
    }
  });

  if (isValid) {
    form.submit();
  }
});