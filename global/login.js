// /js/admin/login.js

import { loginAdmin } from '../api/apiClient.js';

/**
 * Fonction de connexion de l'administrateur.
 */
async function login(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const data = await loginAdmin({ email, password });

    if (data.token) {
      // Stockage du token
      window.localStorage.setItem('token', data.token);

      // Mise à jour de l'UI
      const userOpen = document.getElementById('user-open');
      if (userOpen) userOpen.textContent = 'Log out';

      // Redirection
      window.location.href = '../index.html';
    } else {
      throw new Error('Aucun token reçu');
    }
  } catch (error) {
    console.error('Erreur de connexion :', error.message);
    const errMsg = document.querySelector('.text-error-connexion');
    if (errMsg)
      errMsg.textContent = 'Erreur dans l’identifiant ou le mot de passe';
  }
}

// Écouteur sur le formulaire de connexion
const formLogin = document.querySelector('#menu-connexion');
if (formLogin) {
  formLogin.addEventListener('submit', login);
}
