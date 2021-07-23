//this file is to interact with the ui directly and then delegate action to other modules, like login.js, logout.js
import { login } from './login';

const loginForm = document.querySelector('form');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
