import { updateFavorisCount, mettreAJourBoutonsPanier, initPageListePanier } from "./addFavorisPanier.js";
import { getAllProducts } from './api/apiClient.js';

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
const productsData = await getAllProducts();
getProduitFavoris();
initPageListePanier(productsData);
mettreAJourBoutonsPanier();
updateFavorisCount();
});

const baseURL = "https://backend-lesmidena-production.up.railway.app/";

// Fonction principale d'affichage des favoris
function getProduitFavoris() {
  const container = document.querySelector('.favoris-container');
  const messageVide = document.getElementById('message-vide');
  const favoris = JSON.parse(localStorage.getItem('favoris')) || [];

  if (favoris.length === 0) {
    messageVide.style.display = 'block';
    return;
  }

  favoris.forEach(produit => {
    const image = document.createElement('img');
    const nom = document.createElement('h2');
    const description = document.createElement('p');
    const prix = document.createElement('p');
    const btnAjouter = document.createElement('button');
    const btnSupprimer = document.createElement('button');
    const card = document.createElement('div');

    card.classList.add('favori-card');

    image.src = baseURL + produit.image;
    image.alt = produit.nom;
    image.addEventListener("click", () => {
      window.location.href = `produit.html?ref=${produit.reference}`;
    });
    nom.textContent = produit.nom;
    description.textContent = produit.description ;
    prix.textContent = `Prix : ${produit.prix} €`;

    btnAjouter.textContent = 'Ajouter au panier';
    btnAjouter.classList.add('btn-ajout-panier-favoris')
    btnAjouter.dataset.id = produit._id;

    btnSupprimer.textContent = 'Supprimer des favoris';
    btnSupprimer.onclick = () => supprimerFavoris(produit, card, messageVide);
    
    card.appendChild(image);
    card.appendChild(nom);
    card.appendChild(description);
    card.appendChild(prix);
    card.appendChild(btnAjouter);
    card.appendChild(btnSupprimer);
    container.appendChild(card);

  });
}

// Supprime un produit des favoris
function supprimerFavoris(produit, card, messageVide) {
  let favoris = JSON.parse(localStorage.getItem('favoris')) || [];
  favoris = favoris.filter(fav => fav._id !== produit._id);
  localStorage.setItem('favoris', JSON.stringify(favoris));

  card.remove();
  updateFavorisCount();

  if (favoris.length === 0) {
    messageVide.style.display = 'block';
  }
}



