const user = document.getElementById('user');
const pass = document.getElementById('pass');
const submit = document.getElementById('submit');



submit.addEventListener('click', (e) =>{
    e.preventDefault();
    console.log(user.value)
})


